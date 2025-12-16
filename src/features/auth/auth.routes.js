import express from "express";
import { AuthController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
// Step 1: Initiates the process (Login or Signup/Verify)
router.post("/login", AuthController.loginOrStartCreation);

// Step 2: Verifies OTP and completes the action (Login or Finalize Creation)
router.post("/verify", AuthController.verifyLoginOrCreation);

// Step 3: Refresh access token
router.post("/refresh", AuthController.refreshToken);

// Protected routes (authentication required)
// Step 4: Logout
router.post("/logout", authenticate, AuthController.logout);

// Step 5: Get current user info
router.get("/me", authenticate, AuthController.getCurrentUser);

export { router };
