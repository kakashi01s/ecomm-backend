import { stac } from "../../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../../core/sdui/components.js";
import { w } from "../../../core/sdui/widgets.js";
import { AuthUI } from "../../auth/auth.ui.js";
import { AppIcons } from "../../../core/constants/icons.js";

export class DashboardUI {
  
static buildDashboardUi(user, products, categories, banners, userCartMap, userWishlistSet) { // <-- ADDED PARAMS
    const isGuest = !user;

    const horizontalCards = DashboardUI._productCards(products, isGuest, userCartMap, userWishlistSet, "horizontal");
    const gridCards       = DashboardUI._productCards(products, isGuest, userCartMap, userWishlistSet, "grid");
const horizontalCardItems = horizontalCards.map((card) =>
  stac.padding({
    right: 14,
    child: stac.sizedBox({ 
      width: 200, 
      height: 300, 
      child: card 
    }),
  })
);

    const searchWidget = {
      type: "nativeSearchOverlay",
      hintText: "Search rings, necklaces...",
      apiEndpoint: "/dashboard/search/suggestions",
    };

return stac.popScope({
      canPop: false, // Prevents the app from closing immediately
      action: stac.showDialog(
        // The Dialog to show when the back button is pressed
          stac.center({
          child: stac.card({
            margin: 40,
            color: Brand.surface,
            shape: { borderRadius: Brand.radiusLarge },
            child: stac.padding({
              all: 24,
              child: stac.column({
                mainAxisSize: "min", // This also helps keep it small
                crossAxisAlignment: "center",
                children: [
                  stac.icon({ icon: "exit_to_app", size: 48, color: Brand.primary }),
                  stac.sizedBox({ height: 16 }),
                  stac.text("Exit App?", {
                    style: stac.textStyle({ fontSize: 20, fontWeight: "bold", color: Brand.textPrimary })
                  }),
                  stac.sizedBox({ height: 8 }),
                  stac.text("Are you sure you want to close the application?", {
                    textAlign: "center",
                    style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary })
                  }),
                  stac.sizedBox({ height: 24 }),
                  stac.row({
                    children: [
                      stac.expanded({
                        child: w.button({
                          text: "Stay",
                          variant: "outline",
                          action: stac.navigate(null, "pop")
                        })
                      }),
                      stac.sizedBox({ width: 12 }),
                      stac.expanded({
                        child: w.button({
                          text: "Exit",
                          variant: "primary",
                          action: stac.exitApp() 
                        })
                      }),
                    ]
                  })
                ]
              })
            })
          })
        })
      ),
      // Your existing dashboard layout becomes the child
      child: stac.defaultBottomNavigationController({
      length: 4,
      child: stac.scaffold({
        backgroundColor: Brand.background,
        drawer:          DashboardUI._drawer(isGuest, user),
        body: {
          type: "hideOnScroll",
          body : stac.form({
            child: stac.customScrollView({
            slivers: [
              // ── APP BAR (Now uses the Single Source of Truth!) ──
             ui.dynamicAppBar({
                isDashboard: true,
                isSliver: true,
                pinned: true, // <-- Locks it to the top
                actions: DashboardUI._actionIcons(isGuest, user),
              }),

              stac.sliverAppBar({
                
                pinned: true,       // Makes it stick to the ceiling
                
              floating: false,     // Pulls it down immediately when scrolling up
              primary: false,     // <-- ADD THIS: Disables the automatic status-bar padding
                // toolbarHeight: 52,
              automaticallyImplyLeading: false, // Hides the back/drawer button
                backgroundColor: Brand.surface, // Matches the app background
                elevation: 0,
                titleSpacing: 0, // Removes Flutter's default AppBar margins
                title: ui.nativeSearchOverlay({
                  apiEndpoint: "/search/suggestions",
                  onSubmitAction: stac.navigate("/search/results?q={{query}}", "push"),

                  // 1. FULL CONTROL OVER THE SEARCH BAR UI
                  searchBarUi: w.textField({
                    id: "dashboard_search",
                    hint: "Search rings, necklaces...",
                    decoration: {
                      hintText: "Search rings, necklaces...",
                      filled: true,
                      fillColor: Brand.background,
                      contentPadding: [16, 0, 16, 0],
                      // Pass standard STAC widgets for your icons!
                      prefixIcon: stac.padding({
                        all: 12,
                        child: stac.svg({ src: AppIcons.SEARCH, color: Brand.textSecondary, width: 20, height: 20 })
                      }),
                      border: { type: "outlineInputBorder", borderRadius: 30, color: Brand.divider },
                      enabledBorder: { type: "outlineInputBorder", borderRadius: 30, color: Brand.divider },
                      focusedBorder: { type: "outlineInputBorder", borderRadius: 30, color: Brand.primary },
                    }
                  }),

                  // 2. FULL CONTROL OVER THE DROPDOWN UI
                  suggestionsUi: stac.padding({
                    all: 12,
                    child: stac.row({
                      children: [
                        // Left Side: Dynamic Image with Fallback Icon
                        stac.clipRRect({
                          borderRadius: 8,
                          child: stac.image({
                            src: "${_item.imageUrl}", // Dart injects the URL here!
                            width: 38, 
                            height: 38,
                            fit: "cover",
                            
                            // If the item is a category (null URL) or a broken image,
                            // this exact block automatically takes over.
                            errorWidget: stac.container({
                              width: 38, 
                              height: 38,
                              decoration: { color: Brand.background, borderRadius: 8 },
                              child: stac.center({
                                child: stac.icon({ icon: "search", color: Brand.textSecondary, size: 18 })
                              })
                            })
                          })
                        }),
                        
                        stac.sizedBox({ width: 12 }),
                        
                        // Center: Title & Subtitle Column
                        stac.expanded({
                          child: stac.column({
                            crossAxisAlignment: "start",
                            mainAxisSize: "min",
                            children: [
                              stac.text("${_item.name}", { 
                                maxLines: 1, 
                                overflow: "ellipsis",
                                style: stac.textStyle({ fontSize: 14, color: Brand.textPrimary, fontWeight: "w500" }) 
                              }),
                              stac.sizedBox({ height: 2 }),
                              stac.text("${_item.subtitle}", { 
                                maxLines: 1, 
                                overflow: "ellipsis",
                                style: stac.textStyle({ fontSize: 11, color: Brand.textSecondary }) 
                              }),
                            ]
                          })
                        }),
                        
                        // Right Side: Trailing Arrow
                        stac.padding({
                          right: 4,
                          child: stac.icon({ icon: "north_west", size: 14, color: "#CCCCCC" })
                        })
                      ]
                    })
                  })
                })
                }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  child: DashboardUI._mobileCarousel(banners),
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  left: 16, right: 16, bottom: 24,
                  child: DashboardUI._desktopCarousel(banners),
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  left: 16, bottom: 24,
                  child: {
                    type: "webScrollRow",
                    padding: [0, 0, 16, 0],
                    children: DashboardUI._categoryCards(categories),
                  },
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  left: 16, right: 16, bottom: 12,
                  child: ui.sectionHeader({
                    title: "New Launches",
                    actionText: "View All",
                    action: stac.navigate("/new-launches"),
                  }),
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  left: 16, bottom: 32,
                  child: {
                    type: "webScrollRow",
                    padding: [0, 0, 16, 0],
                    children: horizontalCardItems,
                  },
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  left: 16, right: 16, bottom: 16,
                  child: ui.sectionHeader({
                    title: "Bestsellers",
                    actionText: "View All",
                    action: stac.navigate("/bestsellers"),
                  }),
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.responsiveVisibility({
                  hiddenWhen: ["DESKTOP", "4K"],
                  child: stac.padding({
                    top:0, left: 16, right: 16, bottom: 100, 
                    child: stac.gridView({
                    padding: { top: 0, left: 0, right: 0, bottom: 0 },
                    crossAxisCount: 2,
                    childAspectRatio: 0.68, // 172px wide ÷ ~297px tall — matches 175px fixed image + details
                    mainAxisSpacing: 14,
                    crossAxisSpacing: 14,
                    shrinkWrap: true,
                    physics: "never",
                    children: gridCards,
                  }),
                  }),
                }),
              }),

              stac.sliverToBoxAdapter({
                child: stac.responsiveVisibility({
                  hiddenWhen: ["MOBILE", "TABLET"],
                  child: stac.padding({
                    left: 16, right: 16, bottom: 100, 
                    child: stac.gridView({
                      crossAxisCount:  4,
                      childAspectRatio: 0.62,
                      mainAxisSpacing:  16,
                      crossAxisSpacing: 16,
                      padding: { top:0, left:0, right:0, bottom:0 },
                      shrinkWrap: true,
                      physics: "never",
                      children: gridCards,
                    }),
                  }),
                }),
              }),
            ],
          }),
          }),
          bottomNav: DashboardUI._bottomNav()
        }
      }), // Closes scaffold
      }), // Closes defaultBottomNavigationController
    }); // <-- THE MISSING BRACKET: Closes popScope!
  }
  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  static _bannerItems(banners) {
    return (banners || []).map((b) => ({
      mediaUrl:  b.mediaUrl,
      mediaType: b.mediaType ?? "image",
      linkUrl:   b.linkUrl  ?? null,
    }));
  }

