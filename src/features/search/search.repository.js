import prisma from "../../core/prisma/client.js";

export class SearchRepository {
  /**
   * Fast prefix search across products and categories.
   * Returns a flat list shaped for the nativeSearchOverlay widget.
   */
  static async suggest(query, limit = 10) {
    const term = query.trim();
    if (!term || term.length < 2) return [];

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          price: true,
          salePrice: true,
          images: { select: { url: true }, take: 1 },
          category: { select: { name: true } },
        },
        take: limit,
        orderBy: { name: "asc" },
      }),

      prisma.category.findMany({
        where: { name: { contains: term, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 3,
      }),
    ]);

    const categoryItems = categories.map((cat) => ({
      name: cat.name,
      subtitle: "Category",
      imageUrl: null,
      action: {
        actionType: "server_navigate",
        url: `/category/${cat.id}`,
        action: "push",
      },
    }));

    const productItems = products.map((p) => ({
      name: p.name,
      subtitle: p.category?.name ?? " ",
      imageUrl: p.images?.[0]?.url ?? null,
      action: {
        actionType: "server_navigate",
        url: `/product/${p.id}`,
        action: "push",
      },
    }));

    // Categories first, then products
    return [...categoryItems, ...productItems];
  }
}
