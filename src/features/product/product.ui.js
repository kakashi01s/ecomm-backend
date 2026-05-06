import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

export class ProductUI {

  /**
   * Main entry point.
   * Receives the raw Prisma product object and returns a full scaffold JSON.
   *
   * `product` may now carry two optional fields populated by the controller
   * before calling this builder (fetched from cart/wishlist aggregates):
   * product.cartCount     — number of items currently in the user's cart
   * product.wishlistCount — number of items saved to the user's wishlist
   *
   * When these fields are present the AppBar action icons display live badges.
   */
  static buildProductPage(product, isGuest = false, activePincode = null) {
    const mediaItems = product.images?.map((i) => ({ url: i.url, mediaType: i.mediaType })) ?? [];
    const mainImg  = mediaItems.length > 0 ? mediaItems[0] : { url: "https://via.placeholder.com/600x700", mediaType: "image" };
    const price    = `₹${product.price.toFixed(2)}`;
    const hasDiscount = !!product.salePrice;
    const salePrice   = hasDiscount ? `₹${product.salePrice.toFixed(2)}` : null;

    // Badge counts — default to 0 for guests or when not provided.
    const cartCount     = isGuest ? 0 : (product.cartCount     ?? 0);
    const wishlistCount = isGuest ? 0 : (product.wishlistCount ?? 0);

    return stac.scaffold({
      backgroundColor: Brand.background,

      // ── DYNAMIC APP BAR ────────────────────────────────────────────
      // badgeType: "cart" / "wishlist" → rendered as native ListenableBuilder
      // widgets on the Flutter side. Counts update instantly from CartState
      // with no server round-trip or page navigation whatsoever.
      appBar: ui.dynamicAppBar({
        isDashboard: false,
        showSearch:  false,
        isSliver:    false,
        showLogo: true,

        actions: [
          {
            icon:      AppIcons.HEART,
            action:    stac.navigate("/wishlist"),
            badgeType: "wishlist",
          },
          {
            icon:      AppIcons.CART,
            action:    stac.navigate("/cart"),
            badgeType: "cart",
          },
        ],
      }),

      // stac.form wraps the entire body so that every api_request action
      // fired from any inkWell on this page can resolve StacFormScope.of().
      // Without this ancestor, the Stac renderer throws
      // "StacFormScope.of() called with a context that does not contain a
      // StacFormScope" and silently drops the onSuccess callback — which is
      // why the navigate("replace") never fired and the badge never updated.
      body: stac.form({
        id: "product_page_form",
        child: stac.customScrollView({
        slivers: [

          // ── IMAGE HERO + BACK BUTTON ───────────────────────────────
          ProductUI._imageSliver(product, mediaItems, mainImg, hasDiscount),

          // ── PRODUCT INFO ───────────────────────────────────────────
          stac.sliverToBoxAdapter({
            child: stac.container({
              decoration: {
                color: Brand.surface,
                borderRadius: { topLeft: 24, topRight: 24, bottomLeft: 0, bottomRight: 0 },
              },
              child: stac.padding({
                left: 20, right: 20, top: 24, bottom: 0,
                child: stac.column({
                  crossAxisAlignment: "start",
                  children: [

                    // Category badge + rating row
                    ProductUI._topMeta(product),
                    stac.sizedBox({ height: 10 }),

                    // Product name
                    stac.text(product.name, {
                      style: stac.textStyle({ fontSize: 22, fontWeight: "bold", color: Brand.textPrimary }),
                    }),
                    stac.sizedBox({ height: 12 }),

                    // Price block
                    ProductUI._priceBlock(price, salePrice, hasDiscount),
                    stac.sizedBox({ height: 20 }),

                    // Divider
                    stac.divider({ color: Brand.divider, thickness: 1 }),
                    stac.sizedBox({ height: 20 }),

                    // Variants (if any)
                    ...(product.variants?.length > 0
                      ? [
                          ProductUI._variantSection(product.variants),
                          stac.sizedBox({ height: 20 }),
                          stac.divider({ color: Brand.divider, thickness: 1 }),
                          stac.sizedBox({ height: 20 }),
                        ]
                      : []),

                    // Description
                    ...(product.description
                      ? [
                          ProductUI._descriptionSection(product.description),
                          stac.sizedBox({ height: 20 }),
                          stac.divider({ color: Brand.divider, thickness: 1 }),
                          stac.sizedBox({ height: 20 }),
                        ]
                      : []),
                    ProductUI._pincodeSection(product, activePincode),
                      stac.sizedBox({ height: 24 }),
                    // Delivery & highlights info row
                    ProductUI._highlights(),
                    stac.sizedBox({ height: 32 }),
                  ],
                }),
              }),
            }),
          }),

        ],
        }),
      }),

      // ── BOTTOM BAR: Add to Cart + Wishlist ────────────────────────
      bottomNavigationBar: ProductUI._bottomBar(product, isGuest),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────
  static _pincodeSection(product, activePincode) {
    // STATE 1: Pincode is set. Show the ETA and a "Change" button.
    if (activePincode) {
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
                  stac.text(`Delivering to ${activePincode}`, { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }) }),
                  stac.sizedBox({ height: 4 }),
                  // You can make this dynamic based on the pincode later
                  stac.text("Delivery by Friday, 28 May", { style: stac.textStyle({ fontSize: 12, fontWeight: "w500", color: "#10B981" }) }), 
                ]
              })
            }),
            stac.inkWell({
              // Sends null to clear it, then replaces the page
              action: stac.apiRequest({
                url: `/utilities/pincode`, 
                method: "POST",
                body: { pincode: null },
                onSuccess: stac.navigate(`/product/${product.id}`, "replace")
              }),
              child: stac.padding({ all: 8, child: stac.text("Change", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.primary }) }) })
            })
          ]
        })
      });
    }

    // STATE 2: No Pincode. Show the input field.
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
// Wrap the entire row in a stac.form so the Button can harvest the TextField
stac.form({
  child: stac.row({
    children: [
stac.expanded({
  child: {
    type: "textFormField",
    id: "pincode_input",
    name: "pincode_input", 
    initialValue: activePincode || "", // 🔥 YAHAN INITIAL VALUE ADD KARNI HAI
    decoration: {
      hintText: "Enter Pincode",
      filled: true,
      fillColor: Brand.background,
      contentPadding: [12, 12, 12, 12],
      border: { type: "outlineInputBorder", borderRadius: 8, color: Brand.divider },
      enabledBorder: { type: "outlineInputBorder", borderRadius: 8, color: Brand.divider },
      focusedBorder: { type: "outlineInputBorder", borderRadius: 8, color: Brand.primary }
    }
  }
}),
      
      stac.sizedBox({ width: 12 }),
      
      stac.sizedBox({
        height: 45, 
        child:w.button({
  text: "Check",
  fullWidth: false, 
  action: stac.apiRequest({
    url: `/utilities/pincode`,
    method: "POST",
    // Tell the Dart parser to fetch the value of 'pincode_input' 
    // and assign it to the 'pincode' key in the JSON body.
    body: {
      pincode: { 
        actionType: "getFormValue", 
        id: "pincode_input" 
      }
    },
    onSuccess: stac.navigate(`/product/${product.id}`, "replace")
  })
})
      })
    ]
  })
})
        ]
      })
    });
  }

  /** Sliver with image carousel and floating back + wishlist buttons */
  static _imageSliver(product, mediaItems, mainImg, hasDiscount) {
    
    return stac.sliverToBoxAdapter({
      child: stac.sizedBox({
        height: 420,
        child: stac.stack({
          children: [
            // Full bleed image / carousel
            stac.positioned({
              top: 0, bottom: 0, left: 0, right: 0,
             child: ui.mediaCarousel({
              items: mediaItems.length > 0 ? mediaItems : [mainImg],
              height: 420,
              borderRadius: 0,
              showDots: true,
              autoPlay: false // Usually false for product detail pages
            }),
            }),

            // Sale badge
            ...(hasDiscount
              ? [
                  stac.positioned({
                    bottom: 16, left: 16,
                    child: stac.container({
                      padding: [10, 5, 10, 5],
                      decoration: { color: Brand.error, borderRadius: 20 },
                      child: stac.row({
                        mainAxisSize: "min",
                        children: [
                          stac.svg({ src: AppIcons.SALE, color: "#FFFFFF", width: 14, height: 14 }),
                          stac.sizedBox({ width: 4 }),
                          stac.text("ON SALE", {
                            style: stac.textStyle({ color: "#FFFFFF", fontSize: 11, fontWeight: "bold", letterSpacing: 0.8 }),
                          }),
                        ],
                      }),
                    }),
                  }),
                ]
              : []),
          ],
        }),
      }),
    });
  }

  /** Category badge + star rating in one row */
  static _topMeta(product) {
    return stac.row({
      mainAxisAlignment: "spaceBetween",
      children: [
        // Category pill
        stac.container({
          padding: [12, 5, 12, 5],
          decoration: { color: Brand.secondary, borderRadius: 20 },
          child: stac.text(product.category?.name ?? "Product", {
            style: stac.textStyle({ fontSize: 12, fontWeight: "w600", color: Brand.primaryDark }),
          }),
        }),

        // Static star rating (you can wire this to real data later)
        stac.row({
          mainAxisSize: "min",
          children: [
            stac.svg({ src: AppIcons.STAR, color: "#F59E0B", width: 16, height: 16 }),
            stac.sizedBox({ width: 4 }),
            stac.text("4.8", {
              style: stac.textStyle({ fontSize: 13, fontWeight: "bold", color: Brand.textPrimary }),
            }),
            stac.sizedBox({ width: 4 }),
            stac.text("(120 reviews)", {
              style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }),
            }),
          ],
        }),
      ],
    });
  }

  /** Sale price + original price, or just the regular price */
  static _priceBlock(price, salePrice, hasDiscount) {
    if (hasDiscount) {
      return stac.row({
        crossAxisAlignment: "end",
        children: [
          stac.text(salePrice, {
            style: stac.textStyle({ fontSize: 26, fontWeight: "bold", color: Brand.textPrimary }),
          }),
          stac.sizedBox({ width: 10 }),
          stac.text(price, {
            style: stac.textStyle({ fontSize: 16, color: Brand.textSecondary }),
          }),
          stac.sizedBox({ width: 10 }),
          stac.container({
            padding: [8, 3, 8, 3],
            decoration: { color: "#FEF3C7", borderRadius: 8 },
            child: stac.text("SALE", {
              style: stac.textStyle({ fontSize: 11, fontWeight: "bold", color: "#D97706" }),
            }),
          }),
        ],
      });
    }

    return stac.text(price, {
      style: stac.textStyle({ fontSize: 26, fontWeight: "bold", color: Brand.textPrimary }),
    });
  }

  /** Variants section — shows each variant as a selectable chip */
  static _variantSection(variants) {
    return stac.column({
      crossAxisAlignment: "start",
      children: [
        stac.text("Options", {
          style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }),
        }),
        stac.sizedBox({ height: 12 }),
        {
          type: "webScrollRow",
          padding: [0, 0, 0, 0],
          children: variants.map((v, i) =>
            stac.padding({
              right: 8,
              child: stac.container({
                padding: [14, 8, 14, 8],
                decoration: {
                  color: i === 0 ? Brand.textPrimary : Brand.surface,
                  borderRadius: Brand.radiusSmall,
                  border: i === 0 ? null : { color: Brand.divider, width: 1 },
                },
                child: stac.text(v.name ?? v.value ?? `Option ${i + 1}`, {
                  style: stac.textStyle({
                    fontSize: 13,
                    fontWeight: i === 0 ? "w600" : "normal",
                    color: i === 0 ? "#FFFFFF" : Brand.textPrimary,
                  }),
                }),
              }),
            })
          ),
        },
      ],
    });
  }

  /** Product description block with expand-able style */
  static _descriptionSection(description) {
    return stac.column({
      crossAxisAlignment: "start",
      children: [
        stac.text("About this product", {
          style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textPrimary }),
        }),
        stac.sizedBox({ height: 10 }),
        stac.text(description, {
          maxLines: 6,
          overflow: "ellipsis",
          style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary, height: 1.6 }),
        }),
      ],
    });
  }

  /** Three highlight rows: free delivery, returns, authenticity */
  static _highlights() {
    const rows = [
      { icon: AppIcons.GIFT,    text: "Free delivery on orders above ₹999" },
      { icon: AppIcons.RECEIPT, text: "Easy 7-day returns & exchange"       },
      { icon: AppIcons.SHIELD,  text: "100% authentic & quality assured"    },
    ];

    return stac.column({
      crossAxisAlignment: "start",
      children: rows.map((row, i) =>
        stac.padding({
          bottom: i < rows.length - 1 ? 14 : 0,
          child: stac.row({
            children: [
              stac.container({
                padding: [8, 8, 8, 8],
                decoration: { color: Brand.background, borderRadius: Brand.radiusSmall },
                child: stac.svg({ src: row.icon, color: Brand.primary, width: 18, height: 18 }),
              }),
              stac.sizedBox({ width: 12 }),
              stac.expanded({
                child: stac.text(row.text, {
                  style: stac.textStyle({ fontSize: 13, color: Brand.textSecondary }),
                }),
              }),
            ],
          }),
        })
      ),
    });
  }

  /**
   * Fixed bottom bar:
   * - Guest → shows auth bottom sheet on tap
   * - User  → Add to Cart (primary) + Wishlist icon button
   *
   * `isWishlisted` is derived from product.wishlistCount > 0 so the
   * heart fills immediately without a round-trip on first render.
   */
  static _bottomBar(product, isGuest) {
    // Use the injected value from the controller
    const isWishlisted = product.isWishlisted ?? false;

    const addToCartAction = isGuest
      ? stac.showBottomSheet(
          stac.card({
            margin: 0,
            elevation: 0,
            color: Brand.surface,
            shape: { borderRadius: 24 },
            child: stac.padding({
              left: 24, top: 24, right: 24, bottom: 48,
              child: stac.column({
                mainAxisSize: "min",
                crossAxisAlignment: "stretch",
                children: [
                  stac.container({ width: 40, height: 4, decoration: { color: Brand.divider, borderRadius: 2 } }),
                  stac.sizedBox({ height: 16 }),
                  stac.text("Sign in to continue", {
                    style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }),
                  }),
                  stac.sizedBox({ height: 8 }),
                  stac.text("Create an account or sign in to add items to your cart.", {
                    style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }),
                  }),
                  stac.sizedBox({ height: 24 }),
                  w.button({ text: "Sign In / Register", action: stac.navigate("/auth") }),
                ],
              }),
            }),
          })
        )
      : stac.apiRequest({
          url: `/cart/add`,
          method: "POST",
          body: { productId: product.id, quantity: 1 },
          onSuccess: stac.showToast("Added to cart! 🛒"),
        });

    return stac.container({
      decoration: {
        color: Brand.surface,
        border: { color: Brand.divider, width: 1 },
      },
      padding: [16, 12, 16, 12],
      child: stac.row({
        children: [

          // Native custom parser — shares memory state instantly with Dashboard
          {
            type: "wishlist_heart",
            productId: parseInt(product.id),
            isWishlisted: isWishlisted,
            action: isGuest 
              // Reusing your auth bottom sheet trigger here
              ? stac.showBottomSheet(
                  stac.card({
                    margin: 0, elevation: 0, color: Brand.surface, shape: { borderRadius: 24 },
                    child: stac.padding({
                      left: 24, top: 24, right: 24, bottom: 48,
                      child: stac.column({
                        mainAxisSize: "min", crossAxisAlignment: "stretch",
                        children: [
                          stac.container({ width: 40, height: 4, decoration: { color: Brand.divider, borderRadius: 2 } }),
                          stac.sizedBox({ height: 16 }),
                          stac.text("Sign in to continue", { style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }) }),
                          stac.sizedBox({ height: 8 }),
                          stac.text("Create an account or sign in to save items to your wishlist.", { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                          stac.sizedBox({ height: 24 }),
                          w.button({ text: "Sign In / Register", action: stac.navigate("/auth") }),
                        ]
                      })
                    })
                  })
                )
              : stac.apiRequest({ 
                  url: `/wishlist/toggle`, 
                  method: "POST", 
                  body: { productId: product.id } 
                })
          },

          stac.sizedBox({ width: 12 }),

          // Add to Cart — takes remaining width
            stac.expanded({
            child: {
              type: "cart_qty_button",
              productId: parseInt(product.id),
              initialQty: product.cartQty ?? 0, // Now this has the REAL database value!
              isFullWidth: true,
              addAction: addToCartAction,
              incrementAction: isGuest ? null : stac.apiRequest({ url: `/cart/update`, method: "PUT", body: { productId: product.id, action: "increment", pincode: "302001" } }),
              decrementAction: isGuest ? null : stac.apiRequest({ url: `/cart/update`, method: "PUT", body: { productId: product.id, action: "decrement", pincode: "302001" } })
            }
          }),
        ],
      }),
    });
  }
}