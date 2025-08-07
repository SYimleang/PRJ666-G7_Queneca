import express, { Response, RequestHandler } from "express";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import User from "../models/User";
import Restaurant from "../models/Restaurant";
import Menu from "../models/Menu";
import Waitlist from "../models/Waitlist";

const router = express.Router();

// GET /api/admin/dashboard - Get Admin Dashboard Info
router.get("/dashboard", authenticate, requireAdmin, (async (
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

    // Get restaurant data
    const restaurant = await Restaurant.findById(admin.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get menu data
    const menu = await Menu.findOne({ restaurantId: admin.restaurantId });

    // Get staff data
    const staff = await User.find({
      restaurantId: admin.restaurantId,
      role: "staff",
    }).select("-password");

    // Get waitlist data
    const waitlist = await Waitlist.find({
      restaurantId: admin.restaurantId,
      status: { $in: ['waiting', 'called'] }
    }).sort({ position: 1 });

    // Calculate some basic stats
    const stats = {
      totalStaff: staff.length,
      totalMenuItems: menu ? menu.menuItems.length : 0,
      waitlistCount: waitlist.length,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
        },
        restaurant,
        menu,
        staff,
        waitlist,
        stats,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching dashboard data" });
  }
}) as RequestHandler);

// GET /api/admin/restaurant - Get admin's restaurant details
router.get("/restaurant", authenticate, requireAdmin, (async (
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

    // Get restaurant data
    const restaurant = await Restaurant.findById(admin.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    console.error("Get admin restaurant error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching restaurant data" });
  }
}) as RequestHandler);

// PUT /api/admin/restaurant - Update admin's restaurant
router.put("/restaurant", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const adminId = req.user!.id;
    const { name, phone, location, hours } = req.body;

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

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      admin.restaurantId,
      { name, phone, location, hours },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res.status(500).json({ message: "Server error while updating restaurant" });
  }
}) as RequestHandler);

export default router;
