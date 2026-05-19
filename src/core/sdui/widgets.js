import { stac } from "./StacWidgets.js";
import { Brand } from "./components.js";

/**
 * widgets.js — Core UI Primitive Library
 */
export const w = {

  button: ({ text, action, width, height = 50, variant = "primary", loadingColor = "#FFFFFF" }) => {
    const isOutline = variant === "outline";
    
    return stac.sizedBox({
      width: width === "infinity" ? "infinity" : width,
      height,
      child: {
        type: "async_button",
        action: action,
        loadingColor,
        child: stac.container({
          width: width === "infinity" ? "infinity" : width,
          height,
          decoration: {
            color: isOutline ? "transparent" : Brand.primary,
            borderRadius: Brand.radiusMedium,
            border: isOutline ? { color: Brand.primary, width: 1.5 } : null,
          },
          child: stac.center({
            child: stac.text(text, {
              style: stac.textStyle({
                fontSize: 15,
                fontWeight: "w600",
                color: isOutline ? Brand.primary : "#FFFFFF",
                letterSpacing: 0.3,
              }),
            }),
          }),
        }),
      }
    });
  },

  textField: ({
    id,
    hint,
    label,
    type = "text",
    prefixIcon = null,
    validators = [],
    autofocus = false,
    initialValue = null,
    maxLength = null,
    inputFormatters = [],
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
      initialValue,
      maxLength,
      maxLengthEnforcement: "enforced",
      obscureText: t.obscure,
      keyboardType: t.keyboard,
      validators,
      inputFormatters,
      decoration: {
        hintText: hint,
        labelText: label,
        filled: true,
        fillColor: Brand.background,
        prefixIcon: prefixWidget,
        contentPadding: [16, 16, 16, 16],
        border: { type: "outlineInputBorder", borderRadius: Brand.radiusMedium, color: Brand.divider },
        enabledBorder: { type: "outlineInputBorder", borderRadius: Brand.radiusMedium, color: Brand.divider },
        focusedBorder: { type: "outlineInputBorder", borderRadius: Brand.radiusMedium, color: Brand.primary },
        errorBorder: { type: "outlineInputBorder", borderRadius: Brand.radiusMedium, color: Brand.error },
        focusedErrorBorder: { type: "outlineInputBorder", borderRadius: Brand.radiusMedium, color: Brand.error },
      },
    });
  },

  searchBar: ({ hint = "Search collections...", stateKey = "search_query", action }) => {
    return stac.container({
      height: 52,
      decoration: {
        color: Brand.surface,
        borderRadius: 12,
        border: { color: Brand.divider, width: 1 },
        boxShadow: [{ color: "#00000005", blurRadius: 10, spreadRadius: 0, offset: { dx: 0, dy: 4 } }],
      },
      child: stac.inkWell({
        action: action,
        child: stac.padding({
          horizontal: 16,
          child: stac.row({
            children: [
              stac.svg({ src: "search-refraction", color: Brand.textSecondary, width: 20, height: 20 }),
              stac.sizedBox({ width: 12 }),
              stac.text(hint, { style: stac.textStyle({ color: Brand.textSecondary, fontSize: 15 }) }),
            ],
          }),
        }),
      }),
    });
  },

  iconButton: ({ icon, action, color = Brand.textPrimary, size = 24 }) => {
    return stac.inkWell({
      action: action,
      borderRadius: size,
      child: stac.padding({
        all: 8,
        child: stac.svg({ src: icon, color, width: size, height: size }),
      }),
    });
  },

  badgedIconButton: ({ icon, action, color, size, stateKey, badgeType = "cart" }) => {
    const badgeColor = badgeType === "cart" ? Brand.primary : "#4CAF50";
    const resolvedStateKey = stateKey || `${badgeType}Count`;
    
    return stac.center({
      child: stac.badge({
        count: `{{${resolvedStateKey}}}`,
        color: badgeColor,
        textColor: "#FFFFFF",
        position: { top: 2, right: 2 },
        child: w.iconButton({ icon, action, color, size })
      })
    });
  },

  badgeIconButton: (args) => w.badgedIconButton(args)
};
