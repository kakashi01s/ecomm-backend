import prisma from "../../core/prisma/client.js";

export class CategoryRepository {   

    // 1.creating a new category

    static async createCategory(data) {
        return prisma.category.create({
            data:{
                name: data.name,
                parentId: data.parentId? parseInt(data.parentId) : null,
                
            }
        });
    } 

    // 2.getting all categories

    static async getAllCategories() {
        return prisma.category.findMany({
            where: {parentId: null},
            include: {
                children:{
                    include: {
                        children: true,
                    
                    _count: {
                        select: { products: true }   // counting products in each category
                    }
                }

                }
            }
        });
    }

    // 3.getting category by id

    static async getCategoryById(id) {
        return prisma.category.findUnique({
            where: {id: parseInt(id)},
            include: {
                children:true,   //will include all subcategories
                parent: true,   //will include parent category
            }
        });
    }


    // 4.updating a category

    static async updateCategory(id, data) {
        return prisma.category.update({
            where: {id: parseInt(id)},
            data: {
                name: data.name,
                parentId: data.parentId ? parseInt(data.parentId) : null,  // checking if parentId is provided 
            }
        });
    }

    // 5.deleting a category

    static async deleteCategory(id) {
        return prisma.category.delete({
            where: {id: parseInt(id)},
        });
    }
          
    // checking if category exists
    static async exists(id) {
    const count = await prisma.category.count({
        where: { id: parseInt(id) }
    });
    return count > 0; 
    }

    /**
     * getCategoryFamilyIds
     * Recursively fetches all category IDs including descendants.
     */
    static async getCategoryFamilyIds(id) {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: { children: { select: { id: true } } }
        });
        if (!category) return [];
        let ids = [category.id];
        for (const child of category.children) {
            const childIds = await this.getCategoryFamilyIds(child.id);
            ids = [...ids, ...childIds];
        }
        return ids;
    }

    /**
     * getCategoryWithProducts
     * Fetches products for a category and its subcategories with optional sorting and filtering.
     */
    static async getCategoryWithProducts(categoryId, { sort, minPrice, maxPrice, colors, sizes }) {
        const allCategoryIds = await this.getCategoryFamilyIds(categoryId);

        const where = {
            categoryId: { in: allCategoryIds },
            isActive: true,
        };

        // Price Filtering
        const parsedMin = minPrice !== undefined && minPrice !== null ? parseFloat(minPrice) : NaN;
        const parsedMax = maxPrice !== undefined && maxPrice !== null ? parseFloat(maxPrice) : NaN;

        if (!isNaN(parsedMin) || !isNaN(parsedMax)) {
            where.price = {};
            if (!isNaN(parsedMin)) where.price.gte = parsedMin;
            if (!isNaN(parsedMax)) where.price.lte = parsedMax;
        }

        // Variant Filtering (Color/Size)
        if ((colors && colors.length > 0) || (sizes && sizes.length > 0)) {
            where.variants = {
                some: {
                    ...(colors && colors.length > 0 ? { color: { in: colors } } : {}),
                    ...(sizes && sizes.length > 0 ? { size: { in: sizes } } : {}),
                }
            };
        }

        // Sorting Logic
        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };
        if (sort === 'newest') orderBy = { createdAt: 'desc' };

        return prisma.category.findUnique({
            where: { id: parseInt(categoryId) },
            include: {
                products: {
                    where,
                    orderBy,
                    include: {
                        images: true,
                        category: true,
                        variants: true,
                    }
                }
            }
        });
    }

    /**
     * getDynamicFilters
     * Gathers all available colors, sizes, and price bounds for a category and its descendants.
     */
    static async getDynamicFilters(categoryId) {
        const allCategoryIds = await this.getCategoryFamilyIds(categoryId);

        const [priceBounds, variants] = await Promise.all([
            prisma.product.aggregate({
                where: { categoryId: { in: allCategoryIds }, isActive: true },
                _min: { price: true },
                _max: { price: true }
            }),
            prisma.productVariant.findMany({
                where: { product: { categoryId: { in: allCategoryIds }, isActive: true } },
                select: { color: true, size: true },
                distinct: ['color', 'size']
            })
        ]);

        const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
        const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

        return {
            minPrice: priceBounds._min.price || 0,
            maxPrice: priceBounds._max.price || 0,
            colors: colors.sort(),
            sizes: sizes.sort()
        };
    }
}
