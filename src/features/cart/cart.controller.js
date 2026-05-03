import { CartRepository } from "./cart.repository.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import { CustomError } from "../../utils/custom.Error.js";
import prisma from "../../core/prisma/client.js";
import { CartUI } from "./cart.ui.js";

export class CartController {

    // Helper for the Silent Healer!
    static async getGlobalCounts(userId) {
        if (!userId) return { cartCount: 0, wishlistCount: 0 };
        const [cartTotal, wishlistTotal] = await Promise.all([
            prisma.cartItem.aggregate({ where: { userId }, _sum: { quantity: true } }),
            prisma.wishlist.count({ where: { userId } })
        ]).catch(() => [{ _sum: { quantity: 0 } }, 0]);
        
        return {
            cartCount: cartTotal?._sum?.quantity ?? 0,
            wishlistCount: wishlistTotal ?? 0
        };
    }

    static additemToCart = AsyncHandler(async (req, res) => {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;

        if (!userId) throw new CustomError(401, "Please login to add items to cart");

        const cartItem = await CartRepository.addItemToCart(userId, productId, quantity);
        
        // ── THE FIX: Inject Silent Healer Meta
        const meta = await CartController.getGlobalCounts(userId);
        meta.updatedProductQty = { productId: parseInt(productId), quantity: cartItem.quantity };

        return res.status(200).json({ status: 200, data: cartItem, message: "Item added to cart", meta });
    });

    static calculateTotals = (cartItems, pincode) => {  
        const subtotal = cartItems.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);
        let shipping = 0;
        if (subtotal > 0) shipping = (pincode && String(pincode).startsWith("3")) ? 40 : 100;
        const platformFee = subtotal > 0 ? 10 : 0;      
        const totalAmount = subtotal + shipping + platformFee;

        return [
            {label: "Subtotal", value: Number(subtotal.toFixed(2))},
            {label: "Shipping", value: Number(shipping.toFixed(2))},
            {label: "Platform Fee", value: Number(platformFee.toFixed(2))},
            {label: "Total Amount", value: Number(totalAmount.toFixed(2))}
        ];
    };

    static getCartItems = AsyncHandler(async (req, res) => {
        const userId = req.user?.id;
        const payload = Object.keys(req.body || {}).length > 0 ? req.body : req.query;
        const guestItems = payload.guestItems ? JSON.parse(payload.guestItems) : [];
        const pincode = payload.pincode || "302001";

        let cartItems = userId 
            ? await CartRepository.getCartItems(userId) 
            : await CartRepository.getGuestCartItems(guestItems);

        const totals = CartController.calculateTotals(cartItems, pincode);
        const cartUi = CartUI.buildCartPage(cartItems, totals);
        const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

        return res.status(200).json({ ui: cartUi, meta: { cartCount: totalQuantity } });
    });

    static updateCartItem = AsyncHandler(async (req, res) => {
        const { productId, action, pincode } = req.body;
        const userId = req.user?.id;

        if (!userId) throw new CustomError(401, "Please login to update cart items");
        if (!pincode) throw new CustomError(400, "Pincode is required to calculate shipping");
        if (!["increment", "decrement"].includes(action)) throw new CustomError(400, "Invalid action.");

        const updatedCartItem = await CartRepository.updateCartItem(userId, productId, action);
        const cartItems = await CartRepository.getCartItems(userId);
        const totals = CartController.calculateTotals(cartItems, pincode);
        
        // ── THE FIX: Inject Silent Healer Meta
        const meta = await CartController.getGlobalCounts(userId);
        meta.updatedProductQty = { productId: parseInt(productId), quantity: updatedCartItem.quantity };

        return res.status(200).json({ status: 200, data: { cartItems, totals }, message: "Cart item updated", meta });
    });

    static deleteCartItem = AsyncHandler(async (req, res) => {
        const productId = parseInt(req.params.productId, 10);
        const userId = req.user?.id;

        if (!userId) return res.status(200).json(new ApiResponse(200, null, "Guest: Remove from local storage"));

        await CartRepository.deleteCartItem(productId, userId);
        
        // ── THE FIX: Inject Silent Healer Meta (0 because deleted)
        const meta = await CartController.getGlobalCounts(userId);
        meta.updatedProductQty = { productId: parseInt(productId), quantity: 0 };

        return res.status(200).json({ status: 200, data: null, message: "Product removed from cart", meta });
    });
}