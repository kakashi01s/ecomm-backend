import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

const STATUS_CONFIG = {
  PENDING:    { label: "Pending",     color: "#FF9800", bg: "#FFF3E0", icon: "hourglass_empty" },
  CONFIRMED:  { label: "Confirmed",   color: "#2196F3", bg: "#E3F2FD", icon: "check_circle_outline" },
  PROCESSING: { label: "Processing",  color: "#9C27B0", bg: "#F3E5F5", icon: "autorenew" },
  SHIPPED:    { label: "Shipped",     color: "#00BCD4", bg: "#E0F7FA", icon: "local_shipping" },
  DELIVERED:  { label: "Delivered",   color: "#4CAF50", bg: "#E8F5E9", icon: "done_all" },
  CANCELLED:  { label: "Cancelled",   color: "#D32F2F", bg: "#FFEBEE", icon: "cancel" },
  RETURNED:   { label: "Returned",    color: "#795548", bg: "#EFEBE9", icon: "replay" },
};

export class OrdersListUI {

  static build(orders = []) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      body: stac.customScrollView({
        slivers: [
          ui.dynamicAppBar({
            titleText: "My Orders",
            isDashboard: false,
            isSliver: true,
            pinned: true,
          }),

          orders.length === 0
            ? stac.sliverToBoxAdapter({ child: OrdersListUI._emptyState() })
            : stac.sliverToBoxAdapter({
                child: stac.listView({
                  shrinkWrap: true,
                  padding: [16, 16, 16, 32],
                  children: orders.map((order) => OrdersListUI._orderCard(order)),
                }),
              }),
        ],
      }),
    });
  }

  static _orderCard(order) {
    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
    const firstItem = order.items?.[0];
    const extraCount = (order.items?.length ?? 1) - 1;
    const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return stac.inkWell({
      action: stac.navigate(`/orders/${order.id}`, "push"),
      child: stac.container({
        margin: [0, 0, 0, 14],
        decoration: {
          color: Brand.surface,
          borderRadius: Brand.radiusMedium,
          border: { color: Brand.divider, width: 1 },
          boxShadow: [
            { color: "#0000000A", blurRadius: 6, spreadRadius: 0, offset: { dx: 0, dy: 2 } },
          ],
        },
        child: stac.column({
          crossAxisAlignment: "stretch",
          children: [

            // ── Order header ────────────────────────────────────────
            stac.padding({
              left: 16, right: 16, top: 14, bottom: 12,
              child: stac.row({
                children: [
                  stac.expanded({
                    child: stac.column({
                      crossAxisAlignment: "start",
                      mainAxisSize: "min",
                      children: [
                        stac.text(`Order #${order.id}`, {
                          style: stac.textStyle({
                            fontSize: 14,
                            fontWeight: "bold",
                            color: Brand.textPrimary,
                          }),
                        }),
                        stac.sizedBox({ height: 3 }),
                        stac.text(placedDate, {
                          style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }),
                        }),
                      ],
                    }),
                  }),
                  // Status pill
                  stac.container({
                    padding: [10, 5, 10, 5],
                    decoration: {
                      color: status.bg,
                      borderRadius: 20,
                    },
                    child: stac.row({
                      mainAxisSize: "min",
                      children: [
                        stac.icon({ icon: status.icon, color: status.color, size: 13 }),
                        stac.sizedBox({ width: 4 }),
                        stac.text(status.label, {
                          style: stac.textStyle({
                            fontSize: 12,
                            fontWeight: "bold",
                            color: status.color,
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            }),

            stac.divider({ color: Brand.divider, height: 1, thickness: 0.5 }),

            // ── First product preview ───────────────────────────────
            stac.padding({
              left: 16, right: 16, top: 12, bottom: 12,
              child: stac.row({
                crossAxisAlignment: "center",
                children: [
                  // Thumbnail
                  stac.clipRRect({
                    borderRadius: Brand.radiusSmall,
                    child: stac.image({
                      src: firstItem?.product?.images?.[0] ?? "https://via.placeholder.com/64",
                      width: 60,
                      height: 60,
                      fit: "cover",
                    }),
                  }),
                  stac.sizedBox({ width: 12 }),
                  stac.expanded({
                    child: stac.column({
                      crossAxisAlignment: "start",
                      mainAxisSize: "min",
                      children: [
                        stac.text(firstItem?.product?.name ?? "Product", {
                          maxLines: 2,
                          overflow: "ellipsis",
                          style: stac.textStyle({
                            fontSize: 14,
                            color: Brand.textPrimary,
                            fontWeight: "w500",
                          }),
                        }),
                        ...(extraCount > 0
                          ? [
                              stac.sizedBox({ height: 4 }),
                              stac.text(`+${extraCount} more item${extraCount > 1 ? "s" : ""}`, {
                                style: stac.textStyle({
                                  fontSize: 12,
                                  color: Brand.textSecondary,
                                }),
                              }),
                            ]
                          : []),
                      ],
                    }),
                  }),
                ],
              }),
            }),

            stac.divider({ color: Brand.divider, height: 1, thickness: 0.5 }),

            // ── Footer: total + action ──────────────────────────────
            stac.padding({
              left: 16, right: 16, top: 12, bottom: 14,
              child: stac.row({
                children: [
                  stac.expanded({
                    child: stac.column({
                      crossAxisAlignment: "start",
                      mainAxisSize: "min",
                      children: [
                        stac.text("Total", {
                          style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }),
                        }),
                        stac.text(`₹${(order.totalAmount ?? 0).toFixed(2)}`, {
                          style: stac.textStyle({
                            fontSize: 16,
                            fontWeight: "bold",
                            color: Brand.textPrimary,
                          }),
                        }),
                      ],
                    }),
                  }),
                  stac.row({
                    mainAxisSize: "min",
                    children: [
                      stac.text("View Details", {
                        style: stac.textStyle({
                          fontSize: 13,
                          color: Brand.primary,
                          fontWeight: "w600",
                        }),
                      }),
                      stac.sizedBox({ width: 4 }),
                      stac.icon({ icon: "chevron_right", color: Brand.primary, size: 16 }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
    });
  }

  static _emptyState() {
    return stac.padding({
      top: 80,
      child: stac.center({
        child: stac.column({
          mainAxisSize: "min",
          children: [
            stac.icon({ icon: "receipt_long", color: Brand.divider, size: 80 }),
            stac.sizedBox({ height: 16 }),
            stac.text("No orders yet", {
              style: stac.textStyle({
                fontSize: 18,
                fontWeight: "bold",
                color: Brand.textPrimary,
              }),
            }),
            stac.sizedBox({ height: 8 }),
            stac.text("Your order history will appear here", {
              style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }),
            }),
            stac.sizedBox({ height: 28 }),
            stac.padding({
              left: 48, right: 48,
              child: w.button({
                text: "Start Shopping",
                action: stac.navigate("/", "replace"),
              }),
            }),
          ],
        }),
      }),
    });
  }
}
