import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

export class AddressFormUI {

  /**
   * build — reused for both Add and Edit
   * @param {Object|null} address — null for Add, existing object for Edit
   */
  static build(address = null) {
    const isEdit = !!address;
    const apiUrl = isEdit
      ? `/profile/addresses/${address.id}/edit`
      : "/profile/addresses/add";

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: isEdit ? "Edit Address" : "Add Address",
        isDashboard: false,
      }),
      body: stac.singleChildScrollView({
        child: stac.padding({
          all: 16,
          child: stac.form({
            child: stac.column({
              crossAxisAlignment: "stretch",
              children: [

                // ── Type selector ──────────────────────────────────
                stac.text("Address Type", {
                  style: stac.textStyle({
                    fontSize: 13,
                    fontWeight: "bold",
                    color: Brand.textSecondary,
                    letterSpacing: 0.6,
                  }),
                }),
                stac.sizedBox({ height: 10 }),
                stac.row({
                  children: ["Home", "Work", "Other"].map((type) =>
                    AddressFormUI._typeChip(type, address?.type === type)
                  ),
                }),

                stac.sizedBox({ height: 20 }),

                // ── Fields ────────────────────────────────────────
                AddressFormUI._field({
                  id: "name",
                  hint: "Contact name",
                  label: "Full Name",
                  icon: AppIcons.PERSON,
                  value: address?.name,
                  validators: [{ type: "required", message: "Name is required" }],
                }),
                stac.sizedBox({ height: 14 }),

                AddressFormUI._field({
                  id: "phone",
                  hint: "10-digit phone number",
                  label: "Phone",
                  icon: AppIcons.CELLPHONE,
                  keyboard: "phone",
                  value: address?.phone,
                  validators: [{ type: "required", message: "Phone is required" }],
                }),
                stac.sizedBox({ height: 14 }),

                AddressFormUI._field({
                  id: "line1",
                  hint: "House/Flat no., Building name",
                  label: "Address Line 1",
                  icon: AppIcons.HOME,
                  value: address?.line1,
                  validators: [{ type: "required", message: "Address is required" }],
                }),
                stac.sizedBox({ height: 14 }),

                AddressFormUI._field({
                  id: "line2",
                  hint: "Street, Area, Colony (optional)",
                  label: "Address Line 2",
                  icon: AppIcons.HOME,
                  value: address?.line2,
                }),
                stac.sizedBox({ height: 14 }),

                stac.row({
                  children: [
                    stac.expanded({
                      child: AddressFormUI._field({
                        id: "city",
                        hint: "City",
                        label: "City",
                        value: address?.city,
                        validators: [{ type: "required", message: "City required" }],
                      }),
                    }),
                    stac.sizedBox({ width: 12 }),
                    stac.expanded({
                      child: AddressFormUI._field({
                        id: "state",
                        hint: "State",
                        label: "State",
                        value: address?.state,
                        validators: [{ type: "required", message: "State required" }],
                      }),
                    }),
                  ],
                }),
                stac.sizedBox({ height: 14 }),

                AddressFormUI._field({
                  id: "pincode",
                  hint: "6-digit pincode",
                  label: "Pincode",
                  icon: AppIcons.SCAN,
                  keyboard: "number",
                  value: address?.pincode,
                  validators: [
                    { type: "required", message: "Pincode required" },
                    { type: "minLength", value: 6, message: "Enter valid pincode" },
                  ],
                }),

                stac.sizedBox({ height: 20 }),

                // ── Default toggle ────────────────────────────────
                stac.container({
                  decoration: {
                    color: Brand.surface,
                    borderRadius: Brand.radiusMedium,
                    border: { color: Brand.divider, width: 1 },
                  },
                  child: stac.checkbox({
                    id: "isDefault",
                    title: "Set as default address",
                    value: address?.isDefault ?? false,
                    activeColor: Brand.primary,
                  }),
                }),

                stac.sizedBox({ height: 28 }),

                w.button({
                  text: isEdit ? "Update Address" : "Save Address",
                  action: stac.apiRequest({
                    url: apiUrl,
                    method: "POST",
                    onSuccess: stac.showToast(
                      isEdit ? "Address updated!" : "Address saved!",
                      {
                        backgroundColor: Brand.success,
                        textColor: "#FFFFFF",
                        nextAction: stac.navigate("/profile/addresses", "replace"),
                      }
                    ),
                    onError: stac.showToast("Failed. Please try again.", {
                      backgroundColor: Brand.error,
                      textColor: "#FFFFFF",
                    }),
                  }),
                }),

                stac.sizedBox({ height: 32 }),
              ],
            }),
          }),
        }),
      }),
    });
  }

  static _field({ id, hint, label, icon = null, keyboard = "text", value, validators = [] }) {
    return w.textField({
      id,
      hint,
      label,
      type: keyboard === "number" ? "number" : keyboard === "phone" ? "phone" : "text",
      prefixIcon: icon,
      validators,
    });
  }

  static _typeChip(label, isSelected) {
    return stac.inkWell({
      // In real SDUI you'd handle selection via local state; simplified here
      action: null,
      child: stac.container({
        margin: [0, 0, 8, 0],
        padding: [16, 8, 16, 8],
        decoration: {
          color: isSelected ? Brand.secondary : Brand.surface,
          borderRadius: Brand.radiusMedium,
          border: {
            color: isSelected ? Brand.primary : Brand.divider,
            width: isSelected ? 1.5 : 1,
          },
        },
        child: stac.text(label, {
          style: stac.textStyle({
            fontSize: 13,
            fontWeight: isSelected ? "bold" : "w400",
            color: isSelected ? Brand.primary : Brand.textSecondary,
          }),
        }),
      }),
    });
  }
}
