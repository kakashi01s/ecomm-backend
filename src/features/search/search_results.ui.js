import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AuthUI } from "../auth/auth.ui.js";
import { AppIcons } from "../../core/constants/icons.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class SearchResultsUI {
  static buildResultsPage({ query, products, totalCount, isGuest, userCartMap, userWishlistSet, page, hasMore }) {
    const isEmpty = products.length === 0;

    return stac.scaffold({
      backgroundColor: Brand.background,
      
      // 1. App Bar matching Dashboard, but configured as an inner page
      appBar: ui.dynamicAppBar(
        {
        titleText: "Search Results",
        isDashboard: false,
        
        actions: [
        { icon: AppIcons.SEARCH, action: stac.navigate(Endpoints.SEARCH.BASE), badgeType: "search" },
        { icon: AppIcons.HEART, action: stac.navigate(Endpoints.WISHLIST.BASE), badgeType: "wishlist" },
        { icon: AppIcons.CART,  action: stac.navigate(Endpoints.CART.BASE),     badgeType: "cart" },
        ],
      }
    ),

      // 2. Body wrapped in stac.form so cart API requests can resolve context
      body: isEmpty
        ? ui.emptyState({
            icon: AppIcons.SEARCH,
            title: "No results found",
            subtitle: `We couldn't find anything for "${query}". Try another keyword.`,
            buttonText: "Browse Categories",
            buttonAction: stac.navigate(Endpoints.DASHBOARD.BASE, "replaceAll"),
          })
        : stac.form({
            child: stac.customScrollView({
              slivers: [
                // Result Count Text
                stac.sliverToBoxAdapter({
                  child: stac.padding({
                    left: 16, right: 16, top: 16, bottom: 16,
                    child: stac.text(`Showing ${products.length} of ${totalCount} results for "${query}"`, {
                      style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary, fontWeight: "w500" }),
                    }),
                  }),
                }),

                // MOBILE / TABLET GRID
                stac.sliverToBoxAdapter({
                  child: stac.responsiveVisibility({
                    hiddenWhen: ["DESKTOP", "4K"],
                    child: stac.padding({
                      left: 16, right: 16, bottom: 24,
                      child: stac.gridView({
                        crossAxisCount: 2,
                        childAspectRatio: 0.68,
                        mainAxisSpacing: 14,
                        crossAxisSpacing: 14,
                        shrinkWrap: true,
                        physics: "never",
                        children: SearchResultsUI._productCards(products, isGuest, userCartMap, userWishlistSet, "mobile"),
                      }),
                    }),
                  }),
                }),

                // DESKTOP GRID
                stac.sliverToBoxAdapter({
                  child: stac.responsiveVisibility({
                    hiddenWhen: ["MOBILE", "TABLET"],
                    child: stac.padding({
                      left: 16, right: 16, bottom: 24,
                      child: stac.gridView({
                        crossAxisCount: 4,
                        childAspectRatio: 0.62,
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 16,
                        shrinkWrap: true,
                        physics: "never",
                        children: SearchResultsUI._productCards(products, isGuest, userCartMap, userWishlistSet, "desktop"),
                      }),
                    }),
                  }),
                }),

                // PAGINATION FOOTER
                stac.sliverToBoxAdapter({
                  child: stac.padding({
                    all: 24,
                    child: hasMore
                      ? stac.center({
                          child: stac.sizedBox({
                            width: 160,
                            child: w.button({
                              text: "Load More",
                              variant: "outline",
                              // SDUI Pagination: Replace the page with the next limits
                              action: stac.navigate(Endpoints.SEARCH.RESULTS(`${encodeURIComponent(query)}&page=${page + 1}`), "replace"),
                            }),
                          }),
                        })
                      : stac.sizedBox({ height: 40 }), // Bottom padding when no more items
                  }),
                }),
              ],
            }),
          }),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Reused standard product card generator with isolated map lookups
  // ─────────────────────────────────────────────────────────────────
static _productCards(products, isGuest, userCartMap, userWishlistSet, heroContext) {
    return products.map(p => {
      const mediaItems = p.images?.length > 0 
        ? p.images.map(img => ({ url: img.url, mediaType: img.mediaType })) 
        : [];

      const isWishlisted = userWishlistSet.has(p.id);
      const cartQty = userCartMap[p.id] || 0;
      
      // Map the schema fields to the UI logic
      const isOnSale = p.salePrice !== null && p.salePrice < p.price;
      const displayPrice = isOnSale ? p.salePrice : p.price;
      const strikethroughPrice = isOnSale ? p.price : null;
        
      return ui.productCard({
        id: p.id.toString(), 
        title: p.name, 
        subtitle: p.category?.name?.toUpperCase() || "AURORA", 
        
        // Pass the mapped prices to your UI component
        price: `₹${displayPrice.toFixed(2)}`,
        originalPrice: strikethroughPrice ? `₹${strikethroughPrice.toFixed(2)}` : null,
        isOnSale: isOnSale,
        
        images: mediaItems,
        initialQty: cartQty,
        isWishlisted: isWishlisted, 
        
        // Hardcode fallbacks for the missing DB columns so the UI doesn't break
        rating: "4.9",
        reviewCount: 42,
        
        heroTag: `search_image_${p.id}_${heroContext}`,
        
        onCardTap: stac.navigate(Endpoints.PRODUCT.DETAILS(p.id)),
        
        onWishlistTap: isGuest 
          ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet")))
          : stac.apiRequest({ url: Endpoints.WISHLIST.TOGGLE, method: "POST", body: { productId: p.id } }),
            
        onAddToCartTap: isGuest 
          ? stac.showBottomSheet(AuthUI.asBottomSheet(AuthUI.emailForm("bottomSheet"))) 
          : stac.apiRequest({
              url: Endpoints.CART.ADD, method: "POST", body: { productId: p.id, quantity: 1 },
              onSuccess: stac.showToast("Added to cart! 🛒"),
            }),

        onIncrementTap: isGuest ? null : stac.apiRequest({
          url: Endpoints.CART.UPDATE, method: "PUT", body: { productId: p.id, action: "increment", pincode: "{{activePincode}}" },
        }),
            
        onDecrementTap: isGuest ? null : stac.apiRequest({
          url: Endpoints.CART.UPDATE, method: "PUT", body: { productId: p.id, action: "decrement", pincode: "{{activePincode}}" },
        })
      });
    });
  }
}