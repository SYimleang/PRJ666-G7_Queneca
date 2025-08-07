import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem {
  _id?: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string; // Appetizer, Main, Dessert, etc.
  available: boolean;
  imageUrl?: string;
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    gluten_free: boolean;
    halal: boolean;
  };
  promotions?: {
    discountPercentage: number;
    validUntil: Date;
  };
}

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId;
  menuItems: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ingredients: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    dietaryInfo: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      gluten_free: { type: Boolean, default: false },
      halal: { type: Boolean, default: false },
    },
    promotions: {
      discountPercentage: { type: Number, default: 0 },
      validUntil: { type: Date, default: null },
    },
  },
  { _id: false } // Avoid auto-generating _id for subdocs
);

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    menuItems: [menuItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IMenu>("Menu", menuSchema);
