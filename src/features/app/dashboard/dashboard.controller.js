import { DashboardRepository } from "./dashboard.repository.js";
import { redisManager } from "../../../config/redisClient.js";
import prisma from "../../../core/prisma/client.js";
import { DashboardUI } from "./dashboard.ui.js"; // <-- Import the new UI builder!

export class DashboardController {
  static CACHE_KEY = "dashboard_data";
  static CACHE_TTL = 300;

  static async getCachedBackgroundData() {
    const cachedString = await redisManager.client.get(DashboardController.CACHE_KEY);
    if (cachedString) return JSON.parse(cachedString);

    const dbData = await DashboardRepository.getDashboardPayloadData();
    const payload = {
      products:   dbData.products,
      categories: dbData.categories,
      banners:    dbData.banners,
    };
    await redisManager.client.setEx(
      DashboardController.CACHE_KEY,
      DashboardController.CACHE_TTL,
      JSON.stringify(payload)
    );
    return payload;
  }

static async getDashboard(req, res) {
  try {
    const user = req.user || null;
    const dashboardUi = await DashboardController.getDashboardUiPayload(user);

    let cartCount = 0;
    let wishlistCount = 0;
    let activePincode = req.headers['x-pincode'] || null; // ← header is fast path

    if (user) {
      const [cartTotal, wishlistTotal, userRecord] = await Promise.all([  // ← add userRecord
        prisma.cartItem.aggregate({
          where: { userId: user.id },
          _sum: { quantity: true },
        }),
        prisma.wishlist.count({
          where: { userId: user.id },
        }),
        prisma.user.findUnique({                  // ← ADD THIS
          where: { id: user.id },
          select: { activePincode: true },
        }),
      ]).catch((error) => {
        console.error("[DASHBOARD] Error:", error.message);
        return [{ _sum: { quantity: 0 } }, 0, null];
      });

      cartCount = cartTotal?._sum?.quantity ?? 0;
      wishlistCount = wishlistTotal ?? 0;
      activePincode = activePincode ?? userRecord?.activePincode ?? null; // ← DB fallback
    }

    return res.json({
      ui: dashboardUi,
      meta: { cartCount, wishlistCount, activePincode },  // ← already correct
    });
  } catch (error) {
    return res.status(500).json({ message: "Dashboard error", error: error.message });
  }
}

static async getDashboardUiPayload(user) {
    const { products, categories, banners } = await DashboardController.getCachedBackgroundData();

    // ── THE FIX: Fetch user-specific data OUTSIDE the generic cache ──
    const userCartMap = {};
    const userWishlistSet = new Set();

    if (user) {
      const [cartItems, wishlists] = await Promise.all([
        prisma.cartItem.findMany({ where: { userId: user.id } }),
        prisma.wishlist.findMany({ where: { userId: user.id } })
      ]).catch(() => [[], []]);

      cartItems.forEach(c => { userCartMap[c.productId] = c.quantity; });
      wishlists.forEach(w => { userWishlistSet.add(w.productId); });
    }

    // Pass the truth maps down to the UI builder
    return DashboardUI.buildDashboardUi(user, products, categories, banners, userCartMap, userWishlistSet);
  }
}