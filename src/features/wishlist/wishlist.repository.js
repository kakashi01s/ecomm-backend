import prisma from "../../core/prisma/client.js";

export class WishlistRepository {
  static async getByUserId(userId) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  static async findItem(userId, productId) {
    return prisma.wishlist.findFirst({
      where: { userId, productId },
    });
  }

  static async add(userId, productId) {
    return prisma.wishlist.create({
      data: { userId, productId },
    });
  }

  static async remove(wishlistId, userId) {
    return prisma.wishlist.deleteMany({
      where: { id: wishlistId, userId },
    });
  }

  static async removeByProductId(userId, productId) {
    return prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
  }

  static async toggle(userId, productId) {
    const existing = await WishlistRepository.findItem(userId, productId);
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    } else {
      await prisma.wishlist.create({ data: { userId, productId } });
      return { wishlisted: true };
    }
  }

  static async moveToCart(userId, productId) {
    // Add to cart (or increment if exists), then remove from wishlist
    await prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findFirst({
        where: { userId, productId },
      });
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: 1 } },
        });
      } else {
        await tx.cartItem.create({ data: { userId, productId, quantity: 1 } });
      }
      await tx.wishlist.deleteMany({ where: { userId, productId } });
    });
  }
}
