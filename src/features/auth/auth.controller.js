import { AuthService } from "./auth.service.js";
import { Roles } from "../../core/constants.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  verifyRefreshToken,
  generateAccessToken,
} from "../../utils/token.util.js";
import { AuthRepository } from "./auth.repository.js";

export class AuthController {
  // Step 1: Unified route to start Login or Signup
  static async loginOrStartCreation(req, res) {
    try {
      console.log("[AUTH] Login/Signup request received:", req.body);

      const { email, name } = req.body;
      const role = req.body.role || Roles.CUSTOMER;

      if (!email) {
        console.log("[AUTH] Error: Email is missing");
        return res
          .status(400)
          .json(new ApiResponse(400, "Email is required", {}));
      }

      const result = await AuthService.handleLoginOrStartCreation({
        email,
        name: name || null,
        role,
      });

      console.log("[AUTH] Login/Signup successful:", result.message);

      res.status(200).json(new ApiResponse(200, { email }, result.message));
    } catch (err) {
      console.error("[AUTH] Login/Signup error:", err);

      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            err.message || "Error starting authentication flow",
            {}
          )
        );
    }
  }

  // Step 2: Unified route to verify OTP (for Login or Finalize Creation)
  static async verifyLoginOrCreation(req, res) {
    try {
      console.log("[AUTH] Verify request received:", { email: req.body.email });

      const { email, otp } = req.body;

      if (!email || !otp) {
        console.log("[AUTH] Error: Email or OTP is missing");
        return res
          .status(400)
          .json(new ApiResponse(400, "Email and OTP are required", {}));
      }

      const result = await AuthService.handleVerifyAndComplete(email, otp);

      console.log("[AUTH] Verification successful");

      res.status(200).json(new ApiResponse(200, result.user, result.message));
    } catch (err) {
      console.error("[AUTH] Verification error:", err);

      res
        .status(400)
        .json(new ApiResponse(400, err.message || "Error verifying OTP", {}));
    }
  }

  // Step 3: Refresh access token using refresh token
  static async refreshToken(req, res) {
    try {
      console.log("[AUTH] Refresh token request received");

      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Refresh token is required", {}));
      }

      // Verify the refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json(
              new ApiResponse(
                401,
                "Refresh token expired. Please login again",
                {}
              )
            );
        }
        return res
          .status(401)
          .json(new ApiResponse(401, "Invalid refresh token", {}));
      }

      // Get user from database
      const user = await AuthRepository.findByEmail(decoded.email || "");

      if (!user) {
        // Fallback: try to find by ID if email is not in token
        const userById = await AuthRepository.updateUser(decoded.id, {});
        if (!userById) {
          return res
            .status(404)
            .json(new ApiResponse(404, "User not found", {}));
        }
      }

      // Check if the refresh token matches the one stored in DB
      if (user && user.refreshToken !== refreshToken) {
        return res
          .status(401)
          .json(new ApiResponse(401, "Invalid refresh token", {}));
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        role: decoded.role,
      });

      console.log("[AUTH] New access token generated");

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { accessToken: newAccessToken },
            "Access token refreshed successfully"
          )
        );
    } catch (err) {
      console.error("[AUTH] Refresh token error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, err.message || "Error refreshing token", {})
        );
    }
  }

  // Step 4: Logout (clear refresh token)
  static async logout(req, res) {
    try {
      console.log("[AUTH] Logout request received");

      // Get user ID from authenticated request
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(new ApiResponse(401, "Not authenticated", {}));
      }

      // Clear refresh token from database
      await AuthRepository.updateRefreshToken(userId, null);

      console.log("[AUTH] User logged out successfully");

      res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
    } catch (err) {
      console.error("[AUTH] Logout error:", err);

      res
        .status(500)
        .json(new ApiResponse(500, err.message || "Error logging out", {}));
    }
  }

  // Step 5: Get current user info
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(new ApiResponse(401, "Not authenticated", {}));
      }

      const user = await AuthRepository.findByEmail(req.user.email || "");

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found", {}));
      }

      // Sanitize user object
      const {
        password,
        verificationToken,
        resetToken,
        refreshToken,
        ...userInfo
      } = user;

      res
        .status(200)
        .json(
          new ApiResponse(200, userInfo, "User info retrieved successfully")
        );
    } catch (err) {
      console.error("[AUTH] Get current user error:", err);

      res
        .status(500)
        .json(
          new ApiResponse(500, err.message || "Error retrieving user info", {})
        );
    }
  }
}
