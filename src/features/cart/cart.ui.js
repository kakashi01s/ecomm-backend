import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

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
    const isEmpty = cartItems.length === 0;
    const totalAmountObj = totals.find((t) => t.label === "Total Amount");
    const totalPayable = totalAmountObj
      ? `₹${totalAmountObj.value.toFixed(2)}`
      : "₹0.00";

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: "My Cart",
        isDashboard: false,
        actions: [
          {
            icon: AppIcons.HEART,
            action: stac.navigate("/wishlist"),
            badgeType: "wishlist",
          },
        ],
      }),
      body: isEmpty
        ? CartUI._emptyCart()
        : stac.safeArea({
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
      bottomNavigationBar: isEmpty ? null : CartUI._bottomCheckoutBar(totalPayable),
    });
  }

  // ─────────────────────────────────────────────────────────────────

  static _emptyCart() {
    return ui.emptyState({
      icon: AppIcons.CART,
      title: "Your cart is empty",
      subtitle: "Looks like you haven't added anything yet.",
      buttonText: "Start Shopping",
      buttonAction: stac.navigate("/dashboard", "replaceAll"),
    });
  }

  static _itemsList(cartItems) {
    return stac.column({
      crossAxisAlignment: "stretch",
      children: cartItems.map((item) => {
        const product = item.product || {};
        const images = product.images || [];

        // Prefer the first non-video media, fall back to first item
        const firstImgObj =
          images.find(
            (img) => img.mediaType === "image" || !img.url?.endsWith(".mp4")
          ) || images[0];
        const imageUrl = firstImgObj
          ? firstImgObj.url
          : "https://via.placeholder.com/150";

        // ── The shared cartItem component now uses _cartQtyButton (native parser)
        // internally, so qty updates reflect immediately in ProductState before
        // the navigate replace completes. Both the badge and the button update
        // together without any flicker.
        return ui.cartItem({
          productId: product.id,
          title: product.name || "Unknown Product",
          subtitle: product.category?.name || "Product",
          price: `₹${(product.price || 0).toFixed(2)}`,
          imageUrl,
          initialQty: item.quantity,

          onIncrement: stac.apiRequest({
            url: `/cart/update`,
            method: "PUT",
            body: {
              productId: product.id,
              action: "increment",
              pincode: "302001",
            },
            onSuccess: stac.navigate("/cart", "replace"),
          }),

          onDecrement: stac.apiRequest({
            url: `/cart/update`,
            method: "PUT",
            body: {
              productId: product.id,
              action: "decrement",
              pincode: "302001",
            },
            onSuccess: stac.navigate("/cart", "replace"),
          }),
        });
      }),
    });
  }

  static _receiptSection(totals) {
    const rows = [];

    totals.forEach((total, index) => {
      const isLast = index === totals.length - 1;

      if (isLast) {
        rows.push(stac.divider({ color: Brand.divider, thickness: 1 }));
        rows.push(stac.sizedBox({ height: 8 }));
      }

      rows.push(
        ui.receiptRow({
          label: total.label,
          value: `₹${total.value.toFixed(2)}`,
          isTotal: isLast,
        })
      );
    });

    return stac.container({
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
            ...rows,
          ],
        }),
      }),
    });
  }

  static _bottomCheckoutBar(totalPayable) {
    return stac.container({
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
                  stac.text(totalPayable, {
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
                  action: stac.navigate("/checkout"),
                }),
              }),
            ],
          }),
        }),
      }),
    });
  }
}