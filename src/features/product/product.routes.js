import express from "express";
import { ProductController } from "./product.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication and admin role check to ALL routes
router.use(authenticate);
router.use(requireAdmin);

// Get all categories (useful for product creation form)
router.get("/categories", ProductController.getCategories);

// Generate image upload URLs (call this before creating/updating products)
router.post("/upload-urls", ProductController.getImageUploadUrls);

// CRUD Operations
router.post("/", ProductController.createProduct);
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.put("/:id", ProductController.updateProduct);

// Soft delete (deactivate)
router.patch("/:id/deactivate", ProductController.deactivateProduct);

// Toggle active status
router.patch("/:id/toggle-status", ProductController.toggleProductStatus);

// Hard delete
router.delete("/:id", ProductController.deleteProduct);

export { router };
