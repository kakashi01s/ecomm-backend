import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/",     ProfileController.getOrders);
router.get("/:id",  ProfileController.getOrderDetails);
router.get("/track", (req, res) => res.redirect("/api/profile/pages/track"));

export default router;
