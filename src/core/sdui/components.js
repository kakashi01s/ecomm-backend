import { stac } from "./StacWidgets.js";

// ==========================================
// 1. BRAND DESIGN TOKENS
// ==========================================
export const Brand = {
  primary: "#FF5722",       
  primaryDark: "#E64A19",
  secondary: "#FFCCBC",
  surface: "#FFFFFF",       
  background: "#F8F9FA",    
  success: "#4CAF50",       
  error: "#D32F2F",         
  textPrimary: "#1A1A1A",
  textSecondary: "#757575",
  divider: "#EEEEEE",
  radiusSmall: 8,
  radiusMedium: 12,
  radiusLarge: 20,
};

// ==========================================
// 2. REUSABLE E-COMMERCE COMPONENTS
// ==========================================
export const ui = {
  
  // ----------------------------------------
  // BUTTONS & CHIPS
  // ----------------------------------------
  primaryButton: ({ text, action, isDestructive = false, isFullWidth = true }) => {
    const btn = stac.button({
      text,
      action,
      color: isDestructive ? Brand.error : Brand.primary,
      textColor: "#FFFFFF",
      style: { shape: { borderRadius: Brand.radiusMedium } }
    });
    return isFullWidth ? stac.sizedBox({ width: "infinity", height: 50, child: btn }) : btn;
  },

  secondaryButton: ({ text, action }) => {
    const btn = stac.button({
      text, action, color: Brand.secondary, textColor: Brand.primaryDark,
      style: { shape: { borderRadius: Brand.radiusMedium }, elevation: 0 }
    });
    return stac.sizedBox({ width: "infinity", height: 50, child: btn });
  },

  categoryChip: ({ title, isSelected = false, action }) => 
    stac.inkWell({
      action,
      child: stac.container({
        padding: [16, 8, 16, 8], 
        decoration: {
          color: isSelected ? Brand.primary : Brand.surface,
          borderRadius: 24,
          border: isSelected ? null : { color: Brand.divider, width: 1 }
        },
        child: stac.text(title, { 
          style: stac.textStyle({ color: isSelected ? "#FFFFFF" : Brand.textPrimary, fontWeight: isSelected ? "bold" : "normal" }) 
        })
      })
    }),

  // ----------------------------------------
  // PRODUCT CARDS
  // ----------------------------------------
  
productCard: ({ id, title, price, imageUrl, isOnSale = false, onCardTap, onAddToCartTap }) => 
    stac.inkWell({
      action: onCardTap,
      child: stac.card({
        elevation: 2,
        color: Brand.surface,
        shape: { borderRadius: Brand.radiusMedium },
        child: stac.column({
          crossAxisAlignment: "stretch",
          children: [
            // 🚨 IMAGE: Allow it to stretch to fill whatever space is left
            stac.expanded({
              child: stac.stack({
                children: [
                        stac.positioned({
                            top: 0, bottom: 0, left: 0, right: 0,
                            child: stac.clipRRect({
                            borderRadius: Brand.radiusMedium,
                            // 🚨 Ensure the Hero tag exactly matches the target page's Hero tag!
                            child: stac.hero({
                                tag: `product_image_${id}`, 
                                child: stac.image({ src: imageUrl, fit: "cover" }) 
                            })
                            })
                        }),
                  ...(isOnSale ? [
                    stac.positioned({
                      top: 4, left: 4, // Shrunk to fit 73px width
                      child: stac.container({
                        padding: [4, 2, 4, 2],
                        decoration: { color: Brand.error, borderRadius: 4 },
                        child: stac.text("SALE", { style: stac.textStyle({ color: "#FFFFFF", fontSize: 8, fontWeight: "bold" }) })
                      })
                    })
                  ] : [])
                ]
              })
            }),
            
            // 🚨 INFO: Removed 'expanded', using tiny padding so it hugs the text
            stac.padding({
              all: 6, // Reduced padding from 12 to 6 so it actually fits!
              child: stac.column({
                crossAxisAlignment: "start",
                mainAxisSize: "min", // Hug contents tightly
                children: [
                  stac.text(title, { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 12, fontWeight: "w500", color: Brand.textPrimary }) }),
                  stac.sizedBox({ height: 4 }),
                  stac.row({
                    mainAxisAlignment: "spaceBetween",
                    children: [
                      // Using expanded on the price prevents it from pushing the cart icon off-screen
                      stac.expanded({ 
                        child: stac.text(price, { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 12, fontWeight: "bold", color: Brand.primary }) }) 
                      }),
                      stac.inkWell({
                        action: onAddToCartTap,
                        child: stac.container({
                          padding: 4, // Tiny button padding
                          decoration: { color: Brand.secondary, borderRadius: 6 },
                          child: stac.icon({ icon: "add_shopping_cart", color: Brand.primaryDark, size: 14 })
                        })
                      })
                    ]
                  })
                ]
              })
            })
          ]
        })
      })
    }),
  // ----------------------------------------
  // CART & CHECKOUT
  // ----------------------------------------

  cartItem: ({ title, subtitle, price, imageUrl, quantity, onIncrement, onDecrement }) => 
    stac.container({
      // 🚨 FIX: Caught an invalid padding array [12, 12]. Stac requires single num or 4 nums.
      padding: 12,
      margin: [0, 0, 0, 12], 
      decoration: { color: Brand.surface, borderRadius: Brand.radiusMedium },
      child: stac.row({
        children: [
          stac.clipRRect({
    borderRadius: Brand.radiusSmall,
    child: stac.image({ src: imageUrl, width: 80, height: 80, fit: "cover" }) // Use src here
  }),
          stac.sizedBox({ width: 16 }),
          stac.expanded({
            child: stac.column({
              crossAxisAlignment: "start",
              children: [
                stac.text(title, { style: stac.textStyle({ fontSize: 16, fontWeight: "bold", color: Brand.textPrimary }) }),
                stac.text(subtitle, { style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }) }),
                stac.sizedBox({ height: 8 }),
                stac.text(price, { style: stac.textStyle({ fontSize: 16, fontWeight: "bold", color: Brand.primary }) }),
              ]
            })
          }),
          stac.container({
            decoration: { border: { color: Brand.divider, width: 1 }, borderRadius: 20 },
            child: stac.row({
              children: [
                stac.inkWell({ action: onDecrement, child: stac.padding({ all: 8, child: stac.icon({ icon: "remove", size: 16 }) }) }),
                stac.text(quantity.toString(), { style: stac.textStyle({ fontWeight: "bold" }) }),
                stac.inkWell({ action: onIncrement, child: stac.padding({ all: 8, child: stac.icon({ icon: "add", size: 16 }) }) }),
              ]
            })
          })
        ]
      })
    }),

  receiptRow: ({ label, value, isTotal = false }) => 
    stac.padding({
      vertical: 6,
      child: stac.row({
        mainAxisAlignment: "spaceBetween",
        children: [
          stac.text(label, { style: stac.textStyle({ color: isTotal ? Brand.textPrimary : Brand.textSecondary, fontSize: isTotal ? 18 : 14, fontWeight: isTotal ? "bold" : "normal" }) }),
          stac.text(value, { style: stac.textStyle({ color: isTotal ? Brand.primary : Brand.textPrimary, fontSize: isTotal ? 18 : 14, fontWeight: isTotal ? "bold" : "w500" }) }),
        ]
      })
    }),

  // ----------------------------------------
  // UTILITIES & LAYOUT
  // ----------------------------------------

  sectionHeader: ({ title, actionText = "View All", action }) => 
    stac.row({
      mainAxisAlignment: "spaceBetween",
      children: [
        stac.text(title, { style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }) }),
        stac.inkWell({
          action,
          child: stac.text(actionText, { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.primary }) })
        })
      ]
    }),

  emptyState: ({ icon, title, subtitle, buttonText, buttonAction }) => 
    stac.center({
      child: stac.column({
        mainAxisAlignment: "center",
        crossAxisAlignment: "center",
        children: [
          stac.icon({ icon, color: Brand.divider, size: 100 }),
          stac.sizedBox({ height: 24 }),
          stac.text(title, { style: stac.textStyle({ fontSize: 20, fontWeight: "bold", color: Brand.textPrimary }) }),
          stac.sizedBox({ height: 8 }),
          stac.text(subtitle, { textAlign: "center", style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
          stac.sizedBox({ height: 32 }),
          buttonText ? stac.sizedBox({ width: 200, child: ui.primaryButton({ text: buttonText, action: buttonAction }) }) : stac.sizedBox()
        ]
      })
    }),

// ----------------------------------------
  // SEARCH UTILITIES
  // ----------------------------------------
  searchBar: ({ 
    hintText = "Search for products...", 
    isReadOnly = true, 
    onTapAction, 
    inputId = "search_query" ,
    autofocus = false
  }) => {
    if (isReadOnly) {
      return stac.inkWell({
        action: onTapAction || stac.navigate("/search", "push"), 
        child: stac.container({
          padding: [16, 10, 16, 10],
          decoration: { 
            color: Brand.background, 
            borderRadius: 24,
            border: { color: Brand.divider, width: 1 }
          },
          child: stac.row({
            children: [
              // Using your new custom SVG!
              stac.svg({ src: "logo_search", color: Brand.textSecondary, width: 20, height: 20 }),
              stac.sizedBox({ width: 12 }),
              stac.expanded({
                child: stac.text(hintText, { 
                  maxLines: 1, overflow: "ellipsis", 
                  style: stac.textStyle({ color: Brand.textSecondary, fontSize: 14 }) 
                })
              })
            ]
          })
        })
      });
    }

return stac.container({
  padding: [0, 4, 0, 4],
  child: stac.textField({
    id: inputId,
    autofocus: autofocus,
    onChanged: stac.apiRequest({
      url: "/dashboard/search/live",
      method: "POST",
      body: { query: { actionType: "getFormValue", id: inputId } }
    }),
    decoration: {
   
      hintText: hintText,
      filled: false, 
      
      // prefixIcon: stac.svg({ src: "logo_search", color: Brand.textSecondary, width: 20, height: 20 }),
      
      suffixIcon: stac.padding({ 
        all: 12, 
        child: stac.svg({ src: "logo_search", color: Brand.primary, width: 20, height: 20 }) 
      }),
      
      contentPadding: [16, 10, 16, 10],
      
      // 1. BASE BORDER 
      border: { 
        type: "outlineInputBorder", 
        borderRadius: 24, 
        color: Brand.textPrimary
      },

      // 2. ENABLED BORDER (Not focused)
      enabledBorder: { 
        type: "outlineInputBorder", 
        borderRadius: 24, 
        color: Brand.textPrimary
      },
      
      // 3. FOCUSED BORDER 
      focusedBorder: { 
        type: "outlineInputBorder", 
        borderRadius: 24, 
        color: Brand.primary
      }
    }
  })
  });
  },

  // ----------------------------------------
  // DYNAMIC HEADERS & NAVIGATION
  // ----------------------------------------
dynamicAppBar: ({ 
    titleText = "AURORA", 
    isDashboard = false, 
    showSearch = false, 
    isSliver = false, 
    actions = [] 
  }) => {
    
    // 1. DYNAMIC TITLE
    const titleWidget = showSearch
      ? ui.searchBar({ hintText: "Search products...", isReadOnly: true })
      : stac.row({
          mainAxisSize: "min",
          children: [
            stac.image({ 
              src: "assets/images/app_icon_hor.png", 
              imageType: "asset", 
              // color: Brand.primary, 
              height: 28 
            }),
           
          ]
        });

    // 2. BASE PROPERTIES (Notice we removed 'leading' from here)
    const appBarProps = {
      title: titleWidget,
      backgroundColor: Brand.surface,
      centerTitle: !showSearch, 
      elevation: 0,
      actions: actions
    };

    // 3. THE MAGIC: Only add a custom leading icon if it's NOT the dashboard.
    // If we leave it undefined on the dashboard, Flutter automatically creates 
    // the Hamburger menu and opens the Drawer for us!
    if (!isDashboard) {
      appBarProps.leading = stac.inkWell({ 
        action: stac.navigate(null, "pop"), 
        child: stac.padding({ all: 12, child: stac.icon({ icon: "arrow_back", color: Brand.textPrimary }) }) 
      });
    }

    // 4. RETURN SLIVER OR STANDARD
    if (isSliver) {
      return stac.sliverAppBar({ 
        ...appBarProps, 
        floating: true, 
        pinned: false 
      });
    }
    return stac.appBar(appBarProps);
  },


};