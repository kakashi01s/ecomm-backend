import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

export class WishlistUI {
  static buildWishlistScreen(items) {
    const hasItems = items.length > 0;

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({ titleText: "My Wishlist", isSliver: false }),
      body: hasItems
        ? WishlistUI._itemList(items)
        : WishlistUI._emptyState(),
    });
  }

  static _emptyState() {
    return ui.emptyState({
      icon: "favorite_border",
      title: "Your wishlist is empty",
      subtitle: "Save items you love and come back to them anytime.",
      buttonText: "Start Shopping",
      buttonAction: stac.navigate("/dashboard", "replace"),
    });
  }

  static _itemList(items) {
    return stac.singleChildScrollView({
      child: stac.padding({
        all: 16,
        child: stac.column({
          crossAxisAlignment: "stretch",
          children: [
            // Summary row
            stac.padding({
              bottom: 16,
              child: stac.text(`${items.length} item${items.length !== 1 ? "s" : ""}`, {
                style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }),
              }),
            }),
            ...items.map((item) => WishlistUI._wishlistCard(item)),
          ],
        }),
      }),
    });
  }

  static _wishlistCard(item) {
    const product = item.product;
    const imageUrl =
      product.images?.[0]?.url ?? "https://via.placeholder.com/100x100";
    const price = product.salePrice
      ? `$${product.salePrice}`
      : `$${product.price}`;
    const originalPrice = product.salePrice ? `$${product.price}` : null;

    return stac.container({
      margin: [0, 0, 0, 12],
      decoration: {
        color: Brand.surface,
        borderRadius: Brand.radiusMedium,
        border: { color: Brand.divider, width: 1 },
      },
      child: stac.row({
        crossAxisAlignment: "start",
        children: [
          // Product image — tappable to product page
          stac.inkWell({
            action: stac.navigate(`/product/${product.id}`),
            child: stac.clipRRect({
              borderRadius: {
                topLeft: Brand.radiusMedium,
                bottomLeft: Brand.radiusMedium,
                topRight: 0,
                bottomRight: 0,
              },
              child: stac.image({
                src: imageUrl,
                width: 110,
                height: 130,
                fit: "cover",
              }),
            }),
          }),

          // Details
          stac.expanded({
            child: stac.padding({
              all: 12,
              child: stac.column({
                crossAxisAlignment: "start",
                children: [
                  // Category + remove button
                  stac.row({
                    mainAxisAlignment: "spaceBetween",
                    children: [
                      stac.text(
                        product.category?.name?.toUpperCase() ?? "AURORA",
                        {
                          style: stac.textStyle({
                            fontSize: 10,
                            color: Brand.textSecondary,
                            fontWeight: "bold",
                            letterSpacing: 0.5,
                          }),
                        }
                      ),
                      // Remove from wishlist
                      stac.inkWell({
                        action: stac.apiRequest({
                          url: `/wishlist/remove`,
                          method: "POST",
                          body: { productId: product.id },
                          onSuccess: stac.navigate("/wishlist", "replace"),
                        }),
                        child: stac.padding({
                          all: 4,
                          child: stac.svg({
                            src: AppIcons.CLOSE,
                            color: Brand.textSecondary,
                            width: 16,
                            height: 16,
                          }),
                        }),
                      }),
                    ],
                  }),

                  stac.sizedBox({ height: 6 }),

                  // Product name
                  stac.text(product.name, {
                    maxLines: 2,
                    overflow: "ellipsis",
                    style: stac.textStyle({
                      fontSize: 14,
                      fontWeight: "w500",
                      color: Brand.textPrimary,
                      height: 1.3,
                    }),
                  }),

                  stac.sizedBox({ height: 8 }),

                  // Price row
                  stac.row({
                    children: [
                      stac.text(price, {
                        style: stac.textStyle({
                          fontSize: 16,
                          fontWeight: "w600",
                          color: Brand.textPrimary,
                        }),
                      }),
                      ...(originalPrice
                        ? [
                            stac.sizedBox({ width: 8 }),
                            stac.text(originalPrice, {
                              style: stac.textStyle({
                                fontSize: 12,
                                color: Brand.textSecondary,
                              }),
                            }),
                          ]
                        : []),
                    ],
                  }),

                  stac.sizedBox({ height: 12 }),

                  // Move to cart button
                  w.button({
                    text: "Move to Cart",
                    variant: "primary",
                    icon: AppIcons.CART,
                    action: stac.apiRequest({
                      url: `/wishlist/move-to-cart`,
                      method: "POST",
                      body: { productId: product.id },
                      onSuccess: stac.showToast("Moved to cart! 🛒", {
                        nextAction: stac.navigate("/wishlist", "replace"),
                      }),
                    }),
                  }),
                ],
              }),
            }),
          }),
        ],
      }),
    });
  }
}
