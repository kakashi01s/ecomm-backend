import { AppIcons } from "../constants/icons.js";
import { stac } from "./StacWidgets.js";
import { w } from "./widgets.js";

// ==========================================
// 1. BRAND DESIGN TOKENS
// ==========================================
export const Brand = {
  primary:       "#FF5722",
  primaryDark:   "#E64A19",
  secondary:     "#FFCCBC",
  surface:       "#FFFFFF",
  background:    "#F8F9FA",
  success:       "#4CAF50",
  error:         "#D32F2F",
  textPrimary:   "#1A1A1A",
  textSecondary: "#757575",
  divider:       "#EEEEEE",
  blackOpacity:  "#0000000D",
  radiusSmall:   8,
  radiusMedium:  12,
  radiusLarge:   20,
};

// ==========================================
// 2. SHARED PRIMITIVES
// Low-level, reused across all UI modules.
// ==========================================

/**
 * _productImage — shared image widget used on product cards AND cart items.
 * Always ClipRRect-wrapped so corners are respected inside any parent.
 * errorWidget shows a graceful placeholder instead of a broken image icon.
 */
const _productImage = ({ url, width, height, borderRadius = Brand.radiusSmall }) =>
  stac.clipRRect({
    borderRadius,
    child: stac.image({
      src: url || "https://via.placeholder.com/400x500.png?text=No+Image",
      width,
      height,
      fit: "cover"
    })
  });

// REFACTORED: Wishlist Heart (Pure SDUI Logic)
const _wishlistHeart = ({ productId, action }) => {
  const stateKey = `wishlist_${productId}`;
  
  return stac.reactiveBuilder({
    listenTo: [stateKey],
    child: stac.inkWell({
      action,
      child: stac.container({
        padding: [6, 6, 6, 6],
        decoration: { color: "#E6FFFFFF", shape: "circle" },
        // PURE SDUI: Evaluate the state key securely 
        child: stac.conditionalWidget({
          stateKey: stateKey,
          expectedValue: true, // If wishlist_{id} == true
          defaultValue: false,
          onTrue: stac.icon({ icon: "favorite", color: "#D32F2F", size: 18 }),
          onFalse: stac.icon({ icon: "favorite_border", color: "#757575", size: 18 })
        })
      }),
    }),
  });
};