static _mobileCarousel(banners) {
  return stac.responsiveVisibility({
    hiddenWhen: ["DESKTOP", "4K"],
    child: stac.padding({
      left: 16, right: 16,
      child: ui.mediaCarousel({
        items: banners, // Ensure this matches the expected array structure
        height: 220,
        borderRadius: 15,
        showDots: true
      }),
    }),
  });
}

  static _desktopCarousel(banners) {
    const items = DashboardUI._bannerItems(banners);
    const rightBanners = items.slice(0, 2).map((b, i) =>
      stac.expanded({
        child: stac.padding({
          top: i === 1 ? 12 : 0,
          child: stac.clipRRect({
            borderRadius: 16,
            child: stac.inkWell({
              action: b.linkUrl ? stac.navigate(b.linkUrl) : null,
              child: stac.image({ src: b.mediaUrl, fit: "cover" }),
            }),
          }),
        }),
      })
    );

    return stac.responsiveVisibility({
      hiddenWhen: ["MOBILE", "TABLET"],
      child: stac.sizedBox({
        height: 220,
        child: stac.row({
          children: [
            stac.expanded({
              flex: 3,
              // USE THE NEW WIDGET HERE TOO
              child: ui.mediaCarousel({
                items,
                height: 220,
                borderRadius: 20,
              }),
            }),
            stac.sizedBox({ width: 12 }),
            stac.expanded({
              flex: 2,
              child: stac.column({
                crossAxisAlignment: "stretch",
                children: rightBanners,
              }),
            }),
          ],
        }),
      }),
    });
  }

  static _desktopCarousel(banners) {
    const items = DashboardUI._bannerItems(banners);
    const rightBanners = items.slice(0, 2).map((b, i) =>
      stac.expanded({
        child: stac.padding({
          top: i === 1 ? 12 : 0,
          child: stac.clipRRect({
            borderRadius: 16,
            child: stac.inkWell({
              action: b.linkUrl ? stac.navigate(b.linkUrl) : null,
              child: stac.image({ src: b.mediaUrl, fit: "cover" }),
            }),
          }),
        }),
      })
    );

    return stac.responsiveVisibility({
      hiddenWhen: ["MOBILE", "TABLET"],
      child: stac.sizedBox({
        height: 220,
        child: stac.row({
          children: [
            stac.expanded({
              flex: 3,
              child: {
                type: "carousel",
                height: 220,
                autoPlayIntervalSeconds: 4,
                borderRadius: 20,
                items,
              },
            }),
            stac.sizedBox({ width: 12 }),
            stac.expanded({
              flex: 2,
              child: stac.column({
                crossAxisAlignment: "stretch",
                children: rightBanners,
              }),
            }),
          ],
        }),
      }),
    });
  }

  static _categoryCards(categories) {
    return [
      stac.padding({
        right: 16,
        child: ui.categoryCard({ 
          title: "All", 
          isSelected: true,
          action: stac.showToast("Filter: All") 
        }),
      }),
      ...categories.map((cat) =>
        stac.padding({
          right: 16,
          child: ui.categoryCard({
            title: cat.name,
            imageUrl: cat.imageUrl, 
            isSelected: false,
            action: stac.showToast(`Filter: ${cat.name}`),
          }),
        })
      ),
    ];
  }

