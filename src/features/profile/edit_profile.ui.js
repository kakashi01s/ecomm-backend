import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { w } from "../../core/sdui/widgets.js";
import { AppIcons } from "../../core/constants/icons.js";

export class EditProfileUI {

  static build(user) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: ui.dynamicAppBar({
        titleText: "Edit Profile",
        isDashboard: false,
      }),
      body: stac.singleChildScrollView({
        child: stac.padding({
          all: 16,
          child: stac.form({
            child: stac.column({
              crossAxisAlignment: "stretch",
              children: [

                // ── Avatar ───────────────────────────────────────────
                stac.center({
                  child: stac.stack({
                    alignment: "bottomRight",
                    children: [
                      stac.container({
                        width: 96,
                        height: 96,
                        decoration: {
                          borderRadius: 48,
                          border: { color: Brand.primary, width: 2.5 },
                        },
                        padding: [3, 3, 3, 3],
                        child: user?.avatarUrl
                          ? stac.clipRRect({
                              borderRadius: 44,
                              child: stac.image({
                                src: user.avatarUrl,
                                width: 88,
                                height: 88,
                                fit: "cover",
                              }),
                            })
                          : stac.container({
                              width: 88,
                              height: 88,
                              decoration: {
                                color: Brand.secondary,
                                borderRadius: 44,
                              },
                              child: stac.center({
                                child: stac.text(
                                  EditProfileUI._initials(user?.name),
                                  {
                                    style: stac.textStyle({
                                      fontSize: 28,
                                      fontWeight: "bold",
                                      color: Brand.primary,
                                    }),
                                  }
                                ),
                              }),
                            }),
                      }),
                      stac.container({
                        width: 28,
                        height: 28,
                        decoration: {
                          color: Brand.primary,
                          borderRadius: 14,
                        },
                        child: stac.center({
                          child: stac.icon({ icon: "edit", color: "#FFFFFF", size: 14 }),
                        }),
                      }),
                    ],
                  }),
                }),

                stac.sizedBox({ height: 28 }),

                // ── Fields ───────────────────────────────────────────
                w.textField({
                  id: "name",
                  hint: "Full name",
                  label: "Full Name",
                  type: "text",
                  prefixIcon: AppIcons.PERSON,
                  validators: [{ type: "required", message: "Name is required" }],
                }),
                stac.sizedBox({ height: 14 }),

                // Email read-only display
                stac.container({
                  padding: [16, 16, 16, 16],
                  decoration: {
                    color: Brand.background,
                    borderRadius: Brand.radiusMedium,
                    border: { color: Brand.divider, width: 1 },
                  },
                  child: stac.row({
                    children: [
                      stac.padding({
                        all: 12,
                        child: stac.svg({
                          src: AppIcons.MAIL,
                          color: Brand.textSecondary,
                          width: 20,
                          height: 20,
                        }),
                      }),
                      stac.sizedBox({ width: 8 }),
                      stac.column({
                        crossAxisAlignment: "start",
                        mainAxisSize: "min",
                        children: [
                          stac.text("Email", {
                            style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary }),
                          }),
                          stac.sizedBox({ height: 2 }),
                          stac.text(user?.email ?? "", {
                            style: stac.textStyle({ fontSize: 15, color: Brand.textPrimary }),
                          }),
                        ],
                      }),
                    ],
                  }),
                }),

                stac.sizedBox({ height: 14 }),

                w.textField({
                  id: "phone",
                  hint: "Phone number",
                  label: "Phone",
                  type: "phone",
                  prefixIcon: AppIcons.CELLPHONE,
                }),

                stac.sizedBox({ height: 28 }),

                // ── Save ─────────────────────────────────────────────
                w.button({
                  text: "Save Changes",
                  action: stac.apiRequest({
                    url: "/profile/edit",
                    method: "POST",
                    onSuccess: stac.showToast("Profile updated!", {
                      backgroundColor: Brand.success,
                      textColor: "#FFFFFF",
                      nextAction: stac.navigate(null, "pop"),
                    }),
                    onError: stac.showToast("Update failed. Try again.", {
                      backgroundColor: Brand.error,
                      textColor: "#FFFFFF",
                    }),
                  }),
                }),

                stac.sizedBox({ height: 32 }),
              ],
            }),
          }),
        }),
      }),
    });
  }

  static _initials(name) {
    if (!name) return "AU";
    return name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  }
}
