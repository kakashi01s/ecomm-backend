import prisma from "../../core/prisma/client.js";

export class SearchRepository {
  /**
   * Fast prefix/fuzzy search across products and categories using pg_trgm logic.
   * Returns a flat list shaped for the nativeSearchOverlay widget.
   */
  static async suggest(query, limit = 10) {
    const term = query.trim();
    if (!term || term.length < 2) return [];

    // '%' add kar rahe hain wildcard search ke liye
    const dbTerm = `%${term}%`;
    const keywords = term.split(/\s+/).filter(k => k.length > 1);
    const keywordConditions = keywords.map(k => `%${k}%`);

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
          ) AS "imageUrl",
          -- Relevance scoring
          (CASE WHEN p.name ILIKE ${dbTerm} THEN 10 ELSE 0 END) +
          (CASE WHEN p.description ILIKE ${dbTerm} THEN 5 ELSE 0 END) AS relevance
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE p."isActive" = true 
          AND (
            p.name ILIKE ${dbTerm} 
            OR p.description ILIKE ${dbTerm}
            OR EXISTS (
              SELECT 1 FROM unnest(${keywordConditions}::text[]) k 
              WHERE p.name ILIKE k OR p.description ILIKE k
            )
          )
        ORDER BY relevance DESC, p.name ASC
        LIMIT ${limit}
      `,
      prisma.$queryRaw`
        SELECT id, name 
        FROM "Category" 
        WHERE name ILIKE ${dbTerm} 
           OR EXISTS (
              SELECT 1 FROM unnest(${keywordConditions}::text[]) k 
              WHERE name ILIKE k
            )
        ORDER BY (CASE WHEN name ILIKE ${dbTerm} THEN 1 ELSE 2 END), name ASC
        LIMIT 5
      `
    ]);

    const categoryItems = categories.map((cat) => ({
      name: cat.name,
      subtitle: "Category",
      imageUrl: null,
      action: {
        actionType: "server_navigate",
        url: `/categories/${cat.id}/products`,
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
