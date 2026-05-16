import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class AddressFormUI {

  /**
   * build — reused for both Add and Edit
   * Uses only standard Stac 1.4.0 components.
   */
  static build(address = null) {
    const isEdit = !!address;
    const apiUrl = isEdit
      ? Endpoints.PROFILE.ADDRESS_EDIT(address.id)
      : Endpoints.PROFILE.ADDRESS_ADD;

    const typeStateKey = "address_form_type";
    const initialType = address?.type ?? "Home";

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
            id: "address_form",
            child: stac.column({
              crossAxisAlignment: "stretch",
              children: [

                // ── Type selector ──────────────────────────────────
                stac.text("Address Type", {
                  style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.textSecondary, letterSpacing: 0.6 }),
                }),
                stac.sizedBox({ height: 10 }),
                
                stac.reactiveBuilder({
                   listenTo: [typeStateKey],
                   child: stac.row({
                     children: ["Home", "Work", "Other"].map((type) =>
                       AddressFormUI._typeChip(type, typeStateKey, initialType)
                     ),
                   }),
                }),

                stac.sizedBox({ height: 20 }),

                // ── Contact Fields ────────────────────────────────
                w.textField({
                  id: "fullName",
                  hint: "Contact name",
                  label: "Full Name",
                  prefixIcon: AppIcons.PERSON,
                  initialValue: address?.fullName,
                  validators: [{ type: "required", message: "Name is required" }, { type: "minLength", value: 2 }],
                }),
                stac.sizedBox({ height: 14 }),

                w.textField({
                  id: "phone",
                  hint: "10-digit number",
                  label: "Phone",
                  prefixIcon: AppIcons.CELLPHONE,
                  type: "number",
                  maxLength: 10,
                  initialValue: address?.phone,
                  validators: [{ type: "required", message: "Phone is required" }, { type: "pattern", value: "^[0-9]{10}$" }],
                  inputFormatters: [{ type: "digitsOnly" }]
                }),
                stac.sizedBox({ height: 14 }),

                // ── Location Details ──────────────────────────────
                w.textField({
                  id: "line1",
                  hint: "House/Flat no., Building name",
                  label: "Address Line 1",
                  prefixIcon: AppIcons.HOME,
                  initialValue: address?.line1,
                  validators: [{ type: "required", message: "Address is required" }],
                }),
                stac.sizedBox({ height: 14 }),

                w.textField({
                  id: "line2",
                  hint: "Street, Area, Colony (optional)",
                  label: "Address Line 2",
                  prefixIcon: AppIcons.HOME,
                  initialValue: address?.line2,
                }),
                stac.sizedBox({ height: 20 }),

                stac.row({
                  children: [
                    stac.expanded({
                      child: w.textField({
                        id: "city",
                        hint: "City",
                        label: "City",
                        initialValue: address?.city,
                        validators: [{ type: "required", message: "City required" }],
                      })
                    }),
                    stac.sizedBox({ width: 12 }),
                    stac.expanded({
                      child: w.textField({
                        id: "state",
                        hint: "State",
                        label: "State",
                        initialValue: address?.state,
                        validators: [{ type: "required", message: "State required" }],
                      })
                    }),
                  ],
                }),
                stac.sizedBox({ height: 14 }),

                stac.row({
                  children: [
                    stac.expanded({
                      child: w.textField({
                        id: "postal",
                        hint: "6-digit pincode",
                        label: "Pincode",
                        type: "number",
                        maxLength: 6,
                        initialValue: address?.postal,
                        validators: [
                          { type: "required", message: "Pincode required" },
                          { type: "pattern", value: "^[0-9]{6}$" },
                        ],
                        inputFormatters: [{ type: "digitsOnly" }]
                      })
                    }),
                    stac.sizedBox({ width: 12 }),
                    stac.expanded({
                      child: w.textField({
                        id: "country",
                        hint: "Country",
                        label: "Country",
                        initialValue: address?.country ?? "India",
                        validators: [{ type: "required", message: "Country required" }],
                      })
                    }),
                  ],
                }),

                stac.sizedBox({ height: 20 }),

                // ── Default toggle ────────────────────────────────
                stac.container({
                  padding: [12, 8, 12, 8],
                  decoration: { color: Brand.surface, borderRadius: Brand.radiusMedium, border: { color: Brand.divider, width: 1 } },
                  child: stac.row({
                    children: [
                      stac.checkbox({ id: "isDefault", value: address?.isDefault ?? false, activeColor: Brand.primary }),
                      stac.sizedBox({ width: 8 }),
                      stac.expanded({ child: stac.text("Set as default address", { style: stac.textStyle({ fontSize: 14, color: Brand.textPrimary }) }) })
                    ]
                  }),
                }),

                stac.sizedBox({ height: 28 }),

                // ── Save Button ──────────────────
                w.button({
                  text: isEdit ? "Update Address" : "Save Address",
                  action: stac.apiRequest({
                    url: apiUrl,
                    method: "POST",
                    body: {
                      fullName: { actionType: "getFormValue", id: "fullName" },
                      phone: { actionType: "getFormValue", id: "phone" },
                      line1: { actionType: "getFormValue", id: "line1" },
                      line2: { actionType: "getFormValue", id: "line2" },
                      city: { actionType: "getFormValue", id: "city" },
                      state: { actionType: "getFormValue", id: "state" },
                      country: { actionType: "getFormValue", id: "country" },
                      postal: { actionType: "getFormValue", id: "postal" },
                      isDefault: { actionType: "getFormValue", id: "isDefault" },
                      type: `{{${typeStateKey}}}`, 
                    },
                    onSuccess: stac.popThen(stac.showToast(isEdit ? "Address updated!" : "Address saved!")),
                    onError: stac.showToast("Please fix errors in the form.", { backgroundColor: Brand.error, textColor: "#FFFFFF" })
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

  static _typeChip(type, stateKey, initialValue) {
    return stac.conditionalWidget({
       stateKey: stateKey,
       expectedValue: type,
       defaultValue: initialValue,
       onTrue: stac.inkWell({
          action: stac.setGlobalState({ [stateKey]: type }),
          child: stac.container({
            margin: [0, 0, 8, 0], padding: [16, 8, 16, 8],
            decoration: { color: Brand.secondary, borderRadius: Brand.radiusMedium, border: { color: Brand.primary, width: 1.5 } },
            child: stac.text(type, { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.primary }) }),
          }),
       }),
       onFalse: stac.inkWell({
          action: stac.setGlobalState({ [stateKey]: type }),
          child: stac.container({
            margin: [0, 0, 8, 0], padding: [16, 8, 16, 8],
            decoration: { color: Brand.surface, borderRadius: Brand.radiusMedium, border: { color: Brand.divider, width: 1 } },
            child: stac.text(type, { style: stac.textStyle({ fontSize: 13, fontWeight: "w400", color: Brand.textSecondary }) }),
          }),
       })
    });
  }
}
