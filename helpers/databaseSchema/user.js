import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = new mongoose.model("user", userSchema);
