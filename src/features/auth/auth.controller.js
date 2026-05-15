import { AuthService } from "./auth.service.js";
import { Roles } from "../../core/constants.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { verifyRefreshToken, generateAccessToken } from "../../utils/token.util.js";
import { AuthRepository } from "./auth.repository.js";
import { stac } from "../../core/sdui/StacWidgets.js";
import { DashboardController } from "../app/dashboard/dashboard.controller.js";
import { AuthUI } from "./auth.ui.js"; 
import prisma from "../../core/prisma/client.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";
import { StateKeys } from "../../core/constants/stateKeys.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class AuthController {

static async bootstrap(req, res) {
    let user = req.user || null;
    const theme = { primaryColor: "#FF5722", scaffoldBackgroundColor: "#F5F5F5" };

    try {
      // If we have a user ID from token, fetch full details for bootstrap
      if (user && user.id) {
        user = await AuthRepository.findById(user.id);
      }

      const dashboardUi = await DashboardController.getDashboardUiPayload(user);
      
      // Fetch the unified global meta state!
      const metaState = await GlobalStateHelper.getGlobalMeta(user, req.headers);

      // Pre-fill user state if they are already logged in
      if (user) {
        metaState[StateKeys.IS_LOGGED_IN] = true;
        metaState[StateKeys.USER_NAME] = user.name || user.email.split("@")[0];
        metaState[StateKeys.USER_EMAIL] = user.email;
        metaState[StateKeys.USER_ID] = user.id;
      } else {
        metaState[StateKeys.IS_LOGGED_IN] = false;
      }

      return res.json({ 
        theme, 
        ui: dashboardUi, 
        meta: metaState // Inject into GetX automatically
      });
    } catch (err) {
      console.error("Bootstrap Error:", err);
      return res.status(500).json({ message: "Error loading app" });
    }
  }

  // Uses the modular screen wrapper + email form
  static async getLoginScreen(req, res) {
    return res.json({
      ui: AuthUI.asScreen("Sign In", AuthUI.emailForm("screen"))
    });
  }

  static async handleAuthAction(req, res) {
      const { step, email, password, otp, displayType = "screen" } = req.body;

      // Map steps to their specific UI error keys defined in AuthUI.js
      const errorKeyMap = {
        "identify_user": StateKeys.AUTH_EMAIL_ERROR,
        "verify_password": StateKeys.AUTH_PASSWORD_ERROR,
        "verify_otp": StateKeys.AUTH_OTP_ERROR
      };
      const errorKey = errorKeyMap[step];

      try {
        if (step === "identify_user") {
          const authMethod = await AuthService.determineAuthMethod(email);

          if (authMethod === "REQUIRES_PASSWORD") {
             return res.status(200).json({
               nextAction: AuthUI.getNextAuthAction("password", email, displayType)
             });
          } else {
             await AuthService.generateAndSendOtp(email);
             return res.status(200).json({
               nextAction: stac.showToast("OTP sent to your email", {
                  nextAction: AuthUI.getNextAuthAction("otp", email, displayType)
               })
             });
          }
        }

        if (step === "verify_password") {
          const result = await AuthService.verifyPassword(email, password);
          return res.status(200).json({
            nextAction: stac.manageSession("save", result, 
              stac.setGlobalState({ 
                [StateKeys.IS_LOGGED_IN]: true,
                [StateKeys.USER_NAME]: result.user.name || result.user.email.split('@')[0],
                [StateKeys.USER_EMAIL]: result.user.email,
                [StateKeys.USER_ID]: result.user.id,
                [StateKeys.AUTH_PASSWORD_ERROR]: "", 
                [StateKeys.AUTH_OTP_ERROR]: "", 
                [StateKeys.AUTH_EMAIL_ERROR]: "" 
              }, 
              stac.popThen(stac.navigate(null, "pop")))
            )
          });
        }

        if (step === "verify_otp") {
          const result = await AuthService.verifyOtp(email, otp);
          return res.status(200).json({
            nextAction: stac.manageSession("save", result, 
              stac.setGlobalState({ 
                [StateKeys.IS_LOGGED_IN]: true,
                [StateKeys.USER_NAME]: result.user.name || result.user.email.split('@')[0],
                [StateKeys.USER_EMAIL]: result.user.email,
                [StateKeys.USER_ID]: result.user.id,
                [StateKeys.AUTH_PASSWORD_ERROR]: "", 
                [StateKeys.AUTH_OTP_ERROR]: "", 
                [StateKeys.AUTH_EMAIL_ERROR]: "" 
              }, 
              stac.popThen(stac.navigate(null, "pop")))
            )
          });
        }

        return res.status(400).json({ 
          nextAction: stac.showToast("Unknown auth step") 
        });

      } catch (err) {
        // 🔥 NATIVE ERROR HANDLING: Update the UI state instead of just a toast
        if (errorKey) {
          return res.status(400).json({
            nextAction: stac.setGlobalState({ [errorKey]: err.message })
          });
        }
        return res.status(400).json({ nextAction: stac.showToast(err.message) });
      }
  }

  // ==========================================
  // STANDARD REST ROUTES
  // ==========================================

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json(new ApiResponse(400, "Refresh token is required", {}));
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json(new ApiResponse(401, "Refresh token expired. Please login again", {}));
        }
        return res.status(401).json(new ApiResponse(401, "Invalid refresh token", {}));
      }

      const user = await AuthRepository.findById(decoded.id);

      if (!user || (user.refreshToken !== refreshToken)) {
        return res.status(401).json(new ApiResponse(401, "Invalid refresh token", {}));
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        role: user.role,
        email: user.email
      });

      res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, err.message || "Error refreshing token", {}));
    }
  }

  // Logout (clear refresh token)
  static async logout(req, res) {
    try {
      const userId = req.user?.id;
      if (userId) {
        // This will crash if the user was deleted via the seed script
        await AuthRepository.updateRefreshToken(userId, null);
      }
    } catch (err) {
      // Catch the crash silently so the server doesn't throw a 500 error!
      console.log("[AUTH] Logout DB cleanup skipped (user likely already deleted).");
    }

    // ALWAYS return 200 OK. This guarantees the Flutter app receives a success 
    // status and flawlessly executes the local session wipe and navigation.
    return res.status(200).json({
      success: true,
      nextAction: stac.manageSession(
        "clear", 
        null, 
        stac.navigate(Endpoints.AUTH.BOOTSTRAP, "replaceAll")
      )
    });
  }

  // Get current user info
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(new ApiResponse(401, "Not authenticated", {}));
      }

      const user = await AuthRepository.findById(userId);

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found", {}));
      }

      const { password, verificationToken, resetToken, refreshToken, ...userInfo } = user;

      res.status(200).json(new ApiResponse(200, userInfo, "User info retrieved successfully"));
    } catch (err) {
      res.status(500).json(new ApiResponse(500, err.message || "Error retrieving user info", {}));
    }
  }
}