// REFACTORED: Cart Quantity Button (Pure SDUI Logic)
const _cartQtyButton = ({ productId, addAction, incrementAction, decrementAction }) => {
  const stateKey = `cart_qty_${productId}`;
  
  return stac.reactiveBuilder({
    listenTo: [stateKey],
    child: stac.container({
      child: stac.conditionalWidget({
        stateKey: stateKey,
        expectedValue: 0, // If cart_qty_{id} == 0
        defaultValue: 0,
        
        // onTrue means Quantity is 0 -> SHOW ADD BUTTON
        onTrue: stac.asyncButton({ 
          action: addAction, 
          child: stac.container({
            height: 36, width: 36,
            decoration: { color: Brand.primary, borderRadius: 18 },
            child: stac.center({ child: stac.icon({ icon: "add", color: "#FFFFFF", size: 20 }) })
          })
        }),
        
        // onFalse means Quantity is > 0 -> SHOW STEPPER
        onFalse: stac.container({
          height: 36,
          decoration: { color: Brand.primary, borderRadius: 18 },
          child: stac.row({ 
            mainAxisSize: "min",
            children: [
              stac.asyncButton({ action: decrementAction, child: stac.icon({ icon: "remove", color: "#FFFFFF", size: 16 }) }),
              // We can still use placeholders for direct value injection!
              stac.padding({ horizontal: 8, child: stac.text(`{{${stateKey}}}`, { style: stac.textStyle({ color: "#FFFFFF", fontWeight: "bold" }) }) }),
              stac.asyncButton({ action: incrementAction, child: stac.icon({ icon: "add", color: "#FFFFFF", size: 16 }) }),
            ]
          })
        })
      })
    })
  });
};
const _normalizeUrl = (url) => {
  if (!url) return "https://via.placeholder.com/400x500.png?text=No+Image";
  if (url.startsWith("http")) return url;
  
  // If it's a relative path from your DB, prepend your exact server IP
  return url.startsWith("/") 
    ? `http://192.168.0.20:7001${url}` 
    : `http://192.168.0.20:7001/${url}`;
};
// ==========================================
// 3. PAGE-LEVEL COMPONENTS
// These compose w.* primitives and _shared* into full layout blocks.
// ==========================================
export const ui = {

  // ─── EXPOSE SHARED PRIMITIVES ────────────────────────────────────
  // So cart.ui.js and product_ui.js can import them from one place.
  productImage: _productImage,
  cartQtyButton: _cartQtyButton,
  wishlistHeart: _wishlistHeart,

  // ─── BUTTONS (delegate to w) ─────────────────────────────────────
  primaryButton: ({ text, action, isDestructive = false, isFullWidth = true }) =>
    w.button({
      text,
      action,
      variant: isDestructive ? "destructive" : "primary",
      fullWidth: isFullWidth,
    }),

  secondaryButton: ({ text, action }) => w.button({ text, action, variant: "secondary" }),

  // ─── SEARCH BAR (delegate to w) ──────────────────────────────────
  searchBar: (props) => w.searchBar(props),

  // ─── CATEGORY CHIP ───────────────────────────────────────────────
  categoryChip: ({ title, isSelected = false, action }) =>
    stac.inkWell({
      action,
      child: stac.container({
        padding: [16, 8, 16, 8],
        decoration: {
          color: isSelected ? Brand.primary : Brand.surface,
          borderRadius: 24,
          border: isSelected ? null : { color: Brand.divider, width: 1 },
        },
        child: stac.text(title, {
          style: stac.textStyle({
            color: isSelected ? "#FFFFFF" : Brand.textPrimary,
            fontWeight: isSelected ? "bold" : "normal",
          }),
        }),
      }),
    }),

  // ─── CATEGORY ROUND CARD ─────────────────────────────────────────
  categoryCard: ({ title, imageUrl = null, isSelected = false, action }) => {
    const mediaWidget = imageUrl
      ? stac.clipRRect({
          borderRadius: 32,
          child: stac.image({ src: imageUrl, width: 64, height: 64, fit: "cover" }),
        })
      : stac.container({
          width: 64,
          height: 64,
          decoration: {
            color: isSelected ? Brand.primary : "#EEEEEE",
            borderRadius: 32,
          },
          child: stac.center({
            child: stac.icon({
              icon: "grid_view",
              color: isSelected ? "#FFFFFF" : "#999999",
              size: 28,
            }),
          }),
        });

    const ringedImage = stac.container({
      padding: [2, 2, 2, 2],
      decoration: {
        borderRadius: 34,
        border: isSelected ? { color: Brand.primary, width: 2 } : null,
      },
      child: mediaWidget,
    });

    return stac.inkWell({
      action,
      child: stac.column({
        mainAxisSize: "min",
        crossAxisAlignment: "center",
        children: [
          ringedImage,
          stac.sizedBox({ height: 8 }),
          stac.sizedBox({
            width: 72,
            child: stac.text(title, {
              maxLines: 1,
              overflow: "ellipsis",
              textAlign: "center",
              style: stac.textStyle({
                fontSize: 12,
                fontWeight: isSelected ? "bold" : "normal",
                color: isSelected ? Brand.primary : Brand.textSecondary,
              }),
            }),
          }),
        ],
      }),
    });
  },

  
  // ─── PRODUCT CARD ────────────────────────────────────────────────
  // Overflow-safe: image section uses AspectRatio, not Expanded.
  // Text section is constrained so nothing escapes the card bounds.
  // The cart_qty_button is rendered via the native parser (local state).
productCard: ({
    id, title, subtitle = "", price, originalPrice = null, images = [],
    isOnSale = false, isWishlisted = false, rating = "4.8", reviewCount = 0, initialQty = 0,
    onCardTap, onAddToCartTap, onWishlistTap, onIncrementTap, onDecrementTap,
    heroTag = `product_image_${id}`,
  }) => {
    
    // 🔥 1. ULTRA-SAFE DATA PARSING 
    let resolvedUrl = "https://picsum.photos/400/175"; 
    let isVideo = false;

    if (Array.isArray(images) && images.length > 0) {
      const firstMedia = images[0];
      if (typeof firstMedia === "string") {
        resolvedUrl = firstMedia;
      } else if (firstMedia && typeof firstMedia === "object") {
        resolvedUrl = firstMedia.url || firstMedia.mediaUrl || firstMedia.src || resolvedUrl;
        isVideo = firstMedia.mediaType === "video" || resolvedUrl.endsWith(".mp4");
      }
    }

    // IP address fix for relative URLs
    if (typeof resolvedUrl === "string" && resolvedUrl.startsWith("/")) {
      resolvedUrl = `http://192.168.0.20:7001${resolvedUrl}`; 
    }

    // 🔥 2. EXPLICIT SIZING 
    const rawMediaWidget = isVideo
      ? stac.video({ src: resolvedUrl, autoPlay: true, loop: true, muted: true, showControls: false, fit: "cover", width: 500, height: 175 })
      : stac.image({ 
          src: resolvedUrl, 
          imageType: "network", // Forces Stac to recognize it as a remote URL
          fit: "cover", 
          width: 500, 
          height: 175,
          errorWidget: stac.container({
            color: "#F5F5F5",
            child: stac.center({ child: stac.icon({ icon: "image_not_supported", color: "#CCCCCC", size: 28 }) }),
          })
        });

    // 🔥 3. THE WORKING LAYOUT
    const imageSection = stac.container({
      height: 175,
      width: 500,
      color: "#F5F5F5", 
      child: stac.stack({
        children: [
          rawMediaWidget, // No Positioned wrapper!
          ...(isOnSale ? [ stac.positioned({ top: 8, left: 8, child: stac.container({ padding: [8, 4, 8, 4], decoration: { color: Brand.error, borderRadius: 10 }, child: stac.text("SALE", { style: stac.textStyle({ color: "#FFFFFF", fontSize: 9, fontWeight: "bold", letterSpacing: 0.8 }) }) }) }) ] : []),
          stac.positioned({ top: 6, right: 6, child: _wishlistHeart({ productId: id, action: onWishlistTap }) }),
        ],
      }),
    });

    // 🔥 4. DETAILS SECTION (With Reactive Cart Qty)
    const detailsSection = stac.expanded({
      child: stac.padding({
        left: 10, right: 10, top: 8, bottom: 12,
        child: stac.column({
          crossAxisAlignment: "start", mainAxisAlignment: "spaceBetween",
          children: [
            stac.column({
              crossAxisAlignment: "start", mainAxisSize: "min",
              children: [
                stac.row({
                  mainAxisAlignment: "spaceBetween", crossAxisAlignment: "center",
                  children: [
                    stac.expanded({ child: stac.text(subtitle, { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 9, color: Brand.textSecondary, fontWeight: "bold", letterSpacing: 0.5 }) }) }),
                    ...(reviewCount > 0 ? [ stac.row({ mainAxisSize: "min", children: [ stac.svg({ src: AppIcons.STAR, color: "#FFC107", width: 10, height: 10 }), stac.sizedBox({ width: 2 }), stac.text(`${rating}`, { style: stac.textStyle({ fontSize: 9, color: Brand.textSecondary }) }) ] }) ] : []),
                  ],
                }),
                stac.sizedBox({ height: 4 }),
                stac.text(title, { maxLines: 2, overflow: "ellipsis", style: stac.textStyle({ fontSize: 13, fontWeight: "w500", color: Brand.textPrimary, height: 1.2 }) }),
              ],
            }),
            stac.row({
              mainAxisAlignment: "spaceBetween", crossAxisAlignment: "center",
              children: [
                stac.expanded({
                  child: stac.column({
                    crossAxisAlignment: "start", mainAxisSize: "min",
                    children: [
                      ...(originalPrice ? [ stac.text(originalPrice, { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 10, color: Brand.textSecondary, decoration: "lineThrough" }) }), stac.sizedBox({ height: 2 }) ] : []),
                      stac.text(price, { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 14, fontWeight: "w700", color: Brand.textPrimary }) }),
                    ],
                  }),
                }),
                stac.sizedBox({ width: 4 }),
                _cartQtyButton({ productId: id, addAction: onAddToCartTap, incrementAction: onIncrementTap, decrementAction: onDecrementTap }),
              ],
            }),
          ],
        }),
      }),
    });

    return stac.inkWell({
      action: onCardTap,
      child: stac.container({
        clipBehavior: "antiAlias",
        decoration: { color: Brand.surface, borderRadius: Brand.radiusMedium, border: { color: Brand.divider, width: 1 }, boxShadow: [ { color: "#0000000A", blurRadius: 8, spreadRadius: 0, offset: { dx: 0, dy: 2 } } ] },
        child: stac.column({ crossAxisAlignment: "stretch", mainAxisSize: "max", children: [imageSection, detailsSection] }),
      }),
    });
  },

  // ─── CART ITEM ───────────────────────────────────────────────────
  // Now uses _productImage (shared) and _cartQtyButton (native parser).
  // Qty updates are instant via ProductState — no page reload needed.
  // The page still navigates replace (for totals), but the button
  // itself reacts immediately via local state before the reload completes.
  cartItem: ({
    productId,
    title,
    subtitle,
    price,
    imageUrl,
    initialQty = 1,
    onIncrement,
    onDecrement,
  }) =>
    stac.container({
      margin: [0, 0, 0, 12],
      decoration: {
        color: Brand.surface,
        borderRadius: Brand.radiusMedium,
        border: { color: Brand.divider, width: 1 },
        boxShadow: [
          { color: "#0000000A", blurRadius: 6, spreadRadius: 0, offset: { dx: 0, dy: 2 } },
        ],
      },
      child: stac.padding({
        all: 12,
        child: stac.row({
          crossAxisAlignment: "start",
          children: [
            // Product thumbnail — uses shared _productImage
            _productImage({
              url: imageUrl,
              width: 88,
              height: 88,
              borderRadius: Brand.radiusSmall,
            }),

            stac.sizedBox({ width: 12 }),

            // Info column
            stac.expanded({
              child: stac.column({
                crossAxisAlignment: "start",
                mainAxisSize: "min",
                children: [
                  // Subtitle (category)
                  stac.text(subtitle || "", {
                    maxLines: 1,
                    overflow: "ellipsis",
                    style: stac.textStyle({
                      fontSize: 10,
                      color: Brand.textSecondary,
                      fontWeight: "bold",
                      letterSpacing: 0.4,
                    }),
                  }),

                  stac.sizedBox({ height: 3 }),

                  // Product name
                  stac.text(title || "Unknown Product", {
                    maxLines: 2,
                    overflow: "ellipsis",
                    style: stac.textStyle({
                      fontSize: 14,
                      fontWeight: "w600",
                      color: Brand.textPrimary,
                      height: 1.25,
                    }),
                  }),

                  stac.sizedBox({ height: 8 }),

                  // Price + qty row
                  stac.row({
                    mainAxisAlignment: "spaceBetween",
                    crossAxisAlignment: "center",
                    children: [
                      stac.text(price, {
                        style: stac.textStyle({
                          fontSize: 15,
                          fontWeight: "bold",
                          color: Brand.primary,
                        }),
                      }),

                      // ── NATIVE QTY BUTTON ──────────────────────────
                      // Reuses the exact same widget as product card and
                      // product page. ProductState keeps them all in sync.
                      _cartQtyButton({
                        productId,
                        initialQty,
                        isFullWidth: false,
                        addAction: onIncrement,    // qty was 0 → "add" (shouldn't happen in cart, but safe)
                        incrementAction: onIncrement,
                        decrementAction: onDecrement,
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
    }),

  // ─── RECEIPT ROW ─────────────────────────────────────────────────
  receiptRow: ({ label, value, isTotal = false }) =>
    stac.padding({
      vertical: 6,
      child: stac.row({
        mainAxisAlignment: "spaceBetween",
        children: [
          stac.text(label, {
            style: stac.textStyle({
              color: isTotal ? Brand.textPrimary : Brand.textSecondary,
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? "bold" : "normal",
            }),
          }),
          stac.text(value, {
            style: stac.textStyle({
              color: isTotal ? Brand.primary : Brand.textPrimary,
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? "bold" : "w500",
            }),
          }),
        ],
      }),
    }),

  // ─── SECTION HEADER ──────────────────────────────────────────────
  sectionHeader: ({ title, actionText = "View All", action }) =>
    stac.row({
      mainAxisAlignment: "spaceBetween",
      children: [
        stac.text(title, {
          style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }),
        }),
        stac.inkWell({
          action,
          child: stac.text(actionText, {
            style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.primary }),
          }),
        }),
      ],
    }),
    nativeSearchOverlay: ({ 
    apiEndpoint, 
    onSubmitAction,
    searchBarUi,    // <-- Accept the UI template for the input field
    suggestionsUi   // <-- Accept the UI template for the dropdown items
  } = {}) => ({
    type: "nativeSearchOverlay",
    apiEndpoint,
    onSubmitAction,
    searchBarUi, 
    suggestionsUi,
  }),

  // ─── EMPTY STATE ─────────────────────────────────────────────────
  emptyState: ({ icon, title, subtitle, buttonText, buttonAction }) =>
    stac.center({
      child: stac.column({
        mainAxisAlignment: "center",
        crossAxisAlignment: "center",
        children: [
          stac.svg({ src: icon, color: Brand.divider, size: 100 }),
          stac.sizedBox({ height: 24 }),
          stac.text(title, {
            style: stac.textStyle({ fontSize: 20, fontWeight: "bold", color: Brand.textPrimary }),
          }),
          stac.sizedBox({ height: 8 }),
          stac.text(subtitle, {
            textAlign: "center",
            style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }),
          }),
          stac.sizedBox({ height: 32 }),
          buttonText
            ? stac.sizedBox({
                width: 200,
                child: w.button({ text: buttonText, action: buttonAction }),
              })
            : stac.sizedBox(),
        ],
      }),
    }),

  // ─── DYNAMIC APP BAR ─────────────────────────────────────────────
  dynamicAppBar: ({
    titleText,
    isDashboard = false,
    showSearch = false,
    showLogo = false,
    isSliver = false,
    pinned = false,
    actions = [],
    backAction = null,
  }) => {
    let titleWidget;

    if (showSearch) {
      titleWidget = w.searchBar({ hintText: "Search products...", isReadOnly: true });
    } else if (showLogo || (isDashboard && !titleText)) {
      titleWidget = stac.image({
        src: "assets/images/app_icon_hor.png",
        imageType: "asset",
        height: 24,
        fit: "contain",
      });
    } else {
      titleWidget = stac.text(titleText || "", {
        style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }),
      });
    }

    const resolvedActions = actions.map((item) => {
      if (item && typeof item === "object" && !item.type && item.icon !== undefined) {
        const { icon, action, badgeType = null, color = null, size = 22, padding = 8 } = item;

        if (badgeType === "cart") {
          return { type: "cart_badge_icon", icon, action, color: color ?? Brand.textPrimary, size, padding };
        }
        if (badgeType === "wishlist") {
          return { type: "wishlist_badge_icon", icon, action, color: color ?? Brand.textPrimary, size, padding };
        }

        return w.iconButton({ icon, action, color, size, padding });
      }
      return item;
    });

    const appBarProps = {
      title: titleWidget,
      backgroundColor: Brand.surface,
      centerTitle: !showSearch && !showLogo && !isDashboard,
      elevation: 0,
      toolbarHeight: 56,
      actions: resolvedActions,
    };

if (!isDashboard) {
      appBarProps.leading = w.iconButton({
        icon: AppIcons.BACK,
        // Agar custom backAction diya hai toh wo use karo, warna default pop
        action: backAction ?? stac.navigate(null, "pop"),
        color: Brand.textPrimary,
      });
    }

    if (isSliver) {
      return stac.sliverAppBar({ ...appBarProps, floating: !pinned, pinned });
    }
    return stac.appBar(appBarProps);
  },

mediaCarousel: ({ items = [], height = 400, borderRadius = 0, showDots = true, autoPlay = true, viewportFraction = 1.0 }) => {
    
    // यह आपका Backend-Driven Error Widget है
    const defaultErrorWidget = {
      type: "container",
      color: "#F0F0F0",
      alignment: "center", // यह overflow को रोकेगा और Icon को बीच में रखेगा
      child: {
        type: "icon",
        icon: "image_not_supported", 
        color: "#CCCCCC",
        size: 32
      }
    };

    return {
      type: "carousel", 
      height: height,
      borderRadius: borderRadius,
      showDots: showDots,
      autoPlayIntervalSeconds: autoPlay ? 4 : 0,
      viewportFraction: viewportFraction,
      items: (items || []).map((media) => {
        const url = media.url || media.mediaUrl || media.src || "";
        const type = media.mediaType || (url.endsWith(".mp4") ? "video" : "image");
        
        return {
          mediaUrl: url,
          mediaType: type,
          thumbnail: media.thumbnail || media.imageUrl || null,
          linkUrl: media.linkUrl || null,
          errorWidget: defaultErrorWidget
        };
      })
    };
  },
};