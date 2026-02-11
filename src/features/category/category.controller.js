import { CategoryRepository } from "./category.repository";
import {apiResponse} from "../../core/response/apiResponse";
import {asyncHandler} from "../../core/middleware/asyncHandler";
import { CustomError } from "../../utils/custom.error";

export class CategoryController {

    // 1.create a new category
    static createCategory = asyncHandler(async (req, res) => {
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
        .json(new apiResponse(201, category, "Category created successfully"));
    });

    // 2.get all categories
    static getAllCategories = asyncHandler(async (req, res) => {
        const allCategories = await CategoryRepository.getAllCategories();
        
        return res
        .status(200)
        .json(new apiResponse(200, allCategories, "Categories fetched successfully"));
    });

    // 3.Update category 
    static updateCategory = asyncHandler(async (req, res) => {
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
        .json(new apiResponse(200, updatedCategory, "Category updated successfully"));
    });


    //4.delete category 
    static deleteCategory = asyncHandler(async (req, res) => {
        const {id} = req.params; 
        const categoryExists = await CategoryRepository.exists(id);
        if(!categoryExists){
            throw new CustomError(404, "Category  not Found");
        }
        await CategoryRepository.deleteCategory(id);
        return res
        .status(200)
        .json(new apiResponse(200, null, "Category deleted successfully"));
    });

    // 5.get category by id
    static getCategoryById = asyncHandler(async (req, res) => {
        const {id} = req.params;
        const category = await CategoryRepository.getCategoryById(id);
        if(!category){
            throw new CustomError(404, "Category not found");
        }
        return res
        .status(200)
        .json(new apiResponse(200, category, "Category fetched successfully"));
    });
 
    
}