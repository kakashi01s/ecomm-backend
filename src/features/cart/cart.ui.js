import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class CartUI {
  /**
   * Main entry point for the Cart Page.
   *
   * SYNC STRATEGY:
   * - The cart_qty_button (native parser) updates ProductState INSTANTLY
   *   via the _GlobalStateInterceptor before the navigate fires. The badge
   *   and the button react in <16 ms — no visible flicker.
   * - The page itself navigates replace so server-computed totals
   *   (subtotal, shipping, platform fee) are always recalculated correctly.
   * - The shared cartItem widget and _cartQtyButton primitive are the same
   *   widgets used on the dashboard and product page, so qty is always
   *   consistent everywhere in the app.
   */
  static buildCartPage(cartItems = [], totals = []) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: "My Cart",
        isDashboard: false,
        actions: [
          w.iconButton({
            icon: AppIcons.HEART,
            action: stac.navigate(Endpoints.WISHLIST.BASE),
          }),
        ],
      }),
      body: stac.reactiveBuilder({
        listenTo: ["cartCount"],
        child: stac.conditionalWidget({
          stateKey: "cartCount",
          expectedValue: 0,
          defaultValue: 0,
          onTrue: CartUI._emptyCart(),
          onFalse: stac.safeArea({
            child: stac.customScrollView({
              slivers: [
                stac.sliverToBoxAdapter({
                  child: stac.padding({
                    left: 16,
                    right: 16,
                    top: 16,
                    bottom: 40,
                    child: stac.column({
                      crossAxisAlignment: "stretch",
                      children: [
                        CartUI._itemsList(cartItems),
                        stac.sizedBox({ height: 24 }),
                        CartUI._receiptSection(totals),
                      ],
                    }),
                  }),
                }),
              ],
            }),
          }),
        })
      }),
      bottomNavigationBar: stac.reactiveBuilder({
        listenTo: ["cartCount"],
        child: stac.conditionalWidget({
          stateKey: "cartCount",
          expectedValue: 0,
          defaultValue: 0,
          onTrue: stac.sizedBox(),
          onFalse: CartUI._bottomCheckoutBar()
        })
      }),
    });
  }

  // ─────────────────────────────────────────────────────────────────

  static _emptyCart() {
    return ui.emptyState({
      icon: AppIcons.CART,
      title: "Your cart is empty",
      subtitle: "Looks like you haven't added anything yet.",
      buttonText: "Start Shopping",
      buttonAction: stac.navigate(Endpoints.DASHBOARD.BASE, "replaceAll"),
    });
  }

  static _itemsList(cartItems) {
    return stac.column({
      crossAxisAlignment: "stretch",
      children: cartItems.map((item) => {
        const product = item.product || {};
        const images = product.images || [];
        const stateKey = `cart_qty_${product.id}`;

        // Prefer the first non-video media, fall back to first item
        const firstImgObj =
          images.find(
            (img) => img.mediaType === "image" || !img.url?.endsWith(".mp4")
          ) || images[0];
        const imageUrl = firstImgObj
          ? firstImgObj.url
          : "https://via.placeholder.com/150";

        // Wrap each item in a reactive builder so it disappears when qty hits 0
        return stac.reactiveBuilder({
          listenTo: [stateKey],
          child: stac.conditionalWidget({
            stateKey: stateKey,
            expectedValue: 0,
            defaultValue: 0,
            onTrue: stac.sizedBox(), // Disappear
            onFalse: ui.cartItem({
              productId: product.id,
              title: product.name || "Unknown Product",
              subtitle: product.category?.name || "Product",
              price: `₹${(product.price || 0).toFixed(2)}`,
              imageUrl,
              initialQty: item.quantity,

              onIncrement: stac.apiRequest({
                url: Endpoints.CART.UPDATE,
                method: "PUT",
                body: {
                  productId: product.id,
                  action: "increment",
                  pincode: "{{activePincode}}",
                },
              }),

              onDecrement: stac.apiRequest({
                url: Endpoints.CART.UPDATE,
                method: "PUT",
                body: {
                  productId: product.id,
                  action: "decrement",
                  pincode: "{{activePincode}}",
                },
              }),

              onDelete: stac.apiRequest({
                url: Endpoints.CART.ITEM(product.id),
                method: "DELETE",
              }),
            }),
          })
        });
      }),
    });
  }

  static _receiptSection(totals) {
    return stac.reactiveBuilder({
      listenTo: ["cart_subtotal", "cart_shipping", "cart_platform_fee", "cart_total_payable"],
      child: stac.container({
        decoration: {
          color: Brand.surface,
          borderRadius: Brand.radiusMedium,
          border: { color: Brand.divider, width: 1 },
        },
        child: stac.padding({
          all: 16,
          child: stac.column({
            crossAxisAlignment: "stretch",
            children: [
              stac.text("Order Summary", {
                style: stac.textStyle({
                  fontSize: 16,
                  fontWeight: "bold",
                  color: Brand.textPrimary,
                }),
              }),
              stac.sizedBox({ height: 16 }),
              ui.receiptRow({ label: "Subtotal", value: "₹{{cart_subtotal}}" }),
              ui.receiptRow({ label: "Shipping", value: "₹{{cart_shipping}}" }),
              ui.receiptRow({ label: "Platform Fee", value: "₹{{cart_platform_fee}}" }),
              stac.divider({ color: Brand.divider, thickness: 1 }),
              stac.sizedBox({ height: 8 }),
              ui.receiptRow({ label: "Total Amount", value: "₹{{cart_total_payable}}", isTotal: true }),
            ],
          }),
        }),
      })
    });
  }

  static _bottomCheckoutBar() {
    return stac.reactiveBuilder({
      listenTo: ["cart_total_payable"],
      child: stac.container({
        decoration: {
          color: Brand.surface,
          border: { color: Brand.divider, width: 1 },
          boxShadow: [
            {
              color: Brand.blackOpacity,
              blurRadius: 10,
              spreadRadius: 0,
              offset: { dx: 0, dy: -4 },
            },
          ],
        },
        child: stac.safeArea({
          child: stac.padding({
            all: 16,
            child: stac.row({
              mainAxisAlignment: "spaceBetween",
              children: [
                stac.column({
                  mainAxisSize: "min",
                  crossAxisAlignment: "start",
                  children: [
                    stac.text("Total Payable", {
                      style: stac.textStyle({
                        fontSize: 12,
                        color: Brand.textSecondary,
                      }),
                    }),
                    stac.sizedBox({ height: 2 }),
                    stac.text("₹{{cart_total_payable}}", {
                      style: stac.textStyle({
                        fontSize: 20,
                        fontWeight: "bold",
                        color: Brand.textPrimary,
                      }),
                    }),
                  ],
                }),
                stac.sizedBox({ width: 24 }),
                stac.expanded({
                  child: w.button({
                    text: "Place Order",
                    action: stac.navigate(Endpoints.ORDERS.CHECKOUT),
                  }),
                }),
              ],
            }),
          }),
        }),
      })
    });
  }
}