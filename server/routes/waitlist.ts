import express, { Request, Response, RequestHandler } from "express";
import {
  authenticate,
  AuthRequest,
  requireAdminOrStaff,
} from "../middleware/auth";
import Waitlist from "../models/Waitlist";
import Restaurant from "../models/Restaurant";
import User from "../models/User";

const router = express.Router();

// Helper function to check if restaurant is open
const isRestaurantOpen = (restaurant: any): boolean => {
  if (!restaurant.hours || restaurant.hours.length === 0) {
    return true; // If no hours set, assume always open
  }

  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

  const todayHours = restaurant.hours.find(
    (h: any) => h.day.toLowerCase() === currentDay
  );
  if (!todayHours) {
    return false; // No hours for today
  }

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Helper function to calculate estimated wait time
const calculateEstimatedWaitTime = (
  position: number,
  restaurant: any
): number => {
  return position * restaurant.waitlistSettings.estimatedWaitTimePerCustomer;
};

// Helper function to update positions after changes
const updatePositions = async (restaurantId: string) => {
  const waitingEntries = await Waitlist.find({
    restaurantId,
    status: "waiting",
  }).sort({ joinedAt: 1 });

  for (let i = 0; i < waitingEntries.length; i++) {
    const entry = waitingEntries[i];
    if (entry.position !== i + 1) {
      entry.position = i + 1;
      entry.estimatedWaitTime = calculateEstimatedWaitTime(
        i + 1,
        await Restaurant.findById(restaurantId)
      );
      await entry.save();
    }
  }
};

// POST /api/waitlist/join/:restaurantId - Join waitlist
router.post("/join/:restaurantId", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { restaurantId } = req.params;
    const { partySize, notes } = req.body;
    const customerId = req.user!.id;

    // Validate required fields
    if (!partySize || partySize < 1) {
      return res.status(400).json({ message: "Valid party size is required" });
    }

    // Get restaurant details
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if restaurant is open (if hours are set)
    if (!isRestaurantOpen(restaurant)) {
      return res.status(400).json({
        message:
          "Restaurant is currently closed and not accepting waitlist entries",
      });
    }

    // Get customer details
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check for duplicate entry (within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingEntry = await Waitlist.findOne({
      restaurantId,
      customerId,
      status: { $in: ["waiting", "called"] },
      joinedAt: { $gte: twentyFourHoursAgo },
    });

    if (existingEntry) {
      return res.status(400).json({
        message:
          "You already have an active waitlist entry for this restaurant",
      });
    }

    // Check waitlist capacity
    const currentWaitlistCount = await Waitlist.countDocuments({
      restaurantId,
      status: "waiting",
    });

    if (currentWaitlistCount >= restaurant.waitlistSettings.maxCapacity) {
      return res.status(400).json({
        message: "Waitlist is currently full. Please try again later.",
      });
    }

    // Calculate position (next available position)
    const position = currentWaitlistCount + 1;
    const estimatedWaitTime = calculateEstimatedWaitTime(position, restaurant);

    // Create waitlist entry
    const waitlistEntry = await Waitlist.create({
      restaurantId,
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      partySize,
      notes,
      position,
      estimatedWaitTime,
    });

    res.status(201).json({
      message: "Successfully joined the waitlist",
      waitlistEntry: {
        id: waitlistEntry._id,
        position: waitlistEntry.position,
        estimatedWaitTime: waitlistEntry.estimatedWaitTime,
        partySize: waitlistEntry.partySize,
        notes: waitlistEntry.notes,
        joinedAt: waitlistEntry.joinedAt,
        status: waitlistEntry.status,
      },
    });
  } catch (error) {
    console.error("Join waitlist error:", error);
    res.status(500).json({ message: "Server error while joining waitlist" });
  }
}) as RequestHandler);

// GET /api/waitlist/status/:restaurantId - Get customer's waitlist status
router.get("/status/:restaurantId", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { restaurantId } = req.params;
    const customerId = req.user!.id;

    const waitlistEntry = await Waitlist.findOne({
      restaurantId,
      customerId,
      status: { $in: ["waiting", "called"] },
    }).populate("restaurantId", "name");

    if (!waitlistEntry) {
      return res
        .status(404)
        .json({ message: "No active waitlist entry found" });
    }

    res.json({
      waitlistEntry: {
        id: waitlistEntry._id,
        restaurantName: (waitlistEntry.restaurantId as any).name,
        position: waitlistEntry.position,
        estimatedWaitTime: waitlistEntry.estimatedWaitTime,
        partySize: waitlistEntry.partySize,
        notes: waitlistEntry.notes,
        joinedAt: waitlistEntry.joinedAt,
        status: waitlistEntry.status,
        calledAt: waitlistEntry.calledAt,
      },
    });
  } catch (error) {
    console.error("Get waitlist status error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching waitlist status" });
  }
}) as RequestHandler);

// PUT /api/waitlist/update/:id - Update waitlist entry
router.put("/update/:id", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { partySize, notes } = req.body;
    const customerId = req.user!.id;

    const waitlistEntry = await Waitlist.findOne({
      _id: id,
      customerId,
      status: { $in: ["waiting", "called"] },
    });

    if (!waitlistEntry) {
      return res
        .status(404)
        .json({ message: "Waitlist entry not found or cannot be updated" });
    }

    // Update allowed fields
    if (partySize && partySize > 0) {
      waitlistEntry.partySize = partySize;
    }
    if (notes !== undefined) {
      waitlistEntry.notes = notes;
    }

    await waitlistEntry.save();

    res.json({
      message: "Waitlist entry updated successfully",
      waitlistEntry: {
        id: waitlistEntry._id,
        position: waitlistEntry.position,
        estimatedWaitTime: waitlistEntry.estimatedWaitTime,
        partySize: waitlistEntry.partySize,
        notes: waitlistEntry.notes,
        status: waitlistEntry.status,
      },
    });
  } catch (error) {
    console.error("Update waitlist error:", error);
    res
      .status(500)
      .json({ message: "Server error while updating waitlist entry" });
  }
}) as RequestHandler);

