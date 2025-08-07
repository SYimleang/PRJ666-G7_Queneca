import express, { Response, RequestHandler } from "express";
import User from "../models/User";
import { authenticate, AuthRequest, requireAdmin } from "../middleware/auth";
import { validatePassword, hashPassword } from "../lib/auth";
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
    const { currentPassword, email, name, phone, newPassword } = req.body;

    // Find user by ID
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If email is changed, check if new email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Validate current password
    const isPasswordValid = await validatePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid current password" });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (newPassword) {
      user.password = await hashPassword(newPassword);
    }
    await user.save();
    const { password, ...updatedUser } = user.toObject();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}) as RequestHandler);

// POST /api/users/staff - Create staff user (Admin only)
router.post("/staff", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, email, password, phone } = req.body;
    const adminId = req.user!.id;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get admin user to find their restaurantId
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.restaurantId) {
      return res
        .status(400)
        .json({ message: "Admin must be associated with a restaurant" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new staff user
    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "staff",
      restaurantId: admin.restaurantId,
    });

    res.status(201).json({
      message: "Staff user created successfully",
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        restaurantId: newStaff.restaurantId,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ message: "Server error during staff creation" });
  }
}) as RequestHandler);

// GET /api/users/staff - Get all staff for admin's restaurant
router.get("/staff", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const adminId = req.user!.id;

    // Get admin user to find their restaurantId
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.restaurantId) {
      return res
        .status(400)
        .json({ message: "Admin must be associated with a restaurant" });
    }

    // Get all staff for this restaurant
    const staff = await User.find({
      restaurantId: admin.restaurantId,
      role: "staff",
    }).select("-password");

    res.status(200).json({ staff });
  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({ message: "Server error while fetching staff" });
  }
}) as RequestHandler);

// PUT /api/users/staff/:id - Update staff user (Admin only)
router.put("/staff/:id", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const adminId = req.user!.id;

    // Get admin user to find their restaurantId
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.restaurantId) {
      return res
        .status(400)
        .json({ message: "Admin must be associated with a restaurant" });
    }

    // Check if staff user exists and belongs to admin's restaurant
    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (staff.role !== "staff") {
      return res.status(400).json({ message: "User is not a staff member" });
    }

    if (staff.restaurantId?.toString() !== admin.restaurantId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update staff from your restaurant" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== staff.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update staff user
    const updatedStaff = await User.findByIdAndUpdate(
      id,
      { name, email, phone },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Staff user updated successfully",
      staff: updatedStaff,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ message: "Server error during staff update" });
  }
}) as RequestHandler);

// DELETE /api/users/staff/:id - Delete staff user (Admin only)
router.delete("/staff/:id", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    // Get admin user to find their restaurantId
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.restaurantId) {
      return res
        .status(400)
        .json({ message: "Admin must be associated with a restaurant" });
    }

    // Check if staff user exists and belongs to admin's restaurant
    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (staff.role !== "staff") {
      return res.status(400).json({ message: "User is not a staff member" });
    }

    if (staff.restaurantId?.toString() !== admin.restaurantId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete staff from your restaurant" });
    }

    // Delete staff user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "Staff user deleted successfully",
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ message: "Server error during staff deletion" });
  }
}) as RequestHandler);

export default router;
