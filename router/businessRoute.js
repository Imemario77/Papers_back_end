import { Router } from "express";
import {
  addUserToBusiness,
  allBusinessStaffs,
  createBusiness,
  getBusinessDetails,
  removeUserFromBusiness,
  updateUserRole,
} from "../controllers/BusinessController.js";

const route = Router();

route.post("/create", createBusiness);
route.put("/add/user", addUserToBusiness);
route.put("/remove/user", removeUserFromBusiness);
route.get("/fetch", getBusinessDetails);
route.get("/fetch/allStaffs", allBusinessStaffs);
route.put("/update/user/role", updateUserRole);

export default route;
