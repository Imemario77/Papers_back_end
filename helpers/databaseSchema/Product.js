import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      // the name of the business
      type: String,
      required: true,
    },
    businessId: {
      type: String,
      required: true,
    },
    productId: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    quantity: Number,
    image: String,
  },
  {
    timestamps: true,
  }
);

export const Product = new mongoose.model("product", productSchema);
