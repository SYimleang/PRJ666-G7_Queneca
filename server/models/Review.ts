import mongoose, { Document, Schema } from "mongoose";

interface IReviewResponse {
  comment: string;
  createdAt: Date;
}

export interface IReview extends Document {
  restaurantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  response?: IReviewResponse;
}

const reviewSchema = new Schema<IReview>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    response: {
      comment: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", reviewSchema);
