import prisma from "../../core/prisma/client.js";

export class ProfileRepository {

  static async getUserById(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
  }

static async updateUser(userId, { name, phone, avatarUrl, activePincode }) {
    return prisma.user.update({
      where: { id: userId },
      data: { name, phone, avatarUrl, activePincode }, // Added activePincode here
      select: { id: true, name: true, email: true, phone: true, activePincode: true },
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
    const addressCount = await prisma.address.count({ where: { userId } });
    
    // If first address, always make it default. Otherwise use passed flag.
    let isDefault = addressCount === 0 
      ? true 
      : (data.isDefault === true || data.isDefault === "true");

    if (isDefault && addressCount > 0) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return prisma.address.create({ 
      data: { 
        ...data, 
        userId, 
        isDefault,
        id: undefined // Ensure id is not passed
      } 
    });
  }

  static async updateAddress(addressId, userId, data) {
    const isDefault = data.isDefault === true || data.isDefault === "true";
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const { id, userId: uId, ...updateData } = data;
    return prisma.address.update({ 
      where: { id: addressId }, 
      data: {
        ...updateData,
        isDefault
      }
    });
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
