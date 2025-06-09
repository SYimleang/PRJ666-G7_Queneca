import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken } from "../lib/auth";

// Extend Express Request type with user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    phone: string;
  };
}

// Middleware to authenticate user from JWT token
export const authenticate: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Set user data in request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware to check if user is admin
export const requireAdmin: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
};

// Middleware to check if user is admin or staff
export const requireAdminOrStaff: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin" && req.user.role !== "staff") {
    res.status(403).json({ message: "Admin or staff access required" });
    return;
  }

  next();
};
