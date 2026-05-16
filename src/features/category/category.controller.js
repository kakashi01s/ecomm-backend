import { CategoryRepository } from "./category.repository.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import { CustomError } from "../../utils/custom.Error.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";
import { CategoryUI } from "./category.ui.js";
import { CategoryProductsUI } from "./category.products.ui.js";
import redisClient from "../../config/redisClient.js";
import prisma from "../../core/prisma/client.js";

export class CategoryController {

    // 1.create a new category
    static createCategory = AsyncHandler(async (req, res) => {
        const {name , parentId} = req.body;

        if(!name){
            throw new CustomError(400, "Category name is required");
        }
        // checking if parent id exists
        if(parentId){
            const parentExists = await CategoryRepository.exists(parentId);
            if(!parentExists){
                throw new CustomError(400, "Parent category does not exist");
            }
        }

        const category = await CategoryRepository.createCategory({name, parentId});
        return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
    });

    // 2.get all categories
    static getAllCategories = AsyncHandler(async (req, res) => {
        const allCategories = await CategoryRepository.getAllCategories();
        
        return res
        .status(200)
        .json(new ApiResponse(200, allCategories, "Categories fetched successfully"));
    });

    // 3.Update category 
    static updateCategory = AsyncHandler(async (req, res) => {
        const {id} = req.params;
        const {name, parentId} = req.body;

        // checking if category exists
        const categoryExists = await CategoryRepository.exists(id);
        if(!categoryExists){
            throw new CustomError(400, "Category does not exist");
        }

        // parentId cant be same as id
        if(parentId && parseInt(parentId) === parseInt(id)){
            throw new CustomError(400, "Category cannot be its own parent");
        }

        const updatedCategory = await CategoryRepository.updateCategory(id, {name, parentId});
        return res
        .status(200)
        .json(new ApiResponse(200, updatedCategory, "Category updated successfully"));
    });


    //4.delete category 
    static deleteCategory = AsyncHandler(async (req, res) => {
        const {id} = req.params; 
        const categoryExists = await CategoryRepository.exists(id);
        if(!categoryExists){
            throw new CustomError(404, "Category  not Found");
        }
        await CategoryRepository.deleteCategory(id);
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Category deleted successfully"));
    });

    // 5.get category by id
    static getCategoryById = AsyncHandler(async (req, res) => {
        const {id} = req.params;
        const category = await CategoryRepository.getCategoryById(id);
        if(!category){
            throw new CustomError(404, "Category not found");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, category, "Category fetched successfully"));
    });

    /**
     * getCategoryProducts
     * Endpoint for the Category Products Page (initial load).
     */
    static getCategoryProducts = AsyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = req.user;

        const sessionKey = user ? user.id : (req.headers.authorization || req.ip);
        const redisKey = `filters:cat:${id}:user:${sessionKey}`;
        await redisClient.del(redisKey);

        const categoryData = await CategoryRepository.getCategoryWithProducts(id, {});
        if (!categoryData) throw new CustomError(404, "Category not found");

        const products = categoryData.products || [];
        console.log(`[DEBUG] Category ${id} products count:`, products.length);
        
        // Fetch user wishlist set
        const userWishlistSet = new Set();
        if (user) {
            const wishlists = await prisma.wishlist.findMany({ where: { userId: user.id, product: { isActive: true } } });
            wishlists.forEach(w => userWishlistSet.add(w.productId));
        }

        const activeFilterCount = 0;
        const ui = CategoryProductsUI.buildCategoryProductsPage(id, categoryData.name);
        
        const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
        meta[`cat_prod_${id}`] = CategoryProductsUI.buildProductCards(products, !user, userWishlistSet);
        meta[`cat_filter_count_${id}`] = activeFilterCount;
        meta[`cat_has_prod_${id}`] = products.length > 0;

        return res.status(200).json({ ui, meta });
    });

    /**
     * filterCategoryProducts
     * Reactive API endpoint for filtering/sorting (No Replace).
     */
    static filterCategoryProducts = AsyncHandler(async (req, res) => {
        const { id } = req.params;
        const { sort, minPrice, maxPrice, ...rest } = req.body;
        const user = req.user;

        const sessionKey = user ? user.id : (req.headers.authorization || req.ip);
        const redisKey = `filters:cat:${id}:user:${sessionKey}`;

        if (Object.keys(req.body).length === 0) {
            await redisClient.del(redisKey);
        } else {
            await redisClient.setEx(redisKey, 86400, JSON.stringify(req.body));
        }

        const colors = Object.keys(rest)
            .filter(key => key.startsWith("color_") && (rest[key] === true || rest[key] === "true"))
            .map(key => key.replace("color_", ""));
        
        const sizes = Object.keys(rest)
            .filter(key => key.startsWith("size_") && (rest[key] === true || rest[key] === "true"))
            .map(key => key.replace("size_", ""));

        const categoryData = await CategoryRepository.getCategoryWithProducts(id, { 
            sort, minPrice, maxPrice, colors, sizes 
        });
        if (!categoryData) throw new CustomError(404, "Category not found");

        const products = categoryData.products || [];
        
        let activeFilterCount = 0;
        if (minPrice && String(minPrice).trim() !== "") activeFilterCount++;
        if (maxPrice && String(maxPrice).trim() !== "") activeFilterCount++;
        activeFilterCount += colors.length + sizes.length;
        
        const userWishlistSet = new Set();
        if (user) {
            const wishlists = await prisma.wishlist.findMany({ where: { userId: user.id, product: { isActive: true } } });
            wishlists.forEach(w => userWishlistSet.add(w.productId));
        }

        const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
        meta[`cat_prod_${id}`] = CategoryProductsUI.buildProductCards(products, !user, userWishlistSet);
        meta[`cat_filter_count_${id}`] = activeFilterCount;
        meta[`cat_has_prod_${id}`] = products.length > 0;

        return res.status(200).json({ status: 200, data: null, meta });
    });

    /**
     * getFilterScreen
     */
    static getFilterScreen = AsyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = req.user;
        
        const sessionKey = user ? user.id : (req.headers.authorization || req.ip);
        const redisKey = `filters:cat:${id}:user:${sessionKey}`;
        
        let appliedFilters = {};
        const savedStr = await redisClient.get(redisKey);
        if (savedStr) {
            try { appliedFilters = JSON.parse(savedStr); } catch (e) {}
        }

        const filters = await CategoryRepository.getDynamicFilters(id);
        const ui = CategoryProductsUI.buildFilterScreen(id, filters, appliedFilters);

        return res.status(200).json({ ui });
    });
}
