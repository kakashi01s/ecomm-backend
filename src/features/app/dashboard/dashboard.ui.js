import { stac } from "../../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../../core/sdui/components.js";
import { w } from "../../../core/sdui/widgets.js";
import { AuthUI } from "../../auth/auth.ui.js";
import { AppIcons } from "../../../core/constants/icons.js";

export class DashboardUI {
  
  static buildDashboardUi(user, products, categories, banners) {
    const isGuest = !user;

    const horizontalCards = DashboardUI._productCards(products, isGuest, user, "horizontal");
    const gridCards       = DashboardUI._productCards(products, isGuest, user, "grid");

    const horizontalCardItems = horizontalCards.map((card) =>
      stac.padding({
        right: 14,
        child: stac.sizedBox({ width: 158, height: 258, child: card }),
      })
    );

    const searchWidget = {
      type: "nativeSearchOverlay",
      hintText: "Search rings, necklaces...",
      apiEndpoint: "/dashboard/search/suggestions",
    };

    return stac.defaultBottomNavigationController({
      length: 4,
      child: stac.scaffold({
        backgroundColor: Brand.background,
        drawer:          DashboardUI._drawer(isGuest, user),
        body: {
          type: "hideOnScroll",
          body: stac.customScrollView({
            slivers: [
              // ── APP BAR (Now uses the Single Source of Truth!) ──
              ui.dynamicAppBar({
                isDashboard: true,
                isSliver: true,
                actions: DashboardUI._actionIcons(isGuest, user),
              }),

              stac.sliverToBoxAdapter({
                child: stac.padding({
                  left: 16, right: 16, top: 8, bottom: 20,
                  child: searchWidget,
                }),
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
                      padding: { top:0, left:0, right:0, bottom:0 },
                      crossAxisCount:  2,
                      childAspectRatio: 0.65,
                      mainAxisSpacing:  14,
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
                      childAspectRatio: 0.70,
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
          bottomNav: DashboardUI._bottomNav()
        }
      }),
    });
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
      child: {
        type: "carousel",
        height: 220,
        autoPlayIntervalSeconds: 4,
        borderRadius: 15,
        items: DashboardUI._bannerItems(banners),
        viewportFraction: 0.98
      },
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

static _productCards(products, isGuest, user, heroContext = "card") {
    return products.map(p => {
      // FIX: Keep the full object so we know if it's an image or a video!
      const mediaItems = p.images?.length > 0 
        ? p.images.map(img => ({ url: img.url, mediaType: img.mediaType })) 
        : [];

      const isWishlisted = p.wishlistedBy?.some(w => w.userId === user?.id) || false;

      return ui.productCard({
        id: p.id.toString(), 
        title: p.name, 
        subtitle: p.category?.name?.toUpperCase() || "AURORA EXCLUSIVE", 
        price: `$${p.price}`,
        originalPrice: p.salePrice ? `$${p.originalPrice}` : null,
        images: mediaItems, // Pass the array of objects now
        isOnSale: !!p.salePrice,
        isWishlisted: isWishlisted, 
        rating: p.averageRating?.toFixed(1) || "4.9",
        reviewCount: p.reviewCount || 42,
        heroTag: `product_image_${p.id}_${heroContext}`,
        onCardTap: stac.navigate(`/product/${p.id}`),
        onWishlistTap: isGuest 
          ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet")))
          : stac.apiRequest({ 
              url: `/api/user/wishlist/toggle`, 
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
            })
      });
    });
  }

  static _actionIcons(isGuest, user) {
    return [
      {
        icon: AppIcons.CART,
        action: stac.navigate("/cart"),
        badgeType: "cart",
      },
      {
        icon: AppIcons.HEART,
        action: stac.navigate("/wishlist"),
        badgeType: "wishlist",
      },
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
                  action: stac.navigate("/profile"),
                  color: Brand.primary,
                }),
          ],
        }),
      }),
    ];
  }

static _drawer(isGuest, user) {
    const navItems = [
      { icon: AppIcons.HOME,   label: "Home",     action: stac.navigate("/dashboard", "replace") },
      { icon: AppIcons.CART,   label: "My Cart",  action: stac.navigate("/cart") },
      { icon: AppIcons.HEART,  label: "Wishlist", action: stac.navigate("/wishlist") },
      {
        icon: AppIcons.PERSON,
        label: "Profile",
        action: isGuest ? stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))) : stac.navigate("/profile"),
      },
      { icon: AppIcons.SETTING, label: "Settings", action: stac.navigate("/settings") },
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
                      action: stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))),
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