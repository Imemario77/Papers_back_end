import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    salesId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    productSalesId: {
      type: Array,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    logo: String,
    dueDate: {
      type: Date,
      required: true,
    },
    recorderId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = new mongoose.model("invoice", invoiceSchema);
