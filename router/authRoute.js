import { Router } from "express";
import {
  loginController,
  logoutController,
  signUpController,
} from "../controllers/authController.js";

const route = Router();

route.post("/login", loginController);
route.post("/logout", logoutController);
route.post("/signup", signUpController);


export default route