import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { AuthUI } from "../auth/auth.ui.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";

export class ProductUI {

static buildProductPage(product, isGuest = false, activePincode = null) {
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
          w.badgedIconButton({
            icon: AppIcons.HEART,
            stateKey: "wishlistCount",
            action: isGuest ? AuthUI.triggerAuth("bottomSheet") : stac.navigate("/wishlist"),
          }),
          w.badgedIconButton({
            icon: AppIcons.CART,
            stateKey: "cartCount",
            action: stac.navigate("/cart"),
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
                    ],
                  }),
                }),
              }),
            }),
          ],
        }),
      }),
      bottomNavigationBar: ProductUI._bottomBar(product, isGuest),
    });
  }

static _pincodeSection(product) {
    const stateKey = "activePincode";

    return stac.reactiveBuilder({
      listenTo: [stateKey], // 🔥 Only rebuild when activePincode changes
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
                child: stac.textField({
                  id: "pincode_input",
                  // 🔥 Updates temp_pincode state without rebuilding the UI
                  onChanged: stac.setGlobalState({ temp_pincode: "{{_value}}" }),
                  decoration: {
                    hintText: "Enter Pincode", filled: true, fillColor: Brand.background,
                    contentPadding: [12, 12, 12, 12],
                    border: { type: "outlineInputBorder", borderRadius: 8, color: Brand.divider },
                  }
                })
              }),
              stac.sizedBox({ width: 12 }),
              stac.sizedBox({
                height: 45, 
                child: w.button({
                  text: "Check", fullWidth: false, 
                  action: stac.apiRequest({
                    url: `/utilities/pincode`, 
                    method: "POST",
                    body: { pincode: { actionType: "getFormValue", id: "pincode_input" } },
                    onSuccess: stac.setGlobalState({ activePincode: "{{temp_pincode}}" })
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
            action: stac.setGlobalState({ activePincode: "", temp_pincode: "" }),
            child: stac.padding({ all: 8, child: stac.text("Change", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.primary }) }) })
          })
        ]
      })
    });
  }

  static _bottomBar(product, isGuest) {
    const cartQtyKey = `cart_qty_${product.id}`;
    return stac.container({
      padding: 16,
      decoration: { color: Brand.surface, border: { top: { color: Brand.divider, width: 1 } } },
      child: stac.safeArea({
        child: stac.row({
          children: [
            ui.wishlistHeart({
              productId: product.id,
              action: isGuest ? AuthUI.triggerAuth() : stac.apiRequest({ url: `/wishlist/toggle`, method: "POST", body: { productId: product.id } })
            }),
            stac.sizedBox({ width: 12 }),
            stac.expanded({
              child: stac.reactiveBuilder({
                listenTo: [cartQtyKey],
                child: stac.conditionalWidget({
                  stateKey: cartQtyKey,
                  expectedValue: 0,
                  onTrue: w.button({
                    text: "Add to Cart",
                    action: isGuest ? AuthUI.triggerAuth() : stac.apiRequest({ url: `/cart/add`, method: "POST", body: { productId: product.id, quantity: 1 } })
                  }),
                  onFalse: w.button({
                    text: "Go to Cart",
                    variant: "secondary",
                    icon: AppIcons.CART,
                    action: stac.navigate("/cart")
                  })
                })
              })
            }),
          ],
        }),
      })
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────
// ─── 1. THE REACTIVE PINCODE CONTAINER ───────────────────────────
  // This stays on the page and listens to 'activePincode' in GetX.
  static _pincodeSection(product) {
    const stateKey = "activePincode";

    return stac.reactiveBuilder({
      listenTo: [stateKey],
      child: stac.conditionalWidget({
        stateKey: stateKey,
        expectedValue: "", // We treat an empty string as "not set"
        defaultValue: "", 
        // If activePincode is empty, show the Entry UI
        onTrue: ProductUI._pincodeEntryUi(product),
        // If activePincode has a value, show the Status UI
        onFalse: ProductUI._pincodeStatusUi(product),
      })
    });
  }

  // ─── 2. PINCODE ENTRY UI (The Input Field) ───────────────────────
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
                child: stac.textField({
                  id: "pincode_input",
                  // 🔥 Update local state as user types so 'Check' button can grab it
                  onChanged: stac.setGlobalState({ temp_pincode: "{{_value}}" }),
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
                    url: `/utilities/pincode`, 
                    method: "POST",
                    body: { pincode: { actionType: "getFormValue", id: "pincode_input" } },
                    // 🔥 SUCCESS: Update global state key. This triggers the UI swap instantly!
                    onSuccess: stac.setGlobalState({ activePincode: "{{temp_pincode}}" })
                  })
                })
              })
            ]
          })
        ]
      })
    });
  }

  // ─── 3. PINCODE STATUS UI (Delivery Info) ────────────────────────
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
                // 🔥 Injects the live pincode from GetX state
                stac.text("Delivering to {{activePincode}}", { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }) }),
                stac.sizedBox({ height: 4 }),
                stac.text("Delivery by Friday, 28 May", { style: stac.textStyle({ fontSize: 12, fontWeight: "w500", color: "#10B981" }) }), 
              ]
            })
          }),
          stac.inkWell({
            // 🔥 Reset state locally to show the input UI again
            action: stac.setGlobalState({ activePincode: "" }),
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

  static _variantSection(variants) {
    return stac.column({
      crossAxisAlignment: "start",
      children: [
        stac.text("Options", { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }) }),
        stac.sizedBox({ height: 12 }),
        stac.singleChildScrollView({
          scrollDirection: "horizontal",
          child: stac.row({
            children: variants.map((v, i) =>
              stac.padding({ right: 8, child: stac.container({ padding: [14, 8, 14, 8], decoration: { color: i === 0 ? Brand.textPrimary : Brand.surface, borderRadius: Brand.radiusSmall, border: i === 0 ? null : { color: Brand.divider, width: 1 } }, child: stac.text(v.name ?? v.value ?? `Option ${i + 1}`, { style: stac.textStyle({ fontSize: 13, fontWeight: i === 0 ? "w600" : "normal", color: i === 0 ? "#FFFFFF" : Brand.textPrimary }) }) }) })
            ),
          })
        }),
      ],
    });
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
static _bottomBar(product, isGuest) {
    const productId = parseInt(product.id);
    const cartQtyKey = `cart_qty_${productId}`;

    // 1. Action for Adding to Cart
    const addToCartAction = isGuest
      ? AuthUI.triggerAuth("bottomSheet")
      : stac.apiRequest({
          url: `/cart/add`,
          method: "POST",
          body: { productId: productId, quantity: 1 },
          onSuccess: stac.showToast("Added to cart! 🛒"),
        });

    return stac.container({
      decoration: { color: Brand.surface, border: { top: { color: Brand.divider, width: 1 } } },
      padding: [16, 12, 16, 12],
      child: stac.safeArea({
        top: false, left: false, right: false,
        child: stac.row({
          children: [
            // Wishlist Heart (Existing Reactive Component)
            ui.wishlistHeart({
              productId: productId,
              action: isGuest 
                ? AuthUI.triggerAuth("bottomSheet")
                : stac.apiRequest({ url: `/wishlist/toggle`, method: "POST", body: { productId: productId } })
            }),
            
            stac.sizedBox({ width: 12 }),

            // 2. BIG REACTIVE BUTTON
            stac.expanded({
              child: stac.reactiveBuilder({
                listenTo: [cartQtyKey], // Listens to global cart state
                child: stac.conditionalWidget({
                  stateKey: cartQtyKey,
                  expectedValue: 0, // If qty is 0, show "Add to Cart"
                  defaultValue: 0,
                  
                  // STATE A: Not in Cart -> Show Big "Add to Cart"
                  onTrue: w.button({
                    text: "Add to Cart",
                    fullWidth: true,
                    variant: "primary",
                    action: addToCartAction
                  }),
                  
                  // STATE B: Already in Cart -> Show Big "Go to Cart"
                  onFalse: w.button({
                    text: "Go to Cart",
                    fullWidth: true,
                    variant: "secondary", // Uses secondary color to differentiate
                    icon: "shopping_cart_checkout",
                    action: stac.navigate("/cart") // Instant navigation
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