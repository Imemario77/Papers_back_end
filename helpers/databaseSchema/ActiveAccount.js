import mongoose from "mongoose";

// to know the account a user is currently loged into in
const ActiveLoginAccountSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ActiveLoginAccount = new mongoose.model(
  "activeLoginAccount",
  ActiveLoginAccountSchema
);
