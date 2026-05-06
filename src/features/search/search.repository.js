import prisma from "../../core/prisma/client.js";

export class SearchRepository {
  /**
   * Fast prefix/fuzzy search across products and categories using pg_trgm logic.
   * Returns a flat list shaped for the nativeSearchOverlay widget.
   */
  static async suggest(query, limit = 10) {
    const term = query.trim();
    if (!term || term.length < 2) return [];

    // '%' add kar rahe hain wildcard search ke liye, jo pg_trgm index use karega
    const dbTerm = `%${term}%`;

    const [products, categories] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          p.id, 
          p.name, 
          p.price, 
          p."salePrice", 
          c.name AS "categoryName",
          (
            SELECT url 
            FROM "ProductImage" 
            WHERE "productId" = p.id 
            ORDER BY id ASC 
            LIMIT 1
          ) AS "imageUrl"
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."isActive" = true 
          AND (p.name ILIKE ${dbTerm} OR p.description ILIKE ${dbTerm})
        ORDER BY p.name ASC
        LIMIT ${limit}
      `,
      prisma.$queryRaw`
        SELECT id, name 
        FROM "Category" 
        WHERE name ILIKE ${dbTerm} 
        LIMIT 3
      `
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
      subtitle: p.categoryName || " ", 
      imageUrl: p.imageUrl || null,    
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
