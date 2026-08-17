import express from "express";
import {
    checkAuth,
    login,
    logout, 
    signup, 
    updateProfile, 
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    validateSignup, 
    validateLogin, 
    validateUpdateProfile
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.put("/update-profile", protectRoute, validateUpdateProfile, updateProfile);
router.post("/forgot-password", forgotPassword);
router.get("/check", protectRoute, checkAuth);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
export default router;
