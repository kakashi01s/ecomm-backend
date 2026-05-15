import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { AuthUI } from "../auth/auth.ui.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class CategoryUI {

  /**
   * buildCategoryUi
   * @param {Array}  categories  — from CategoryRepository.getAllCategories()
   *                              Each item: { id, name, imageUrl, children: [...], _count: { products } }
   * @param {number|null} selectedCategoryId — currently expanded parent (null = none)
   */
  static buildCategoryUi(categories = [], selectedCategoryId = null) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      body: {
        type: "hideOnScroll",
        body: stac.customScrollView({
          slivers: [
            // ── App Bar ──────────────────────────────────────────────
            ui.dynamicAppBar({
              titleText: "Categories",
              isSliver: true,
              pinned: true,
              isDashboard: false,
              backAction: stac.handleDashboardBack(null)
            }),

            // ── Hero banner strip ────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: CategoryUI._heroBanner(),
            }),

            // ── Section label ────────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, top: 24, bottom: 12,
                child: stac.text("Browse by Category", {
                  style: stac.textStyle({
                    fontSize: 18,
                    fontWeight: "bold",
                    color: Brand.textPrimary,
                  }),
                }),
              }),
            }),

            // ── Category grid ────────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, bottom: 32,
                child: categories.length === 0
                  ? CategoryUI._emptyState()
                  : stac.gridView({
                      crossAxisCount: 2,
                      mainAxisSpacing: 14,
                      crossAxisSpacing: 14,
                      childAspectRatio: 1.05,
                      shrinkWrap: true,
                      physics: "never",
                      children: categories.map((cat) =>
                        CategoryUI._parentCategoryCard(cat, selectedCategoryId)
                      ),
                    }),
              }),
            }),

            // ── Sub-categories (shown when a parent is selected) ─────
            ...(selectedCategoryId
              ? CategoryUI._subCategorySection(categories, selectedCategoryId)
              : []),

            // ── Bottom padding ───────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: stac.sizedBox({ height: 100 }),
            }),
          ],
        }),
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  /** Top decorative banner */
  static _heroBanner() {
    return stac.container({
      margin: [16, 16, 16, 0],
      height: 110,
      decoration: {
        color: Brand.primary,
        borderRadius: Brand.radiusLarge,
      },
      child: stac.stack({
        children: [
          // Background decoration circle
          stac.positioned({
            right: -20,
            top: -20,
            child: stac.container({
              width: 140,
              height: 140,
              decoration: {
                color: "#FFFFFF18",
                borderRadius: 70,
              },
            }),
          }),
          stac.positioned({
            right: 40,
            bottom: -30,
            child: stac.container({
              width: 90,
              height: 90,
              decoration: {
                color: "#FFFFFF10",
                borderRadius: 45,
              },
            }),
          }),
          // Text content
          stac.padding({
            left: 24, top: 24, right: 24, bottom: 24,
            child: stac.column({
              crossAxisAlignment: "start",
              mainAxisAlignment: "center",
              children: [
                stac.text("Explore Collections", {
                  style: stac.textStyle({
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                  }),
                }),
                stac.sizedBox({ height: 6 }),
                stac.text("Find what you're looking for", {
                  style: stac.textStyle({
                    fontSize: 13,
                    color: "#FFFFFFCC",
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    });
  }

  /**
   * Parent category card — tapping expands sub-categories.
   * Navigates to /categories/:id/products for leaf categories (no children).
   */
  static _parentCategoryCard(cat, selectedCategoryId) {
    const isSelected = selectedCategoryId === cat.id;
    const productCount = cat._count?.products ?? 0;
    const hasChildren = cat.children && cat.children.length > 0;

    // Fulfilling user request: open the new category grid we created
    const tapAction = stac.navigate(Endpoints.CATEGORY.PRODUCTS(cat.id), "push");

    const imageWidget = cat.imageUrl
      ? stac.clipRRect({
          borderRadius: 36,
          child: stac.image({
            src: cat.imageUrl,
            width: 72,
            height: 72,
            fit: "cover",
            errorWidget: stac.container({
              width: 72,
              height: 72,
              decoration: {
                color: isSelected ? "#FFFFFF30" : Brand.background,
                borderRadius: 36,
              },
              child: stac.center({
                child: stac.svg({
                  src: AppIcons.CATEGORY,
                  color: isSelected ? "#FFFFFF" : Brand.textSecondary,
                  width: 30,
                  height: 30,
                }),
              }),
            }),
          }),
        })
      : stac.container({
          width: 72,
          height: 72,
          decoration: {
            color: isSelected ? "#FFFFFF30" : Brand.background,
            borderRadius: 36,
          },
          child: stac.center({
            child: stac.svg({
              src: AppIcons.CATEGORY,
              color: isSelected ? "#FFFFFF" : Brand.textSecondary,
              width: 30,
              height: 30,
            }),
          }),
        });

    return stac.inkWell({
      action: tapAction,
      child: stac.container({
        decoration: {
          color: isSelected ? Brand.primary : Brand.surface,
          borderRadius: Brand.radiusMedium,
          border: isSelected
            ? null
            : { color: Brand.divider, width: 1 },
          boxShadow: [
            {
              color: isSelected ? "#FF572240" : "#0000000A",
              blurRadius: isSelected ? 12 : 6,
              spreadRadius: 0,
              offset: { dx: 0, dy: 3 },
            },
          ],
        },
        child: stac.padding({
          all: 16,
          child: stac.column({
            mainAxisAlignment: "center",
            crossAxisAlignment: "center",
            children: [
              imageWidget,
              stac.sizedBox({ height: 10 }),
              stac.text(cat.name, {
                maxLines: 1,
                overflow: "ellipsis",
                textAlign: "center",
                style: stac.textStyle({
                  fontSize: 14,
                  fontWeight: "w600",
                  color: isSelected ? "#FFFFFF" : Brand.textPrimary,
                }),
              }),
              stac.sizedBox({ height: 4 }),
              stac.text(
                hasChildren
                  ? `${cat.children.length} sub-categories`
                  : `${productCount} items`,
                {
                  style: stac.textStyle({
                    fontSize: 11,
                    color: isSelected ? "#FFFFFFCC" : Brand.textSecondary,
                  }),
                }
              ),
            ],
          }),
        }),
      }),
    });
  }

  /** Sub-category horizontal row rendered below grid when parent is selected */
  static _subCategorySection(categories, selectedCategoryId) {
    const parent = categories.find((c) => c.id === selectedCategoryId);
    if (!parent || !parent.children || parent.children.length === 0) return [];

    return [
      stac.sliverToBoxAdapter({
        child: stac.padding({
          left: 16, right: 16, bottom: 12,
          child: ui.sectionHeader({
            title: `${parent.name} — Sub-categories`,
            actionText: "View All",
            action: stac.navigate(`/categories/${parent.id}/products`, "push"),
          }),
        }),
      }),
      stac.sliverToBoxAdapter({
        child: stac.padding({
          left: 16, bottom: 24,
          child: {
            type: "webScrollRow",
            padding: [0, 0, 16, 0],
            children: parent.children.map((sub) =>
              stac.padding({
                right: 12,
                child: CategoryUI._subCategoryPill(sub),
              })
            ),
          },
        }),
      }),
    ];
  }

  /** Pill chip for a sub-category */
  static _subCategoryPill(sub) {
    const productCount = sub._count?.products ?? 0;

    return stac.inkWell({
      action: stac.navigate(`/categories/${sub.id}/products`, "push"),
      child: stac.container({
        padding: [16, 10, 16, 10],
        decoration: {
          color: Brand.surface,
          borderRadius: 24,
          border: { color: Brand.divider, width: 1 },
          boxShadow: [
            { color: "#0000000A", blurRadius: 6, spreadRadius: 0, offset: { dx: 0, dy: 2 } },
          ],
        },
        child: stac.column({
          mainAxisSize: "min",
          crossAxisAlignment: "center",
          children: [
            stac.text(sub.name, {
              style: stac.textStyle({
                fontSize: 13,
                fontWeight: "w600",
                color: Brand.textPrimary,
              }),
            }),
            stac.sizedBox({ height: 2 }),
            stac.text(`${productCount} items`, {
              style: stac.textStyle({
                fontSize: 10,
                color: Brand.textSecondary,
              }),
            }),
          ],
        }),
      }),
    });
  }

  /** Shown when categories array is empty */
  static _emptyState() {
    return stac.center({
      child: stac.padding({
        all: 48,
        child: stac.column({
          mainAxisAlignment: "center",
          crossAxisAlignment: "center",
          children: [
            stac.icon({ icon: "category", color: Brand.divider, size: 72 }),
            stac.sizedBox({ height: 20 }),
            stac.text("No Categories Yet", {
              style: stac.textStyle({
                fontSize: 18,
                fontWeight: "bold",
                color: Brand.textPrimary,
              }),
            }),
            stac.sizedBox({ height: 8 }),
            stac.text("Categories will appear here once added.", {
              textAlign: "center",
              style: stac.textStyle({
                fontSize: 14,
                color: Brand.textSecondary,
              }),
            }),
          ],
        }),
      }),
    });
  }

  /**
   * buildCategoryProductsPage
   * Main listing page for products in a specific category.
   */
  static buildCategoryProductsPage(category, products = [], activeFilterCount = 0) {
    const categoryId = category.id;
    const stateKey = `cat_prod_${categoryId}`;
    const filterCountKey = `cat_filter_count_${categoryId}`;

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: category.name,
        isDashboard: false,
        actions: [
          { icon: AppIcons.CART, action: stac.navigate(Endpoints.CART.BASE), badgeType: "cart" }
        ]
      }),
      body: stac.padding({
        all: 16,
        child: stac.reactiveBuilder({
          listenTo: [stateKey],
          child: stac.gridView({
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 0.7, // Adjusted for card height
            // PURE SDUI: The grid children are injected reactively from state
            children: `{{${stateKey}}}`
          })
        })
      }),
      bottomNavigationBar: stac.container({
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
                    action: stac.showBottomSheet(CategoryUI._sortBottomSheet(categoryId)),
                    child: stac.center({
                      child: stac.row({
                        mainAxisSize: "min",
                        mainAxisAlignment: "center",
                        children: [ stac.svg({ src: AppIcons.SORT, color: Brand.textPrimary, width: 20, height: 20 }),
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
                          // ── INACTIVE STATE (0 FILTERS) ────────
                          onTrue: stac.row({
                            mainAxisSize: "min",
                            mainAxisAlignment: "center",
                            children: [ 
                              stac.svg({ src: AppIcons.FILTER, color: Brand.textPrimary, width: 20, height: 20 }),
                              stac.sizedBox({ width: 10 }),
                              stac.text("FILTER", { style: stac.textStyle({ fontSize: 13, fontWeight: "bold", letterSpacing: 1.1, color: Brand.textPrimary }) }),
                            ]
                          }),
                          // ── ACTIVE STATE (> 0 FILTERS) ────────
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
      })
    });
  }

  /**
   * buildFilterScreen
   * Complete page for selecting dynamic filters.
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
                // ── PRICE RANGE ──────────────────────────────
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

                // ── COLORS (DYNAMIC) ─────────────────────────
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

                // ── SIZES (DYNAMIC) ──────────────────────────
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

                stac.sizedBox({ height: 100 }), // Spacer for bottom bar
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
                        body: {}, // Sending empty body clears all filters
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
                  : stac.container({ // Disabled state layout
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
                    // SDUI: Collect every possible dynamic field from the form
                    body: {
                      minPrice: "{{filter_minPrice}}",
                      maxPrice: "{{filter_maxPrice}}",
                      // We'll process color_ and size_ prefixed keys in the controller
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
   * _buildProductCards
   * Converts product records from DB into SDUI ui.productCard widgets.
   */
  static _buildProductCards(products, isGuest = false, userWishlistSet = new Set()) {
    if (!products || products.length === 0) {
      return [
        stac.center({ 
          child: stac.text("No products found.", { 
            style: stac.textStyle({ color: Brand.textSecondary }) 
          }) 
        })
      ];
    }

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
   * _filterBottomSheet
   * UI for the price filter form.
   */
  static _filterBottomSheet(categoryId) {
    return stac.container({
      padding: [24, 24, 24, 40],
      decoration: { color: Brand.surface, borderRadius: { topLeft: 24, topRight: 24 } },
      child: stac.form({
        id: "category_filter_form",
        child: stac.column({
          mainAxisSize: "min",
          crossAxisAlignment: "start",
          children: [
            stac.text("Filter Products", { style: stac.textStyle({ fontSize: 20, fontWeight: "bold" }) }),
            stac.sizedBox({ height: 24 }),
            stac.text("Price Range", { style: stac.textStyle({ fontSize: 14, fontWeight: "bold" }) }),
            stac.sizedBox({ height: 12 }),
            {
              type: "range_slider",
              minStateKey: "filter_minPrice",
              maxStateKey: "filter_maxPrice",
              min: 0,
              max: 50000,
              initialMin: 0,
              initialMax: 50000,
              activeColor: Brand.primary,
              inactiveColor: Brand.divider
            },
            stac.sizedBox({ height: 32 }),
            w.button({
              text: "Apply Filters",
              action: stac.apiRequest({
                url: Endpoints.CATEGORY.FILTER(categoryId),
                method: "POST",
                body: {
                  minPrice: "{{filter_minPrice}}",
                  maxPrice: "{{filter_maxPrice}}"
                },
                onSuccess: stac.navigate(null, "pop") // Close bottom sheet
              })
            })
          ]
        })
      })
    });
  }

  /**
   * _sortBottomSheet
   * UI for sorting options.
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

  // ─────────────────────────────────────────────────────────────────
  // CONTROLLER INTEGRATION HELPERS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Used by CategoryController.getAllCategories → SDUI variant
   * Pass the result of CategoryRepository.getAllCategories() directly.
   */
  static fromRepository(categories, selectedCategoryId = null) {
    return CategoryUI.buildCategoryUi(categories, selectedCategoryId);
  }
}
