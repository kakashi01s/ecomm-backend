import { ProfileRepository } from "./profile.repository.js";
import { ProfileUI } from "./profile.ui.js";
import { EditProfileUI } from "./edit_profile.ui.js";
import { AddressListUI } from "./address_list.ui.js";
import { AddressFormUI } from "./address_form.ui.js";
import { OrdersListUI } from "./orders_list.ui.js";
import { OrderDetailsUI } from "./order_details.ui.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";
import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import prisma from "../../core/prisma/client.js";

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
      let incomingPincode = req.body.pincode;
      if (incomingPincode === undefined) incomingPincode = req.body.pincode_input;
      if (incomingPincode === undefined) incomingPincode = req.query.pincode;

      const finalPincode = incomingPincode ? incomingPincode.toString() : null;
      let deliveryMsg = "Standard Delivery: 3-5 Days";

      if (finalPincode) {
        // Validate against DeliveryZone table
        const zone = await prisma.deliveryZone.findUnique({
          where: { pincode: finalPincode }
        });

        if (!zone) {
          return res.status(400).json({ 
            message: "Delivery is not available in this pincode yet." 
          });
        }

        if (!zone.isServiceable) {
          return res.status(400).json({ 
            message: "Delivery services are temporarily suspended in this area." 
          });
        }

        deliveryMsg = `Delivery in ${zone.estimatedDaysMin}-${zone.estimatedDaysMax} days (Cost: ₹${zone.deliveryCost})`;
      }

      if (req.user) {
        await ProfileRepository.updateUser(req.user.id, { 
          activePincode: finalPincode 
        });
      }

      const meta = req.user 
        ? await GlobalStateHelper.getGlobalMeta(req.user, req.headers)
        : { ...GlobalStateHelper.baseMeta(), activePincode: finalPincode };
        
      meta.delivery_msg = deliveryMsg;

      return res.status(200).json({ 
        success: true, 
        message: finalPincode ? "Pincode updated successfully" : "Pincode cleared",
        nextAction: {
          actionType: "set_global_state",
          mutations: { activePincode: finalPincode, delivery_msg: deliveryMsg }
        },
        meta
      });
    } catch (e) {
      return res.status(500).json({ message: "Update pincode error", error: e.message });
    }
  }

  // POST /profile/lookup-pincode
  static async lookupPincode(req, res) {
    try {
      // Standard textField onChanged sends { data: "..." }
      const postal = req.body.data || req.body.value;

      if (!postal || postal.toString().length < 5) {
        return res.status(200).json({});
      }

      const pCode = postal.toString().trim();
      
      // Query the database for the delivery zone
      const result = await prisma.deliveryZone.findUnique({
        where: { pincode: pCode }
      });

      if (result) {
        return res.status(200).json({
          meta: {
            address_city: result.city,
            address_state: result.state,
            address_country: result.country,
            postal_trigger: pCode // Changes the ID of City/State fields to force rebuild
          }
        });
      }

      return res.status(200).json({});
    } catch (e) {
      return res.status(500).json({ message: "Lookup error" });
    }
  }

  // GET /profile/addresses
  static async getAddresses(req, res) {
    try {
      const addresses = await ProfileRepository.getAddresses(req.user.id);
      const ui = AddressListUI.build();
      const meta = {
        user_addresses: AddressListUI.buildAddressCards(addresses)
      };
      return res.json({ ui, meta });
    } catch (e) {
      return res.status(500).json({ message: "Addresses error", error: e.message });
    }
  }

  // GET /profile/addresses/add
  static async getAddressAdd(req, res) {
    try {
      const ui = AddressFormUI.build(null);
      const meta = {
        address_form_type: "Home",
      };
      return res.json({ ui, meta });
    } catch (e) {
      return res.status(500).json({ message: "Address form error", error: e.message });
    }
  }

  // ── VALIDATION HELPER ──────────────────────────────────────────────
  static _validateAddress(body) {
    const { fullName, phone, line1, city, state, postal, country } = body;
    const errors = [];
    if (!fullName || fullName.length < 2) errors.push("Full name is too short");
    
    // Relaxed phone validation: allow +, spaces, and 7-15 digits
    const phoneRegex = /^\+?[\d\s]{7,15}$/;
    if (!phone || !phoneRegex.test(phone)) errors.push("Invalid phone number format");
    
    if (!line1) errors.push("Address line 1 is required");
    if (!city) errors.push("City is required");
    if (!state) errors.push("State is required");
    
    // Relaxed postal validation: allow alphanumeric and 3-10 chars for international support
    if (!postal || postal.length < 3) errors.push("Invalid postal code");
    
    if (!country) errors.push("Country is required");
    return errors;
  }

  // POST /profile/addresses/add
  static async createAddress(req, res) {
    try {
      const errors = ProfileController._validateAddress(req.body);
      if (errors.length > 0) return res.status(400).json({ message: errors[0] });

      await ProfileRepository.createAddress(req.user.id, req.body);
      
      const addresses = await ProfileRepository.getAddresses(req.user.id);
      const meta = {
        user_addresses: AddressListUI.buildAddressCards(addresses)
      };

      return res.json({ 
        success: true, 
        message: "Address saved",
        meta
      });
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
      
      const ui = AddressFormUI.build(address);
      const meta = {
        address_form_type: address.type || "Home",
      };
      
      return res.json({ ui, meta });
    } catch (e) {
      return res.status(500).json({ message: "Address edit error", error: e.message });
    }
  }

  // POST /profile/addresses/:id/edit
  static async updateAddress(req, res) {
    try {
      const errors = ProfileController._validateAddress(req.body);
      if (errors.length > 0) return res.status(400).json({ message: errors[0] });

      await ProfileRepository.updateAddress(
        parseInt(req.params.id), req.user.id, req.body
      );

      const addresses = await ProfileRepository.getAddresses(req.user.id);
      const meta = {
        user_addresses: AddressListUI.buildAddressCards(addresses)
      };

      return res.json({ 
        success: true, 
        message: "Address updated",
        meta
      });
    } catch (e) {
      return res.status(500).json({ message: "Update address error", error: e.message });
    }
  }

  // POST /profile/addresses/:id/delete
  static async deleteAddress(req, res) {
    try {
      await ProfileRepository.deleteAddress(parseInt(req.params.id), req.user.id);
      
      const addresses = await ProfileRepository.getAddresses(req.user.id);
      const meta = {
        user_addresses: AddressListUI.buildAddressCards(addresses)
      };

      return res.json({ 
        success: true, 
        message: "Address deleted",
        meta
      });
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

  // GET /orders/:id
  static async getOrderDetails(req, res) {
    try {
      const order = await ProfileRepository.getOrderById(parseInt(req.params.id), req.user.id);
      return res.json({ ui: OrderDetailsUI.build(order) });
    } catch (e) {
      return res.status(500).json({ message: "Order details error", error: e.message });
    }
  }

  // Placeholder for static pages
  static async getStaticPage(req, res) {
    const { page } = req.params;
    const titles = {
      track: "Track Order",
      privacy: "Privacy & Security",
      help: "Help & Support",
      about: "About App"
    };

    const uiJson = stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({ titleText: titles[page] || "Aurora", isDashboard: false }),
      body: stac.center({
        child: stac.padding({
          all: 32,
          child: stac.column({
            mainAxisSize: "min",
            children: [
              stac.icon({ icon: "construction", size: 64, color: Brand.divider }),
              stac.sizedBox({ height: 16 }),
              stac.text(`${titles[page] || "Feature"} is coming soon!`, {
                style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary })
              }),
              stac.sizedBox({ height: 8 }),
              stac.text("We are working hard to bring this feature to you.", {
                textAlign: "center",
                style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary })
              }),
            ]
          })
        })
      })
    });
    return res.json({ ui: uiJson });
  }
}
