import { Router } from "express";
import { VerifyOTP, resendOtp } from "../controllers/otpController.js";
import { deletePrevPasswordAndReset } from "../controllers/userController.js";

const route = Router();

route.post("/verify", VerifyOTP);
route.post("/resend", resendOtp);
route.post("/password", deletePrevPasswordAndReset);

export default route;
