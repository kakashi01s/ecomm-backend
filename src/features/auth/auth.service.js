import bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.util.js";
import { sendEmail } from "../../utils/emailHandler.js";

// Import Roles for safe handling of role defaults/checks
import { Roles } from "../../core/constants.js";

export class AuthService {
  /**
   * Step 1: Handles Login, Resend Verification, or Initial Creation.
   */
  static async handleLoginOrStartCreation({ email, name, role }) {
    const existingUser = await AuthRepository.findByEmail(email);

    if (existingUser) {
      // --- Case 1 & 2: User exists ---
      if (existingUser.isVerified) {
        // Case 1: Verified User -> Send OTP for Login
        await OtpService.sendOtp(email);
        return { message: `Login OTP sent to your email ${email}` };
      } else {
        // Case 2: Unverified User -> Resend OTP for Verification/Completion
        // Optionally update other details like name/role if provided
        await AuthRepository.updateUser(existingUser.id, {
          name: name || existingUser.name,
          role: role || existingUser.role,
          // We don't need to update password unless explicitly requested for security
        });
        await OtpService.sendOtp(email);
        return {
          message: `Verification OTP resent to your email ${email}. Please complete sign-up.`,
        };
      }
    } else {
      // --- Case 3: User does not exist -> Create User and Send OTP for Verification ---

      // NOTE: Your Prisma schema requires a 'password' field. Hash the email as a placeholder
      // since the login flow is OTP-only.

      // Create user record with isVerified: false
      await AuthRepository.createUser({
        name,
        email,
        role: role || Roles.CUSTOMER,
        isVerified: false,
      });

      // Send OTP for verification
      await OtpService.sendOtp(email);
      return {
        message: `New user record created. Verification OTP sent to ${email}.`,
      };
    }
  }

  /**
   * Step 2: Handles OTP verification and completes the Login or Creation process.
   */
  static async handleVerifyAndComplete(email, otp) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error(`User not found with email ${email}`);

    // 1. Verify OTP (Clears token on success or throws on failure/expiry)
    await OtpService.verifyOtp(email, otp);

    let finalUser = user;

    // 2. Check if the user was unverified and finalize creation if necessary
    if (!user.isVerified) {
      // Finalize creation: set isVerified = true
      // We use the result of updateUser as finalUser to ensure we have the latest record data
      finalUser = await AuthRepository.updateUser(user.id, {
        isVerified: true,
      });
    }

    // --- FIX FOR JWT SIZE START ---
    // 1. Create a minimal payload for the Access Token
    const accessPayload = {
      id: user.id,
      role: user.role,
      // Do NOT include user.verificationToken, user.createdAt, user.refreshToken, etc.
    };

    // 2. Create a minimal payload for the Refresh Token
    const refreshPayload = {
      id: user.id,
      role: user.role,
    };
    // --- FIX FOR JWT SIZE END ---

    const accessToken = generateAccessToken(accessPayload); // Use the minimal payload
    const refreshToken = generateRefreshToken(refreshPayload); // Use the minimal payload

    // 4. Store refresh token in DB
    await AuthRepository.updateRefreshToken(finalUser.id, refreshToken);

    // 5. SANITIZE USER OBJECT AND ATTACH TOKENS FOR RESPONSE
    // Use destructuring to omit sensitive/internal fields from the response payload
    const {
      password, // Omit
      verificationToken, // Omit
      resetToken, // Omit
      refreshToken: storedRefreshToken, // Omit the stored (potentially hashed) token
      ...userForResponse // Keep all other fields (id, name, email, role, isVerified, etc.)
    } = finalUser;

    // Attach the newly generated tokens to the sanitized object
    userForResponse.accessToken = accessToken;
    userForResponse.refreshToken = refreshToken;

    const message = user.isVerified
      ? "Logged in successfully"
      : "User verified and logged in successfully";

    console.log("verified token");
    // Return the sanitized user object
    return { message, user: userForResponse };
  }
}

// --- OtpService: Updated to use AuthRepository's verificationToken methods ---
export class OtpService {
  // Generate 6-digit OTP
  static generateOtp(length = 6) {
    return Math.floor(100000 + Math.random() * 900000)
      .toString()
      .slice(0, length);
  }

  // Send OTP to user's email and save in DB
  static async sendOtp(email) {
    const otp = this.generateOtp();

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Set expiry: Format: `${otp}:${expiryTimestamp}`
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes (as timestamp number)
    const token = `${otp}:${expiresAt}`;

    // Save token to user.verificationToken
    await AuthRepository.saveVerificationToken(email, token);

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: `Your OTP for ${process.env.APP_NAME}`,
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return otp;
  }

  // Verify OTP
  static async verifyOtp(email, otp) {
    // Get token from user.verificationToken field
    const token = await AuthRepository.getVerificationToken(email);
    if (!token)
      throw new Error("OTP not found or expired. Please request a new one.");

    const [savedOtp, expiresAtString] = token.split(":");
    const expiresAt = parseInt(expiresAtString);

    if (Date.now() > expiresAt) {
      // Clear token after expiry check
      await AuthRepository.clearVerificationToken(email);
      throw new Error("OTP expired");
    }

    if (savedOtp !== otp) {
      throw new Error("Invalid OTP");
    }

    // Clear token after successful verification
    await AuthRepository.clearVerificationToken(email);

    return true;
  }
}
