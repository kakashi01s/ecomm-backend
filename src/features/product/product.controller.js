import { ProductRepository } from "./product.repository.js";
import { ProductUI } from "./product.ui.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { S3Util } from "../../utils/s3_util.js";
import prisma from "../../core/prisma/client.js";

export class ProductController {

  static async getCategories(req, res) {
    try {
      const categories = await ProductRepository.getAllCategories();
      res.status(200).json(new ApiResponse(200, categories, "Categories retrieved successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error retrieving categories"));
    }
  }

  static async getImageUploadUrls(req, res) {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json(new ApiResponse(400, {}, "files array is required with at least one file"));
      }

      const results = [];
      for (const file of files) {
        const { filename, contentType } = file;
        if (!filename || !contentType) {
          return res.status(400).json(new ApiResponse(400, {}, "Each file must have filename and contentType"));
        }
        const key = `products/${Date.now()}-${filename}`;
        const uploadUrl = await S3Util.generateUploadUrl(key, contentType);
        results.push({ key, uploadUrl, publicUrl: `${process.env.CLOUDFRONT_URL}/${key}` });
      }

      res.status(200).json(new ApiResponse(200, results, "Upload URLs generated successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error generating upload URLs"));
    }
  }

  static async createProduct(req, res) {
    try {
      const { name, description, price, categoryId, stock, sku, images, variants, isActive } = req.body;

      if (!name || !price || !categoryId) {
        return res.status(400).json(new ApiResponse(400, {}, "name, price, and categoryId are required"));
      }
      if (price <= 0) return res.status(400).json(new ApiResponse(400, {}, "price must be greater than 0"));
      if (stock && stock < 0) return res.status(400).json(new ApiResponse(400, {}, "stock cannot be negative"));

      const product = await ProductRepository.createProduct({
        name,
        description: description || null,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        stock: stock ? parseInt(stock) : 0,
        images: images || [],
        variants: variants || [],
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error creating product"));
    }
  }

  static async getAllProducts(req, res) {
    try {
      const { page, limit, categoryId, isActive, search } = req.query;
      const result = await ProductRepository.getAllProducts({
        page:  page  ? parseInt(page)  : 1,
        limit: limit ? parseInt(limit) : 20,
        categoryId,
        isActive,
        search,
      });
      res.status(200).json(new ApiResponse(200, result, "Products retrieved successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error retrieving products"));
    }
  }

  /**
   * GET /product/:id
   *
   * Returns SDUI payload for the Flutter client.
   * The optional ?raw=true query param returns the raw JSON product object
   * for admin panels or debugging without building UI.
   */
    static async getProductById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      const product = await ProductRepository.getProductById(id);

      if (!product) return res.status(404).json(new ApiResponse(404, {}, "Product not found"));
      if (req.query.raw === "true") return res.status(200).json(new ApiResponse(200, product, "Product retrieved successfully"));

      const isGuest = !req.user;

      let cartCount = 0;
      let wishlistCount = 0;
      let isProductWishlisted = false; // <-- Tracks specific product status
      let productCartQty = 0;          // <-- Tracks specific product quantity

      if (!isGuest) {
        // Run all 4 queries concurrently to get the absolute truth
        const [cartTotal, wishlistTotal, userWishlist, userCartItem] = await Promise.all([
          prisma.cartItem.aggregate({ where: { userId: req.user.id }, _sum: { quantity: true } }),
          prisma.wishlist.count({ where: { userId: req.user.id } }),
          prisma.wishlist.findFirst({ where: { userId: req.user.id, productId: parseInt(id) } }),
          prisma.cartItem.findFirst({ where: { userId: req.user.id, productId: parseInt(id) } }) // <-- The missing query!
        ]).catch(() => [{ _sum: { quantity: 0 } }, 0, null, null]);

        cartCount           = cartTotal?._sum?.quantity ?? 0;
        wishlistCount       = wishlistTotal ?? 0;
        isProductWishlisted = !!userWishlist;
        productCartQty      = userCartItem?.quantity ?? 0;
      }

      // Inject the true values into the product object for the UI builder
      product.isWishlisted = isProductWishlisted;
      product.cartQty      = productCartQty;
      let activePincode = req.headers['x-pincode'] || null;

      if (!activePincode && req.user?.id) {
        const userRecord = await prisma.user.findUnique({
          where:  { id: req.user.id },
          select: { activePincode: true },
        });
        activePincode = userRecord?.activePincode ?? null;
      }
      const productUi = ProductUI.buildProductPage(product, isGuest, activePincode);
      

      // Inject activePincode into the meta block
      return res.json({ 
        ui: productUi, 
        meta: { cartCount, wishlistCount, activePincode } 
      });
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error retrieving product"));
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      const exists = await ProductRepository.productExists(id);
      if (!exists) return res.status(404).json(new ApiResponse(404, {}, "Product not found"));

      const { name, description, price, categoryId, stock, sku, images, variants, isActive } = req.body;

      if (price && price <= 0) return res.status(400).json(new ApiResponse(400, {}, "price must be greater than 0"));
      if (stock !== undefined && stock < 0) return res.status(400).json(new ApiResponse(400, {}, "stock cannot be negative"));

      const updateData = {};
      if (name        !== undefined) updateData.name        = name;
      if (description !== undefined) updateData.description = description;
      if (price       !== undefined) updateData.price       = parseFloat(price);
      if (categoryId  !== undefined) updateData.categoryId  = parseInt(categoryId);
      if (stock       !== undefined) updateData.stock       = parseInt(stock);
      if (sku         !== undefined) updateData.sku         = sku;
      if (images      !== undefined) updateData.images      = images;
      if (variants    !== undefined) updateData.variants    = variants;
      if (isActive    !== undefined) updateData.isActive    = isActive;

      const product = await ProductRepository.updateProduct(id, updateData);
      res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error updating product"));
    }
  }

  static async deactivateProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id))) return res.status(400).json(new ApiResponse(400, {}, "Valid product ID is required"));

      const exists = await ProductRepository.productExists(id);
      if (!exists) return res.status(404).json(new ApiResponse(404, {}, "Product not found"));

      const product = await ProductRepository.softDeleteProduct(id);
      res.status(200).json(new ApiResponse(200, product, "Product deactivated successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error deactivating product"));
    }
  }

  static async toggleProductStatus(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id))) return res.status(400).json(new ApiResponse(400, {}, "Valid product ID is required"));

      const current = await ProductRepository.getProductById(id);
      if (!current) return res.status(404).json(new ApiResponse(404, {}, "Product not found"));

      const product = await ProductRepository.updateProduct(id, { isActive: !current.isActive });
      res.status(200).json(new ApiResponse(200, product, `Product ${product.isActive ? "activated" : "deactivated"} successfully`));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error toggling product status"));
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id))) return res.status(400).json(new ApiResponse(400, {}, "Valid product ID is required"));

      const exists = await ProductRepository.productExists(id);
      if (!exists) return res.status(404).json(new ApiResponse(404, {}, "Product not found"));

      const product = await ProductRepository.getProductById(id);

      if (product.images?.length > 0) {
        for (const image of product.images) {
          try {
            const key = image.url.replace(`${process.env.CLOUDFRONT_URL}/`, "");
            await S3Util.deleteFile(key);
          } catch (s3Error) {
            console.error("[PRODUCT] S3 delete error:", s3Error);
          }
        }
      }

      await ProductRepository.deleteProduct(id);
      res.status(200).json(new ApiResponse(200, {}, "Product deleted successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, {}, err.message || "Error deleting product"));
    }
  }
}