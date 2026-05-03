import prisma from "../../core/prisma/client.js";
import { CustomError } from "../../utils/custom.Error.js";

export class CartRepository {   

    // 1. Adding/Updating item (logged in user)
    static async addItemToCart(userId, productId, quantity) {
        // checking if item already exists in cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                productId: parseInt(productId),
                userId: parseInt(userId) 
            }
        });

        if (existingCartItem) {
            // if esists, update quantity
            return await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + parseInt(quantity) }
            });
        } else {
            // if not exists, create new cart item
            return await prisma.cartItem.create({ 
                data: {
                    productId: parseInt(productId),
                    userId: parseInt(userId),
                    quantity: parseInt(quantity)
                }
            });
        }
    }

    // 2. Getting cart info (Logged in user)
    static async getCartItems(userId) {
        return await prisma.cartItem.findMany({
            where: {
                userId: parseInt(userId)
            },
            include: {
                product: {
                    include : {
                        images: true,   // <--- FIX: Eagerly load product images
                        category: true  // <--- FIX: Eagerly load the category for the subtitle
                    }
                } 
            }
        });
    }

    

    // 3. Guest Cart Info 
    static async getGuestCartItems(guestItems) {
        // guestItems format: [{productId: 1, quantity: 2}]
        const productIds = guestItems.map(item => parseInt(item.productId)); // extracting product ids ex: [101,102,103]

        // get product details for all productIds in guest cart
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });
        
        return guestItems.map(item => ({
            ...item,
            product: products.find(p => p.id === parseInt(item.productId))
        }));
    }

    // update cart item quantity (increment/decrement)
    static async updateCartItem(userId, productId, action) {    
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                productId: parseInt(productId),
                userId  : parseInt(userId)
            }
        });

        if (!cartItem) {
            throw new CustomError(404, "Cart item not found");
        }
        
        let newQuantity = cartItem.quantity;
        if (action === "increment") {
            newQuantity = cartItem.quantity + 1;
        } else if (action === "decrement") {
            newQuantity = cartItem.quantity - 1;
        }

        if (newQuantity <= 0) {

            return await prisma.cartItem.delete({
                where: { id: cartItem.id }
            });
        } 
        else {
           
            return await prisma.cartItem.update({
                where: { id: cartItem.id },
                data: { quantity: newQuantity }
            });
        }
    }


    // 5. Hard Deleting cart item (Login user ke liye)
    static async deleteCartItem(productId, userId) {
        return await prisma.cartItem.deleteMany({
            where: {
                productId: parseInt(productId),
                userId: parseInt(userId)
            }
        });
    }
}
