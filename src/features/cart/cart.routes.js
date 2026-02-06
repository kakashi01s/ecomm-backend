import { Router } from "express";
import { CartController } from "./cart.controller.js";
import { optionalAuthenticate } from "../../middlewares/optionalauth.middleware.js";
console.log("Inside Cart Routes file");
const router = Router();

//
router.use(optionalAuthenticate);

router.route("/add").post(CartController.additemToCart);
router.route("/get-items").post(CartController.getCartItems);
router.route("/remove/:productId").delete(CartController.decrementItem);
router.route("/delete/:productId").delete(CartController.deleteCartItem);

export default router;