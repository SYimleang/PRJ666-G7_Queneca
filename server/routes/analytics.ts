import express, { Response, RequestHandler } from "express";
import {
  authenticate,
  AuthRequest,
  requireAdminOrStaff,
} from "../middleware/auth";
import User from "../models/User";
import Waitlist from "../models/Waitlist";
const router = express.Router();
import mongoose from "mongoose";

// Visitor statistics
router.get("/visitors", authenticate, requireAdminOrStaff, (async (
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

    // Ensure user has a restaurantId
    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Get the range parameter from query
    const range =
      (req.query.range as "daily" | "weekly" | "monthly") ?? "daily";

    const allowedRanges = ["daily", "weekly", "monthly"];
    if (!allowedRanges.includes(range)) {
      return res.status(400).json({ error: "Invalid range parameter." });
    }

    console.log(`Fetching visitor stats for range: ${range}`);

    const now = new Date();
    const startDate = new Date(now);

    let groupFormat;
    if (range === "weekly") {
      startDate.setDate(now.getDate() - 21); // Start of the week
      startDate.setDate(1); // Reset to the first of the month
      groupFormat = {
        $dateToString: { format: "%b %d, %Y", date: "$joinedAt" },
      };
    } else if (range === "monthly") {
      startDate.setDate(now.getDate() - 3); // Start of the week
      startDate.setDate(1); // Reset to the first of the month
      groupFormat = {
        $dateToString: { format: "%b-%Y", date: "$joinedAt" },
      };
    } else {
      startDate.setDate(now.getDate() - 3);
      groupFormat = {
        $dateToString: { format: "%b %d, %Y", date: "$joinedAt" },
      };
    }

    const result = await Waitlist.aggregate([
      {
        $match: {
          restaurantId: user.restaurantId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: "$partySize" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Get Stats error:", error);
    res.status(500).json({ message: "Server error during get stats" });
  }
}) as RequestHandler);

// Peak hours heatmap
router.get("/peak-hours", authenticate, requireAdminOrStaff, (async (
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

    console.log("Fetching peak hours heatmap data...");
    const restaurantId = user.restaurantId;
    console.log(`Fetching peak hours for restaurantId: ${restaurantId}`);

    const result = await Waitlist.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
        },
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$joinedAt" }, // 1 = Sunday
          hour: { $hour: "$joinedAt" },
        },
      },
      {
        $group: {
          _id: { dayOfWeek: "$dayOfWeek", hour: "$hour" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dayOfWeek: "$_id.dayOfWeek",
          hour: "$_id.hour",
          count: 1,
        },
      },
    ]);

    const formatted = result.map((r) => ({
      _id: 0,
      dayOfWeek: r.dayOfWeek,
      hour: r.hour,
      count: r.count,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get Stats error:", error);
    res.status(500).json({ message: "Server error during get stats" });
  }
}) as RequestHandler);

export default router;
