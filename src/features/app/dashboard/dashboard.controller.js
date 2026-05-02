import { stac } from "../../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../../core/sdui/components.js";
import { AuthUI } from "../../auth/auth.ui.js"; 
import { AppIcons } from "../../../core/constants/icons.js"; 
import { DashboardRepository } from "./dashboard.repository.js"; 

export class DashboardController {
  
  static async getDashboard(req, res) {
    try {
      const user = req.user || null; 
      const dashboardUi = await DashboardController.getDashboardUiPayload(user);
      return res.json({ ui: dashboardUi });
    } catch (error) {
      return res.status(500).json({ message: "Dashboard error", error: error.message });
    }
  }

  // 🚨 CLEAN: Data fetching is now fully delegated to the Repository!
  static async getDashboardUiPayload(user) {
    const { products, categories, banners } = await DashboardRepository.getDashboardPayloadData();
    return DashboardController._buildDashboardUi(user, products, categories, banners);
  }

  static _buildDashboardUi(user, products, categories, banners) {
    const isGuest = !user;
    
    // ==========================================
    // 1. PREPARE DATA MAPPINGS
    // ==========================================
    const categoryChips = categories.map((cat, index) => 
      stac.padding({
        right: 12,
        child: ui.categoryChip({ title: cat.name, isSelected: index === 0, action: stac.showToast(`Filter: ${cat.name}`) })
      })
    );

    const dynamicBanners = (banners || []).map(banner => 
      stac.padding({
        right: 16,
        child: stac.inkWell({
          action: banner.linkUrl ? stac.navigate(banner.linkUrl) : null,
          child: stac.clipRRect({
            borderRadius: Brand.radiusLarge,
            child: banner.mediaType === "video"
              ? stac.video({ src: banner.mediaUrl, width: 320, height: 180, autoPlay: true, loop: true, muted: true, fit: "cover" })
              : stac.image({ src: banner.mediaUrl, width: 320, height: 180, fit: "cover" })
          })
        })
      })
    );

    const productCards = products.map(p => 
      ui.productCard({
        id: p.id.toString(), title: p.name, price: `$${p.price.toFixed(2)}`,
        imageUrl: p.images?.length > 0 ? p.images[0].url : "https://via.placeholder.com/400x500",
        isOnSale: !!p.salePrice,
        onCardTap: stac.navigate(`/product/${p.id}`),
        onAddToCartTap: isGuest ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet"))) : stac.showToast("Added to Cart")
      })
    );

    const horizontalProductCards = productCards.map(card => 
          stac.padding({ 
            right: 16, 
            child: stac.sizedBox({ 
              width: 160, 
              height: 260, // 🚨 FIX: Added a fixed height to constrain the Expanded widget!
              child: card 
            }) 
          })
        );

    // ==========================================
    // 2. BUILD THE FINAL LAYOUT
    // ==========================================
    return stac.defaultBottomNavigationController({
      length: 4, 
      child: stac.scaffold({
        backgroundColor: Brand.background,

        // 🚨 CLEAN: The Drawer is now properly attached to the Scaffold
        drawer: {
          type: "drawer", // 🚨 This tells Flutter it's officially a Drawer!
          child: stac.container({
            width: 280,
            color: Brand.surface,
            child: stac.safeArea({
              child: stac.column({
                crossAxisAlignment: "stretch",
                children: [
                  stac.padding({ 
                    all: 24, 
                    child: stac.text("AURORA Menu", { style: stac.textStyle({ fontSize: 20, fontWeight: "bold", color: Brand.textPrimary }) }) 
                  }),
                  stac.divider({ color: Brand.divider, thickness: 1 }),
                  stac.inkWell({ action: stac.showToast("My Orders"), child: stac.padding({ all: 16, child: stac.text("My Orders", { style: stac.textStyle({ fontSize: 16, color: Brand.textPrimary }) }) }) }),
                  stac.inkWell({ action: stac.showToast("Wishlist"), child: stac.padding({ all: 16, child: stac.text("Wishlist", { style: stac.textStyle({ fontSize: 16, color: Brand.textPrimary }) }) }) }),
                  stac.inkWell({ action: stac.showToast("Settings"), child: stac.padding({ all: 16, child: stac.text("Settings", { style: stac.textStyle({ fontSize: 16, color: Brand.textPrimary }) }) }) }),
                ]
              })
            })
          })
        },
        
        // --- NATIVE BOTTOM NAV BAR ---
        bottomNavigationBar: stac.responsiveVisibility({
          hiddenWhen: ["DESKTOP", "4K"],
          child: stac.bottomNavigationBar({
            backgroundColor: Brand.surface, selectedItemColor: Brand.primaryDark, unselectedItemColor: Brand.textSecondary,
            items: [
              stac.bottomNavigationBarItem({ icon: "home", label: "Home" }),
              stac.bottomNavigationBarItem({ icon: "search", label: "Discover" }),
              stac.bottomNavigationBarItem({ icon: "shopping_bag", label: "Cart" }),
              stac.bottomNavigationBarItem({ icon: "person_outline", label: "Profile" })
            ]
          })
        }),

        // --- BUTTERY SMOOTH SLIVER BODY ---
        body: stac.customScrollView({
          slivers: [
            
            // 1. THE DYNAMIC SLIVER APP BAR
            ui.dynamicAppBar({
              titleText: "AURORA",
              isDashboard: true,   // Shows Drawer Icon
              showSearch: false,   // Shows Brand Logo
              isSliver: true,      // Makes it hide on scroll
              actions: [
                  stac.svg({ src: AppIcons.CART, color: Brand.primary, width: 24, height: 24 }),
                      stac.sizedBox({ width: 16 }),
                        stac.svg({ src: AppIcons.HEART_EMPTY, color: Brand.primary, width: 24, height: 24 }),
                      stac.sizedBox({ width: 16 }),
                // Desktop/Tablet Auth Actions
                stac.responsiveVisibility({
                  hiddenWhen: ["MOBILE", "TABLET"],
                  child: stac.row({
                    mainAxisSize: "min",
                    children: [
                      stac.svg({ src: AppIcons.CART, color: Brand.textPrimary, width: 24, height: 24 }),
                      stac.sizedBox({ width: 16 }),
                      isGuest 
                        ? ui.primaryButton({ text: "Sign In", isFullWidth: false, action: stac.showDialog(AuthUI.asDialog(AuthUI.emailForm("dialog"))) })
                        : stac.svg({ src: AppIcons.PERSON, color: Brand.primary, width: 28, height: 28 })
                    ]
                  })
                }),
                stac.sizedBox({ width: 16 })
              ]
            }),

            // 2. THE SEARCH PILL
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, top: 4, bottom: 16,
                child: ui.searchBar({ 
                  hintText: "Search for rings, necklaces...", 
                  isReadOnly: false 
                })
              })
            }),
            
            // 3. DYNAMIC BANNERS
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, bottom: 24,
                child: stac.singleChildScrollView({
                  scrollDirection: "horizontal",
                  child: stac.row({ children: dynamicBanners })
                })
              })
            }),

