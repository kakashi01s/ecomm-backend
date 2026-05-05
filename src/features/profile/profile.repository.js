import prisma from "../../core/prisma/client.js";

export class ProfileRepository {

  static async getUserById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  }

  static async updateUser(userId, { name, phone, avatarUrl }) {
    return prisma.user.update({
      where: { id: userId },
      data: { name, phone, avatarUrl },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
  }

  // ── Addresses ──────────────────────────────────────────────────────
  static async getAddresses(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  static async getAddressById(addressId, userId) {
    return prisma.address.findFirst({ where: { id: addressId, userId } });
  }

  static async createAddress(userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  }

  static async updateAddress(addressId, userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.update({ where: { id: addressId }, data });
  }

  static async deleteAddress(addressId, userId) {
    return prisma.address.delete({ where: { id: addressId, userId } });
  }

  // ── Orders ─────────────────────────────────────────────────────────
  static async getOrders(userId) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
    });
  }

  static async getOrderById(orderId, userId) {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: { product: { select: { name: true, images: true, price: true } } },
        },
        address: true,
      },
    });
  }
}
