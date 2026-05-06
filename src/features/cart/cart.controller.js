import { CartRepository } from "./cart.repository.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import { CustomError } from "../../utils/custom.Error.js";
import prisma from "../../core/prisma/client.js";
import { CartUI } from "./cart.ui.js";

export class CartController {

// Update the helper signature to accept 'req' so it can read headers
  static async getGlobalCounts(req) {
    const userId = req.user?.id;
    const activePincode = req.headers['x-pincode'] || req.user?.activePincode || null;

    if (!userId) {
      return { cartCount: 0, wishlistCount: 0, activePincode };
    }

    const [cartTotal, wishlistTotal] = await Promise.all([
      prisma.cartItem.aggregate({ where: { userId }, _sum: { quantity: true } }),
      prisma.wishlist.count({ where: { userId } })
    ]).catch(() => [{ _sum: { quantity: 0 } }, 0]);
    
    return {
      cartCount: cartTotal?._sum?.quantity ?? 0,
      wishlistCount: wishlistTotal ?? 0,
      activePincode // <-- Automatically added to meta in all cart responses
    };
  }

  // POST /cart/add
  static additemToCart = AsyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new CustomError(401, "Please login to add items to cart");

    const cartItem = await CartRepository.addItemToCart(userId, productId, quantity);
    
    const meta = await CartController.getGlobalCounts(req);
    // Tell Flutter the exact new quantity for this product's cart_qty_button
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
      { label: "Subtotal",     value: Number(subtotal.toFixed(2)) },
      { label: "Shipping",     value: Number(shipping.toFixed(2)) },
      { label: "Platform Fee", value: Number(platformFee.toFixed(2)) },
      { label: "Total Amount", value: Number(totalAmount.toFixed(2)) },
    ];
  };

  // GET /cart  (or POST with body for guest carts)
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
    
    // Include global counts so appbar badges are accurate on cart page load
    const meta = userId 
      ?  await CartController.getGlobalCounts(req)
      : { cartCount: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0), wishlistCount: 0 };

    return res.status(200).json({ ui: cartUi, meta });
  });

  // PUT /cart/update
static updateCartItem = AsyncHandler(async (req, res) => {
  const { productId, action, pincode } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new CustomError(401, "Please login to update cart items");
  if (!pincode) throw new CustomError(400, "Pincode is required to calculate shipping");
  if (!["increment", "decrement"].includes(action)) throw new CustomError(400, "Invalid action.");

  const updatedCartItem = await CartRepository.updateCartItem(userId, productId, action);
  const cartItems = await CartRepository.getCartItems(userId);
  const totals = CartController.calculateTotals(cartItems, pincode);
  
    const meta = await CartController.getGlobalCounts(req);

  // When decrement brings qty to 0, the repository deletes the row and returns
  // the deleted record (Prisma always returns the old row on delete).
  // getGlobalCounts() already reflects the deletion, so we derive the true
  // quantity by checking if this product still exists in the fresh cartItems.
  const stillInCart = cartItems.find(i => i.productId === parseInt(productId));
  meta.updatedProductQty = {
    productId: parseInt(productId),
    quantity: stillInCart?.quantity ?? 0,
  };

  return res.status(200).json({ 
    status: 200, 
    data: { cartItems, totals }, 
    message: "Cart item updated", 
    meta 
  });
});

  // DELETE /cart/:productId
  static deleteCartItem = AsyncHandler(async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const userId = req.user?.id;

    if (!userId) return res.status(200).json(new ApiResponse(200, null, "Guest: Remove from local storage"));

    await CartRepository.deleteCartItem(productId, userId);
    
    const meta = await CartController.getGlobalCounts(req);
    // quantity: 0 collapses the cart_qty_button back to the "Add to Cart" state
    meta.updatedProductQty = { productId: parseInt(productId), quantity: 0 };

    return res.status(200).json({ status: 200, data: null, message: "Product removed from cart", meta });
  });
}