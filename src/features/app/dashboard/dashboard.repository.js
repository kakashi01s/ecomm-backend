import prisma from "../../../core/prisma/client.js";
import { ProductRepository } from "../../product/product.repository.js";

export class DashboardRepository {
  
  // Fetch only active banners, ordered by newest first
  static async getActiveBanners() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Aggregates all the data the Dashboard UI needs in one clean function
  static async getDashboardPayloadData(productLimit = 8) {
    const [productsResult, categories, banners] = await Promise.all([
      ProductRepository.getAllProducts({ limit: productLimit, isActive: "true" }),
      ProductRepository.getAllCategories(),
      this.getActiveBanners()
    ]);

    return {
      products: productsResult.products,
      categories,
      banners
    };
  }
}