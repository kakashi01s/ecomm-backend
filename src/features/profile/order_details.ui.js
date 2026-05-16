import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

const STATUS_CONFIG = {
  PENDING:    { label: "Pending",     color: "#FF9800", bg: "#FFF3E0", icon: "hourglass_empty", desc: "Your order is awaiting confirmation." },
  CONFIRMED:  { label: "Confirmed",   color: "#2196F3", bg: "#E3F2FD", icon: "check_circle_outline", desc: "Your order has been confirmed." },
  PROCESSING: { label: "Processing",  color: "#9C27B0", bg: "#F3E5F5", icon: "autorenew", desc: "We are preparing your items." },
  SHIPPED:    { label: "Shipped",     color: "#00BCD4", bg: "#E0F7FA", icon: "local_shipping", desc: "Your order is on the way." },
  DELIVERED:  { label: "Delivered",   color: "#4CAF50", bg: "#E8F5E9", icon: "done_all", desc: "Order delivered successfully." },
  CANCELLED:  { label: "Cancelled",   color: "#D32F2F", bg: "#FFEBEE", icon: "cancel", desc: "This order was cancelled." },
  RETURN_REQUESTED: { label: "Return Requested", color: "#607D8B", bg: "#ECEFF1", icon: "assignment_return", desc: "Your return request is being reviewed." },
  RETURNED:   { label: "Returned",    color: "#795548", bg: "#EFEBE9", icon: "replay", desc: "The item has been returned." },
  REFUNDED:   { label: "Refunded",    color: "#009688", bg: "#E0F2F1", icon: "account_balance_wallet", desc: "Refund has been processed." },
};

export class OrderDetailsUI {

