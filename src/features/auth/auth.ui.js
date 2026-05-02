import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";

export class AuthUI {
  
  // ==========================================
  // 1. THE CORE FORMS (The Lego Blocks)
  // ==========================================

  static emailForm(displayType) {
    return stac.form({
      child: stac.column({
        mainAxisSize: "min",
        crossAxisAlignment: "stretch",
        children: [
          stac.text("Welcome", { style: stac.textStyle({ fontSize: 24, fontWeight: "bold", color: Brand.textPrimary }), textAlign: displayType === 'screen' ? "center" : "start" }),
          stac.sizedBox({ height: 8 }),
          stac.text("Sign in to access your cart and saved items.", { style: stac.textStyle({ color: Brand.textSecondary }), textAlign: displayType === 'screen' ? "center" : "start" }),
          stac.sizedBox({ height: 32 }),
          
          stac.textFormField({
            id: "email", 
            labelText: "Email Address",
            keyboardType: "emailAddress",
            prefixIcon: "email",
            validators: [
              { type: "required", message: "Email is required" },
              { type: "email", message: "Enter a valid email address" }
            ]
          }),
          stac.sizedBox({ height: 24 }), 
          
          ui.primaryButton({
            text: "Continue", 
            action: stac.apiRequest({
              url: "/auth/action", 
              method: "POST",
              body: { 
                step: "identify_user", 
                displayType: displayType, // 🚨 Pass context so server knows how to respond!
                email: { actionType: "getFormValue", id: "email" } 
              }
            })
          })
        ]
      })
    });
  }

  static passwordForm(email, displayType) {
    return stac.form({
      child: stac.column({
        mainAxisSize: "min",
        crossAxisAlignment: "stretch",
        children: [
          stac.text("Enter Password", { style: stac.textStyle({ fontSize: 24, fontWeight: "bold", color: Brand.textPrimary }) }),
          stac.sizedBox({ height: 8 }),
          stac.text(`Welcome back, ${email}`, { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
          stac.sizedBox({ height: 24 }),
          
          stac.textFormField({ id: "password", labelText: "Password", obscureText: true, prefixIcon: "lock" }),
          stac.sizedBox({ height: 32 }),
          
          ui.primaryButton({
            text: "Login",
            action: stac.apiRequest({
              url: "/auth/action", 
              method: "POST",
              body: { 
                step: "verify_password", 
                email: email, 
                displayType: displayType,
                password: { actionType: "getFormValue", id: "password" } 
              }
            })
          })
        ]
      })
    });
  }

  static otpForm(email, displayType) {
    return stac.form({
      child: stac.column({
        mainAxisSize: "min",
        crossAxisAlignment: "stretch",
        children: [
          stac.text("Enter OTP", { style: stac.textStyle({ fontSize: 24, fontWeight: "bold", color: Brand.textPrimary }) }),
          stac.sizedBox({ height: 8 }),
          stac.text(`We sent a code to ${email}`, { style: stac.textStyle({ fontSize: 14, color: Brand.textSecondary }) }),
          stac.sizedBox({ height: 24 }),
          
          stac.textFormField({ id: "otp", labelText: "6-Digit Code", keyboardType: "number", prefixIcon: "dialpad" }),
          stac.sizedBox({ height: 32 }),
          
          ui.primaryButton({
            text: "Verify",
            action: stac.apiRequest({
              url: "/auth/action", 
              method: "POST",
              body: { 
                step: "verify_otp", 
                email: email, 
                displayType: displayType,
                otp: { actionType: "getFormValue", id: "otp" } 
              }
            })
          })
        ]
      })
    });
  }

  // ==========================================
  // 2. THE WRAPPERS (The Layout Contexts)
  // ==========================================

  static asScreen(title, formWidget) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      appBar: stac.appBar({ title: title, backgroundColor: Brand.surface, elevation: 1 }),
      body: stac.safeArea({
        child: stac.singleChildScrollView({
          child: stac.padding({ 
            horizontal: 32, vertical: 40,
            child: formWidget
          })
        })
      })
    });
  }

  static asBottomSheet(formWidget) {
    return stac.card({
      margin: 0, elevation: 0, color: Brand.surface, shape: { borderRadius: 24 },
      child: stac.padding({
        left: 24, top: 24, right: 24, bottom: 48,
        child: stac.singleChildScrollView({
          child: stac.column({
            mainAxisSize: "min",
            children: [
              stac.container({ width: 40, height: 4, decoration: { color: Brand.divider, borderRadius: 2 } }),
              stac.sizedBox({ height: 24 }),
              formWidget
            ]
          })
        })
      })
    });
  }

  static asDialog(formWidget) {
    return stac.center({
      child: stac.container({
        width: 400,
        child: stac.card({
          elevation: 4, color: Brand.surface, shape: { borderRadius: Brand.radiusMedium },
          child: stac.padding({ 
            all: 32, 
            child: stac.singleChildScrollView({ child: formWidget }) 
          })
        })
      })
    });
  }

  // ==========================================
  // 3. ACTION ROUTER
  // ==========================================
  
  static getNextAuthAction(step, email, displayType) {
    let form;
    let title;

    if (step === "password") {
      form = AuthUI.passwordForm(email, displayType);
      title = "Enter Password";
    } else if (step === "otp") {
      form = AuthUI.otpForm(email, displayType);
      title = "Enter OTP";
    }

    if (displayType === "bottomSheet") {
      return stac.showBottomSheet(AuthUI.asBottomSheet(form));
    }
    if (displayType === "dialog") {
      return stac.showDialog(AuthUI.asDialog(form));
    }
    
    return stac.navigate(null, "push", AuthUI.asScreen(title, form));
  }
}