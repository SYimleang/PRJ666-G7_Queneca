import express, { Response, RequestHandler } from "express";
import User from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// GET /api/users/me - Get current user's profile
router.get("/me", authenticate, (async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}) as RequestHandler);

// PUT /api/users/me - Update current user's profile
router.put("/me", authenticate, (async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    // Find user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If email is changed, check if new email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email } },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}) as RequestHandler);

export default router;
