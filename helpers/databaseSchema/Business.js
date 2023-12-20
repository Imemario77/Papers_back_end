import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: {
      // the name of the business
      type: String,
      required: true,
    },
    email: {
      // the email of the buisness
      type: String,
      unique: true,
    },
    adminId: {
      // the bussiness creator id
      type: String,
      required: true,
    },
    description: String,
    employees: Array, // to  save all the id's of the employees
  },
  {
    timestamps: true,
  }
);

export const Business = new mongoose.model("business", businessSchema);
