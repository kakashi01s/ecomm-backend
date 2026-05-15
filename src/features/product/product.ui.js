import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { AuthUI } from "../auth/auth.ui.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";
import { StateKeys } from "../../core/constants/stateKeys.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class ProductUI {

  static buildProductPage(product, user = null, activePincode = null, isWishlisted = false) {
    const mediaItems = product.images?.map((i) => ({ url: i.url, mediaType: i.mediaType })) ?? [];
    const mainImg  = mediaItems.length > 0 ? mediaItems[0] : { url: "https://via.placeholder.com/600x700", mediaType: "image" };
    const price    = `₹${product.price.toFixed(2)}`;
    const hasDiscount = !!product.salePrice;
    const salePrice   = hasDiscount ? `₹${product.salePrice.toFixed(2)}` : null;

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        showLogo: true,
        actions: [
          stac.reactiveBuilder({
            listenTo: ["wishlistCount", StateKeys.IS_LOGGED_IN],
            child: w.badgedIconButton({
              icon: AppIcons.HEART,
              stateKey: "wishlistCount",
              action: stac.conditionalAction({
                stateKey: StateKeys.IS_LOGGED_IN,
                expectedValue: true,
                defaultValue: false,
                onTrue: stac.navigate(Endpoints.WISHLIST.BASE),
                onFalse: AuthUI.triggerAuth("bottomSheet")
              }),
            }),
          }),
          w.badgedIconButton({
            icon: AppIcons.CART,
            stateKey: "cartCount",
            action: stac.navigate(Endpoints.CART.BASE),
          }),
        ],
      }),
      body: stac.form({
        id: "product_page_form",
        child: stac.customScrollView({
          slivers: [
            ProductUI._imageSliver(product, mediaItems, mainImg, hasDiscount),
            stac.sliverToBoxAdapter({
              child: stac.container({
                decoration: { color: Brand.surface, borderRadius: { topLeft: 24, topRight: 24 } },
                child: stac.padding({
                  horizontal: 20, top: 24, bottom: 32,
                  child: stac.column({
                    crossAxisAlignment: "start",
                    children: [
                      ProductUI._topMeta(product),
                      stac.sizedBox({ height: 10 }),
                      stac.text(product.name, { style: stac.textStyle({ fontSize: 22, fontWeight: "bold" }) }),
                      stac.sizedBox({ height: 12 }),
                      ProductUI._priceBlock(price, salePrice, hasDiscount),
                      stac.sizedBox({ height: 20 }),
                      stac.divider({ color: Brand.divider }),
                      stac.sizedBox({ height: 20 }),
                      ProductUI._pincodeSection(product),
                      stac.sizedBox({ height: 32 }),
                      ProductUI._descriptionSection(product.description || "No description available."),
                      stac.sizedBox({ height: 32 }),
                      ProductUI._highlights(),
                      stac.sizedBox({ height: 100 }),
                    ],
                  }),
                }),
              }),
            }),
          ],
        }),
      }),
      bottomNavigationBar: ProductUI._bottomBar(product, user, isWishlisted),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  static _pincodeSection(product) {
    const stateKey = "activePincode";

    return stac.reactiveBuilder({
      listenTo: [stateKey],
      child: stac.conditionalWidget({
        stateKey: stateKey,
        expectedValue: "", 
        defaultValue: "", 
        onTrue: ProductUI._pincodeEntryUi(product),
        onFalse: ProductUI._pincodeStatusUi(product),
      })
    });
  }

  static _pincodeEntryUi(product) {
    return stac.container({
      padding: [16, 16, 16, 16],
      decoration: { color: Brand.surface, borderRadius: Brand.radiusSmall, border: { color: Brand.divider, width: 1 } },
      child: stac.column({
        crossAxisAlignment: "start",
        children: [
          stac.row({
            children: [
               stac.svg({ src: AppIcons.LOCATION || "location_on", color: Brand.textSecondary, width: 18, height: 18 }),
               stac.sizedBox({ width: 8 }),
               stac.text("Check Delivery & Services", { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }) }),
            ]
          }),
          stac.sizedBox({ height: 12 }),
          stac.row({
            children: [
              stac.expanded({
                child: stac.textFormField({
                  id: "pincode_input",
                  decoration: {
                    hintText: "Enter Pincode", filled: true, fillColor: Brand.background, contentPadding: [12, 12, 12, 12],
                    border: { type: "outlineInputBorder", borderRadius: 8, color: Brand.divider },
                    enabledBorder: { type: "outlineInputBorder", borderRadius: 8, color: Brand.divider },
                    focusedBorder: { type: "outlineInputBorder", borderRadius: 8, color: Brand.primary }
                  }
                })
              }),
              stac.sizedBox({ width: 12 }),
              stac.sizedBox({
                height: 45, 
                child: w.button({
                  text: "Check", fullWidth: false, 
                  action: stac.apiRequest({
                    url: Endpoints.UTILITIES.PINCODE, 
                    method: "POST",
                    body: { pincode: { actionType: "getFormValue", id: "pincode_input" } }
                  })
                })
              })
            ]
          })
        ]
      })
    });
  }

  static _pincodeStatusUi(product) {
    return stac.container({
      padding: [16, 16, 16, 16],
      decoration: { color: Brand.surface, borderRadius: Brand.radiusSmall, border: { color: Brand.divider, width: 1 } },
      child: stac.row({
        children: [
          stac.svg({ src: AppIcons.LOCATION || "location_on", color: Brand.primary, width: 24, height: 24 }),
          stac.sizedBox({ width: 12 }),
          stac.expanded({
            child: stac.column({
              crossAxisAlignment: "start",
              children: [
                stac.text("Delivering to {{activePincode}}", { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }) }),
                stac.sizedBox({ height: 4 }),
                stac.text("Standard Delivery: Tomorrow", { style: stac.textStyle({ fontSize: 12, fontWeight: "w500", color: "#10B981" }) }), 
              ]
            })
          }),
          stac.inkWell({
            action: stac.apiRequest({
              url: Endpoints.UTILITIES.PINCODE, 
              method: "POST",
              body: { pincode: null }
            }),
            child: stac.padding({ all: 8, child: stac.text("Change", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.primary }) }) })
          })
        ]
      })
    });
  }

  static _imageSliver(product, mediaItems, mainImg, hasDiscount) {
    return stac.sliverToBoxAdapter({
      child: stac.sizedBox({
        height: 420,
        child: stac.stack({
          children: [
            stac.positioned({
              top: 0, bottom: 0, left: 0, right: 0,
              child: ui.mediaCarousel({ items: mediaItems.length > 0 ? mediaItems : [mainImg], height: 420, borderRadius: 0, showDots: true, autoPlay: false }),
            }),
            ...(hasDiscount ? [ stac.positioned({ bottom: 16, left: 16, child: stac.container({ padding: [10, 5, 10, 5], decoration: { color: Brand.error, borderRadius: 20 }, child: stac.row({ mainAxisSize: "min", children: [ stac.svg({ src: AppIcons.SALE, color: "#FFFFFF", width: 14, height: 14 }), stac.sizedBox({ width: 4 }), stac.text("ON SALE", { style: stac.textStyle({ color: "#FFFFFF", fontSize: 11, fontWeight: "bold", letterSpacing: 0.8 }) }) ] }) }) }) ] : []),
          ],
        }),
      }),
    });
  }

  static _topMeta(product) {
    return stac.row({
      mainAxisAlignment: "spaceBetween",
      children: [
        stac.container({ padding: [12, 5, 12, 5], decoration: { color: Brand.secondary, borderRadius: 20 }, child: stac.text(product.category?.name ?? "Product", { style: stac.textStyle({ fontSize: 12, fontWeight: "w600", color: Brand.primaryDark }) }) }),
        stac.row({ mainAxisSize: "min", children: [ stac.svg({ src: AppIcons.STAR, color: "#F59E0B", width: 16, height: 16 }), stac.sizedBox({ width: 4 }), stac.text("4.8", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.textPrimary }) }), stac.sizedBox({ width: 4 }), stac.text("(120 reviews)", { style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }) }) ] }),
      ],
    });
  }

  static _priceBlock(price, salePrice, hasDiscount) {
    if (hasDiscount) {
      return stac.row({
        crossAxisAlignment: "end",
        children: [
          stac.text(salePrice, { style: stac.textStyle({ fontSize: 26, fontWeight: "bold", color: Brand.textPrimary }) }),
          stac.sizedBox({ width: 10 }),
          stac.text(price, { style: stac.textStyle({ fontSize: 16, color: Brand.textSecondary }) }),
          stac.sizedBox({ width: 10 }),
          stac.container({ padding: [8, 3, 8, 3], decoration: { color: "#FEF3C7", borderRadius: 8 }, child: stac.text("SALE", { style: stac.textStyle({ fontSize: 11, fontWeight: "bold", color: "#D97706" }) }) }),
        ],
      });
    }
    return stac.text(price, { style: stac.textStyle({ fontSize: 26, fontWeight: "bold", color: Brand.textPrimary }) });
  }

  static _descriptionSection(description) {
    return stac.column({
      crossAxisAlignment: "start",
      children: [
        stac.text("About this product", { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }) }),
        stac.sizedBox({ height: 10 }),
        stac.text(description, { maxLines: 6, overflow: "ellipsis", style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary, height: 1.6 }) }),
      ],
    });
  }

  static _highlights() {
    const rows = [
      { icon: AppIcons.GIFT,    text: "Free delivery on orders above ₹999" },
      { icon: AppIcons.RECEIPT, text: "Easy 7-day returns & exchange"       },
      { icon: AppIcons.SHIELD,  text: "100% authentic & quality assured"    },
    ];
    return stac.column({
      crossAxisAlignment: "start",
      children: rows.map((row, i) =>
        stac.padding({ bottom: i < rows.length - 1 ? 14 : 0, child: stac.row({ children: [ stac.container({ padding: [8, 8, 8, 8], decoration: { color: Brand.background, borderRadius: Brand.radiusSmall }, child: stac.svg({ src: row.icon, color: Brand.primary, width: 18, height: 18 }) }), stac.sizedBox({ width: 12 }), stac.expanded({ child: stac.text(row.text, { style: stac.textStyle({ fontSize: 13, color: Brand.textSecondary }) }) }) ] }) })
      ),
    });
  }

  static _bottomBar(product, user, isWishlisted = false) {
    const productId = parseInt(product.id);
    const cartQtyKey = `cart_qty_${productId}`;

    return stac.container({
      decoration: { color: Brand.surface, border: { top: { color: Brand.divider, width: 1 } } },
      padding: [16, 12, 16, 12],
      child: stac.safeArea({
        top: false, left: false, right: false,
        child: stac.row({
          children: [
            ui.wishlistHeart({
              productId: productId,
              isWishlisted: isWishlisted,
              action: stac.conditionalAction({
                stateKey: StateKeys.IS_LOGGED_IN,
                expectedValue: true,
                defaultValue: false,
                onTrue: stac.apiRequest({ url: Endpoints.WISHLIST.TOGGLE, method: "POST", body: { productId: productId } }),
                onFalse: AuthUI.triggerAuth("bottomSheet")
              })
            }),
            
            stac.sizedBox({ width: 12 }),

            stac.expanded({
              child: stac.reactiveBuilder({
                listenTo: [StateKeys.IS_LOGGED_IN], 
                child: ui.cartQtyButton({
                  productId: productId,
                  variant: "full",
                  addAction: stac.conditionalAction({
                    stateKey: StateKeys.IS_LOGGED_IN,
                    expectedValue: true,
                    defaultValue: false,
                    onTrue: stac.apiRequest({
                      url: Endpoints.CART.ADD,
                      method: "POST",
                      body: { productId: productId, quantity: 1, pincode: "{{activePincode}}" },
                      onSuccess: stac.showToast("Added to cart! 🛒"),
                    }),
                    onFalse: AuthUI.triggerAuth("bottomSheet")
                  }),
                  incrementAction: stac.conditionalAction({
                    stateKey: StateKeys.IS_LOGGED_IN,
                    expectedValue: true,
                    defaultValue: false,
                    onTrue: stac.apiRequest({
                      url: Endpoints.CART.UPDATE,
                      method: "PUT",
                      body: { productId: productId, action: "increment", pincode: "{{activePincode}}" }
                    }),
                    onFalse: AuthUI.triggerAuth("bottomSheet")
                  }),
                  decrementAction: stac.conditionalAction({
                    stateKey: StateKeys.IS_LOGGED_IN,
                    expectedValue: true,
                    defaultValue: false,
                    onTrue: stac.apiRequest({
                      url: Endpoints.CART.UPDATE,
                      method: "PUT",
                      body: { productId: productId, action: "decrement", pincode: "{{activePincode}}" }
                    }),
                    onFalse: AuthUI.triggerAuth("bottomSheet")
                  })
                })
              })
            }),
          ],
        }),
      })
    });
  }
}