  static build(order) {
    if (!order) return ui.errorState({ message: "Order not found" });

    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
    const placedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: `Order #${order.id}`,
        isDashboard: false,
      }),
      body: stac.customScrollView({
        slivers: [
          // ── Status Header ──────────────────────────────────────────
          stac.sliverToBoxAdapter({
            child: stac.container({
              padding: [20, 24, 20, 24],
              color: Brand.surface,
              child: stac.column({
                children: [
                  stac.container({
                    padding: [12, 6, 12, 6],
                    decoration: { color: status.bg, borderRadius: 24 },
                    child: stac.row({
                      mainAxisSize: "min",
                      children: [
                        stac.icon({ icon: status.icon, color: status.color, size: 16 }),
                        stac.sizedBox({ width: 6 }),
                        stac.text(status.label, { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: status.color }) }),
                      ]
                    })
                  }),
                  stac.sizedBox({ height: 12 }),
                  stac.text(status.desc, { style: stac.textStyle({ fontSize: 13, color: Brand.textSecondary }) }),
                  stac.sizedBox({ height: 4 }),
                  stac.text(`Placed on ${placedDate}`, { style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }) }),
                ]
              })
            })
          }),

          stac.sliverToBoxAdapter({ child: stac.divider({ color: Brand.divider, height: 1 }) }),

          // ── Delivery Address ───────────────────────────────────────
          stac.sliverToBoxAdapter({
            child: OrderDetailsUI._sectionHeader("Delivery Address")
          }),
          stac.sliverToBoxAdapter({
            child: stac.container({
              padding: [20, 0, 20, 20],
              color: Brand.surface,
              child: stac.column({
                crossAxisAlignment: "start",
                children: [
                  stac.text(order.address?.fullName ?? "Customer", { style: stac.textStyle({ fontSize: 15, fontWeight: "bold" }) }),
                  stac.sizedBox({ height: 4 }),
                  stac.text(`${order.address?.line1}, ${order.address?.line2 ? order.address.line2 + ', ' : ''}${order.address?.city}`, { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                  stac.text(`${order.address?.state} - ${order.address?.postal}`, { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                  stac.sizedBox({ height: 4 }),
                  stac.text(`Phone: ${order.address?.phone}`, { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
                ]
              })
            })
          }),

          stac.sliverToBoxAdapter({ child: stac.divider({ color: Brand.divider, height: 1 }) }),

          // ── Items ──────────────────────────────────────────────────
          stac.sliverToBoxAdapter({
            child: OrderDetailsUI._sectionHeader(`${order.items?.length || 0} Items`)
          }),
          stac.sliverList({
            delegate: {
              type: "sliverChildBuilderDelegate",
              children: (order.items || []).map(item => OrderDetailsUI._itemRow(item))
            }
          }),

          stac.sliverToBoxAdapter({ child: stac.divider({ color: Brand.divider, height: 1 }) }),

          // ── Payment Summary ────────────────────────────────────────
          stac.sliverToBoxAdapter({
            child: OrderDetailsUI._sectionHeader("Payment Summary")
          }),
          stac.sliverToBoxAdapter({
            child: stac.container({
              padding: [20, 0, 20, 32],
              color: Brand.surface,
              child: stac.column({
                children: [
                  OrderDetailsUI._summaryRow("Subtotal", `₹${(order.totalAmount - 50).toFixed(2)}`),
                  OrderDetailsUI._summaryRow("Shipping Fee", "₹50.00"),
                  stac.sizedBox({ height: 12 }),
                  stac.divider({ color: Brand.divider, height: 1 }),
                  stac.sizedBox({ height: 12 }),
                  stac.row({
                    mainAxisAlignment: "spaceBetween",
                    children: [
                      stac.text("Total Amount", { style: stac.textStyle({ fontSize: 16, fontWeight: "bold" }) }),
                      stac.text(`₹${(order.totalAmount || 0).toFixed(2)}`, { style: stac.textStyle({ fontSize: 18, fontWeight: "bold", color: Brand.primary }) }),
                    ]
                  }),
                ]
              })
            })
          }),

          // ── Actions ────────────────────────────────────────────────
          stac.sliverToBoxAdapter({
            child: stac.padding({
              all: 20,
              child: stac.column({
                children: [
                  w.button({ text: "Download Invoice", variant: "outline", action: stac.showToast("Invoice feature coming soon!") }),
                  stac.sizedBox({ height: 12 }),
                  order.status === "DELIVERED" 
                    ? w.button({ text: "Return Items", variant: "outline", action: stac.showToast("Please contact support for returns") })
                    : stac.sizedBox(),
                ]
              })
            })
          }),

          stac.sliverToBoxAdapter({ child: stac.sizedBox({ height: 50 }) }),
        ]
      })
    });
  }

  static _sectionHeader(title) {
    return stac.padding({
      left: 20, top: 24, bottom: 12,
      child: stac.text(title, { style: stac.textStyle({ fontSize: 14, fontWeight: "bold", color: Brand.textSecondary, letterSpacing: 0.5 }) })
    });
  }

  static _itemRow(item) {
    return stac.container({
      padding: [20, 12, 20, 12],
      color: Brand.surface,
      child: stac.row({
        crossAxisAlignment: "start",
        children: [
          stac.clipRRect({
            borderRadius: 8,
            child: stac.image({ src: item.product?.images?.[0]?.url || "https://via.placeholder.com/80", width: 64, height: 64, fit: "cover" })
          }),
          stac.sizedBox({ width: 16 }),
          stac.expanded({
            child: stac.column({
              crossAxisAlignment: "start",
              children: [
                stac.text(item.product?.name || "Product", { maxLines: 2, overflow: "ellipsis", style: stac.textStyle({ fontSize: 14, fontWeight: "w500" }) }),
                stac.sizedBox({ height: 4 }),
                stac.text(`Qty: ${item.quantity}`, { style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }) }),
              ]
            })
          }),
          stac.text(`₹${(item.price * item.quantity).toFixed(2)}`, { style: stac.textStyle({ fontSize: 14, fontWeight: "bold" }) })
        ]
      })
    });
  }

  static _summaryRow(label, value) {
    return stac.padding({
      bottom: 8,
      child: stac.row({
        mainAxisAlignment: "spaceBetween",
        children: [
          stac.text(label, { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
          stac.text(value, { style: stac.textStyle({ fontSize: 14, fontWeight: "w500" }) }),
        ]
      })
    });
  }
}
