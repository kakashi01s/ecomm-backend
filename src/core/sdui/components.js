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
// 2. PAGE-LEVEL COMPONENTS
// These compose w.* primitives into full layout blocks.
// Don't add raw stac.button / stac.textField here — always go through w.
// ==========================================
export const ui = {

  // ─── BUTTONS (delegate to w) ─────────────────────────────────────
  primaryButton: ({ text, action, isDestructive = false, isFullWidth = true }) =>
    w.button({
      text,
      action,
      variant: isDestructive ? "destructive" : "primary",
      fullWidth: isFullWidth,
    }),

  secondaryButton: ({ text, action }) =>
    w.button({ text, action, variant: "secondary" }),

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
    // 1. Build the image or fallback icon
    const mediaWidget = imageUrl
      ? stac.clipRRect({
          borderRadius: 32, // 32 is half of 64, making a perfect circle
          child: stac.image({
            src: imageUrl,
            width: 64,
            height: 64,
            fit: "cover",
          }),
        })
      : stac.container({
          width: 64,
          height: 64,
          decoration: {
            color: isSelected ? Brand.primary : "#EEEEEE",
            borderRadius: 32, // Circular fallback
          },
          child: stac.center({
            child: stac.icon({
              icon: "grid_view",
              color: isSelected ? "#FFFFFF" : "#999999",
              size: 28,
            }),
          }),
        });

    // 2. Add an optional selection ring
    const ringedImage = stac.container({
      padding: [2, 2, 2, 2], // Space between image and ring
      decoration: {
        borderRadius: 34,
        border: isSelected ? { color: Brand.primary, width: 2 } : null,
      },
      child: mediaWidget,
    });

    // 3. Assemble the vertical card layout
    return stac.inkWell({
      action,
      child: stac.column({
        mainAxisSize: "min",
        crossAxisAlignment: "center",
        children: [
          ringedImage,
          stac.sizedBox({ height: 8 }),
          stac.sizedBox({
            width: 72, // Constrain text width
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

// ─── PREMIUM PRODUCT CARD ──────────────────────────────────────────
  productCard: ({ 
    id, title, subtitle = "AURORA SILVER", price, originalPrice = null, 
    images = [], isOnSale = false, isWishlisted = false, 
    rating = "4.8", reviewCount = 120, onCardTap, onAddToCartTap, onWishlistTap,
    heroTag = `product_image_${id}`,
  }) => {
    
    // 1. Cleanly parse the array (handles both raw strings and {url, mediaType} objects)
    const mediaArray = Array.isArray(images) && images.length > 0 
      ? images 
      : [{ url: "https://via.placeholder.com/400x500", mediaType: "image" }];

    // 2. Fallback widget for broken images
    const fallbackImage = stac.container({
      color: "#F5F5F5",
      child: stac.center({ child: stac.icon({ icon: "image_not_supported", color: "#999999", size: 32 }) })
    });

    // 3. Find if this product has a video anywhere in its media array
    const videoItem = mediaArray.find(m => {
      const type = m.mediaType || "";
      const url = typeof m === "string" ? m : m.url;
      return type === "video" || (typeof url === "string" && url.endsWith(".mp4"));
    });

    const hasVideo = !!videoItem;
    // If there's a video, feature it! Otherwise, use the first image.
    const primaryMedia = hasVideo ? videoItem : mediaArray[0];
    const mediaUrl = typeof primaryMedia === "string" ? primaryMedia : primaryMedia.url;

    // 4. THE FIX: Directly use YOUR video component. No carousels!
    const mediaWidget = hasVideo
      ? stac.video({ 
          src: mediaUrl, 
          autoPlay: true, 
          loop: true, 
          muted: true, 
          showControls: false, 
          fit: "cover" 
        })
      : stac.image({ 
          src: mediaUrl, 
          fit: "cover", 
          errorWidget: fallbackImage 
        });

    // 5. Wrap in Hero ONLY if it's an image. (Hero + Video = Crash in Flutter)
    const heroWrappedMedia = hasVideo 
      ? mediaWidget 
      : stac.hero({ tag: heroTag, child: mediaWidget });

    return stac.inkWell({
      action: onCardTap,
      child: stac.container({
        decoration: {
          color: Brand.surface,
          borderRadius: Brand.radiusMedium,
          border: { color: Brand.divider, width: 1 },
        },
        child: stac.column({
          crossAxisAlignment: "stretch",
          children: [
            
            // =========================
            // MEDIA STACK
            // =========================
            stac.expanded({
              child: stac.stack({
                children: [
                  stac.positioned({
                    top: 0, bottom: 0, left: 0, right: 0,
                    child: stac.clipRRect({
                      borderRadius: { topLeft: Brand.radiusMedium, topRight: Brand.radiusMedium, bottomLeft: 0, bottomRight: 0 },
                      child: heroWrappedMedia, // Uses the safe, hero-stripped video widget!
                    }),
                  }),
                  
                  // SALE BADGE
                  ...(isOnSale ? [
                    stac.positioned({
                      top: 10, left: 10,
                      child: stac.container({
                        padding: [8, 4, 8, 4],
                        decoration: { color: Brand.textPrimary, borderRadius: 12 },
                        child: stac.text("SALE", { style: stac.textStyle({ color: Brand.surface, fontSize: 10, fontWeight: "bold", letterSpacing: 1.0 }) }),
                      }),
                    }),
                  ] : []),

                  // WISHLIST BUTTON
                  stac.positioned({
                    top: 8, right: 8,
                    child: stac.inkWell({
                      action: onWishlistTap,
                      child: stac.container({
                        padding: [6, 6, 6, 6],
                        decoration: { color: "#FFFFFFE6", shape: "circle" },
                        child: stac.svg({ src: AppIcons.HEART, color: isWishlisted ? Brand.error : Brand.textSecondary, width: 18, height: 18 })
                      })
                    })
                  })
                ],
              }),
            }),

            // =========================
            // TEXT DETAILS
            // =========================
            stac.padding({
              all: 12,
              child: stac.column({
                crossAxisAlignment: "start",
                mainAxisSize: "min",
                children: [
                  stac.row({
                    mainAxisAlignment: "spaceBetween",
                    children: [
                      stac.expanded({
                        child: stac.text(subtitle, {
                          maxLines: 1, overflow: "ellipsis",
                          style: stac.textStyle({ fontSize: 10, color: Brand.textSecondary, fontWeight: "bold", letterSpacing: 0.5 })
                        }),
                      }),
                      stac.sizedBox({ width: 4 }),
                      ...(reviewCount > 0 ? [
                        stac.row({
                          mainAxisSize: "min", 
                          children: [
                            stac.svg({ src: AppIcons.STAR, color: "#FFC107", width: 12, height: 12 }),
                            stac.sizedBox({ width: 4 }),
                            stac.text(`${rating} (${reviewCount})`, { style: stac.textStyle({ fontSize: 10, color: Brand.textSecondary }) })
                          ]
                        })
                      ] : [])
                    ]
                  }),
                  stac.sizedBox({ height: 6 }),
                  stac.text(title, {
                    maxLines: 2, overflow: "ellipsis",
                    style: stac.textStyle({ fontSize: 14, fontWeight: "w500", color: Brand.textPrimary, height: 1.2 }),
                  }),
                  stac.sizedBox({ height: 12 }),
                  stac.row({
                    mainAxisAlignment: "spaceBetween",
                    crossAxisAlignment: "end", 
                    children: [
                      stac.expanded({
                        child: stac.column({
                          crossAxisAlignment: "start",
                          children: [
                            ...(originalPrice ? [
                              stac.text(originalPrice, { style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }) }),
                              stac.sizedBox({ height: 2 }),
                            ] : []),
                            stac.text(price, {
                              maxLines: 1, overflow: "ellipsis",
                              style: stac.textStyle({ fontSize: 16, fontWeight: "w600", color: Brand.textPrimary }),
                            }),
                          ]
                        })
                      }),
                      stac.inkWell({
                        action: onAddToCartTap,
                        child: stac.container({
                          padding: [8, 8, 8, 8],
                          decoration: { color: Brand.textPrimary, shape: "circle" },
                          child: stac.svg({ src: AppIcons.PLUS, color: Brand.surface, width: 14, height: 14 }),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
    });
  },
  // ─── CART ITEM ───────────────────────────────────────────────────
  cartItem: ({ title, subtitle, price, imageUrl, quantity, onIncrement, onDecrement }) =>
    stac.container({
      padding: 12,
      margin: [0, 0, 0, 12],
      decoration: { color: Brand.surface, borderRadius: Brand.radiusMedium },
      child: stac.row({
        children: [
          stac.clipRRect({
            borderRadius: Brand.radiusSmall,
            child: stac.image({ src: imageUrl, width: 80, height: 80, fit: "cover" }),
          }),
          stac.sizedBox({ width: 16 }),
          stac.expanded({
            child: stac.column({
              crossAxisAlignment: "start",
              children: [
                stac.text(title, {
                  style: stac.textStyle({ fontSize: 16, fontWeight: "bold", color: Brand.textPrimary }),
                }),
                stac.text(subtitle, {
                  style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }),
                }),
                stac.sizedBox({ height: 8 }),
                stac.text(price, {
                  style: stac.textStyle({ fontSize: 16, fontWeight: "bold", color: Brand.primary }),
                }),
              ],
            }),
          }),
          stac.container({
            decoration: { border: { color: Brand.divider, width: 1 }, borderRadius: 20 },
            child: stac.row({
              children: [
                stac.inkWell({
                  action: onDecrement,
                  child: stac.padding({ all: 8, child: stac.icon({ icon: "remove", size: 16 }) }),
                }),
                stac.text(quantity.toString(), {
                  style: stac.textStyle({ fontWeight: "bold" }),
                }),
                stac.inkWell({
                  action: onIncrement,
                  child: stac.padding({ all: 8, child: stac.icon({ icon: "add", size: 16 }) }),
                }),
              ],
            }),
          }),
        ],
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
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? "bold" : "normal",
            }),
          }),
          stac.text(value, {
            style: stac.textStyle({
              color: isTotal ? Brand.primary : Brand.textPrimary,
              fontSize: isTotal ? 18 : 14,
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

  // ─── EMPTY STATE ─────────────────────────────────────────────────
  emptyState: ({ icon, title, subtitle, buttonText, buttonAction }) =>
    stac.center({
      child: stac.column({
        mainAxisAlignment: "center",
        crossAxisAlignment: "center",
        children: [
          stac.icon({ icon, color: Brand.divider, size: 100 }),
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
  //
  // Action descriptors now support a `badgeType` field:
  //   "cart"     → emits { type: "cart_badge_icon" }   (reactive, reads CartState)
  //   "wishlist" → emits { type: "wishlist_badge_icon" } (reactive, reads CartState)
  //   omitted    → plain icon button (no badge)
  //
  // The Flutter side renders these as native ListenableBuilder widgets that
  // update ONLY the badge pill — zero page navigation on count change.
  //
// ─── DYNAMIC APP BAR ─────────────────────────────────────────────
// ─── DYNAMIC APP BAR ─────────────────────────────────────────────
  dynamicAppBar: ({
    titleText, 
    isDashboard = false,
    showSearch = false,
    showLogo = false, // <-- Explicit conditional toggle for the logo
    isSliver = false,
    actions = [],
  }) => {
    
    // Determine what goes in the center/left of the app bar
    let titleWidget;
    
    if (showSearch) {
      titleWidget = w.searchBar({ hintText: "Search products...", isReadOnly: true });
    } else if (showLogo || (isDashboard && !titleText)) {
      // Unwrapped the image from the Row for perfect vertical centering
      titleWidget = stac.image({
        src: "assets/images/app_icon_hor.png",
        imageType: "asset",
        height: 24, // Standardized logo height
        fit: "contain"
      });
    } else {
      titleWidget = stac.text(titleText || "", {
        style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }),
      });
    }

    const resolvedActions = actions.map((item) => {
      if (item && typeof item === "object" && !item.type && item.icon !== undefined) {
        const { icon, action, badgeType = null, color = null, size = 22, padding = 8 } = item;

        // Reactive badge types
        if (badgeType === "cart") {
          return {
            type: "cart_badge_icon",
            icon,
            action,
            color: color ?? Brand.textPrimary,
            size,
            padding,
          };
        }
        if (badgeType === "wishlist") {
          return {
            type: "wishlist_badge_icon",
            icon,
            action,
            color: color ?? Brand.textPrimary,
            size,
            padding,
          };
        }

        // Plain icon — no badge
        return w.iconButton({ icon, action, color, size, padding });
      }
      return item;
    });

    const appBarProps = {
      title: titleWidget,
      backgroundColor: Brand.surface,
      centerTitle: !showSearch && !showLogo && !isDashboard, // Center text titles only
      elevation: 0,
      toolbarHeight: 56, // <-- The Single Source of Truth for perfectly identical heights
      actions: resolvedActions,
    };

    if (!isDashboard) {
      appBarProps.leading = w.iconButton({
        icon: AppIcons.BACK,
        action: stac.navigate(null, "pop"),
        color: Brand.textPrimary,
      });
    }

    if (isSliver) {
      return stac.sliverAppBar({ ...appBarProps, floating: true, pinned: false });
    }
    return stac.appBar(appBarProps);
  },
}