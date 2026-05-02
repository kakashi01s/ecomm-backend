import { stac } from "../../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../../core/sdui/components.js";
import { AuthUI } from "../../auth/auth.ui.js";
import { AppIcons } from "../../../core/constants/icons.js";
import { DashboardRepository } from "./dashboard.repository.js";
import { redisManager } from "../../../config/redisClient.js";

export class DashboardController {
  static CACHE_KEY = "dashboard_data";
  static CACHE_TTL = 300;

  static async getCachedBackgroundData() {
    const cachedString = await redisManager.client.get(DashboardController.CACHE_KEY);
    if (cachedString) return JSON.parse(cachedString);

    const dbData = await DashboardRepository.getDashboardPayloadData();
    const payload = {
      products: dbData.products,
      categories: dbData.categories,
      banners: dbData.banners,
    };
    await redisManager.client.setEx(
      DashboardController.CACHE_KEY,
      DashboardController.CACHE_TTL,
      JSON.stringify(payload)
    );
    return payload;
  }

  static async getDashboard(req, res) {
    try {
      const user = req.user || null;
      const dashboardUi = await DashboardController.getDashboardUiPayload(user);
      return res.json({ ui: dashboardUi });
    } catch (error) {
      return res.status(500).json({ message: "Dashboard error", error: error.message });
    }
  }

  static async getDashboardUiPayload(user) {
    const { products, categories, banners } = await DashboardController.getCachedBackgroundData();
    return DashboardController._buildDashboardUi(user, products, categories, banners);
  }

