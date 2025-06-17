import mongoose, { Document, Schema } from "mongoose";

export interface IWaitlistSettings {
  autoRemoveMinutes: number;
  maxCapacity: number;
  estimatedWaitTimePerCustomer: number;
  tableReadyNotificationMessage: string;
}

export interface IRestaurant extends Document {
  name: string;
  phone: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: {
    open: string;
    close: string;
  };
  rating?: number;
  ownerId: mongoose.Types.ObjectId; // User with role=admin
  logoUrl: string;
  qrCode: string;
  waitlistSettings: IWaitlistSettings;
  createdAt: Date;
  updatedAt: Date;
  // waitlist ID
  // staff list ID
  // menu ID
}

const waitlistSettingsSchema = new Schema<IWaitlistSettings>(
  {
    autoRemoveMinutes: { type: Number, default: 30 },
    maxCapacity: { type: Number, default: 50 },
    estimatedWaitTimePerCustomer: { type: Number, default: 15 },
    tableReadyNotificationMessage: {
      type: String,
      default: "Your table is ready! Please come to the host stand.",
    },
  },
  { _id: false }
);

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      region: { type: String, required: true }, // province/state
      zip: { type: String, required: true },
    },
    hours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    rating: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    logoUrl: { type: String, required: false },
    qrCode: { type: String, required: false },
    waitlistSettings: { type: waitlistSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model<IRestaurant>("Restaurant", restaurantSchema);
