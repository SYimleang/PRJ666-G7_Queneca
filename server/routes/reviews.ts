import express, { Response, Request, RequestHandler } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import Restaurant, { IRestaurant } from "../models/Restaurant";
import mongoose from "mongoose";
import User from "../models/User";
import Review from "../models/Review";

const router = express.Router();

// Get /api/reviews/restaurant/:restaurantId - Get all reviews for a restaurant
router.get(
  "/restaurant/:restaurantId",
  async (req: Request<{ restaurantId: string }>, res: Response) => {
    try {
      const { restaurantId } = req.params;

      const reviews = await Review.find({ restaurantId })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({ reviews });
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      res.status(500).json({ message: "Server error while fetching reviews" });
    }
  }
);

// Get /api/reviews/restaurant - Get all reviews for the restaurant owned by the authenticated admin
router.get("/restaurant", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const adminId = req.user?.id;

    console.log("Admin ID:", adminId);

    // Get user to find their restaurantId
    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    const restaurants = await Restaurant.find({
      ownerId: new mongoose.Types.ObjectId(adminId),
    });

    // If no restaurant is found for the admin, return 404
    if (!restaurants) {
      return res
        .status(404)
        .json({ message: "No restaurants found for this admin" });
    }

    const restaurantIds = restaurants.map((r) => r._id);

    console.log("Restaurant IDs:", restaurantIds);

    const reviews = await Review.find({ restaurantId: { $in: restaurantIds } })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
}) as RequestHandler);

// POST /api/reviews - Create a new review
router.post("/", authenticate, (async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, rating, comment } = req.body;

    const userId = req.user?.id;

    if (!restaurantId || !rating) {
      return res
        .status(400)
        .json({ message: "Restaurant ID and rating are required" });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({ restaurantId, userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this restaurant" });
    }

    const review = await Review.create({
      restaurantId,
      userId,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error while creating review" });
  }
}) as RequestHandler);

// PUT /api/reviews/:reviewId/respond - Admin only
router.put("/:reviewId/respond", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const adminId = req.user?.id;

    // Find the review by ID
    const review = await Review.findById(reviewId).populate<{
      restaurantId: IRestaurant;
    }>("restaurantId");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ensure the review belongs to the admin's restaurant
    if (String(review.restaurantId.ownerId) !== adminId) {
      return res.status(403).json({
        message: "You can only respond to reviews of your own restaurant",
      });
    }

    review.response = {
      comment,
      createdAt: new Date(),
    };

    await review.save();

    res.status(200).json({ message: "Response added", review });
  } catch (error) {
    console.error("Error responding to review:", error);
    res
      .status(500)
      .json({ message: "Server error while responding to review" });
  }
}) as RequestHandler);

export default router;
