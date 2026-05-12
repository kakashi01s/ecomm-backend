import { AuthService } from "./auth.service.js";
import { Roles } from "../../core/constants.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { verifyRefreshToken, generateAccessToken } from "../../utils/token.util.js";
import { AuthRepository } from "./auth.repository.js";
import { stac } from "../../core/sdui/StacWidgets.js";
import { DashboardController } from "../app/dashboard/dashboard.controller.js";
import { AuthUI } from "./auth.ui.js"; 
import prisma from "../../core/prisma/client.js"; // <-- Added Prisma import
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";

export class AuthController {

static async bootstrap(req, res) {
    const user = req.user || null;
    const theme = { primaryColor: "#FF5722", scaffoldBackgroundColor: "#F5F5F5" };

    try {
      const dashboardUi = await DashboardController.getDashboardUiPayload(user);
      
      // Fetch the unified global meta state!
      const metaState = await GlobalStateHelper.getGlobalMeta(user, req.headers);

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
      try {
        //  Extract displayType so the server knows how to render the next step!
        const { step, email, password, otp, displayType = "screen" } = req.body;

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

        // When login is successful, "replace" root route to clear all dialogs/bottom sheets automatically!
        if (step === "verify_password") {
          const tokens = await AuthService.verifyPassword(email, password);
          return res.status(200).json({
              nextAction: stac.manageSession("save", tokens, {
          actionType: "server_navigate",
          action: "seamless_replace", 
          url: "/dashboard" 
        })
          });
        }

        if (step === "verify_otp") {
          const tokens = await AuthService.verifyOtp(email, otp);
          return res.status(200).json({
              nextAction: stac.manageSession("save", tokens, {
          actionType: "server_navigate",
          action: "seamless_replace", 
          url: "/dashboard" 
        })
          });
        }

        return res.status(400).json({ nextAction: stac.showToast("Unknown auth step") });

      } catch (err) {
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

      const user = await AuthRepository.findByEmail(decoded.email || "");

      if (!user) {
        const userById = await AuthRepository.updateUser(decoded.id, {});
        if (!userById) {
          return res.status(404).json(new ApiResponse(404, "User not found", {}));
        }
      }

      if (user && user.refreshToken !== refreshToken) {
        return res.status(401).json(new ApiResponse(401, "Invalid refresh token", {}));
      }

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        role: decoded.role,
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
        stac.navigate("/auth/bootstrap", "replaceAll")
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

      const user = await AuthRepository.findByEmail(req.user.email || "");

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