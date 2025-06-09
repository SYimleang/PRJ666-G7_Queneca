import express, { Request, Response, RequestHandler } from "express";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import Restaurant from "../models/Restaurant";
import User from "../models/User";

const router = express.Router();

// POST /api/restaurants - Create Restaurant (Protected, admin only)
router.post("/", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, phone, location, hours } = req.body;
    const adminId = req.user!.id;

    // Validate required fields
    if (!name || !phone || !location || !hours) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate location fields
    if (
      !location.address ||
      !location.city ||
      !location.state ||
      !location.zip
    ) {
      return res
        .status(400)
        .json({ message: "Complete location information is required" });
    }

    // Validate hours fields
    if (!hours.open || !hours.close) {
      return res
        .status(400)
        .json({ message: "Opening and closing hours are required" });
    }

    // Check if admin already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ ownerId: adminId });
    if (existingRestaurant) {
      return res
        .status(400)
        .json({ message: "Admin already has a restaurant" });
    }

    // Create new restaurant
    const newRestaurant = await Restaurant.create({
      name,
      phone,
      location,
      hours,
      ownerId: adminId,
    });

    // Update admin user with restaurantId
    await User.findByIdAndUpdate(adminId, { restaurantId: newRestaurant._id });

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error("Create restaurant error:", error);
    res
      .status(500)
      .json({ message: "Server error during restaurant creation" });
  }
}) as RequestHandler);

// GET /api/restaurants/:id - Get Restaurant by ID
router.get("/:id", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id).populate(
      "ownerId",
      "name email"
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    console.error("Get restaurant error:", error);
    res.status(500).json({ message: "Server error while fetching restaurant" });
  }
}) as RequestHandler);

// GET /api/restaurants - Get all restaurants
router.get("/", (async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find().populate(
      "ownerId",
      "name email"
    );
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Get restaurants error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching restaurants" });
  }
}) as RequestHandler);

// PUT /api/restaurants/:id - Update Restaurant (Protected, admin only)
router.put("/:id", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, phone, location, hours } = req.body;
    const adminId = req.user!.id;

    // Validate required fields
    if (!name || !phone || !location || !hours) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate location fields
    if (
      !location.address ||
      !location.city ||
      !location.state ||
      !location.zip
    ) {
      return res
        .status(400)
        .json({ message: "Complete location information is required" });
    }

    // Validate hours fields
    if (!hours.open || !hours.close) {
      return res
        .status(400)
        .json({ message: "Opening and closing hours are required" });
    }

    // Check if restaurant exists and belongs to the admin
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.ownerId.toString() !== adminId) {
      return res
        .status(403)
        .json({ message: "You can only update your own restaurant" });
    }

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { name, phone, location, hours },
      { new: true }
    );

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res.status(500).json({ message: "Server error during restaurant update" });
  }
}) as RequestHandler);

// DELETE /api/restaurants/:id - Delete Restaurant (Protected, admin only)
router.delete("/:id", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    // Check if restaurant exists and belongs to the admin
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.ownerId.toString() !== adminId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own restaurant" });
    }

    // Delete restaurant
    await Restaurant.findByIdAndDelete(id);

    // Remove restaurantId from admin user
    await User.findByIdAndUpdate(adminId, { restaurantId: null });

    res.status(200).json({
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    res
      .status(500)
      .json({ message: "Server error during restaurant deletion" });
  }
}) as RequestHandler);

export default router;
