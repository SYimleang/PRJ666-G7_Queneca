// models/Table.ts
import { Document, Schema, models, model } from "mongoose";

export interface ITable extends Document {
  restaurantId: string;
  tableNumber: number;
  status: "available" | "occupied";
  seatedParty?: {
    name: string;
    size: number;
    waitlistId?: string;
  };
  seats: number;
}

const TableSchema = new Schema<ITable>({
  restaurantId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ["available", "occupied"],
    default: "available",
  },
  seatedParty: {
    name: String,
    size: Number,
    waitlistId: String,
  },
  seats: { type: Number, required: true },
});

export default models.Table || model<ITable>("Table", TableSchema);
