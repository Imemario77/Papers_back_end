import { Router } from "express";
import {
  addVendor,
  deleteVendor,
  editVendor,
  getAllVendors,
} from "../controllers/vendorController.js";

const route = Router();

route.post("/add", addVendor);
route.put("/edit", editVendor);
route.get("/get", getAllVendors);
route.delete("/remove/:email", deleteVendor);

export default route;
