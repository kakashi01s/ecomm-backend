import { stac } from "../../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../../core/sdui/components.js";
import { w } from "../../../core/sdui/widgets.js";
import { AuthUI } from "../../auth/auth.ui.js";
import { AppIcons } from "../../../core/constants/icons.js";
import { CategoryUI } from "../../category/category.ui.js";
import { ProfileUI } from "../../profile/profile.ui.js";
import { WishlistUI } from "../../wishlist/wishlist.ui.js";
import { StateKeys } from "../../../core/constants/stateKeys.js";
import { Endpoints } from "../../../core/constants/apiEndpoints.js";

export class DashboardUI {

  static buildAll({
    user            = null,
    products        = [],
    categories      = [],
    banners         = [],
    userCartMap     = {},
    userWishlistSet = new Set(),
    deviceType      = "mobile",
    wishlistItems   = [],
  } = {}) {
    return {
      screens: [
        DashboardUI.buildDashboardUi(
          user, products, categories, banners,
          userCartMap, userWishlistSet, deviceType, wishlistItems
        ),
      ],
    };
  }

  static buildDashboardUi(
    user, products, categories, banners,
    userCartMap, userWishlistSet, deviceType = "mobile", wishlistItems = []
  ) {
    const isDesktop = deviceType === "desktop";

    const horizontalCards = DashboardUI._productCards(products, userCartMap, userWishlistSet, "horizontal");
    const gridCards = DashboardUI._productCards(products, userCartMap, userWishlistSet, "grid");

    const horizontalCardItems = horizontalCards.map((card) =>
      stac.padding({
        right: 14,
        child: stac.sizedBox({ width: 200, height: 300, child: card }),
      })
    );

    let gridCrossAxisCount = 2;
    let gridAspectRatio    = 0.68;
    if (deviceType === "tablet")  { gridCrossAxisCount = 3; gridAspectRatio = 0.65; }
    if (deviceType === "desktop") { gridCrossAxisCount = 4; gridAspectRatio = 0.62; }

    const homeBody = stac.form({
      child: stac.customScrollView({
        slivers: [
          ui.dynamicAppBar({
            isDashboard: true,
            isSliver: true,
            pinned: true,
            actions: DashboardUI._actionIcons(user, isDesktop),
          }),

          stac.sliverAppBar({
            pinned: true, floating: false, primary: false, automaticallyImplyLeading: false,
            backgroundColor: Brand.surface, elevation: 0, titleSpacing: 0,
            title: ui.nativeSearchOverlay({
              apiEndpoint: Endpoints.SEARCH.SUGGESTIONS,
              onSubmitAction: stac.navigate(Endpoints.SEARCH.RESULTS("{{query}}"), "push"),
              searchBarUi: w.textField({
                id: "dashboard_search", hint: "Search rings, necklaces...",
                decoration: {
                  hintText: "Search rings, necklaces...", filled: true, fillColor: Brand.background,
                  contentPadding: [16, 0, 16, 0],
                  prefixIcon: stac.padding({ all: 12, child: stac.svg({ src: AppIcons.SEARCH, color: Brand.textSecondary, width: 20, height: 20 }) }),
                  border: { type: "outlineInputBorder", borderRadius: 30, color: Brand.divider },
                  enabledBorder: { type: "outlineInputBorder", borderRadius: 30, color: Brand.divider },
                  focusedBorder: { type: "outlineInputBorder", borderRadius: 30, color: Brand.primary },
                },
              }),
              suggestionsUi: stac.padding({
                all: 12,
                child: stac.row({
                  children: [
                    stac.clipRRect({
                      borderRadius: 8,
                      child: stac.image({
                        src: "${_item.imageUrl}", width: 38, height: 38, fit: "cover",
                        errorWidget: stac.container({ width: 38, height: 38, decoration: { color: Brand.background, borderRadius: 8 }, child: stac.center({ child: stac.svg({ src: AppIcons.SEARCH, color: Brand.textSecondary, width: 18, height: 18 }) }) }),
                      }),
                    }),
                    stac.sizedBox({ width: 12 }),
                    stac.expanded({
                      child: stac.column({
                        crossAxisAlignment: "start", mainAxisSize: "min",
                        children: [
                          stac.text("${_item.name}", { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 14, color: Brand.textPrimary, fontWeight: "w500" }) }),
                          stac.sizedBox({ height: 2 }),
                          stac.text("${_item.subtitle}", { maxLines: 1, overflow: "ellipsis", style: stac.textStyle({ fontSize: 11, color: Brand.textSecondary }) }),
                        ],
                      }),
                    }),
                    stac.padding({ right: 4, child: stac.svg({ src: AppIcons.NEXT, width: 14, height: 14, color: "#CCCCCC" }) }), // Using NEXT for north_west
                  ],
                }),
              }),
            }),
          }),

          stac.sliverToBoxAdapter({
            child: stac.padding({ left: 16, right: 16, bottom: 24, top: 16, child: isDesktop ? DashboardUI._desktopCarousel(banners) : DashboardUI._mobileCarousel(banners) }),
          }),

   stac.sliverToBoxAdapter({
  child: stac.padding({ 
    left: 16, bottom: 24, 
    child: stac.singleChildScrollView({
      scrollDirection: "horizontal",
      padding: [0, 0, 16, 0],
      child: stac.row({
        crossAxisAlignment: "start",
        children: DashboardUI._categoryCards(categories)
      })
    }) 
  }),
}),

          stac.sliverToBoxAdapter({
            child: stac.padding({ left: 16, right: 16, bottom: 12, child: ui.sectionHeader({ title: "New Launches", actionText: "View All", action: stac.navigate(Endpoints.DASHBOARD.NEW_LAUNCHES) }) }),
          }),

stac.sliverToBoxAdapter({
  child: stac.padding({ 
    left: 16, bottom: 32, 
    child: stac.singleChildScrollView({
      scrollDirection: "horizontal",
      padding: [0, 0, 16, 0],
      child: stac.row({
        crossAxisAlignment: "start",
        children: horizontalCardItems
      })
    }) 
  }),
}),

          stac.sliverToBoxAdapter({
            child: stac.padding({ left: 16, right: 16, bottom: 16, child: ui.sectionHeader({ title: "Bestsellers", actionText: "View All", action: stac.navigate(Endpoints.DASHBOARD.BESTSELLERS) }) }),
          }),

          stac.sliverToBoxAdapter({
            child: stac.padding({
              top: 0, left: 16, right: 16, bottom: 100,
              child: stac.gridView({
                padding: { top: 0, left: 0, right: 0, bottom: 0 },
                crossAxisCount: gridCrossAxisCount, childAspectRatio: gridAspectRatio, mainAxisSpacing: 16, crossAxisSpacing: 16, shrinkWrap: true, physics: "never",
                children: gridCards,
              }),
            }),
          }),
        ],
      }),
    });

    // ── ROOT: POPSCOPE WITH CONDITIONAL LOGIC ────────────────────────────────
    return stac.popScope({
      canPop: false,
      action: stac.conditionalAction({
        stateKey: "dashboard_tab_index",
        expectedValue: 0,
        defaultValue: 0,
        onTrue: stac.showDialog(
          stac.center({
            child: stac.card({
              margin: 40, color: Brand.surface, shape: { borderRadius: Brand.radiusLarge },
              child: stac.padding({
                all: 24,
                child: stac.column({
                  mainAxisSize: "min", crossAxisAlignment: "center",
                  children: [
                    stac.svg({ src: AppIcons.EXIT, width: 48, height: 48, color: Brand.primary }),
                    stac.sizedBox({ height: 16 }),
                    stac.text("Exit App?", { style: stac.textStyle({ fontSize: 20, fontWeight: "bold", color: Brand.textPrimary }) }),
                    stac.sizedBox({ height: 8 }),
                    stac.text("Are you sure you want to close the application?", { textAlign: "center", style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                    stac.sizedBox({ height: 24 }),
                    stac.row({
                      children: [
                        stac.expanded({ child: w.button({ text: "Stay", variant: "outline", action: stac.navigate(null, "pop") }) }),
                        stac.sizedBox({ width: 12 }),
                        stac.expanded({ child: w.button({ text: "Exit", variant: "primary", action: stac.exitApp() }) }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
          })
        ),
        onFalse: stac.setGlobalState({ dashboard_tab_index: 0 })
      }),
      
      // ── THE SCAFFOLD WITH REACTIVE INDEXED STACK ─────────────────────────────
     
      child: stac.scaffold({
        backgroundColor: Brand.background,
        drawer: DashboardUI._drawer(user),
        body: {
          type: "hideOnScroll",
          
          // 🚀 REMOVED reactiveBuilder! 
          // Passed the exact state key string. Flutter handles the rest instantly.
          body: stac.indexedStack({
            index: "dashboard_tab_index", 
            children: [
              homeBody,
              CategoryUI.buildCategoryUi(categories),
              ProfileUI.buildProfileUi(user),
            ]
          }),
          
          bottomNav: isDesktop ? undefined : DashboardUI._bottomNav(),
        },
      }),
    });
  }

  // ── CUSTOM PURE-SDUI BOTTOM NAVIGATION ──────────────────────────────────
static _bottomNav() {
  const tabs = [
    { icon: AppIcons.HOME, label: "Home", index: 0 },
    { icon: AppIcons.CATEGORY, label: "Categories", index: 1 },
    { icon: AppIcons.PERSON, label: "Profile", index: 2 },
  ];
    return stac.container({
      decoration: {
        color: Brand.surface,
        border: { top: { color: Brand.divider || "#EAEAEA", width: 1 } },
        boxShadow: [{ color: "#00000008", blurRadius: 16, spreadRadius: 0, offset: { dx: 0, dy: -4 } }],
      },
      child: stac.safeArea({
        top: false, left: false, right: false,
        
        // Listen to tab changes
        child: stac.reactiveBuilder({
          listenTo: ["dashboard_tab_index"],
          child: stac.row({
            mainAxisAlignment: "spaceAround",
            children: tabs.map(tab => 
              stac.expanded({
                child: stac.inkWell({
                  action: stac.setGlobalState({ dashboard_tab_index: tab.index }),
                  child: stac.padding({
                    vertical: 10,
                    
                    // PURE SDUI LOGIC: Render Active or Inactive UI
                    child: stac.conditionalWidget({
                      stateKey: "dashboard_tab_index",
                      expectedValue: tab.index,
                      defaultValue: 0,
                      
                      // UI WHEN TAB IS ACTIVE
                      onTrue: stac.column({
                        mainAxisSize: "min",
                        children: [
                          stac.svg({ src: tab.icon, color: Brand.primary, width: 24, height: 24 }),
                          stac.sizedBox({ height: 4 }),
                          stac.text(tab.label, { 
                            style: stac.textStyle({ fontSize: 12, fontWeight: "bold", color: Brand.primary }) 
                          })
                        ]
                      }),
                      
                      // UI WHEN TAB IS INACTIVE
                      onFalse: stac.column({
                        mainAxisSize: "min",
                        children: [
                          stac.svg({ src: tab.icon, color: Brand.textSecondary, width: 24, height: 24 }),
                          stac.sizedBox({ height: 4 }),
                          stac.text(tab.label, { 
                            style: stac.textStyle({ fontSize: 12, fontWeight: "w500", color: Brand.textSecondary }) 
                          })
                        ]
                      })
                    })

                  })
                })
              })
            )
          })
        })
      }),
    });
  }

  static _wishlistScreen(user, wishlistItems = []) {
    const hasItems = wishlistItems.length > 0;

    return stac.scaffold({
      backgroundColor: Brand.background,
      body: {
        type: "hideOnScroll",
        body: stac.customScrollView({
          slivers: [
            ui.dynamicAppBar({ titleText: "Wishlist", isSliver: true, pinned: true }),
            stac.sliverToBoxAdapter({
              child: stac.conditionalWidget({
                stateKey: StateKeys.IS_LOGGED_IN,
                expectedValue: true,
                defaultValue: !!user,
                onTrue: hasItems 
                  ? stac.padding({
                      all: 16,
                      child: stac.column({
                        crossAxisAlignment: "stretch",
                        children: [
                          stac.padding({
                            bottom: 16,
                            child: stac.text(`${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""}`, {
                              style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }),
                            }),
                          }),
                          ...wishlistItems.map((item) => WishlistUI._wishlistCard(item)),
                        ],
                      }),
                    })
                  : stac.padding({
                      all: 40,
                      child: stac.column({
                        mainAxisAlignment: "center", crossAxisAlignment: "center",
                        children: [
                          stac.svg({ src: AppIcons.HEART, color: Brand.divider, width: 80, height: 80 }),
                          stac.sizedBox({ height: 20 }),
                          stac.text("Your wishlist is empty", { style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }) }),
                          stac.sizedBox({ height: 8 }),
                          stac.text("Save items you love and find them here", { textAlign: "center", style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                          stac.sizedBox({ height: 28 }),
                          stac.sizedBox({ width: 200, child: w.button({ text: "Explore Products", action: stac.setGlobalState({ dashboard_tab_index: 0 }) }) }),
                        ],
                      }),
                    }),
                onFalse: stac.padding({
                    all: 40,
                    child: stac.column({
                      mainAxisAlignment: "center", crossAxisAlignment: "center",
                      children: [
                        stac.svg({ src: AppIcons.HEART, color: Brand.divider, width: 80, height: 80 }),
                        stac.sizedBox({ height: 20 }),
                        stac.text("Sign in to view your wishlist", { textAlign: "center", style: stac.textStyle({ fontSize: 16, color: Brand.textSecondary }) }),
                        stac.sizedBox({ height: 24 }),
                        stac.sizedBox({ width: 200, child: w.button({ text: "Sign In", action: AuthUI.triggerAuth("dialog") }) }),
                      ],
                    }),
                  })
              })
            }),
          ],
        }),
      },
    });
  }

  static _bannerItems(banners) {
    return (banners || []).map((b) => ({
      mediaUrl:  b.mediaUrl,
      mediaType: b.mediaType ?? "image",
      linkUrl:   b.linkUrl  ?? null,
    }));
  }

  static _mobileCarousel(banners) { return ui.mediaCarousel({ items: banners, height: 220, borderRadius: 15, showDots: true }); }

  static _desktopCarousel(banners) {
    const items = DashboardUI._bannerItems(banners);
    const rightBanners = items.slice(0, 2).map((b, i) =>
      stac.expanded({ child: stac.padding({ top: i === 1 ? 12 : 0, child: stac.clipRRect({ borderRadius: 16, child: stac.inkWell({ action: b.linkUrl ? stac.navigate(b.linkUrl) : null, child: stac.image({ src: b.mediaUrl, fit: "cover" }) }) }) }) })
    );
    return stac.sizedBox({ height: 220, child: stac.row({ children: [stac.expanded({ flex: 3, child: { type: "carousel", height: 220, autoPlayIntervalSeconds: 4, borderRadius: 20, items } }), stac.sizedBox({ width: 12 }), stac.expanded({ flex: 2, child: stac.column({ crossAxisAlignment: "stretch", children: rightBanners }) })] }) });
  }

  static _categoryCards(categories) {
    return [
      stac.padding({ right: 16, child: ui.categoryCard({ title: "All", isSelected: true, action: stac.navigate(Endpoints.SEARCH.RESULTS("")) }) }),
      ...categories.map((cat) => stac.padding({ right: 16, child: ui.categoryCard({ title: cat.name, imageUrl: cat.imageUrl, isSelected: false, action: stac.navigate(Endpoints.CATEGORY.PRODUCTS(cat.id)) }) })),
    ];
  }

  static _productCards(products, userCartMap, userWishlistSet, heroContext = "card") {
    return products.map((p) => {
      const mediaItems = p.images?.length > 0 ? p.images.map((img) => ({ url: img.url, mediaType: img.mediaType })) : [];
      const isWishlisted = userWishlistSet.has(p.id);
      const cartQty = userCartMap[p.id] || 0;

      return ui.productCard({
        id:            p.id.toString(),
        title:         p.name,
        subtitle:      p.category?.name?.toUpperCase() || "AURORA EXCLUSIVE",
        price:         `$${p.price}`,
        originalPrice: p.salePrice ? `$${p.originalPrice}` : null,
        images:        mediaItems,
        isOnSale:      !!p.salePrice,
        initialQty:    cartQty,
        isWishlisted,
        rating:        p.averageRating?.toFixed(1) || "4.9",
        reviewCount:   p.reviewCount || 42,
        heroTag:       `product_image_${p.id}_${heroContext}`,
        onCardTap:      stac.navigate(Endpoints.PRODUCT.DETAILS(p.id)),
        onWishlistTap:  stac.conditionalAction({
          stateKey: StateKeys.IS_LOGGED_IN,
          expectedValue: true,
          defaultValue: false,
          onTrue: stac.apiRequest({ url: Endpoints.WISHLIST.TOGGLE, method: "POST", body: { productId: p.id } }),
          onFalse: AuthUI.triggerAuth("bottomSheet")
        }),
        onAddToCartTap: stac.conditionalAction({
          stateKey: StateKeys.IS_LOGGED_IN,
          expectedValue: true,
          defaultValue: false,
          onTrue: stac.apiRequest({ url: Endpoints.CART.ADD, method: "POST", body: { productId: p.id, quantity: 1 }, onSuccess: stac.showToast("Added to cart! 🛒") }),
          onFalse: AuthUI.triggerAuth("bottomSheet")
        }),
        onIncrementTap: stac.conditionalAction({
          stateKey: StateKeys.IS_LOGGED_IN,
          expectedValue: true,
          defaultValue: false,
          onTrue: stac.apiRequest({ url: Endpoints.CART.UPDATE, method: "PUT", body: { productId: p.id, action: "increment", pincode: "{{activePincode}}" } }),
          onFalse: AuthUI.triggerAuth("bottomSheet")
        }),
        onDecrementTap: stac.conditionalAction({
          stateKey: StateKeys.IS_LOGGED_IN,
          expectedValue: true,
          defaultValue: false,
          onTrue: stac.apiRequest({ url: Endpoints.CART.UPDATE, method: "PUT", body: { productId: p.id, action: "decrement", pincode: "{{activePincode}}" } }),
          onFalse: AuthUI.triggerAuth("bottomSheet")
        }),
      });
    });
  }

  static _actionIcons(user, isDesktop) {
    const icons = [
      stac.reactiveBuilder({
        listenTo: ["wishlistCount", StateKeys.IS_LOGGED_IN],
        child: stac.badge({
          count: "{{wishlistCount}}",
          color: Brand.error,
          textColor: "#FFFFFF",
          position: { top: 2, right: 2 },
          child: w.iconButton({
            icon: AppIcons.HEART,
            action: stac.conditionalAction({
              stateKey: StateKeys.IS_LOGGED_IN,
              expectedValue: true,
              defaultValue: false,
              onTrue: stac.navigate(Endpoints.WISHLIST.BASE),
              onFalse: AuthUI.triggerAuth("bottomSheet")
            })
          })
        })
      }),
      stac.reactiveBuilder({
        listenTo: ["cartCount", StateKeys.IS_LOGGED_IN],
        child: stac.badge({
          count: "{{cartCount}}",
          color: Brand.error,
          textColor: "#FFFFFF",
          position: { top: 2, right: 2 },
          child: w.iconButton({
            icon: AppIcons.CART,
            action: stac.navigate(Endpoints.CART.BASE)
          })
        })
      })
    ];

    if (isDesktop) {
      icons.push(
        stac.reactiveBuilder({
          listenTo: [StateKeys.IS_LOGGED_IN],
          child: stac.row({
            mainAxisSize: "min",
            children: [
              stac.sizedBox({ width: 8 }),
              stac.conditionalWidget({
                stateKey: StateKeys.IS_LOGGED_IN,
                expectedValue: true,
                defaultValue: !!user,
                onTrue: w.iconButton({ icon: AppIcons.PERSON, action: stac.setGlobalState({ dashboard_tab_index: 2 }), color: Brand.primary }),
                onFalse: w.button({ text: "Sign In", fullWidth: false, action: AuthUI.triggerAuth("dialog") })
              })
            ]
          })
        })
      );
    }
    return icons;
  }

static _drawer(user) {
    const navItems = [
      { icon: AppIcons.HOME,        label: "Home",       action: stac.popThen(stac.setGlobalState({ dashboard_tab_index: 0 })) },
      { icon: AppIcons.CATEGORY,    label: "Categories", action: stac.popThen(stac.setGlobalState({ dashboard_tab_index: 1 })) },
      { icon: AppIcons.HEART,       label: "Wishlist",   action: stac.popThen(stac.conditionalAction({
        stateKey: StateKeys.IS_LOGGED_IN,
        expectedValue: true,
        defaultValue: false,
        onTrue: stac.navigate(Endpoints.WISHLIST.BASE),
        onFalse: AuthUI.triggerAuth("bottomSheet")
      })) },
      { icon: AppIcons.PERSON,      label: "Profile",    action: stac.popThen(stac.conditionalAction({
        stateKey: StateKeys.IS_LOGGED_IN,
        expectedValue: true,
        defaultValue: false,
        onTrue: stac.setGlobalState({ dashboard_tab_index: 2 }),
        onFalse: AuthUI.triggerAuth("bottomSheet")
      })) },
      { icon: AppIcons.SETTING,     label: "Settings",   action: stac.popThen(stac.navigate(Endpoints.DASHBOARD.SETTINGS, "push")) },
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
              stac.container({
                padding: [24, 32, 24, 32],
                decoration: { color: Brand.primary },
                child: stac.reactiveBuilder({
                  listenTo: [StateKeys.IS_LOGGED_IN, StateKeys.USER_NAME],
                  child: stac.column({
                    crossAxisAlignment: "start",
                    children: [
                      stac.image({ src: "assets/images/app_icon_hor.png", imageType: "asset", height: 28 }),
                      stac.sizedBox({ height: 8 }),
                      stac.conditionalWidget({
                        stateKey: StateKeys.IS_LOGGED_IN,
                        expectedValue: true,
                        defaultValue: !!user,
                        onTrue: stac.text(`Hi, {{${StateKeys.USER_NAME}}}`, { style: stac.textStyle({ fontSize: 14, color: "#FFFFFF" }) }),
                        onFalse: stac.text("Welcome, Guest", { style: stac.textStyle({ fontSize: 14, color: "#FFFFFF" }) })
                      }),
                    ],
                  }),
                })
              }),
              stac.sizedBox({ height: 8 }),
              ...navItems.map(({ icon, label, action }) =>
                stac.inkWell({
                  action,
                  child: stac.padding({ left: 20, right: 20, top: 0, bottom: 0, child: stac.container({ padding: [0, 14, 0, 14], child: stac.row({ children: [stac.svg({ src: icon, color: Brand.textSecondary, width: 20, height: 20 }), stac.sizedBox({ width: 14 }), stac.text(label, { style: stac.textStyle({ fontSize: 15, color: Brand.textPrimary }) })] }) }) }),
                })
              ),
              stac.expanded({ child: stac.sizedBox() }),
              stac.divider({ color: Brand.divider, thickness: 1 }),
              stac.padding({
                all: 20,
                child: stac.reactiveBuilder({
                  listenTo: [StateKeys.IS_LOGGED_IN],
                  child: stac.conditionalWidget({
                    stateKey: StateKeys.IS_LOGGED_IN,
                    expectedValue: true,
                    defaultValue: !!user,
                    onTrue: w.button({
                      text: "Logout", 
                      variant: "outline", 
                      action: stac.apiRequest({ 
                        url: Endpoints.AUTH.LOGOUT, 
                        method: "POST", 
                        onSuccess: stac.manageSession("clear", null, stac.navigate(Endpoints.AUTH.BOOTSTRAP, "replace")), 
                        onError: stac.manageSession("clear", null, stac.navigate(Endpoints.AUTH.BOOTSTRAP, "replace")) 
                      }),
                    }),
                    onFalse: w.button({ 
                      text: "Sign In / Register", 
                      action: stac.popThen(AuthUI.triggerAuth("bottomSheet")) 
                    })
                  })
                })
              }),
            ],
          }),
        }),
      }),
    };
  }
}
