import express, { Request, Response, RequestHandler } from "express";
import { hashPassword, validatePassword, generateToken } from "../lib/auth";
import User from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";
import Restaurant from "../models/Restaurant";

const router = express.Router();

// POST /api/auth/register
router.post("/register", (async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
    });

    // Generate JWT token
    const token = generateToken({
      id: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
}) as RequestHandler);

// POST /api/auth/register-admin
router.post("/register-admin", (async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new admin user
    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      name,
      phone,
    });

    // Generate JWT token
    const token = generateToken({
      id: String(newAdmin._id),
      email: newAdmin.email,
      role: newAdmin.role,
      name: newAdmin.name,
      phone: newAdmin.phone,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      user: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
        name: newAdmin.name,
        phone: newAdmin.phone,
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ message: "Server error during admin registration" });
  }
}) as RequestHandler);

// POST /api/auth/login
router.post("/login", (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !(await validatePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenPayload: any = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    };

    if (user.restaurantId) {
      tokenPayload.restaurantId = user.restaurantId;
    }

    let restaurant = null;

    if (user.restaurantId) {
      tokenPayload.restaurantId = user.restaurantId;
      restaurant = await Restaurant.findById(user.restaurantId); // get restaurant data
    }
    const token = generateToken(tokenPayload);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userPayload: any = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    };

    if (user.restaurantId) {
      userPayload.restaurantId = user.restaurantId;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: userPayload,
      restaurant,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
}) as RequestHandler);

// GET /api/auth/verify - Verify current token (Protected)
router.get("/verify", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No user found in token" });
    }

    res.status(200).json({
      message: "Token is valid",
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Server error during token verification" });
  }
}) as RequestHandler);

export default router;
