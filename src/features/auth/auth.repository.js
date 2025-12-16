import prisma from "../../core/prisma/client.js";

export class AuthRepository {
  static async createUser(data) {
    return prisma.user.create({ data });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async updateUser(userId, data) {
    // This is used for setting isVerified=true and updating other user details
    return prisma.user.update({
      where: { id: userId },
      data: data,
    });
  }

  static async updateRefreshToken(userId, refreshToken) {
    // Assuming 'refreshToken' is a field on the 'user' model
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  // --- OTP/Verification Token Operations using the User model ---

  /**
   * Saves the combined OTP and expiry timestamp to the user's verificationToken field.
   * Format: `${otp}:${expiryTimestamp}`
   */
  static async saveVerificationToken(email, tokenValue) {
    // We update the user record to store the token
    return prisma.user.update({
      where: { email },
      data: { verificationToken: tokenValue },
    });
  }

  /**
   * Retrieves the token value from the user's verificationToken field.
   */
  static async getVerificationToken(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { verificationToken: true },
    });
    return user ? user.verificationToken : null;
  }

  /**
   * Clears the verificationToken field on the user record.
   */
  static async clearVerificationToken(email) {
    return prisma.user.update({
      where: { email },
      data: { verificationToken: null },
    });
  }
}
