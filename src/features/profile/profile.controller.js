import { ProfileRepository } from "./profile.repository.js";
import { ProfileUI } from "./profile.ui.js";
import { EditProfileUI } from "./edit_profile.ui.js";
import { AddressListUI } from "./address_list.ui.js";
import { AddressFormUI } from "./address_form.ui.js";
import { OrdersListUI } from "./orders_list.ui.js";

export class ProfileController {

  // GET /profile
  static async getProfile(req, res) {
    try {
      const user = await ProfileRepository.getUserById(req.user.id);
      return res.json({ ui: ProfileUI.buildProfileUi(user) });
    } catch (e) {
      return res.status(500).json({ message: "Profile error", error: e.message });
    }
  }

  // GET /profile/edit
  static async getEditProfile(req, res) {
    try {
      const user = await ProfileRepository.getUserById(req.user.id);
      return res.json({ ui: EditProfileUI.build(user) });
    } catch (e) {
      return res.status(500).json({ message: "Edit profile error", error: e.message });
    }
  }

  // POST /profile/edit
  static async updateProfile(req, res) {
    try {
      const { name, phone, avatarUrl } = req.body;
      const user = await ProfileRepository.updateUser(req.user.id, { name, phone, avatarUrl });
      return res.json({ success: true, user });
    } catch (e) {
      return res.status(500).json({ message: "Update error", error: e.message });
    }
  }

// POST /profile/pincode
static async updatePincode(req, res) {
    try {
      // 1. Grab the pincode, explicitly allowing null
      let incomingPincode = req.body.pincode;
      if (incomingPincode === undefined) incomingPincode = req.body.pincode_input;
      if (incomingPincode === undefined) incomingPincode = req.query.pincode;

      // 2. Format it: if it's truthy, stringify it. Otherwise, force it to null.
      const finalPincode = incomingPincode ? incomingPincode.toString() : null;

      console.log("====================================");
      console.log("[PINCODE ARRIVED]:", finalPincode);
      console.log("====================================");

      // 3. Save to DB (Notice we removed the `&& activePincode` check so nulls get saved)
      if (req.user) {
        console.log("[PINCODE] Saving to DB for user:", req.user.id, "pincode:", finalPincode);
        await ProfileRepository.updateUser(req.user.id, { 
          activePincode: finalPincode 
        });
        console.log("[PINCODE] Saved successfully");
      }

      // 4. Return it exactly as 'activePincode' so Flutter catches it
      // Standard Express res.json WILL preserve the null value here.
      return res.status(200).json({ 
        success: true, 
        message: finalPincode ? "Pincode updated" : "Pincode cleared",
        meta: { activePincode: finalPincode } 
      });
    } catch (e) {
      console.error("[PINCODE ERROR]", e);
      return res.status(500).json({ message: "Update pincode error", error: e.message });
    }
  }

  // GET /profile/addresses
  static async getAddresses(req, res) {
    try {
      const addresses = await ProfileRepository.getAddresses(req.user.id);
      return res.json({ ui: AddressListUI.build(addresses) });
    } catch (e) {
      return res.status(500).json({ message: "Addresses error", error: e.message });
    }
  }

  // GET /profile/addresses/add
  static async getAddressAdd(req, res) {
    try {
      return res.json({ ui: AddressFormUI.build(null) });
    } catch (e) {
      return res.status(500).json({ message: "Address form error", error: e.message });
    }
  }

  // POST /profile/addresses/add
  static async createAddress(req, res) {
    try {
      const address = await ProfileRepository.createAddress(req.user.id, req.body);
      return res.json({ success: true, address });
    } catch (e) {
      return res.status(500).json({ message: "Create address error", error: e.message });
    }
  }

  // GET /profile/addresses/:id/edit
  static async getAddressEdit(req, res) {
    try {
      const address = await ProfileRepository.getAddressById(
        parseInt(req.params.id), req.user.id
      );
      if (!address) return res.status(404).json({ message: "Address not found" });
      return res.json({ ui: AddressFormUI.build(address) });
    } catch (e) {
      return res.status(500).json({ message: "Address edit error", error: e.message });
    }
  }

  // POST /profile/addresses/:id/edit
  static async updateAddress(req, res) {
    try {
      const address = await ProfileRepository.updateAddress(
        parseInt(req.params.id), req.user.id, req.body
      );
      return res.json({ success: true, address });
    } catch (e) {
      return res.status(500).json({ message: "Update address error", error: e.message });
    }
  }

  // POST /profile/addresses/:id/delete
  static async deleteAddress(req, res) {
    try {
      await ProfileRepository.deleteAddress(parseInt(req.params.id), req.user.id);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ message: "Delete address error", error: e.message });
    }
  }

  // GET /orders
  static async getOrders(req, res) {
    try {
      const orders = await ProfileRepository.getOrders(req.user.id);
      return res.json({ ui: OrdersListUI.build(orders) });
    } catch (e) {
      return res.status(500).json({ message: "Orders error", error: e.message });
    }
  }
}