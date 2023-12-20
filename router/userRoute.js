import { Router } from "express";
import {
  resetPassword,
  update_email,
  update_firstName,
  update_lastName,
  update_number,
  update_password,
} from "../controllers/userController.js";

const route = Router();

route.post("/email", update_email);
route.post("/firstname", update_firstName);
route.post("/lastname", update_lastName);
route.post("/number", update_number);
route.post("/password", update_password);
route.post("/reset/password", resetPassword);
route.post("/verify/otp", resetPassword);

export default route;
