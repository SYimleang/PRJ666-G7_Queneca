import express, {  Response, RequestHandler } from "express";
import { 
    authenticate, 
    requireAdmin, 
    AuthRequest,
    requireAdminOrStaff
} from "../middleware/auth";
import User from "../models/User";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/staff - Get staff for current user's restaurant
router.get("/", authenticate, requireAdminOrStaff, (async (
    req: AuthRequest, 
    res: Response
) => {
  try {
    const userId = req.user!.id;
    
    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    const staff = await User.find({
      restaurantId: user.restaurantId,
      role: { $in: ["staff", "admin"] },
    }).select("-password"); // Hide passwords

    res.json({ staff });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
}) as RequestHandler);

// PUT /api/staff - update staff
router.put("/", authenticate, requireAdmin, (async (
  req: AuthRequest, 
  res: Response
) => {
  try {
    const { userList } = req.body;
    if (!Array.isArray(userList)) {
      return res.status(400).json({ message: "Invalid payload: userList must be an array" });
    }
    const user = await User.findById(req.user!.id);

    if (!user || !user.restaurantId) {
      return res.status(400).json({ message: "Restaurant association required" });
    }

    const updatedUsers = [];

    // Validate each staff entry
    for (const userData of userList) {

      const { _id, name, email, role, phone } = userData;

      if (!name || !email || !role) {
        return res.status(400).json({ message: "Invalid staff data" });
      }

      // If _id exists, update
      if (_id) {
        const updated = await User.findOneAndUpdate(
          {_id, restaurantId: user.restaurantId },
          {
            name,
            email,
            role
          },
          { new: true }
        );
        if (updated) updatedUsers.push(updated);
      } else {
        // If no _id, create new staff
        const created = new User({
          name,
          email,
          role,
          phone: phone || "000-000-0000", // default phone
          password: "changeme123",
          restaurantId: user.restaurantId,
        });
        const saved = await created.save();
        updatedUsers.push(saved);
      }
    }

    res.status(200).json({ message: "Staff updated successfully", staff: updatedUsers });
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ message: "Failed to update staff" });
  }
}) as RequestHandler);

// DELETE /api/staff/:id - delete staff by ID
router.delete("/:id", authenticate, requireAdmin, (async (
  req: AuthRequest, 
  res: Response
) => {
  try {
    const staffId = req.params.id;
    const adminUser = await User.findById(req.user!.id);

    if (!adminUser || !adminUser.restaurantId) {
      return res.status(403).json({ message: "Unauthorized or no restaurant context" });
    }

    console.log('Deleting staff:', staffId);
    const staffToDelete = await User.findById(staffId);
    console.log('Found staff:', staffToDelete);

    if (!staffToDelete) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Prevent deleting yourself
    if ((staffToDelete._id as mongoose.Types.ObjectId).equals(adminUser._id as mongoose.Types.ObjectId)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await User.findByIdAndDelete(staffId);

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: "Failed to delete staff" });
  }
}) as RequestHandler);


export default router;
