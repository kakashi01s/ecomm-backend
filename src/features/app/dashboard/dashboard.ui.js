import { stac } from "../../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../../core/sdui/components.js";
import { w } from "../../../core/sdui/widgets.js";
import { AuthUI } from "../../auth/auth.ui.js";
import { AppIcons } from "../../../core/constants/icons.js";
import { CategoryUI } from "../../category/category.ui.js";
import { ProfileUI } from "../../profile/profile.ui.js";

export class DashboardUI {

  static buildAll({
    user            = null,
    products        = [],
    categories      = [],
    banners         = [],
    userCartMap     = {},
    userWishlistSet = new Set(),
    deviceType      = "mobile",
  } = {}) {
    return {
      screens: [
        DashboardUI.buildDashboardUi(
          user, products, categories, banners,
          userCartMap, userWishlistSet, deviceType
        ),
      ],
    };
  }

  static buildDashboardUi(
    user, products, categories, banners,
    userCartMap, userWishlistSet, deviceType = "mobile"
  ) {
    const isGuest = !user;
    const isDesktop = deviceType === "desktop";

    const horizontalCards = DashboardUI._productCards(products, isGuest, userCartMap, userWishlistSet, "horizontal");
    const gridCards = DashboardUI._productCards(products, isGuest, userCartMap, userWishlistSet, "grid");

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
            actions: DashboardUI._actionIcons(isGuest, user, isDesktop),
          }),

          stac.sliverAppBar({
            pinned: true, floating: false, primary: false, automaticallyImplyLeading: false,
            backgroundColor: Brand.surface, elevation: 0, titleSpacing: 0,
            title: ui.nativeSearchOverlay({
              apiEndpoint: "/search/suggestions",
              onSubmitAction: stac.navigate("/search/results?q={{query}}", "push"),
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
                        errorWidget: stac.container({ width: 38, height: 38, decoration: { color: Brand.background, borderRadius: 8 }, child: stac.center({ child: stac.icon({ icon: "search", color: Brand.textSecondary, size: 18 }) }) }),
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
                    stac.padding({ right: 4, child: stac.icon({ icon: "north_west", size: 14, color: "#CCCCCC" }) }),
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
            child: stac.padding({ left: 16, right: 16, bottom: 12, child: ui.sectionHeader({ title: "New Launches", actionText: "View All", action: stac.navigate("/new-launches") }) }),
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
            child: stac.padding({ left: 16, right: 16, bottom: 16, child: ui.sectionHeader({ title: "Bestsellers", actionText: "View All", action: stac.navigate("/bestsellers") }) }),
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
                    stac.icon({ icon: "exit_to_app", size: 48, color: Brand.primary }),
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
        drawer: DashboardUI._drawer(isGuest, user),
        body: {
          type: "hideOnScroll",
          
          // 🚀 REMOVED reactiveBuilder! 
          // Passed the exact state key string. Flutter handles the rest instantly.
          body: stac.indexedStack({
            index: "dashboard_tab_index", 
            children: [
              homeBody,
              CategoryUI.buildCategoryUi(categories),
              DashboardUI._wishlistScreen(user),
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
      { icon: AppIcons.HEART, label: "Wishlist", index: 2 },
      { icon: AppIcons.PERSON, label: "Profile", index: 3 },
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

  static _wishlistScreen(user) {
    const isGuest = !user;
    return stac.scaffold({
      backgroundColor: Brand.background,
      body: {
        type: "hideOnScroll",
        body: stac.customScrollView({
          slivers: [
            ui.dynamicAppBar({ titleText: "Wishlist", isSliver: true, pinned: true }),
            stac.sliverToBoxAdapter({
              child: isGuest
                ? stac.padding({
                    all: 40,
                    child: stac.column({
                      mainAxisAlignment: "center", crossAxisAlignment: "center",
                      children: [
                        stac.icon({ icon: "favorite_border", color: Brand.divider, size: 80 }),
                        stac.sizedBox({ height: 20 }),
                        stac.text("Sign in to view your wishlist", { textAlign: "center", style: stac.textStyle({ fontSize: 16, color: Brand.textSecondary }) }),
                        stac.sizedBox({ height: 24 }),
                        stac.sizedBox({ width: 200, child: w.button({ text: "Sign In", action: AuthUI.triggerAuth("dialog") }) }),
                      ],
                    }),
                  })
                : stac.padding({
                    all: 40,
                    child: stac.column({
                      mainAxisAlignment: "center", crossAxisAlignment: "center",
                      children: [
                        stac.icon({ icon: "favorite_border", color: Brand.divider, size: 80 }),
                        stac.sizedBox({ height: 20 }),
                        stac.text("Your wishlist is empty", { style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.textPrimary }) }),
                        stac.sizedBox({ height: 8 }),
                        stac.text("Save items you love and find them here", { textAlign: "center", style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                        stac.sizedBox({ height: 28 }),
                        stac.sizedBox({ width: 200, child: w.button({ text: "Explore Products", action: stac.setGlobalState({ dashboard_tab_index: 0 }) }) }),
                      ],
                    }),
                  }),
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
      stac.padding({ right: 16, child: ui.categoryCard({ title: "All", isSelected: true, action: stac.showToast("Filter: All") }) }),
      ...categories.map((cat) => stac.padding({ right: 16, child: ui.categoryCard({ title: cat.name, imageUrl: cat.imageUrl, isSelected: false, action: stac.showToast(`Filter: ${cat.name}`) }) })),
    ];
  }

  static _productCards(products, isGuest, userCartMap, userWishlistSet, heroContext = "card") {
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
        onCardTap:      stac.navigate(`/product/${p.id}`),
        onWishlistTap:  isGuest
          ? AuthUI.triggerAuth("bottomSheet")
          : stac.apiRequest({ url: `/wishlist/toggle`, method: "POST", body: { productId: p.id } }),
        onAddToCartTap: isGuest
          ? AuthUI.triggerAuth("bottomSheet")
          : stac.apiRequest({ url: `/cart/add`, method: "POST", body: { productId: p.id, quantity: 1 }, onSuccess: stac.showToast("Added to cart! 🛒") }),
        onIncrementTap: isGuest ? null : stac.apiRequest({ url: `/cart/update`, method: "PUT", body: { productId: p.id, action: "increment" } }),
        onDecrementTap: isGuest ? null : stac.apiRequest({ url: `/cart/update`, method: "PUT", body: { productId: p.id, action: "decrement" } }),
      });
    });
  }

  static _actionIcons(isGuest, user, isDesktop) {
    const icons = [
      stac.reactiveBuilder({
        listenTo: ["wishlistCount"],
        child: stac.badge({
          count: "{{wishlistCount}}",
          color: Brand.error,
          textColor: "#FFFFFF",
          position: { top: 2, right: 2 },
          child: w.iconButton({
            icon: AppIcons.HEART,
            action: isGuest ? AuthUI.triggerAuth("bottomSheet") : stac.setGlobalState({ dashboard_tab_index: 2 })
          })
        })
      }),
      stac.reactiveBuilder({
        listenTo: ["cartCount"],
        child: stac.badge({
          count: "{{cartCount}}",
          color: Brand.error,
          textColor: "#FFFFFF",
          position: { top: 2, right: 2 },
          child: w.iconButton({
            icon: AppIcons.CART,
            action: stac.navigate("/cart")
          })
        })
      })
    ];

    if (isDesktop) {
      icons.push(
        stac.row({
          mainAxisSize: "min",
          children: [
            stac.sizedBox({ width: 8 }),
            isGuest 
              ? w.button({ text: "Sign In", fullWidth: false, action: AuthUI.triggerAuth("dialog") }) 
              : w.iconButton({ icon: AppIcons.PERSON, action: stac.setGlobalState({ dashboard_tab_index: 3 }), color: Brand.primary })
          ]
        })
      );
    }
    return icons;
  }

static _drawer(isGuest, user) {
    const navItems = [
      { icon: AppIcons.HOME,        label: "Home",       action: stac.popThen(stac.setGlobalState({ dashboard_tab_index: 0 })) },
      { icon: AppIcons.CATEGORY,    label: "Categories", action: stac.popThen(stac.setGlobalState({ dashboard_tab_index: 1 })) },
      { icon: AppIcons.HEART,       label: "Wishlist",   action: stac.popThen(stac.setGlobalState({ dashboard_tab_index: 2 })) },
      { icon: AppIcons.PERSON,      label: "Profile",    action: isGuest ? stac.popThen(AuthUI.triggerAuth("bottomSheet")) : stac.popThen(stac.setGlobalState({ dashboard_tab_index: 3 })) },
      { icon: AppIcons.SETTING,     label: "Settings",   action: stac.popThen(stac.navigate("/settings", "push")) },
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
                child: isGuest
                  // 🔥 FIX: w.button is the widget, stac.popThen wraps the action!
                  ? w.button({ 
                      text: "Sign In / Register", 
                      action: stac.popThen(AuthUI.triggerAuth("bottomSheet")) 
                    })
                  : w.button({
                      text: "Logout", 
                      variant: "outline", 
                      action: stac.apiRequest({ 
                        url: "/auth/logout", 
                        method: "POST", 
                        onSuccess: stac.manageSession("clear", null, stac.navigate("/auth/bootstrap", "replace")), 
                        onError: stac.manageSession("clear", null, stac.navigate("/auth/bootstrap", "replace")) 
                      }),
                    }),
              }),
            ],
          }),
        }),
      }),
    };
  }
}