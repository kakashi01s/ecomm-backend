import { Router } from "express";
import { ProfileController } from "../../profile/profile.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { optionalAuthenticate } from "../../../middlewares/optionalauth.middleware.js";  // ← change import

const router = Router();


router.post("/pincode", optionalAuthenticate, ProfileController.updatePincode);  // ← add middleware

export { router };