  static _buildDashboardUi(user, products, categories, banners) {
    const isGuest = !user;

    // ── 1. CATEGORY CHIPS (web-scroll-safe)
    const categoryChipItems = [
      // "View All" chip first
      stac.padding({
        right: 10,
        child: ui.categoryChip({ title: "All", isSelected: true }),
      }),
      ...categories.map((cat) =>
        stac.padding({
          right: 10,
          child: ui.categoryChip({
            title: cat.name,
            isSelected: false,
            action: stac.showToast(`Filter: ${cat.name}`),
          }),
        })
      ),
    ];

    // ── 2. BANNER CAROUSEL
    const bannerCarousel = {
      type: "carousel",
      height: 190,
      autoPlayIntervalSeconds: 4,
      borderRadius: 20,
      items: (banners || []).map((banner) => ({
        mediaUrl: banner.mediaUrl,
        mediaType: banner.mediaType ?? "image",
        linkUrl: banner.linkUrl ?? null,
      })),
    };

    // ── 3. PRODUCT CARDS
    const productCards = products.map((p) =>
      ui.productCard({
        id: p.id.toString(),
        title: p.name,
        price: `$${p.price.toFixed(2)}`,
        imageUrl: p.images?.length > 0 ? p.images[0].url : "https://via.placeholder.com/400x500",
        isOnSale: !!p.salePrice,
        onCardTap: stac.navigate(`/product/${p.id}`),
        onAddToCartTap: isGuest
          ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet")))
          : stac.showToast("Added to Cart"),
      })
    );

    // Horizontal card scroll items — fixed size wrappers for webScrollRow
    const horizontalCardItems = productCards.map((card) =>
      stac.padding({
        right: 14,
        child: stac.sizedBox({ width: 158, height: 258, child: card }),
      })
    );

    // ── 4. SEARCH WIDGET — inline, no page navigation
    const searchWidget = {
      type: "nativeSearchOverlay",
      hintText: "Search rings, necklaces...",
      apiEndpoint: "/dashboard/search/suggestions",
    };

    // ── 5. ACTION BAR ICONS (top-right)
    const actionIcons = [
      stac.inkWell({
        action: stac.navigate("/cart"),
        child: stac.padding({
          all: 4,
          child: stac.svg({ src: AppIcons.CART, color: Brand.textPrimary, width: 22, height: 22 }),
        }),
      }),
      stac.sizedBox({ width: 4 }),
      stac.inkWell({
        action: stac.navigate("/wishlist"),
        child: stac.padding({
          all: 4,
          child: stac.svg({ src: AppIcons.HEART_EMPTY, color: Brand.textPrimary, width: 22, height: 22 }),
        }),
      }),
      stac.sizedBox({ width: 4 }),
      // Desktop only: sign in button or profile icon
      stac.responsiveVisibility({
        hiddenWhen: ["MOBILE", "TABLET"],
        child: stac.row({
          mainAxisSize: "min",
          children: [
            stac.sizedBox({ width: 8 }),
            isGuest
              ? ui.primaryButton({
                  text: "Sign In",
                  isFullWidth: false,
                  action: stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))),
                })
              : stac.inkWell({
                  action: stac.navigate("/profile"),
                  child: stac.padding({
                    all: 4,
                    child: stac.svg({ src: AppIcons.PERSON, color: Brand.primary, width: 24, height: 24 }),
                  }),
                }),
          ],
        }),
      }),
      stac.sizedBox({ width: 8 }),
    ];

    // ── 6. DRAWER
    const drawer = {
      type: "drawer",
      child: stac.container({
        width: 280,
        color: Brand.surface,
        child: stac.safeArea({
          child: stac.column({
            crossAxisAlignment: "stretch",
            children: [
              // Drawer header with brand color
              stac.container({
                padding: [24, 32, 24, 32],
                decoration: { color: Brand.primary },
                child: stac.column({
                  crossAxisAlignment: "start",
                  children: [
                    stac.image({
                      src: "assets/images/app_icon_hor.png",
                      imageType: "asset",
                      height: 28,
                    }),
                    stac.sizedBox({ height: 8 }),
                    stac.text(
                      isGuest ? "Welcome, Guest" : `Hi, ${user?.name ?? "there"}`,
                      { style: stac.textStyle({ fontSize: 14, color: "#FFFFFF" }) }
                    ),
                  ],
                }),
              }),

              stac.sizedBox({ height: 8 }),

              // Drawer items
              ...[
                { icon: AppIcons.HOME,      label: "Home",      action: stac.navigate("/dashboard", "replace") },
                { icon: AppIcons.STORE,     label: "Shop",      action: stac.navigate("/shop") },
                { icon: AppIcons.CART,      label: "My Cart",   action: stac.navigate("/cart") },
                { icon: AppIcons.HEART_EMPTY, label: "Wishlist", action: stac.navigate("/wishlist") },
                { icon: AppIcons.PERSON,    label: "Profile",   action: isGuest ? stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))) : stac.navigate("/profile") },
                { icon: AppIcons.SETTING,   label: "Settings",  action: stac.navigate("/settings") },
              ].map(({ icon, label, action }) =>
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
                          stac.text(label, {
                            style: stac.textStyle({ fontSize: 15, color: Brand.textPrimary }),
                          }),
                        ],
                      }),
                    }),
                  }),
                })
              ),

              stac.expanded({ child: stac.sizedBox() }),
              stac.divider({ color: Brand.divider, thickness: 1 }),

              // Guest login CTA at bottom
              ...(isGuest ? [
                stac.padding({
                  all: 20,
                  child: ui.primaryButton({
                    text: "Sign In / Register",
                    action: stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))),
                  }),
                }),
              ] : []),
            ],
          }),
        }),
      }),
    };

    // ── 7. BOTTOM NAV
    const bottomNav = stac.responsiveVisibility({
      hiddenWhen: ["DESKTOP", "4K"],
      child: stac.bottomNavigationBar({
        backgroundColor: Brand.surface,
        selectedItemColor: Brand.primary,
        unselectedItemColor: Brand.textSecondary,
        items: [
          stac.bottomNavigationBarItem({ icon: "home", label: "Home" }),
          stac.bottomNavigationBarItem({ icon: "search", label: "Discover" }),
          stac.bottomNavigationBarItem({ icon: "shopping_bag", label: "Cart" }),
          stac.bottomNavigationBarItem({ icon: "person_outline", label: "Profile" }),
        ],
      }),
    });

    // ── 8. ASSEMBLE
    return stac.defaultBottomNavigationController({
      length: 4,
      child: stac.scaffold({
        backgroundColor: Brand.background,
        drawer,
        bottomNavigationBar: bottomNav,

        body: stac.customScrollView({
          slivers: [

            // ── APP BAR
            stac.sliverAppBar({
              backgroundColor: Brand.surface,
              floating: true,
              pinned: false,
              elevation: 0,
              centerTitle: false,
              title: stac.image({
                src: "assets/images/app_icon_hor.png",
                imageType: "asset",
                height: 26,
              }),
              actions: actionIcons,
            }),

            // ── SEARCH BAR
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, top: 8, bottom: 20,
                child: searchWidget,
              }),
            }),

            // ── BANNER CAROUSEL
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, bottom: 24,
                child: bannerCarousel,
              }),
            }),

            // ── CATEGORY CHIPS
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, bottom: 24,
                child: {
                  type: "webScrollRow",
                  padding: [0, 0, 16, 0],
                  children: categoryChipItems,
                },
              }),
            }),

            // ── SECTION: NEW LAUNCHES
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

            // ── SECTION: BESTSELLERS
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

            // Mobile/Tablet: 2-column grid
            stac.sliverToBoxAdapter({
              child: stac.responsiveVisibility({
                hiddenWhen: ["DESKTOP", "4K"],
                child: stac.padding({
                  left: 16, right: 16, bottom: 32,
                  child: stac.gridView({
                    crossAxisCount: 2,
                    childAspectRatio: 0.65,
                    mainAxisSpacing: 14,
                    crossAxisSpacing: 14,
                    shrinkWrap: true,
                    physics: "never",
                    children: productCards,
                  }),
                }),
              }),
            }),

            // Desktop: 4-column grid
            stac.sliverToBoxAdapter({
              child: stac.responsiveVisibility({
                hiddenWhen: ["MOBILE", "TABLET"],
                child: stac.padding({
                  left: 16, right: 16, bottom: 32,
                  child: stac.gridView({
                    crossAxisCount: 4,
                    childAspectRatio: 0.70,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    shrinkWrap: true,
                    physics: "never",
                    children: productCards,
                  }),
                }),
              }),
            }),

          ],
        }),
      }),
    });
  }
}