            // 4. CATEGORY TAB BAR
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, bottom: 24,
                child: stac.singleChildScrollView({
                  scrollDirection: "horizontal",
                  child: stac.row({
                    mainAxisSize: "min",
                    children: [
                      ui.categoryChip({ title: "View All", isSelected: true }),
                      stac.sizedBox({ width: 12 }),
                      ...categoryChips 
                    ]
                  })
                })
              })
            }),

            // 5. NEW LAUNCHES
            stac.sliverToBoxAdapter({
              child: stac.column({
                children: [
                  stac.padding({
                    left: 16, right: 16, bottom: 16,
                    child: ui.sectionHeader({ title: "New Launches", actionText: "View All Launches", action: stac.showToast("View All Launches") })
                  }),
                  stac.padding({
                    left: 16, bottom: 32, 
                    child: stac.singleChildScrollView({
                      scrollDirection: "horizontal",
                      child: stac.row({ children: horizontalProductCards }) 
                    })
                  })
                ]
              })
            }),

            // 6. BESTSELLERS
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, bottom: 32,
                child: stac.column({
                  children: [
                    ui.sectionHeader({ title: "Bestsellers", actionText: "View All", action: stac.showToast("View All") }),
                    stac.sizedBox({ height: 16 }),

                    stac.responsiveVisibility({
                      hiddenWhen: ["DESKTOP", "4K"],
                      child: stac.gridView({
                        crossAxisCount: 2, childAspectRatio: 0.65, shrinkWrap: true, physics: "never",
                        children: productCards
                      })
                    }),

                    stac.responsiveVisibility({
                      hiddenWhen: ["MOBILE", "TABLET"],
                      child: stac.gridView({
                        crossAxisCount: 4, childAspectRatio: 0.70, shrinkWrap: true, physics: "never",
                        children: productCards
                      })
                    })
                  ]
                })
              })
            })

          ]
        })
      })
    });
  }
}