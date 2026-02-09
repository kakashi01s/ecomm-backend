import { CartRepository } from "./cart.repository.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import { CustomError } from "../../utils/custom.Error.js";
import prisma from "../../core/prisma/client.js";

export class CartController {

    // 1. Adding/Updating item (logged in user)

    static additemToCart = AsyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;

    
    if (!userId) {
        throw new CustomError(401, "Please login to add items to cart");
    }

    const cartItem = await CartRepository.addItemToCart(userId, productId, quantity);
    return res.status(200).json(new ApiResponse(200, cartItem, "Item added to cart"));
});

    // 2. Getting cart info 
    static getCartItems = AsyncHandler(async (req, res) => {
        const userId = req.user?.id; 
        if (userId) {
            const cartItems = await CartRepository.getCartItems(userId);
            return res.status(200).json(new ApiResponse(200, cartItems, "Cart items fetched successfully"));
        }
        const { guestItems } = req.body; // Frontend localStorage se bhejega
         if (!guestItems || guestItems.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "Guest cart is empty"));
        }
        const cartItems = await CartRepository.getGuestCartItems(guestItems);
        return res.status(200).json(new ApiResponse(200, cartItems, "Guest cart items fetched successfully"));
 });


 // 3. update cart items
 static updateCartItem = AsyncHandler(async (req, res) => {
    const{productId,action}=req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new CustomError(401, "Please login to update cart items");
    }
    
    if (!["increment", "decrement"].includes(action)) {
            throw new CustomError(400, "Invalid action. Use increment or decrement.");
        }
    const updatedCartItem = await CartRepository.updateCartItem(userId, productId, action);
    return res.status(200).json(new ApiResponse(200, updatedCartItem, "Cart item updated successfully"));
 });
    


    // Logic for the Trash/Remove button
    static deleteCartItem = AsyncHandler(async (req, res) => {
        const { productId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(200).json(new ApiResponse(200, null, "Guest: Remove from local storage"));
        }

        await CartRepository.deleteCartItem(productId, userId);
        return res.status(200).json(new ApiResponse(200, null, "Product removed from cart"));
    });
}
        