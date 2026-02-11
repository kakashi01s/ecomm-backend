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
}
