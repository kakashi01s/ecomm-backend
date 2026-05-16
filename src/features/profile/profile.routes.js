import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);

// Profile
router.get("/",                          ProfileController.getProfile);
router.get("/edit",                      ProfileController.getEditProfile);
router.post("/edit",                     ProfileController.updateProfile);
router.post("/pincode",                  ProfileController.updatePincode);
router.post("/lookup-pincode",           ProfileController.lookupPincode);
// Addresses
router.get("/addresses",                 ProfileController.getAddresses);
router.get("/addresses/add",             ProfileController.getAddressAdd);
router.post("/addresses/add",            ProfileController.createAddress);
router.get("/addresses/:id/edit",        ProfileController.getAddressEdit);
router.post("/addresses/:id/edit",       ProfileController.updateAddress);
router.post("/addresses/:id/delete",     ProfileController.deleteAddress);

// Orders (profile-scoped)
router.get("/orders",                    ProfileController.getOrders);
router.get("/orders/:id",                ProfileController.getOrderDetails);

// Static Pages / Placeholders
router.get("/pages/:page",               ProfileController.getStaticPage);

export { router };