static _productCards(products, isGuest, userCartMap, userWishlistSet, heroContext = "card") { // <-- ADDED PARAMS
    return products.map(p => {
      const mediaItems = p.images?.length > 0 
        ? p.images.map(img => ({ url: img.url, mediaType: img.mediaType })) 
        : [];

      // THE FIX: Look up truth from the isolated dictionaries!
      const isWishlisted = userWishlistSet.has(p.id);
      const cartQty = userCartMap[p.id] || 0;
        
      return ui.productCard({
        id: p.id.toString(), 
        title: p.name, 
        subtitle: p.category?.name?.toUpperCase() || "AURORA EXCLUSIVE", 
        price: `$${p.price}`,
        originalPrice: p.salePrice ? `$${p.originalPrice}` : null,
        images: mediaItems,
        isOnSale: !!p.salePrice,
        initialQty: cartQty,
        isWishlisted: isWishlisted, 
        rating: p.averageRating?.toFixed(1) || "4.9",
        reviewCount: p.reviewCount || 42,
        heroTag: `product_image_${p.id}_${heroContext}`,
        
        onCardTap: stac.navigate(`/product/${p.id}`),
        
        onWishlistTap: isGuest 
          ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet")))
          : stac.apiRequest({ 
              url: `/wishlist/toggle`, 
              method: "POST", 
              body: { productId: p.id } 
            }),
            
        onAddToCartTap: isGuest 
          ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet"))) 
          : stac.apiRequest({
              url: `/cart/add`,
              method: "POST",
              body: { productId: p.id, quantity: 1 },
              onSuccess: stac.showToast("Added to cart! 🛒"),
            }),

        // --- NEW: Add the Increment & Decrement actions ---
        onIncrementTap: isGuest
          ? null
          : stac.apiRequest({
              url: `/cart/update`, // <-- Adjust if your route differs
              method: "PUT",       // <-- Adjust if your route differs (PUT/PATCH/POST)
              body: { productId: p.id, action: "increment", pincode: "302001" },
            }),
            
        onDecrementTap: isGuest
          ? null
          : stac.apiRequest({
              url: `/cart/update`, // <-- Adjust if your route differs
              method: "PUT",
              body: { productId: p.id, action: "decrement", pincode: "302001" },
            })
      });
    });
  }

  static _actionIcons(isGuest, user) {
    return [
      { icon: AppIcons.CART,  action: stac.navigate("/cart"),     badgeType: "cart" },
      { icon: AppIcons.HEART, action: stac.navigate("/wishlist"), badgeType: "wishlist" },
      stac.responsiveVisibility({
        hiddenWhen: ["MOBILE", "TABLET"],
        child: stac.row({
          mainAxisSize: "min",
          children: [
            stac.sizedBox({ width: 8 }),
            isGuest
              ? w.button({
                  text: "Sign In",
                  fullWidth: false,
                  action: stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))),
                })
              : w.iconButton({
                  icon: AppIcons.PERSON,
                  action: stac.popThen(stac.navigate("/profile")) ,
                  color: Brand.primary,
                }),
          ],
        }),
      }),
    ];
  }

