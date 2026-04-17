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

static calculateTotals = (cartItems, pincode) => {  
    // 1. Subtotal: (Price * Quantity) 
    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.product?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    let shipping = 0;
    if (subtotal > 0) {
        shipping = (pincode && String(pincode).startsWith("3")) ? 40 : 100;
    }   
    // 3. Platform Fee: Fixed charge ₹10 (Sirf agar items ho cart mein)
    const platformFee = subtotal > 0 ? 10 : 0;      
    const totalAmount = subtotal + shipping + platformFee;

    return[
        
           {label: "Subtotal", value: Number(subtotal.toFixed(2))}
        , {label: "Shipping", value: Number(shipping.toFixed(2))}
        , {label: "Platform Fee", value: Number(platformFee.toFixed(2))}
        , {label: "Total Amount", value: Number(totalAmount.toFixed(2))}
    ];
};



    
 
// 2. Getting cart items (for both logged in and guest users)
    static getCartItems = AsyncHandler(async (req, res) => {
        const userId = req.user?.id;
        const { guestItems = [], pincode } = req.body || {};
        if(!pincode){
            throw new CustomError(400, "Pincode is required to calculate shipping");
        }

        let cartItems = userId? await CartRepository.getCartItems(userId) 
        : await CartRepository.getGuestCartItems(guestItems||[]);

        const totals = CartController.calculateTotals(cartItems, pincode);
        return res.status(200).json(new ApiResponse(200, {cartItems, totals}, "Cart items fetched successfully"));
    });


    // 3. Update cart items (Increment/Decrement)
    static updateCartItem = AsyncHandler(async (req, res) => {
        const { productId, action,pincode } = req.body;
        const userId = req.user?.id;

        

        if (!userId) {
            throw new CustomError(401, "Please login to update cart items");
        }
        
        if (!pincode) {
            throw new CustomError(400, "Pincode is required to calculate shipping");
        }
        if (!["increment", "decrement"].includes(action)) {
            throw new CustomError(400, "Invalid action. Use increment or decrement.");
        }

        const updatedCartItem = await CartRepository.updateCartItem(userId, productId, action);
        const cartItems = await CartRepository.getCartItems(userId);
        const totals = CartController.calculateTotals(cartItems, pincode);
        return res.status(200).json(new ApiResponse(200,{cartItems, totals}, "Cart item updated successfully"));
    });


    


    // Logic for the Trash/Remove button
    static deleteCartItem = AsyncHandler(async (req, res) => {
        const productId = parseInt(req.params.productId, 10);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(200).json(new ApiResponse(200, null, "Guest: Remove from local storage"));
        }

        await CartRepository.deleteCartItem(productId, userId);
        return res.status(200).json(new ApiResponse(200, null, "Product removed from cart"));
    });
}
        