import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { AppIcons } from "../../core/constants/icons.js";
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
