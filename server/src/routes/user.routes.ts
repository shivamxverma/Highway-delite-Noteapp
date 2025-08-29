import { Router } from "express";
import { googleAuth,refreshAccessToken,generateOTP,registerUser } from "../controllers/user.controller.js";
import otpRateLimiter from "../middlewares/ratelimit.middleware.js";

const router = Router();


router.post("/register",registerUser);
router.post("/generateotp",otpRateLimiter,generateOTP);
router.get("/auth/google",googleAuth);
router.get("/refresh",refreshAccessToken);

export default router;