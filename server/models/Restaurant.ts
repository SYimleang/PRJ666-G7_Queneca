import mongoose, { Document, Schema } from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    hours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    rating: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRestaurant>("Restaurant", restaurantSchema);
