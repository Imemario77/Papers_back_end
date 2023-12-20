import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    saleDate: {
      type: Date,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
    invoiced: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Sales = new mongoose.model("sales", salesSchema);
