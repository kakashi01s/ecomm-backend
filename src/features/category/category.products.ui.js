import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { AuthUI } from "../auth/auth.ui.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class CategoryProductsUI {
  /**
   * buildCategoryProductsPage
   * Main listing page for products in a specific category.
   */
  static buildCategoryProductsPage(categoryId, categoryName) {
    const stateKey = `cat_prod_${categoryId}`;
    const filterCountKey = `cat_filter_count_${categoryId}`;
    const hasProductsKey = `cat_has_prod_${categoryId}`;

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: categoryName,
        isDashboard: false,
        actions: [
          { icon: AppIcons.CART, action: stac.navigate(Endpoints.CART.BASE), badgeType: "cart" }
        ]
      }),
      body: stac.padding({
        all: 16,
        child: stac.reactiveBuilder({
          listenTo: [hasProductsKey],
          child: stac.conditionalWidget({
            stateKey: hasProductsKey,
            expectedValue: true,
            onTrue: stac.reactiveBuilder({
              listenTo: [stateKey],
              child: stac.gridView({
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.7, 
                children: `{{${stateKey}}}`
              })
            }),
            onFalse: CategoryProductsUI._emptyProductsState(categoryId)
          })
        })
      }),
      bottomNavigationBar: stac.reactiveBuilder({
        listenTo: [hasProductsKey],
        child: stac.conditionalWidget({
          stateKey: hasProductsKey,
          expectedValue: true,
          onTrue: stac.container({
            decoration: {
              color: Brand.surface,
              border: { top: { color: Brand.divider, width: 1 } },
              boxShadow: [
                { color: "#00000008", blurRadius: 16, spreadRadius: 0, offset: { dx: 0, dy: -4 } },
              ],
            },
            child: stac.safeArea({
              child: stac.sizedBox({
                height: 56,
                child: stac.row({
                  children: [
                    // SORT BUTTON
                    stac.expanded({
                      child: stac.inkWell({
                        action: stac.showBottomSheet(CategoryProductsUI._sortBottomSheet(categoryId)),
                        child: stac.center({
                          child: stac.row({
                            mainAxisSize: "min",
                            mainAxisAlignment: "center",
                            children: [ 
                              stac.svg({ src: AppIcons.SORT, color: Brand.textPrimary, width: 20, height: 20 }),
                              stac.sizedBox({ width: 10 }),
                              stac.text("SORT", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", letterSpacing: 1.1 }) }),
                            ]
                          })
                        })
                      })
                    }),

                    // DIVIDER
                    stac.container({ width: 1, height: 24, color: Brand.divider }),

                    // FILTER BUTTON (REACTIVE)
                    stac.expanded({
                      child: stac.inkWell({
                        action: stac.navigate(Endpoints.CATEGORY.FILTERS(categoryId), "push"),
                        child: stac.center({
                          child: stac.reactiveBuilder({
                            listenTo: [filterCountKey],
                            child: stac.conditionalWidget({
                              stateKey: filterCountKey,
                              expectedValue: 0,
                              onTrue: stac.row({
                                mainAxisSize: "min",
                                mainAxisAlignment: "center",
                                children: [ 
                                  stac.svg({ src: AppIcons.FILTER, color: Brand.textPrimary, width: 20, height: 20 }),
                                  stac.sizedBox({ width: 10 }),
                                  stac.text("FILTER", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", letterSpacing: 1.1, color: Brand.textPrimary }) }),
                                ]
                              }),
                              onFalse: stac.row({
                                mainAxisSize: "min",
                                mainAxisAlignment: "center",
                                children: [ 
                                  stac.badge({
                                    count: `{{${filterCountKey}}}`,
                                    color: Brand.primary,
                                    size: 16,
                                    position: { top: -6, right: -6 },
                                    child: stac.svg({ src: AppIcons.FILTER, color: Brand.primary, width: 20, height: 20 }),
                                  }),
                                  stac.sizedBox({ width: 10 }),
                                  stac.text("FILTER", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", letterSpacing: 1.1, color: Brand.primary }) }),
                                ]
                              })
                            })
                          })
                        })
                      })
                    }),
                  ]
                }),
              })
            })
          }),
          onFalse: stac.sizedBox({ height: 0 })
        })
      })
    });
  }

  /**
   * _emptyProductsState
   */
  static _emptyProductsState(categoryId) {
    return stac.center({
      child: stac.padding({
        all: 32,
        child: stac.column({
          mainAxisAlignment: "center",
          crossAxisAlignment: "center",
          children: [
            stac.container({
              width: 120,
              height: 120,
              decoration: {
                color: Brand.surface,
                borderRadius: 60,
              },
              child: stac.center({
                child: stac.svg({
                  src: AppIcons.SEARCH,
                  color: Brand.divider,
                  width: 60,
                  height: 60,
                }),
              }),
            }),
            stac.sizedBox({ height: 24 }),
            stac.text("No Products Found", {
              style: stac.textStyle({
                fontSize: 20,
                fontWeight: "bold",
                color: Brand.textPrimary,
              }),
            }),
            stac.sizedBox({ height: 12 }),
            stac.text(
              "We couldn't find any products matching your criteria. Try adjusting your filters or check back later.",
              {
                textAlign: "center",
                style: stac.textStyle({
                  fontSize: 14,
                  color: Brand.textSecondary,
                  height: 1.5,
                }),
              }
            ),
            stac.sizedBox({ height: 32 }),
            w.button({
              text: "Explore Other Categories",
              width: 200,
              action: stac.navigate(null, "popToFirst"),
            }),
          ],
        }),
      }),
    });
  }

  /**
   * buildFilterScreen
   */
  static buildFilterScreen(categoryId, filters, appliedFilters = {}) {
    const { minPrice, maxPrice, colors = [], sizes = [] } = filters;
    const hasAppliedFilters = Object.keys(appliedFilters || {}).some(k => {
      const val = appliedFilters[k];
      return val === true || val === "true" || (typeof val === 'string' && val.trim() !== "");
    });

    return stac.form({
      id: `filter_form_${categoryId}_${Date.now()}`,
      child: stac.scaffold({
        backgroundColor: Brand.background,
        appBar: ui.dynamicAppBar({ titleText: "Filters", isDashboard: false }),
        body: stac.singleChildScrollView({
          child: stac.padding({
            all: 24,
            child: stac.column({
              crossAxisAlignment: "start",
              children: [
                stac.text("Price Range", { style: stac.textStyle({ fontSize: 16, fontWeight: "bold" }) }),
                stac.sizedBox({ height: 16 }),
                {
                  type: "range_slider",
                  minStateKey: "filter_minPrice",
                  maxStateKey: "filter_maxPrice",
                  min: minPrice,
                  max: maxPrice,
                  initialMin: appliedFilters.minPrice ? Number(appliedFilters.minPrice) : minPrice,
                  initialMax: appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : maxPrice,
                  activeColor: Brand.primary,
                  inactiveColor: Brand.divider
                },

                stac.sizedBox({ height: 32 }),
                stac.divider({ color: Brand.divider }),
                stac.sizedBox({ height: 32 }),

                ...(colors.length > 0 ? [
                  stac.text("Colors", { style: stac.textStyle({ fontSize: 16, fontWeight: "bold" }) }),
                  stac.sizedBox({ height: 16 }),
                  stac.wrap({
                    spacing: 12,
                    runSpacing: 12,
                    children: colors.map(c => stac.sizedBox({
                      width: 160,
                      child: stac.row({
                        mainAxisSize: "max",
                        children: [
                          stac.checkbox({
                            id: `color_${c}`,
                            value: appliedFilters[`color_${c}`] === true || appliedFilters[`color_${c}`] === "true",
                            activeColor: Brand.primary
                          }),
                          stac.sizedBox({ width: 4 }),
                          stac.expanded({
                            child: stac.text(c, { 
                              maxLines: 1, 
                              overflow: "ellipsis",
                              style: stac.textStyle({ fontSize: 14, color: Brand.textPrimary }) 
                            })
                          })
                        ]
                      })
                    }))
                  }),
                  stac.sizedBox({ height: 32 }),
                  stac.divider({ color: Brand.divider }),
                  stac.sizedBox({ height: 32 }),
                ] : []),

                ...(sizes.length > 0 ? [
                  stac.text("Sizes", { style: stac.textStyle({ fontSize: 16, fontWeight: "bold" }) }),
                  stac.sizedBox({ height: 16 }),
                  stac.wrap({
                    spacing: 12,
                    runSpacing: 12,
                    children: sizes.map(s => stac.sizedBox({
                      width: 120,
                      child: stac.row({
                        mainAxisSize: "max",
                        children: [
                          stac.checkbox({
                            id: `size_${s}`,
                            value: appliedFilters[`size_${s}`] === true || appliedFilters[`size_${s}`] === "true",
                            activeColor: Brand.primary
                          }),
                          stac.sizedBox({ width: 4 }),
                          stac.expanded({
                            child: stac.text(s, { 
                                maxLines: 1, 
                                overflow: "ellipsis",
                                style: stac.textStyle({ fontSize: 14, color: Brand.textPrimary }) 
                            })
                          })
                        ]
                      })
                    }))
                  }),
                  stac.sizedBox({ height: 40 }),
                ] : []),

                stac.sizedBox({ height: 100 }), 
              ]
            })
          })
        }),
        bottomNavigationBar: stac.container({
          padding: [24, 16, 24, 40],
          decoration: { color: Brand.surface, border: { top: { color: Brand.divider, width: 1 } } },
          child: stac.row({
            mainAxisSize: "max",
            children: [
              stac.expanded({
                child: hasAppliedFilters 
                  ? stac.inkWell({
                      action: stac.apiRequest({
                        url: Endpoints.CATEGORY.FILTER(categoryId),
                        method: "POST",
                        body: {}, 
                        onSuccess: stac.navigate(null, "pop")
                      }),
                      child: stac.container({
                        height: 50,
                        decoration: {
                          border: { color: Brand.divider, width: 1 },
                          borderRadius: 12,
                        },
                        child: stac.center({
                          child: stac.text("Clear", { style: stac.textStyle({ color: Brand.textPrimary, fontWeight: "bold", fontSize: 15 }) })
                        })
                      })
                    })
                  : stac.container({ 
                      height: 50,
                      decoration: {
                        color: Brand.surface,
                        border: { color: Brand.divider, width: 1 },
                        borderRadius: 12,
                        boxShadow: []
                      },
                      child: stac.center({
                        child: stac.text("Clear", { style: stac.textStyle({ color: Brand.textSecondary, fontWeight: "bold", fontSize: 15 }) })
                      })
                    })
              }),
              stac.sizedBox({ width: 16 }),
              stac.expanded({
                child: w.button({
                  text: "Apply",
                  action: stac.apiRequest({
                    url: Endpoints.CATEGORY.FILTER(categoryId),
                    method: "POST",
                    body: {
                      minPrice: "{{filter_minPrice}}",
                      maxPrice: "{{filter_maxPrice}}",
                      ...colors.reduce((acc, c) => ({ ...acc, [`color_${c}`]: { actionType: "getFormValue", id: `color_${c}` } }), {}),
                      ...sizes.reduce((acc, s) => ({ ...acc, [`size_${s}`]: { actionType: "getFormValue", id: `size_${s}` } }), {}),
                    },
                    onSuccess: stac.navigate(null, "pop")
                  })
                })
              })
            ]
          })
        })
      })
    });
  }

  /**
   * buildProductCards
   */
  static buildProductCards(products, isGuest = false, userWishlistSet = new Set()) {
    if (!products || products.length === 0) return [];

    return products.map((p) => {
      const isWishlisted = userWishlistSet.has(p.id);
      return ui.productCard({
        id: p.id,
        title: p.name,
        subtitle: p.category?.name || "",
        price: `₹${p.price.toFixed(2)}`,
        originalPrice: p.salePrice ? `₹${p.salePrice.toFixed(2)}` : null,
        isOnSale: !!p.salePrice,
        images: p.images,
        isWishlisted: isWishlisted,
        onCardTap: stac.navigate(Endpoints.PRODUCT.DETAILS(p.id)),
        onAddToCartTap: isGuest ? AuthUI.triggerAuth("bottomSheet") : stac.apiRequest({
          url: Endpoints.CART.ADD, method: "POST", body: { productId: p.id, quantity: 1 },
          onSuccess: stac.showToast("Added to cart!")
        }),
        onIncrementTap: isGuest ? null : stac.apiRequest({
          url: Endpoints.CART.UPDATE, method: "PUT", body: { productId: p.id, action: "increment", pincode: "{{activePincode}}" }
        }),
        onDecrementTap: isGuest ? null : stac.apiRequest({
          url: Endpoints.CART.UPDATE, method: "PUT", body: { productId: p.id, action: "decrement", pincode: "{{activePincode}}" }
        }),
        onWishlistTap: isGuest ? AuthUI.triggerAuth("bottomSheet") : stac.apiRequest({
          url: Endpoints.WISHLIST.TOGGLE, method: "POST", body: { productId: p.id }
        })
      });
    });
  }

  /**
   * _sortBottomSheet
   */
  static _sortBottomSheet(categoryId) {
    const options = [
      { label: "Newest Arrivals", value: "newest" },
      { label: "Price: Low to High", value: "price_asc" },
      { label: "Price: High to Low", value: "price_desc" }
    ];

    return stac.container({
      padding: [24, 24, 24, 40],
      decoration: { color: Brand.surface, borderRadius: { topLeft: 24, topRight: 24 } },
      child: stac.column({
        mainAxisSize: "min",
        crossAxisAlignment: "start",
        children: [
          stac.text("Sort By", { style: stac.textStyle({ fontSize: 20, fontWeight: "bold" }) }),
          stac.sizedBox({ height: 16 }),
          ...options.map(opt => stac.inkWell({
            action: stac.apiRequest({
              url: Endpoints.CATEGORY.FILTER(categoryId),
              method: "POST",
              body: { sort: opt.value },
              onSuccess: stac.navigate(null, "pop")
            }),
            child: stac.padding({
              vertical: 16,
              child: stac.row({
                children: [
                  stac.svg({ src: AppIcons.SORT, color: Brand.primary, width: 20, height: 20 }),
                  stac.sizedBox({ width: 12 }),
                  stac.text(opt.label, { style: stac.textStyle({ fontSize: 16 }) })
                ]
              })
            })
          }))
        ]
      })
    });
  }
}
