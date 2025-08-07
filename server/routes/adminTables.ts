// routes/adminTables.ts
import express, { Response, RequestHandler } from "express";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import Table from "../models/Tables";
import User from "../models/User";

const router = express.Router();

// GET /api/admin/tables - Get all tables for admin's restaurant
router.get("/", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  const user = await User.findById(req.user!.id);
  if (!user?.restaurantId) {
    return res
      .status(400)
      .json({ message: "No restaurant associated with admin" });
  }

  const tables = await Table.find({ restaurantId: user.restaurantId }).sort({
    tableNumber: 1,
  });
  res.json({ tables });
}) as RequestHandler);

// POST /api/admin/tables - Add a table to restaurant
router.post("/", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  const { tableNumber, seats } = req.body;

  if (!tableNumber || !seats || seats < 1) {
    return res
      .status(400)
      .json({ message: "Table number and valid seat count required" });
  }

  const user = await User.findById(req.user!.id);
  if (!user?.restaurantId) {
    return res
      .status(400)
      .json({ message: "No restaurant associated with admin" });
  }

  const existing = await Table.findOne({
    restaurantId: user.restaurantId,
    tableNumber,
  });
  if (existing) {
    return res.status(409).json({ message: "Table number already exists" });
  }

  const table = await Table.create({
    restaurantId: user.restaurantId,
    tableNumber,
    seats,
    status: "available",
  });

  res.status(201).json({ table });
}) as RequestHandler);

// DELETE /api/admin/tables/:id - Delete table by ID
router.delete("/:id", authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  const user = await User.findById(req.user!.id);
  const table = await Table.findById(req.params.id);

  if (!table) return res.status(404).json({ message: "Table not found" });
  if (user?.restaurantId?.toString() !== table.restaurantId.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await table.deleteOne();
  res.status(204).end();
}) as RequestHandler);

export default router;
