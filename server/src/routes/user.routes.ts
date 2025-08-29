import { Router } from "express";
import { googleAuth,refreshAccessToken,generateOTP,registerUser } from "../controllers/user.controller.js";

const router = Router();


router.post("/register",registerUser);
router.post("/generateotp",generateOTP);
router.get("/auth/google",googleAuth);
router.get("/refresh",refreshAccessToken);

export default router;