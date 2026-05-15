import { Router } from "express";
import { CategoryController } from "./category.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";
import { optionalAuthenticate } from "../../middlewares/optionalauth.middleware.js";

const router = Router();


router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// Public but Pincode/Cart Aware
router.get("/:id/products", optionalAuthenticate, CategoryController.getCategoryProducts);
router.post("/:id/products/filter", optionalAuthenticate, CategoryController.filterCategoryProducts);
router.get("/:id/filters", optionalAuthenticate, CategoryController.getFilterScreen);

// Admin Only
router.use(authenticate);
router.use(requireAdmin);

router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;