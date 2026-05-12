import { DashboardRepository } from "./dashboard.repository.js";
import { redisManager } from "../../../config/redisClient.js";
import prisma from "../../../core/prisma/client.js";
import { DashboardUI } from "./dashboard.ui.js"; // <-- Import the new UI builder!
import { GlobalStateHelper } from "../utilities/globalState.util.js";

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
      
      // Fetch the unified global meta state!
      const metaState = await GlobalStateHelper.getGlobalMeta(user, req.headers);

      return res.json({
        ui: dashboardUi,
        meta: metaState, // Inject into GetX automatically
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