import { Router } from "express";
import { DashboardController } from "../../app/dashboard/dashboard.controller.js";
import { SearchController } from "../../search/search.controller.js";
import { optionalAuthenticate } from "../../../middlewares/optionalauth.middleware.js";

const router = Router();
router.use(optionalAuthenticate);

// Dashboard home
router.get("/", DashboardController.getDashboard);



export { router };