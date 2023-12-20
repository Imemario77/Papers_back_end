import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
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

export const Customer = new mongoose.model("customer", customerSchema);
