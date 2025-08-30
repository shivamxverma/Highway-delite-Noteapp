import { Router } from "express";
import { googleAuth, refreshAccessToken, generateOTP, registerUser, logoutUser,loginUser } from "../controllers/user.controller.js";
import otpRateLimiter from "../middlewares/ratelimit.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/generateotp", otpRateLimiter, generateOTP);
router.post("/auth/google", googleAuth);
router.get("/refresh", refreshAccessToken);
router.post("/logout",verifyJWT, logoutUser);

export default router;