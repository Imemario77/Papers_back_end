import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      // type of expensis made n
      type: String,
      required: true,
    },
    attachment: String, // document to be attached
    amount: {
      type: Number,
      required: true,
    },
    vendor: String,

    remarks: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    businessId: {
      type: String,
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

export const Expense = new mongoose.model("expense", expenseSchema);
