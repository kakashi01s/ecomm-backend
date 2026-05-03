import { WishlistRepository } from "./wishlist.repository.js";

export class WishlistService {
  static async getWishlist(userId) {
    return WishlistRepository.getByUserId(userId);
  }

  static async toggle(userId, productId) {
    return WishlistRepository.toggle(userId, productId);
  }

  static async remove(userId, productId) {
    await WishlistRepository.removeByProductId(userId, productId);
  }

  static async moveToCart(userId, productId) {
    await WishlistRepository.moveToCart(userId, productId);
  }
}
