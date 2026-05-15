import { WishlistService } from "./wishlist.service.js";
import { WishlistUI } from "./wishlist.ui.js";
import { stac } from "../../core/sdui/StacWidgets.js";
import prisma from "../../core/prisma/client.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";

export class WishlistController {

  // GET /wishlist — returns the full wishlist screen UI
  static async getWishlist(req, res) {
    try {
      const user = req.user;
      const items = await WishlistService.getWishlist(user.id);
      
      console.log(`[WISHLIST DEBUG] User ID: ${user.id}, Items Count: ${items.length}`);
      if (items.length > 0) {
        console.log(`[WISHLIST DEBUG] First item product ID: ${items[0].product?.id}`);
      }

      // Include global counts so the appbar badges sync on page load
      const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
      console.log(`[WISHLIST DEBUG] GlobalMeta Wishlist Count: ${meta.wishlistCount}`);
      
      return res.json({ ui: WishlistUI.buildWishlistScreen(items), meta });
    } catch (err) {
      console.error("[WISHLIST DEBUG] Error:", err);
      return res.status(500).json({ message: "Failed to load wishlist", error: err.message });
    }
  }

  // POST /api/user/wishlist/toggle — used by product cards and product page heart
  static async toggleWishlist(req, res) {
    try {
      const user = req.user;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId required" });

      const result = await WishlistService.toggle(user.id, Number(productId));
      const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);

      meta[`wishlist_${productId}`] = result.wishlisted;

      return res.json({ data: result, meta });
    } catch (err) {
      return res.status(500).json({ message: "Failed to toggle wishlist", error: err.message });
    }
  }

  // POST /api/user/wishlist/remove — used by wishlist screen X button
  static async removeFromWishlist(req, res) {
    try {
      const user = req.user;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId required" });

      await WishlistService.remove(user.id, Number(productId));
      const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);

      // Mark the product as un-wishlisted so any open product page reacts
      meta[`wishlist_${productId}`] = false;

      return res.json({ success: true, meta });
    } catch (err) {
      return res.status(500).json({ message: "Failed to remove from wishlist", error: err.message });
    }
  }

  // POST /api/user/wishlist/move-to-cart
  static async moveToCart(req, res) {
    try {
      const user = req.user;
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId required" });

      await WishlistService.moveToCart(user.id, Number(productId));
      
      const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);

      // Product now has qty 1 in cart AND is no longer wishlisted
      meta[`cart_qty_${productId}`] = 1;
      meta[`wishlist_${productId}`] = false;

      return res.json({ success: true, meta });
    } catch (err) {
      return res.status(500).json({ message: "Failed to move to cart", error: err.message });
    }
  }
}