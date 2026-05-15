// src/core/utils/globalState.util.js

import prisma from "../../../core/prisma/client.js";
import { SDUIConfig } from "../../../core/sdui/sdui.constants.js";

export class GlobalStateHelper {
  /**
   * Returns the absolute baseline meta configuration required by the Flutter app.
   * Use this for guest responses or when you need to start with a clean meta object.
   */
  static baseMeta() {
    return {
      stringTargetKeys: SDUIConfig.stringTargetKeys,
    };
  }

  /**
   * Extracts standard global state variables (cartCount, wishlistCount, activePincode)
   * PLUS individual cart quantities for every product to sync SDUI buttons.
   */
  static async getGlobalMeta(user, reqHeaders = {}) {
    let cartCount = 0;
    let wishlistCount = 0;
    let activePincode = reqHeaders['x-pincode'] || null;
    let productQuantities = {};

    if (user) {
      const userId = user.id;
      const [cartItems, wishlistItems, userRecord] = await Promise.all([
        prisma.cartItem.findMany({
          where: { 
            userId,
            product: { isActive: true }
          },
          select: { productId: true, quantity: true }
        }),
        prisma.wishlist.findMany({
          where: { 
            userId,
            product: { isActive: true }
          },
          select: { productId: true }
        }),
        // Only query DB for pincode if not provided in headers
        activePincode ? Promise.resolve(null) : prisma.user.findUnique({
          where: { id: userId },
          select: { activePincode: true },
        }),
      ]).catch((error) => {
        console.error("[GLOBAL STATE] Error fetching counts:", error.message);
        return [[], [], null];
      });

      // Calculate total cartCount and prepare individual product quantities
      cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      cartItems.forEach(item => {
        productQuantities[`cart_qty_${item.productId}`] = item.quantity;
      });

      wishlistCount = wishlistItems.length;
      wishlistItems.forEach(item => {
        productQuantities[`wishlist_${item.productId}`] = true;
      });
      if (!activePincode) {
        activePincode = userRecord?.activePincode ?? null;
      }
    }

    return {
      ...GlobalStateHelper.baseMeta(),
      ...productQuantities, // Spread individual quantities like { cart_qty_1: 2, cart_qty_5: 1 }
      cartCount,
      wishlistCount,
      activePincode,
    };
  }
}