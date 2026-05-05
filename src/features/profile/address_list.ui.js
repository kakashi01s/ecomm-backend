import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

export class AddressListUI {

  static build(addresses = []) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: "Saved Addresses",
        isDashboard: false,
        actions: [
          {
            icon: AppIcons.PLUS,
            action: stac.navigate("/profile/addresses/add", "push"),
          },
        ],
      }),
      body: addresses.length === 0
        ? AddressListUI._emptyState()
        : stac.listView({
            padding: [16, 16, 16, 100],
            children: addresses.map((addr) => AddressListUI._addressCard(addr)),
          }),
      floatingActionButton: {
        type: "floatingActionButton",
        onPressed: stac.navigate("/profile/addresses/add", "push"),
        child: stac.icon({ icon: "add", color: "#FFFFFF", size: 24 }),
        backgroundColor: Brand.primary,
      },
    });
  }

  static _addressCard(addr) {
    const typeLabel = addr.type ?? "Home";
    const typeIcon = typeLabel.toLowerCase() === "work" ? "business" : "home";

    return stac.container({
      margin: [0, 0, 0, 12],
      decoration: {
        color: Brand.surface,
        borderRadius: Brand.radiusMedium,
        border: {
          color: addr.isDefault ? Brand.primary : Brand.divider,
          width: addr.isDefault ? 1.5 : 1,
        },
        boxShadow: [
          { color: "#0000000A", blurRadius: 6, spreadRadius: 0, offset: { dx: 0, dy: 2 } },
        ],
      },
      child: stac.padding({
        all: 16,
        child: stac.column({
          crossAxisAlignment: "stretch",
          children: [

            // Header row
            stac.row({
              children: [
                stac.container({
                  width: 36,
                  height: 36,
                  decoration: {
                    color: addr.isDefault ? Brand.secondary : Brand.background,
                    borderRadius: Brand.radiusSmall,
                  },
                  child: stac.center({
                    child: stac.icon({
                      icon: typeIcon,
                      color: addr.isDefault ? Brand.primary : Brand.textSecondary,
                      size: 20,
                    }),
                  }),
                }),
                stac.sizedBox({ width: 12 }),
                stac.expanded({
                  child: stac.column({
                    crossAxisAlignment: "start",
                    mainAxisSize: "min",
                    children: [
                      stac.row({
                        children: [
                          stac.text(typeLabel, {
                            style: stac.textStyle({
                              fontSize: 15,
                              fontWeight: "bold",
                              color: Brand.textPrimary,
                            }),
                          }),
                          stac.sizedBox({ width: 8 }),
                          ...(addr.isDefault
                            ? [
                                stac.container({
                                  padding: [8, 3, 8, 3],
                                  decoration: {
                                    color: Brand.secondary,
                                    borderRadius: 10,
                                  },
                                  child: stac.text("Default", {
                                    style: stac.textStyle({
                                      fontSize: 10,
                                      fontWeight: "bold",
                                      color: Brand.primary,
                                    }),
                                  }),
                                }),
                              ]
                            : []),
                        ],
                      }),
                      stac.sizedBox({ height: 2 }),
                      stac.text(addr.name ?? "", {
                        style: stac.textStyle({ fontSize: 13, color: Brand.textSecondary }),
                      }),
                    ],
                  }),
                }),
              ],
            }),

            stac.sizedBox({ height: 12 }),
            stac.divider({ color: Brand.divider, height: 1, thickness: 0.5 }),
            stac.sizedBox({ height: 12 }),

            // Address text
            stac.text(
              [addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                .filter(Boolean)
                .join(", "),
              {
                style: stac.textStyle({ fontSize: 14, color: Brand.textPrimary }),
              }
            ),

            ...(addr.phone
              ? [
                  stac.sizedBox({ height: 6 }),
                  stac.row({
                    children: [
                      stac.icon({ icon: "phone", color: Brand.textSecondary, size: 13 }),
                      stac.sizedBox({ width: 4 }),
                      stac.text(addr.phone, {
                        style: stac.textStyle({ fontSize: 13, color: Brand.textSecondary }),
                      }),
                    ],
                  }),
                ]
              : []),

            stac.sizedBox({ height: 14 }),

            // Action row
            stac.row({
              mainAxisAlignment: "end",
              children: [
                // Edit
                stac.inkWell({
                  action: stac.navigate(`/profile/addresses/${addr.id}/edit`, "push"),
                  child: stac.container({
                    padding: [12, 8, 12, 8],
                    decoration: {
                      color: Brand.background,
                      borderRadius: Brand.radiusSmall,
                      border: { color: Brand.divider, width: 1 },
                    },
                    child: stac.row({
                      mainAxisSize: "min",
                      children: [
                        stac.icon({ icon: "edit", color: Brand.primary, size: 14 }),
                        stac.sizedBox({ width: 4 }),
                        stac.text("Edit", {
                          style: stac.textStyle({
                            fontSize: 13,
                            color: Brand.primary,
                            fontWeight: "w500",
                          }),
                        }),
                      ],
                    }),
                  }),
                }),
                stac.sizedBox({ width: 10 }),
                // Delete
                stac.inkWell({
                  action: stac.apiRequest({
                    url: `/profile/addresses/${addr.id}/delete`,
                    method: "POST",
                    onSuccess: stac.navigate("/profile/addresses", "replace"),
                    onError: stac.showToast("Delete failed.", {
                      backgroundColor: Brand.error,
                      textColor: "#FFFFFF",
                    }),
                  }),
                  child: stac.container({
                    padding: [12, 8, 12, 8],
                    decoration: {
                      color: "#FFEBEE",
                      borderRadius: Brand.radiusSmall,
                      border: { color: "#FFCDD2", width: 1 },
                    },
                    child: stac.row({
                      mainAxisSize: "min",
                      children: [
                        stac.icon({ icon: "delete_outline", color: Brand.error, size: 14 }),
                        stac.sizedBox({ width: 4 }),
                        stac.text("Delete", {
                          style: stac.textStyle({
                            fontSize: 13,
                            color: Brand.error,
                            fontWeight: "w500",
                          }),
                        }),
                      ],
                    }),
                  }),
                }),
              ],
            }),
          ],
        }),
      }),
    });
  }

  static _emptyState() {
    return stac.center({
      child: stac.column({
        mainAxisSize: "min",
        children: [
          stac.icon({ icon: "location_off", color: Brand.divider, size: 72 }),
          stac.sizedBox({ height: 16 }),
          stac.text("No saved addresses", {
            style: stac.textStyle({
              fontSize: 17,
              fontWeight: "bold",
              color: Brand.textPrimary,
            }),
          }),
          stac.sizedBox({ height: 8 }),
          stac.text("Add an address to get started", {
            style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }),
          }),
          stac.sizedBox({ height: 24 }),
          stac.padding({
            left: 48, right: 48,
            child: w.button({
              text: "Add Address",
              action: stac.navigate("/profile/addresses/add", "push"),
            }),
          }),
        ],
      }),
    });
  }
}
