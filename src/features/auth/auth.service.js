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
   * STEP 0: Check how this user should log in
   */
  static async determineAuthMethod(email) {
    const user = await AuthRepository.findByEmail(email);
    
    // If the user exists and has a password set, they use the Password screen
    if (user && user.password) {
      return "REQUIRES_PASSWORD";
    }
    
    // Otherwise, they are new or strictly use OTP
    return "REQUIRES_OTP";
  }

  /**
   * STEP 1: Generate and Send OTP.
   * If the user doesn't exist, create an unverified placeholder account.
   */
  static async generateAndSendOtp(email) {
    let user = await AuthRepository.findByEmail(email);

    if (!user) {
      // Create a new unverified user if they do not exist
      user = await AuthRepository.createUser({
        email,
        name: email.split("@")[0], // Fallback name from email
        role: Roles.CUSTOMER,
        isVerified: false,
      });
    }

    // Generate and email the OTP using your existing OtpService
    await OtpService.sendOtp(email);
    return true;
  }

  /**
   * STEP 2A: Verify Password Login
   */
  static async verifyPassword(email, password) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("User not found.");
    if (!user.password) throw new Error("This account uses OTP to login.");

    // Check Password Hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password.");

    // Check if verified (optional, depends on if you require OTP first)
    if (!user.isVerified) {
       await AuthRepository.updateUser(user.id, { isVerified: true });
    }

    // Return the tokens
    return await this._generateAndSaveTokens(user);
  }

  /**
   * STEP 2B: Verify OTP Login and complete account creation
   */
  static async verifyOtp(email, otp) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error(`User not found with email ${email}`);

    // Verify OTP (Clears token on success or throws on failure/expiry)
    await OtpService.verifyOtp(email, otp);

    let finalUser = user;

    // Check if the user was unverified and finalize creation
    if (!user.isVerified) {
      finalUser = await AuthRepository.updateUser(user.id, { isVerified: true });
    }

    // Return the tokens
    return await this._generateAndSaveTokens(finalUser);
  }

  /**
   * INTERNAL HELPER: Generates minimal JWTs and saves the refresh token
   */
  static async _generateAndSaveTokens(user) {
    const accessPayload = { id: user.id, role: user.role, email: user.email };
    const refreshPayload = { id: user.id, role: user.role, email: user.email };

    const accessToken = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(refreshPayload);

    await AuthRepository.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
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
