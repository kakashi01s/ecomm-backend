import { Router } from "express";
import { CategoryController } from "./category.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = Router();


router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

//  
router.use(authenticate);
router.use(requireAdmin);

router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;