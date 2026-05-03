import express from "express";
import { WishlistController } from "./wishlist.controller.js";
import {
  authenticate,
  requireAdmin,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All wishlist routes require auth
router.use(authenticate);

router.get("/",                  WishlistController.getWishlist);
router.post("/toggle",           WishlistController.toggleWishlist);
router.post("/remove",           WishlistController.removeFromWishlist);
router.post("/move-to-cart",     WishlistController.moveToCart);

export default router;
