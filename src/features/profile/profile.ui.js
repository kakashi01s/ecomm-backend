import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";
import { AuthUI } from "../auth/auth.ui.js";

export class ProfileUI {

  /**
   * buildProfileUi
   * @param {Object|null} user  — authenticated user ({ id, name, email, avatarUrl }) or null for guest
   */
  static buildProfileUi(user = null) {
    const isGuest = !user;

    return stac.scaffold({
      backgroundColor: Brand.background,
      body: {
        type: "hideOnScroll",
        body: stac.customScrollView({
          slivers: [
            // ── App Bar ──────────────────────────────────────────────
            ui.dynamicAppBar({
              titleText: "My Profile",
              isSliver: true,
              pinned: true,
            }),

            // ── Profile header card ──────────────────────────────────
            stac.sliverToBoxAdapter({
              child: ProfileUI._profileHeader(user, isGuest),
            }),

            // ── Guest CTA ────────────────────────────────────────────
            ...(isGuest
              ? [
                  stac.sliverToBoxAdapter({
                    child: stac.padding({
                      left: 16, right: 16, top: 8, bottom: 4,
                      child: w.button({
                        text: "Sign In / Register",
                        action: stac.showDialog(
                          AuthUI.asDialog(AuthUI.emailForm("dialog"))
                        ),
                      }),
                    }),
                  }),
                ]
              : []),

            // ── Account section ──────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: ProfileUI._section("Account", [
                ProfileUI._menuItem({
                  icon: "person_outline",
                  label: "Edit Profile",
                  action: stac.navigate("/profile/edit", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "location_on",
                  label: "Saved Addresses",
                  action: stac.navigate("/profile/addresses", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "payment",
                  label: "Payment Methods",
                  action: stac.navigate("/profile/payments", "push"),
                }),
              ]),
            }),

            // ── Orders section ───────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: ProfileUI._section("Orders", [
                ProfileUI._menuItem({
                  icon: "receipt_long",
                  label: "My Orders",
                  badge: null,
                  action: stac.navigate("/profile/orders", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "local_shipping",
                  label: "Track Order",
                  action: stac.navigate("/profile/orders/track", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "replay",
                  label: "Returns & Refunds",
                  action: stac.navigate("/profile/orders/returns", "push"),
                }),
              ]),
            }),

            // ── Preferences section ──────────────────────────────────
            stac.sliverToBoxAdapter({
              child: ProfileUI._section("Preferences", [
                ProfileUI._menuItem({
                  icon: "notifications_none",
                  label: "Notifications",
                  action: stac.navigate("/settings/notifications", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "lock_outline",
                  label: "Privacy & Security",
                  action: stac.navigate("/settings/privacy", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "help_outline",
                  label: "Help & Support",
                  action: stac.navigate("/help", "push"),
                }),
                ProfileUI._menuItem({
                  icon: "info_outline",
                  label: "About App",
                  action: stac.navigate("/about", "push"),
                }),
              ]),
            }),

            // ── Logout / version ─────────────────────────────────────
            stac.sliverToBoxAdapter({
              child: stac.padding({
                left: 16, right: 16, top: 8, bottom: 0,
                child: isGuest
                  ? stac.sizedBox()
                  : w.button({
                      text: "Logout",
                      variant: "outline",
                      action: stac.apiRequest({
                        url: "/auth/logout",
                        method: "POST",
                        onSuccess: stac.manageSession(
                          "clear",
                          null,
                          stac.navigate("/auth/bootstrap", "replace")
                        ),
                        onError: stac.manageSession(
                          "clear",
                          null,
                          stac.navigate("/auth/bootstrap", "replace")
                        ),
                      }),
                    }),
              }),
            }),

            stac.sliverToBoxAdapter({
              child: stac.padding({
                top: 16, bottom: 8,
                child: stac.center({
                  child: stac.text("Aurora v1.0.0", {
                    style: stac.textStyle({
                      fontSize: 12,
                      color: Brand.textSecondary,
                    }),
                  }),
                }),
              }),
            }),

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

  static _profileHeader(user, isGuest) {
    const avatarWidget = user?.avatarUrl
      ? stac.clipRRect({
          borderRadius: 44,
          child: stac.image({
            src: user.avatarUrl,
            width: 88,
            height: 88,
            fit: "cover",
            errorWidget: ProfileUI._avatarFallback(user?.name),
          }),
        })
      : ProfileUI._avatarFallback(user?.name);

    return stac.container({
      margin: [16, 20, 16, 8],
      decoration: {
        color: Brand.surface,
        borderRadius: Brand.radiusLarge,
        border: { color: Brand.divider, width: 1 },
        boxShadow: [
          { color: "#0000000A", blurRadius: 10, spreadRadius: 0, offset: { dx: 0, dy: 4 } },
        ],
      },
      child: stac.padding({
        all: 24,
        child: stac.row({
          crossAxisAlignment: "center",
          children: [
            // Avatar
            stac.container({
              decoration: {
                borderRadius: 46,
                border: { color: Brand.primary, width: 2.5 },
              },
              padding: [3, 3, 3, 3],
              child: avatarWidget,
            }),

            stac.sizedBox({ width: 16 }),

            // Name & email
            stac.expanded({
              child: stac.column({
                crossAxisAlignment: "start",
                mainAxisSize: "min",
                children: [
                  stac.text(
                    isGuest ? "Welcome, Guest" : (user?.name ?? "Aurora User"),
                    {
                      maxLines: 1,
                      overflow: "ellipsis",
                      style: stac.textStyle({
                        fontSize: 18,
                        fontWeight: "bold",
                        color: Brand.textPrimary,
                      }),
                    }
                  ),
                  stac.sizedBox({ height: 4 }),
                  stac.text(
                    isGuest
                      ? "Sign in to access your account"
                      : (user?.email ?? ""),
                    {
                      maxLines: 1,
                      overflow: "ellipsis",
                      style: stac.textStyle({
                        fontSize: 13,
                        color: Brand.textSecondary,
                      }),
                    }
                  ),
                  ...(!isGuest
                    ? [
                        stac.sizedBox({ height: 10 }),
                        stac.container({
                          padding: [10, 4, 10, 4],
                          decoration: {
                            color: Brand.secondary,
                            borderRadius: 12,
                          },
                          child: stac.text("Premium Member", {
                            style: stac.textStyle({
                              fontSize: 11,
                              fontWeight: "bold",
                              color: Brand.primaryDark,
                            }),
                          }),
                        }),
                      ]
                    : []),
                ],
              }),
            }),

            // Edit arrow
            ...(!isGuest
              ? [
                  stac.inkWell({
                    action: stac.navigate("/profile/edit", "push"),
                    child: stac.container({
                      padding: [8, 8, 8, 8],
                      decoration: {
                        color: Brand.background,
                        borderRadius: Brand.radiusSmall,
                      },
                      child: stac.icon({
                        icon: "edit",
                        color: Brand.primary,
                        size: 18,
                      }),
                    }),
                  }),
                ]
              : []),
          ],
        }),
      }),
    });
  }

  /** Circular avatar fallback with initials */
  static _avatarFallback(name) {
    const initials = name
      ? name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
      : "AU";

    return stac.container({
      width: 88,
      height: 88,
      decoration: {
        color: Brand.secondary,
        borderRadius: 44,
      },
      child: stac.center({
        child: stac.text(initials, {
          style: stac.textStyle({
            fontSize: 28,
            fontWeight: "bold",
            color: Brand.primary,
          }),
        }),
      }),
    });
  }

  /** A labeled section card containing menu items */
  static _section(title, items) {
    return stac.padding({
      left: 16, right: 16, top: 16, bottom: 0,
      child: stac.column({
        crossAxisAlignment: "stretch",
        children: [
          stac.text(title, {
            style: stac.textStyle({
              fontSize: 13,
              fontWeight: "bold",
              color: Brand.textSecondary,
              letterSpacing: 0.8,
            }),
          }),
          stac.sizedBox({ height: 8 }),
          stac.container({
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
              children: items.flatMap((item, idx) =>
                idx < items.length - 1
                  ? [item, stac.divider({ color: Brand.divider, height: 1, thickness: 0.5 })]
                  : [item]
              ),
            }),
          }),
        ],
      }),
    });
  }

  /** Single tappable menu row inside a section */
  static _menuItem({ icon, label, badge = null, action }) {
    return stac.inkWell({
      action,
      child: stac.padding({
        left: 16, right: 16, top: 14, bottom: 14,
        child: stac.row({
          children: [
            stac.container({
              width: 36,
              height: 36,
              decoration: {
                color: Brand.background,
                borderRadius: Brand.radiusSmall,
              },
              child: stac.center({
                child: stac.icon({
                  icon,
                  color: Brand.primary,
                  size: 20,
                }),
              }),
            }),
            stac.sizedBox({ width: 14 }),
            stac.expanded({
              child: stac.text(label, {
                style: stac.textStyle({
                  fontSize: 15,
                  color: Brand.textPrimary,
                  fontWeight: "w500",
                }),
              }),
            }),
            ...(badge
              ? [
                  stac.container({
                    padding: [8, 3, 8, 3],
                    decoration: { color: Brand.primary, borderRadius: 10 },
                    child: stac.text(`${badge}`, {
                      style: stac.textStyle({ fontSize: 11, color: "#FFFFFF", fontWeight: "bold" }),
                    }),
                  }),
                  stac.sizedBox({ width: 8 }),
                ]
              : []),
            stac.icon({ icon: "chevron_right", color: Brand.textSecondary, size: 18 }),
          ],
        }),
      }),
    });
  }
}
