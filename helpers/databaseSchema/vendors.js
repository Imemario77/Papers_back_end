import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    businessId: {
      type: String,
      required: true,
    },
    address: String,
  },
  {
    timestamps: true,
  }
);

export const Vendor = new mongoose.model("vendor", vendorSchema);
