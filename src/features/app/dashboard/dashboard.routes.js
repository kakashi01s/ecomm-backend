import { Router } from "express";
import { DashboardController } from "../../app/dashboard/dashboard.controller.js";
import { optionalAuthenticate } from "../../../middlewares/optionalauth.middleware.js";

const router = Router();
router.use(optionalAuthenticate);
// This is just '/' because it will be mounted at '/dashboard' in index.js
router.get("/", DashboardController.getDashboard);

export  { router};