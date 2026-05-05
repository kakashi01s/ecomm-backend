import { Router } from "express";
import { SearchController } from "../search/search.controller.js";
import { optionalAuthenticate } from "../../middlewares/optionalauth.middleware.js";

const router = Router();
router.use(optionalAuthenticate);


// Lean suggestions — called directly by nativeSearchOverlay in Flutter
// No full UI rebuild, just returns { results: [] }
router.post("/suggestions", SearchController.suggestions);
router.get("/results", SearchController.getResults);
router.get("/", SearchController.getSearchScreen);              // Loads the page
router.post("/live", SearchController.liveSearch);

export { router };