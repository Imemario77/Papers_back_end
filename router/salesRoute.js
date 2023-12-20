import { Router } from "express";
import {
  createSales,
  deleteOneSales,
  getAllSales,
  getOneSales,
  getSalesAmount,
} from "../controllers/salesConroller.js";

const route = Router();

route.post("/create", createSales);
route.get("/find", getAllSales);
route.get("/get-one-sale/:salesId", getOneSales);
route.delete("/delete/:salesId", deleteOneSales);
route.get("/getAmount/:selectedTime", getSalesAmount);

export default route;
