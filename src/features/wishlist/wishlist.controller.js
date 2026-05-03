import { WishlistService } from "./wishlist.service.js";
import { WishlistUI } from "./wishlist.ui.js";
import { stac } from "../../core/sdui/StacWidgets.js";
import prisma from "../../core/prisma/client.js"; // <-- ADD THIS LINE
export class WishlistController {

  static async getGlobalCounts(userId) {
    if (!userId) return { cartCount: 0, wishlistCount: 0 };
    const [cartTotal, wishlistTotal] = await Promise.all([
      prisma.cartItem.aggregate({ where: { userId }, _sum: { quantity: true } }),
      prisma.wishlist.count({ where: { userId } }),
    ]).catch(() => [{ _sum: { quantity: 0 } }, 0]);
    return {
      cartCount: cartTotal?._sum?.quantity ?? 0,
      wishlistCount: wishlistTotal ?? 0
    };
  }

  // GET /wishlist — returns the full wishlist screen UI
  static async getWishlist(req, res) {
    try {
      const userId = req.user.id;
      const items = await WishlistService.getWishlist(userId);
      return res.json({ ui: WishlistUI.buildWishlistScreen(items) });
    } catch (err) {
      return res.status(500).json({ message: "Failed to load wishlist", error: err.message });
    }
  }

  // POST /api/user/wishlist/toggle — used by product cards
  static async toggleWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId required" });

      const result = await WishlistService.toggle(userId, Number(productId));
      const meta = await WishlistController.getGlobalCounts(userId);

      return res.json({ data: result, meta });
    } catch (err) {
      return res.status(500).json({ message: "Failed to toggle wishlist", error: err.message });
    }
  }

  // POST /api/user/wishlist/remove — used by wishlist screen X button
  static async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId required" });

      await WishlistService.remove(userId, Number(productId));
      const meta = await WishlistController.getGlobalCounts(userId);

      return res.json({ success: true, meta });
    } catch (err) {
      return res.status(500).json({ message: "Failed to remove from wishlist", error: err.message });
    }
  }

  // POST /api/user/wishlist/move-to-cart
    static async moveToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId required" });

      await WishlistService.moveToCart(userId, Number(productId));
      
      const meta = await WishlistController.getGlobalCounts(userId);
      // ── The Silent Healer: Tell Flutter this product now has qty 1 in the cart
      meta.updatedProductQty = { productId: parseInt(productId), quantity: 1 };

      return res.json({ success: true, meta });
    } catch (err) {
      return res.status(500).json({ message: "Failed to move to cart", error: err.message });
    }
  }
}