static _drawer(isGuest, user) {
const navItems = [
        { icon: AppIcons.HOME,   label: "Home",     action: stac.popThen(stac.navigate("/dashboard", "replace")) },
        { icon: AppIcons.CART,   label: "My Cart",  action: stac.popThen(stac.navigate("/cart")) },
        { icon: AppIcons.HEART,  label: "Wishlist", action: stac.popThen(stac.navigate("/wishlist")) },
        {
          icon: AppIcons.PERSON,
          label: "Profile",
          action: isGuest 
            ? stac.popThen(stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("bottomSheet")))) 
            : stac.popThen(stac.navigate("/profile")),
        },
        { icon: AppIcons.SETTING, label: "Settings", action: stac.popThen(stac.navigate("/settings")) },
      ];

    return {
      type: "drawer",
      child: stac.container({
        width: 280,
        color: Brand.surface,
        child: stac.safeArea({
          child: stac.column({
            crossAxisAlignment: "stretch",
            children: [
              // HEADER
              stac.container({
                padding: [24, 32, 24, 32],
                decoration: { color: Brand.primary },
                child: stac.column({
                  crossAxisAlignment: "start",
                  children: [
                    stac.image({ src: "assets/images/app_icon_hor.png", imageType: "asset", height: 28 }),
                    stac.sizedBox({ height: 8 }),
                    stac.text(isGuest ? "Welcome, Guest" : `Hi, ${user?.name ?? "there"}`, { style: stac.textStyle({ fontSize: 14, color: "#FFFFFF" }) }),
                  ],
                }),
              }),
              stac.sizedBox({ height: 8 }),
              
              // NAVIGATION ITEMS
              ...navItems.map(({ icon, label, action }) =>
                stac.inkWell({
                  action,
                  child: stac.padding({
                    left: 20, right: 20, top: 0, bottom: 0,
                    child: stac.container({
                      padding: [0, 14, 0, 14],
                      decoration: { border: { color: Brand.divider, width: 0 } },
                      child: stac.row({
                        children: [
                          stac.svg({ src: icon, color: Brand.textSecondary, width: 20, height: 20 }),
                          stac.sizedBox({ width: 14 }),
                          stac.text(label, { style: stac.textStyle({ fontSize: 15, color: Brand.textPrimary }) }),
                        ],
                      }),
                    }),
                  }),
                })
              ),
              
              // EXPAND TO PUSH BUTTON TO BOTTOM
              stac.expanded({ child: stac.sizedBox() }),
              stac.divider({ color: Brand.divider, thickness: 1 }),
              
              // AUTH / LOGOUT BUTTON
              stac.padding({
                all: 20,
                child: isGuest 
                  ? w.button({
                      text: "Sign In / Register",
                      action: stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("bottomSheet"))),
                    })
                  : w.button({
                      text: "Logout",
                      variant: "outline", // Uses the outline variant so it's not as visually loud as a primary button
                      action: stac.apiRequest({
                        url: "/auth/logout",
                        method: "POST",
                        // The backend AuthController already returns the session clear and navigation,
                        // but adding it here acts as an instant fallback safety net.
                        onSuccess: stac.manageSession(
                          "clear", 
                          null, 
                          stac.navigate("/auth/bootstrap", "replace")
                        ),
                        onError: stac.manageSession(
                          "clear", 
                          null, 
                          stac.navigate("/auth/bootstrap", "replace")
                        )
                      }),
                    }),
              }),
            ],
          }),
        }),
      }),
    };
  }

  static _bottomNav() {
    return stac.responsiveVisibility({
      hiddenWhen: ["DESKTOP", "4K"],
      child: stac.container({
        decoration: {
          color: Brand.surface,
          boxShadow: [{ color: Brand.blackOpacity, blurRadius: 16, spreadRadius: 0, offset: { dx: 0, dy: -4 } }]
        },
        child: stac.bottomNavigationBar({
          backgroundColor:       "transparent",
          selectedItemColor:     Brand.primary,
          unselectedItemColor:   Brand.textSecondary,
          elevation:             0,
          type:                  "fixed",
          showSelectedLabels:    false,
          showUnselectedLabels:  false,
          items: [
            stac.bottomNavigationBarItem({ icon: "home",           label: "Home"    }),
            stac.bottomNavigationBarItem({ icon: "search",         label: "Discover" }),
            stac.bottomNavigationBarItem({ icon: "shopping_bag",   label: "Cart"    }),
            stac.bottomNavigationBarItem({ icon: "person_outline", label: "Profile" }),
          ],
        }),
      }),
    });
  }
}