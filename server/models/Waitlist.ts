import mongoose, { Document, Schema } from "mongoose";

export interface IWaitlist extends Document {
  restaurantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  notes?: string;
  status: "waiting" | "called" | "seated" | "cancelled" | "no-show";
  position: number;
  estimatedWaitTime: number; // in minutes
  joinedAt: Date;
  calledAt?: Date;
  seatedAt?: Date;
  cancelledAt?: Date;
  noShowAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistSchema = new Schema<IWaitlist>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    partySize: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["waiting", "called", "seated", "cancelled", "no-show"],
      default: "waiting",
    },
    position: { type: Number, required: true },
    estimatedWaitTime: { type: Number, required: true }, // in minutes
    joinedAt: { type: Date, default: Date.now },
    calledAt: { type: Date },
    seatedAt: { type: Date },
    cancelledAt: { type: Date },
    noShowAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

// Index for efficient querying
waitlistSchema.index({ restaurantId: 1, status: 1, position: 1 });
waitlistSchema.index({ customerId: 1, restaurantId: 1, status: 1 });

export default mongoose.model<IWaitlist>("Waitlist", waitlistSchema);
