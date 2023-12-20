import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    businessId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Role = new mongoose.model("role", roleSchema);
