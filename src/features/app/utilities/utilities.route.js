import { Router } from "express";
import { ProfileController } from "../../profile/profile.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";

const router = Router();


router.post("/pincode",ProfileController.updatePincode);

export { router };
