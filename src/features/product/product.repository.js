import prisma from "../../core/prisma/client.js";

export class ProductRepository {
  /**
   * Create a new product with images
   */
  static async createProduct(data) {
    const { images, variants, ...productData } = data;

    return prisma.product.create({
      data: {
        ...productData,
        images: images
          ? {
              create: images.map((url) => ({ url })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants,
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  /**
   * Get all products with pagination and filters
   */
  static async getAllProducts({
    page = 1,
    limit = 20,
    categoryId,
    isActive,
    search,
  }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (categoryId) where.categoryId = parseInt(categoryId);
    if (typeof isActive !== "undefined") where.isActive = isActive === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: true,
          variants: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(id) {
    return prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  /**
   * Update a product
   */
  static async updateProduct(id, data) {
    const { images, variants, ...productData } = data;

    // If images are provided, delete old ones and create new ones
    const updateData = {
      ...productData,
    };

    if (images) {
      updateData.images = {
        deleteMany: {},
        create: images.map((url) => ({ url })),
      };
    }

    if (variants) {
      updateData.variants = {
        deleteMany: {},
        create: variants,
      };
    }

    return prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  /**
   * Delete a product (soft delete by setting isActive to false)
   */
  static async softDeleteProduct(id) {
    return prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete a product
   */
  static async deleteProduct(id) {
    // Delete related records first
    await prisma.productImage.deleteMany({
      where: { productId: parseInt(id) },
    });

    await prisma.productVariant.deleteMany({
      where: { productId: parseInt(id) },
    });

    await prisma.cartItem.deleteMany({
      where: { productId: parseInt(id) },
    });

    await prisma.wishlist.deleteMany({
      where: { productId: parseInt(id) },
    });

    // Then delete the product
    return prisma.product.delete({
      where: { id: parseInt(id) },
    });
  }

  /**
   * Get all categories
   */
  static async getAllCategories() {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * Check if product exists
   */
  static async productExists(id) {
    const count = await prisma.product.count({
      where: { id: parseInt(id) },
    });
    return count > 0;
  }
}
