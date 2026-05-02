import { Router } from "express";
import { DashboardController } from "../../app/dashboard/dashboard.controller.js";
import { SearchController } from "../../search/search.controller.js";
import { optionalAuthenticate } from "../../../middlewares/optionalauth.middleware.js";

const router = Router();
router.use(optionalAuthenticate);

// Dashboard home
router.get("/", DashboardController.getDashboard);

// Lean suggestions — called directly by nativeSearchOverlay in Flutter
// No full UI rebuild, just returns { results: [] }
router.post("/search/suggestions", SearchController.suggestions);

export { router };