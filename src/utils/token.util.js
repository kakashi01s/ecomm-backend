import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRY || "7d"; // default for regular users

// Generate Access Token

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

// Generate Refresh Token with optional role-based expiry

const generateRefreshToken = (payload) => {
  // Default expiry
  let expiresIn = REFRESH_EXPIRES_IN;

  // Short-lived refresh token for ADMIN/SUPERADMIN
  if (payload.role === "ADMIN" || payload.role === "SUPERADMIN") {
    expiresIn = "1h";
  }

  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
};

// Verify Refresh Token

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// Verify Access Token

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
