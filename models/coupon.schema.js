import mongoose from "mongoose";

const couponSchema = new mongoose(
  {
    code: {
      type: String,
      required: [true, "Please provide a coupon name"],
    },
    code: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Coupon", couponSchema);
