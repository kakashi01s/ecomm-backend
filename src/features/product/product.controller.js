import { ProductRepository } from "./product.repository.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { S3Util } from "../../utils/s3_util.js";

export class ProductController {
  /**
   * Get all categories (for dropdown in product creation form)
   */
  static async getCategories(req, res) {
    try {
      console.log("[PRODUCT] Get categories request received");

      const categories = await ProductRepository.getAllCategories();

      console.log(`[PRODUCT] Retrieved ${categories.length} categories`);

      res
        .status(200)
        .json(
          new ApiResponse(200, categories, "Categories retrieved successfully")
        );
    } catch (err) {
      console.error("[PRODUCT] Get categories error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error retrieving categories")
        );
    }
  }

  /**
   * Generate pre-signed URLs for image uploads
   */
  static async getImageUploadUrls(req, res) {
    try {
      console.log("[PRODUCT] Generate upload URLs request received");

      const { files } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              {},
              "files array is required with at least one file"
            )
          );
      }

      const results = [];

      for (const file of files) {
        const { filename, contentType } = file;

        if (!filename || !contentType) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                {},
                "Each file must have filename and contentType"
              )
            );
        }

        const key = S3Util.generateFileKey("products", filename);
        const uploadUrl = await S3Util.generateUploadUrl(key, contentType);

        results.push({
          key,
          uploadUrl,
          publicUrl: `${process.env.CLOUDFRONT_URL}/${key}`,
        });
      }

      console.log(`[PRODUCT] Generated ${results.length} upload URLs`);

      res
        .status(200)
        .json(
          new ApiResponse(200, results, "Upload URLs generated successfully")
        );
    } catch (err) {
      console.error("[PRODUCT] Generate upload URLs error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            err.message || "Error generating upload URLs"
          )
        );
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(req, res) {
    try {
      console.log("[PRODUCT] Create product request received:", req.body);

      const {
        name,
        description,
        price,
        categoryId,
        stock,
        sku,
        images,
        variants,
        isActive,
      } = req.body;

      // Validation
      if (!name || !price || !categoryId) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, {}, "name, price, and categoryId are required")
          );
      }

      if (price <= 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "price must be greater than 0"));
      }

      if (stock && stock < 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "stock cannot be negative"));
      }

      const productData = {
        name,
        description: description || null,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        stock: stock ? parseInt(stock) : 0,
        sku: sku || null,
        images: images || [],
        variants: variants || [],
        isActive: isActive !== undefined ? isActive : true,
      };

      const product = await ProductRepository.createProduct(productData);

      console.log("[PRODUCT] Product created successfully:", product.id);

      res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"));
    } catch (err) {
      console.error("[PRODUCT] Create product error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error creating product")
        );
    }
  }

  /**
   * Get all products with pagination and filters
   */
  static async getAllProducts(req, res) {
    try {
      console.log("[PRODUCT] Get all products request received:", req.query);

      const { page, limit, categoryId, isActive, search } = req.query;

      const result = await ProductRepository.getAllProducts({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        categoryId,
        isActive,
        search,
      });

      console.log(
        `[PRODUCT] Retrieved ${result.products.length} products (Total: ${result.pagination.total})`
      );

      res
        .status(200)
        .json(new ApiResponse(200, result, "Products retrieved successfully"));
    } catch (err) {
      console.error("[PRODUCT] Get all products error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error retrieving products")
        );
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      console.log(`[PRODUCT] Get product by ID request received: ${id}`);

      if (!id || isNaN(parseInt(id))) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      const product = await ProductRepository.getProductById(id);

      if (!product) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Product not found"));
      }

      console.log(`[PRODUCT] Product retrieved successfully: ${id}`);

      res
        .status(200)
        .json(new ApiResponse(200, product, "Product retrieved successfully"));
    } catch (err) {
      console.error("[PRODUCT] Get product by ID error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error retrieving product")
        );
    }
  }

  /**
   * Update a product
   */
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;

      console.log(`[PRODUCT] Update product request received: ${id}`, req.body);

      if (!id || isNaN(parseInt(id))) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      // Check if product exists
      const exists = await ProductRepository.productExists(id);

      if (!exists) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Product not found"));
      }

      const {
        name,
        description,
        price,
        categoryId,
        stock,
        sku,
        images,
        variants,
        isActive,
      } = req.body;

      // Validation
      if (price && price <= 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "price must be greater than 0"));
      }

      if (stock !== undefined && stock < 0) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "stock cannot be negative"));
      }

      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (categoryId !== undefined)
        updateData.categoryId = parseInt(categoryId);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (sku !== undefined) updateData.sku = sku;
      if (images !== undefined) updateData.images = images;
      if (variants !== undefined) updateData.variants = variants;
      if (isActive !== undefined) updateData.isActive = isActive;

      const product = await ProductRepository.updateProduct(id, updateData);

      console.log(`[PRODUCT] Product updated successfully: ${id}`);

      res
        .status(200)
        .json(new ApiResponse(200, product, "Product updated successfully"));
    } catch (err) {
      console.error("[PRODUCT] Update product error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error updating product")
        );
    }
  }

  /**
   * Soft delete (deactivate) a product
   */
  static async deactivateProduct(req, res) {
    try {
      const { id } = req.params;

      console.log(`[PRODUCT] Deactivate product request received: ${id}`);

      if (!id || isNaN(parseInt(id))) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      // Check if product exists
      const exists = await ProductRepository.productExists(id);

      if (!exists) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Product not found"));
      }

      const product = await ProductRepository.softDeleteProduct(id);

      console.log(`[PRODUCT] Product deactivated successfully: ${id}`);

      res
        .status(200)
        .json(
          new ApiResponse(200, product, "Product deactivated successfully")
        );
    } catch (err) {
      console.error("[PRODUCT] Deactivate product error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error deactivating product")
        );
    }
  }

  /**
   * Toggle product active status
   */
  static async toggleProductStatus(req, res) {
    try {
      const { id } = req.params;

      console.log(`[PRODUCT] Toggle product status request received: ${id}`);

      if (!id || isNaN(parseInt(id))) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      // Get current product
      const currentProduct = await ProductRepository.getProductById(id);

      if (!currentProduct) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Product not found"));
      }

      // Toggle the isActive status
      const product = await ProductRepository.updateProduct(id, {
        isActive: !currentProduct.isActive,
      });

      console.log(
        `[PRODUCT] Product status toggled successfully: ${id} (isActive: ${product.isActive})`
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            product,
            `Product ${
              product.isActive ? "activated" : "deactivated"
            } successfully`
          )
        );
    } catch (err) {
      console.error("[PRODUCT] Toggle product status error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(
            500,
            {},
            err.message || "Error toggling product status"
          )
        );
    }
  }

  /**
   * Hard delete a product
   */
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      console.log(`[PRODUCT] Delete product request received: ${id}`);

      if (!id || isNaN(parseInt(id))) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Valid product ID is required"));
      }

      // Check if product exists
      const exists = await ProductRepository.productExists(id);

      if (!exists) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Product not found"));
      }

      // Get product to delete associated S3 images
      const product = await ProductRepository.getProductById(id);

      // Delete images from S3 if they exist
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            // Extract key from URL
            const url = image.url;
            const key = url.replace(`${process.env.CLOUDFRONT_URL}/`, "");
            await S3Util.deleteFile(key);
            console.log(`[PRODUCT] Deleted image from S3: ${key}`);
          } catch (s3Error) {
            console.error("[PRODUCT] Error deleting image from S3:", s3Error);
            // Continue with deletion even if S3 deletion fails
          }
        }
      }

      await ProductRepository.deleteProduct(id);

      console.log(`[PRODUCT] Product deleted successfully: ${id}`);

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Product deleted successfully"));
    } catch (err) {
      console.error("[PRODUCT] Delete product error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, {}, err.message || "Error deleting product")
        );
    }
  }
}
