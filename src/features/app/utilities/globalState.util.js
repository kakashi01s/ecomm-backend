// src/core/utils/globalState.util.js

import prisma from "../../../core/prisma/client.js";

export class GlobalStateHelper {
  /**
   * Extracts standard global state variables (cartCount, wishlistCount, activePincode)
   * Call this in ANY controller before sending a response to keep Flutter in sync.
   */
  static async getGlobalMeta(user, reqHeaders = {}) {
    let cartCount = 0;
    let wishlistCount = 0;
    let activePincode = reqHeaders['x-pincode'] || null;

    if (user) {
      const [cartTotal, wishlistTotal, userRecord] = await Promise.all([
        prisma.cartItem.aggregate({
          where: { userId: user.id },
          _sum: { quantity: true },
        }),
        prisma.wishlist.count({
          where: { userId: user.id },
        }),
        // Only query DB for pincode if not provided in headers
        activePincode ? Promise.resolve(null) : prisma.user.findUnique({
          where: { id: user.id },
          select: { activePincode: true },
        }),
      ]).catch((error) => {
        console.error("[GLOBAL STATE] Error fetching counts:", error.message);
        return [{ _sum: { quantity: 0 } }, 0, null];
      });

      cartCount = cartTotal?._sum?.quantity ?? 0;
      wishlistCount = wishlistTotal ?? 0;
      if (!activePincode) {
        activePincode = userRecord?.activePincode ?? null;
      }
    }

    return {
      cartCount,
      wishlistCount,
      activePincode,
    };
  }
}