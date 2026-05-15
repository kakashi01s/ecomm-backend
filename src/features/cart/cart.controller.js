import { CartRepository } from "./cart.repository.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import { CustomError } from "../../utils/custom.Error.js";
import prisma from "../../core/prisma/client.js";
import { CartUI } from "./cart.ui.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";

export class CartController {

  // POST /cart/add
  static additemToCart = AsyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const user = req.user;

    if (!user) throw new CustomError(401, "Please login to add items to cart");

    const cartItem = await CartRepository.addItemToCart(user.id, productId, quantity);
    
    const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
    // Explicitly set the reactive key to trigger UI update
    meta[`cart_qty_${productId}`] = cartItem.quantity;
    
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

  static _injectCartTotalsMeta = (meta, totals) => {
    meta.cart_subtotal = (totals.find(t => t.label === "Subtotal")?.value ?? 0).toFixed(2);
    meta.cart_shipping = (totals.find(t => t.label === "Shipping")?.value ?? 0).toFixed(2);
    meta.cart_platform_fee = (totals.find(t => t.label === "Platform Fee")?.value ?? 0).toFixed(2);
    meta.cart_total_payable = (totals.find(t => t.label === "Total Amount")?.value ?? 0).toFixed(2);
    return meta;
  };

  // GET /cart  (or POST with body for guest carts)
  static getCartItems = AsyncHandler(async (req, res) => {
    const user = req.user;
    const payload = Object.keys(req.body || {}).length > 0 ? req.body : req.query;
    const guestItems = payload.guestItems ? JSON.parse(payload.guestItems) : [];
    const pincode = payload.pincode || "302001";

    let cartItems = user 
      ? await CartRepository.getCartItems(user.id) 
      : await CartRepository.getGuestCartItems(guestItems);

    const totals = CartController.calculateTotals(cartItems, pincode);
    const cartUi = CartUI.buildCartPage(cartItems, totals);
    
    // Include global counts so appbar badges are accurate on cart page load
    let meta;
    if (user) {
      meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
    } else {
      const productQuantities = {};
      cartItems.forEach(item => {
        productQuantities[`cart_qty_${item.product?.id || item.productId}`] = item.quantity;
      });
      meta = { 
        ...GlobalStateHelper.baseMeta(), 
        ...productQuantities,
        cartCount: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0), 
        wishlistCount: 0 
      };
    }

    CartController._injectCartTotalsMeta(meta, totals);

    return res.status(200).json({ ui: cartUi, meta });
  });

  // PUT /cart/update
static updateCartItem = AsyncHandler(async (req, res) => {
  let { productId, action, pincode } = req.body;
  const user = req.user;

  if (!user) throw new CustomError(401, "Please login to update cart items");
  if (!["increment", "decrement"].includes(action)) throw new CustomError(400, "Invalid action.");

  // Handle case where pincode is missing or is just the SDUI placeholder
  if (!pincode || pincode === "{{activePincode}}") {
    pincode = user.activePincode || "302001"; 
  }

  const updatedCartItem = await CartRepository.updateCartItem(user.id, productId, action);
  const cartItems = await CartRepository.getCartItems(user.id);
  const totals = CartController.calculateTotals(cartItems, pincode);
  
  const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
  CartController._injectCartTotalsMeta(meta, totals);

  // When decrement brings qty to 0, the repository deletes the row and returns
  // the deleted record (Prisma always returns the old row on delete).
  // GlobalStateHelper already reflects the deletion, so we derive the true
  // quantity by checking if this product still exists in the fresh cartItems.
  const stillInCart = cartItems.find(i => i.productId === parseInt(productId));
  const newQty = stillInCart?.quantity ?? 0;

  meta[`cart_qty_${productId}`] = newQty;
  meta.updatedProductQty = {
    productId: parseInt(productId),
    quantity: newQty,
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
    const user = req.user;

    if (!user) return res.status(200).json(new ApiResponse(200, null, "Guest: Remove from local storage", GlobalStateHelper.baseMeta()));

    await CartRepository.deleteCartItem(productId, user.id);
    const cartItems = await CartRepository.getCartItems(user.id);
    const totals = CartController.calculateTotals(cartItems, user.activePincode || "302001");
    
    const meta = await GlobalStateHelper.getGlobalMeta(user, req.headers);
    CartController._injectCartTotalsMeta(meta, totals);

    // Explicitly set the reactive key to 0
    meta[`cart_qty_${productId}`] = 0;
    
    // quantity: 0 collapses the cart_qty_button back to the "Add to Cart" state
    meta.updatedProductQty = { productId: parseInt(productId), quantity: 0 };

    return res.status(200).json({ status: 200, data: null, message: "Product removed from cart", meta });
  });
}