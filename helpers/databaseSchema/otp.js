import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: String,
  id: String,
  created: String,
  expries: String,
});

export const Otp = new mongoose.model("otp", otpSchema);