// DELETE /api/waitlist/cancel/:id - Cancel waitlist entry
router.delete("/cancel/:id", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customerId = req.user!.id;

    const waitlistEntry = await Waitlist.findOne({
      _id: id,
      customerId,
    });

    if (!waitlistEntry) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    // Check if entry can be cancelled
    if (
      waitlistEntry.status === "seated" ||
      waitlistEntry.status === "no-show"
    ) {
      return res.status(400).json({
        message: "You've already been called – cancellation not allowed.",
      });
    }

    if (waitlistEntry.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "This waitlist entry is already cancelled" });
    }

    // Cancel the entry
    waitlistEntry.status = "cancelled";
    waitlistEntry.cancelledAt = new Date();
    waitlistEntry.cancellationReason = reason || "Customer cancelled";
    await waitlistEntry.save();

    // Update positions for remaining entries
    await updatePositions(waitlistEntry.restaurantId.toString());

    res.json({ message: "Your waitlist spot has been canceled." });
  } catch (error) {
    console.error("Cancel waitlist error:", error);
    res
      .status(500)
      .json({ message: "Server error while canceling waitlist entry" });
  }
}) as RequestHandler);

// GET /api/waitlist/restaurant/:restaurantId - Get restaurant's waitlist (Admin/Staff)
router.get(
  "/restaurant/:restaurantId",
  authenticate,
  requireAdminOrStaff,
  (async (req: AuthRequest, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const userId = req.user!.id;

      // Verify user has access to this restaurant
      const user = await User.findById(userId);
      if (
        !user ||
        (user.role !== "admin" &&
          user.restaurantId?.toString() !== restaurantId)
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const waitlist = await Waitlist.find({
        restaurantId,
        status: { $in: ["waiting", "called"] },
      }).sort({ position: 1 });

      const restaurant = await Restaurant.findById(restaurantId);

      res.json({
        waitlist: waitlist.map((entry) => ({
          id: entry._id,
          customerName: entry.customerName,
          customerPhone: entry.customerPhone,
          partySize: entry.partySize,
          notes: entry.notes,
          position: entry.position,
          estimatedWaitTime: entry.estimatedWaitTime,
          joinedAt: entry.joinedAt,
          status: entry.status,
          calledAt: entry.calledAt,
        })),
        settings: restaurant?.waitlistSettings,
      });
    } catch (error) {
      console.error("Get restaurant waitlist error:", error);
      res.status(500).json({ message: "Server error while fetching waitlist" });
    }
  }) as RequestHandler
);

// PUT /api/waitlist/call/:id - Call customer (Admin/Staff)
router.put("/call/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const waitlistEntry = await Waitlist.findById(id);
    if (!waitlistEntry) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    // Verify user has access to this restaurant
    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "admin" &&
        user.restaurantId?.toString() !== waitlistEntry.restaurantId.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (waitlistEntry.status !== "waiting") {
      return res
        .status(400)
        .json({ message: "Can only call customers who are waiting" });
    }

    waitlistEntry.status = "called";
    waitlistEntry.calledAt = new Date();
    await waitlistEntry.save();

    res.json({ message: "Customer has been called" });
  } catch (error) {
    console.error("Call customer error:", error);
    res.status(500).json({ message: "Server error while calling customer" });
  }
}) as RequestHandler);

// PUT /api/waitlist/seat/:id - Mark customer as seated (Admin/Staff)
router.put("/seat/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const waitlistEntry = await Waitlist.findById(id);
    if (!waitlistEntry) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    // Verify user has access to this restaurant
    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "admin" &&
        user.restaurantId?.toString() !== waitlistEntry.restaurantId.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (waitlistEntry.status !== "called") {
      return res
        .status(400)
        .json({ message: "Customer must be called before being seated" });
    }

    waitlistEntry.status = "seated";
    waitlistEntry.seatedAt = new Date();
    await waitlistEntry.save();

    // Update positions for remaining entries
    await updatePositions(waitlistEntry.restaurantId.toString());

    res.json({ message: "Customer has been seated" });
  } catch (error) {
    console.error("Seat customer error:", error);
    res.status(500).json({ message: "Server error while seating customer" });
  }
}) as RequestHandler);

// PUT /api/waitlist/no-show/:id - Mark customer as no-show (Admin/Staff)
router.put("/no-show/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const waitlistEntry = await Waitlist.findById(id);
    if (!waitlistEntry) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    // Verify user has access to this restaurant
    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "admin" &&
        user.restaurantId?.toString() !== waitlistEntry.restaurantId.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (waitlistEntry.status !== "called") {
      return res
        .status(400)
        .json({
          message: "Customer must be called before being marked as no-show",
        });
    }

    waitlistEntry.status = "no-show";
    waitlistEntry.noShowAt = new Date();
    await waitlistEntry.save();

    // Update positions for remaining entries
    await updatePositions(waitlistEntry.restaurantId.toString());

    res.json({ message: "Customer marked as no-show" });
  } catch (error) {
    console.error("No-show customer error:", error);
    res
      .status(500)
      .json({ message: "Server error while marking customer as no-show" });
  }
}) as RequestHandler);

export default router;
