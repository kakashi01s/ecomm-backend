/**
 * widgets.js — Core UI Primitive Library
 *
 * This sits BETWEEN StacWidgets.js (raw primitives) and components.js (page builders).
 * Every button, text field, search bar, and icon button in the app comes from here.
 *
 * Usage: import { w } from "./widgets.js";
 */

import { stac } from "./StacWidgets.js";
import { Brand } from "./components.js";
import { AppIcons } from "../constants/icons.js";

export const w = {

  // ─────────────────────────────────────────────────────────────────────
  // BUTTON
  //
  // variants: "primary" | "secondary" | "ghost" | "destructive" | "outline"
  // Usage: w.button({ text, action, variant, fullWidth, icon })
  //
  // Flutter side: rendered as inkWell > container — no ElevatedButton,
  // so we get full control over shape, padding, and color without theme fights.
  // ─────────────────────────────────────────────────────────────────────
  button: ({
    text,
    action,
    variant = "primary",
    fullWidth = true,
    icon = null,
  }) => {
    const configs = {
      primary: {
        bg: Brand.primary,
        fg: "#FFFFFF",
        border: null,
      },
      secondary: {
        bg: Brand.secondary,
        fg: Brand.primaryDark,
        border: null,
      },
      ghost: {
        bg: "transparent",
        fg: Brand.primary,
        border: { color: Brand.primary, width: 1.5 },
      },
      destructive: {
        bg: Brand.error,
        fg: "#FFFFFF",
        border: null,
      },
      outline: {
        bg: Brand.surface,
        fg: Brand.textPrimary,
        border: { color: Brand.divider, width: 1 },
      },
    };

    const c = configs[variant] ?? configs.primary;

    const label = stac.text(text, {
      style: stac.textStyle({
        fontSize: 15,
        fontWeight: "w600",
        color: c.fg,
        letterSpacing: 0.3,
      }),
    });

    // If an icon is provided, put it left of the label
    const innerContent =
      icon !== null
        ? stac.row({
            mainAxisSize: "min",
            mainAxisAlignment: "center",
            children: [
              stac.svg({
                src: icon,
                color: c.fg,
                width: 18,
                height: 18,
              }),
              stac.sizedBox({ width: 8 }),
              label,
            ],
          })
        : label;

const buttonBody = stac.asyncButton({
      action,
      loadingColor: c.fg, // The spinner will perfectly match the text color!
      child: stac.container({
        height: 50,
        width: fullWidth ? "infinity" : null,
        padding: fullWidth ? null : [32, 0, 32, 0],
        decoration: {
          color: c.bg,
          borderRadius: Brand.radiusMedium,
          border: c.border,
        },
        child: stac.center({ child: innerContent }),
      }),
    });

    return fullWidth
      ? stac.sizedBox({ width: "infinity", height: 50, child: buttonBody })
      : buttonBody;
  },

  // ─────────────────────────────────────────────────────────────────────
  // TEXT FIELD
  //
  // types: "text" | "email" | "password" | "number" | "phone"
  // prefixIcon: AppIcons key string (e.g. AppIcons.LOCK)
  //
  // Consistent border radius + fill across every form in the app.
  // Uses stac.textFormField so validators work inside stac.form.
  // ─────────────────────────────────────────────────────────────────────
  textField: ({
    id,
    hint,
    label,
    type = "text",
    prefixIcon = null,
    validators = [],
    autofocus = false,
  }) => {
    const typeMap = {
      email:    { keyboard: "emailAddress", obscure: false },
      password: { keyboard: "text",         obscure: true  },
      number:   { keyboard: "number",       obscure: false },
      phone:    { keyboard: "phone",        obscure: false },
      text:     { keyboard: "text",         obscure: false },
    };

    const t = typeMap[type] ?? typeMap.text;

    const prefixWidget = prefixIcon
      ? stac.padding({
          all: 12,
          child: stac.svg({
            src: prefixIcon,
            color: Brand.textSecondary,
            width: 20,
            height: 20,
          }),
        })
      : undefined;

    return stac.textFormField({
      id,
      autofocus,
      obscureText: t.obscure,
      keyboardType: t.keyboard,
      validators,
      decoration: {
        hintText: hint,
        labelText: label,
        filled: true,
        fillColor: Brand.background,
        prefixIcon: prefixWidget,
        contentPadding: [16, 16, 16, 16],
        border: {
          type: "outlineInputBorder",
          borderRadius: Brand.radiusMedium,
          color: Brand.divider,
        },
        enabledBorder: {
          type: "outlineInputBorder",
          borderRadius: Brand.radiusMedium,
          color: Brand.divider,
        },
        focusedBorder: {
          type: "outlineInputBorder",
          borderRadius: Brand.radiusMedium,
          color: Brand.primary,
        },
        errorBorder: {
          type: "outlineInputBorder",
          borderRadius: Brand.radiusMedium,
          color: Brand.error,
        },
        focusedErrorBorder: {
          type: "outlineInputBorder",
          borderRadius: Brand.radiusMedium,
          color: Brand.error,
        },
      },
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // SEARCH BAR
  //
  // isReadOnly: true  → pill that navigates to /search (dashboard use)
  // isReadOnly: false → live text field with onChanged API call (search page)
  // ─────────────────────────────────────────────────────────────────────
  searchBar: ({
    hintText = "Search products...",
    isReadOnly = true,
    onTapAction = null,
    inputId = "search_query",
    autofocus = false,
  }) => {
    if (isReadOnly) {
      return stac.inkWell({
        action: onTapAction ?? stac.navigate("/search", "push"),
        child: stac.container({
          height: 46,
          padding: [16, 0, 16, 0],
          decoration: {
            color: Brand.background,
            borderRadius: 24,
            border: { color: Brand.divider, width: 1 },
          },
          child: stac.row({
            children: [
              stac.svg({
                src: AppIcons.SEARCH,
                color: Brand.textSecondary,
                width: 18,
                height: 18,
              }),
              stac.sizedBox({ width: 10 }),
              stac.expanded({
                child: stac.text(hintText, {
                  maxLines: 1,
                  overflow: "ellipsis",
                  style: stac.textStyle({
                    color: Brand.textSecondary,
                    fontSize: 14,
                  }),
                }),
              }),
            ],
          }),
        }),
      });
    }

// Live variant — used on the search screen
    return stac.container({
      height: 46,
      child: stac.textField({
        id: inputId, // defaults to "search_query"
        autofocus,
        // The magic happens here: omitting 'body' tells STAC to auto-send the form value!
        onChanged: stac.apiRequest({
          url: "/search/live", 
          method: "POST",
        }),
        decoration: {
          hintText,
          filled: true,
          fillColor: Brand.background,
          suffixIcon: stac.padding({
            all: 12,
            child: stac.svg({
              src: AppIcons.SEARCH,
              color: Brand.primary,
              width: 20,
              height: 20,
            }),
          }),
          contentPadding: [16, 0, 16, 0],
          border: {
            type: "outlineInputBorder",
            borderRadius: 24,
            color: Brand.divider,
          },
          enabledBorder: {
            type: "outlineInputBorder",
            borderRadius: 24,
            color: Brand.divider,
          },
          focusedBorder: {
            type: "outlineInputBorder",
            borderRadius: 24,
            color: Brand.primary,
          },
        },
      }),
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // ICON BUTTON
  //
  // Wraps any AppIcons key with consistent tap target + padding.
  // Usage: w.iconButton({ icon: AppIcons.CART, action: stac.navigate("/cart") })
  // ─────────────────────────────────────────────────────────────────────
  iconButton: ({
    icon,
    action,
    color = null,
    size = 22,
    padding = 8,
  }) =>
    stac.inkWell({
      action,
      child: stac.padding({
        all: padding,
        child: stac.svg({
          src: icon,
          color: color ?? Brand.textPrimary,
          width: size,
          height: size,
        }),
      }),
    }),

  // ─────────────────────────────────────────────────────────────────────
  // BADGED ICON BUTTON
  //
  // Drop-in upgrade of w.iconButton — identical tap target but renders a
  // live notification bubble in the top-right corner of the icon.
  //
  // count      — integer. Badge is invisible when count === 0.
  // maxCount   — values above this show as "{maxCount}+" (default 99)
  // badgeColor — pill background, defaults to Brand.error (red)
  //
  // Usage:
  //   w.badgedIconButton({
  //     icon:   AppIcons.CART,
  //     count:  cartItemCount,        // e.g. product.cartCount from API
  //     action: stac.navigate("/cart"),
  //   })
  // ─────────────────────────────────────────────────────────────────────
  badgedIconButton: ({
    icon,
    action,
    count = 0,
    color = null,
    size = 22,
    padding = 8,
    badgeColor = Brand.error,
    maxCount = 99,
  }) => {
    const clampedCount = count > maxCount ? maxCount + 1 : count;

    const iconWidget = stac.inkWell({
      action,
      child: stac.padding({
        all: padding,
        child: stac.svg({
          src: icon,
          color: color ?? Brand.textPrimary,
          width: size,
          height: size,
        }),
      }),
    });

    // Skip the badge node entirely when nothing to show — keeps JSON lean.
    if (clampedCount <= 0) return iconWidget;

    return stac.badge({
      count: clampedCount,
      color: badgeColor,
      textColor: "#FFFFFF",
      size: 16,
      // Nudge the pill so it straddles the top-right edge of the icon —
      // matching native Android / iOS badge placement.
      position: { top: 2, right: 2 },
      child: iconWidget,
    });
  },
};