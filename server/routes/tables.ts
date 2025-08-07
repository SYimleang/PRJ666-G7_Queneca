import express, { Response, RequestHandler } from "express";
import {
  authenticate,
  requireAdminOrStaff,
  AuthRequest,
} from "../middleware/auth";
import Table from "../models/Tables";
import User from "../models/User";

const router = express.Router();

// GET /api/tables - Get all tables for user's restaurant
router.get("/", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user?.restaurantId) {
      return res.status(400).json({ message: "No associated restaurant" });
    }

    const tables = await Table.find({ restaurantId: user.restaurantId });
    res.json({ tables });
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ message: "Failed to fetch tables" });
  }
}) as RequestHandler);

// PUT /api/tables/seat/:id - Seat a party at a table
router.put("/seat/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, size, waitlistId } = req.body;

    if (!name || !size) {
      return res.status(400).json({ message: "Missing name or size" });
    }

    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    // Optional: verify restaurantId matches user.restaurantId
    const user = await User.findById(req.user!.id);
    if (user?.restaurantId?.toString() !== table.restaurantId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    table.status = "occupied";
    table.seatedParty = { name, size, waitlistId };
    await table.save();

    res.json({ table });
  } catch (err) {
    console.error("Error seating table:", err);
    res.status(500).json({ message: "Failed to seat table" });
  }
}) as RequestHandler);

// PUT /api/tables/clear/:id - Clear a table
router.put("/clear/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    const user = await User.findById(req.user!.id);
    if (user?.restaurantId?.toString() !== table.restaurantId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    table.status = "available";
    table.seatedParty = undefined;
    await table.save();

    res.json({ table });
  } catch (err) {
    console.error("Error clearing table:", err);
    res.status(500).json({ message: "Failed to clear table" });
  }
}) as RequestHandler);

// PATCH /api/tables/:id/seat
router.patch("/:id/seat", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }

  table.status = "occupied";
  await table.save();

  res.json({ table });
}) as RequestHandler);

// PATCH /api/tables/:id/clear
router.patch("/:id/clear", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return res.status(404).json({ message: "Table not found" });
  }

  table.status = "available";
  table.seatedParty = undefined;
  await table.save();

  res.json({ table });
}) as RequestHandler);

export default router;
