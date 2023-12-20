import { Router } from "express";
import {
  addCustomer,
  deleteCustomer,
  editCustomer,
  getAllCustomers,
} from "../controllers/customerController.js";
const route = Router();

route.post("/add", addCustomer);
route.put("/edit", editCustomer);
route.get("/get", getAllCustomers);
route.delete("/remove/:email", deleteCustomer);

export default route;
