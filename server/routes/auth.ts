import express, { Request, Response, RequestHandler } from "express";
import { hashPassword, validatePassword, generateToken } from "../lib/auth";
import User, { IUser } from "../models/User";

const router = express.Router();

// POST /api/auth/register
router.post("/register", (async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

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
      name,
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
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

    // Generate JWT token
    const token = generateToken({ id: user._id.toString(), email: user.email });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
}) as RequestHandler);

export default router;
