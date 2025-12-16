import { verifyAccessToken } from "../utils/token.util.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * Middleware to authenticate user using JWT access token
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Access token is required", {}));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Access token is required", {}));
    }

    // Verify the token
    const decoded = verifyAccessToken(token);

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("[AUTH MIDDLEWARE] Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(new ApiResponse(401, "Access token expired", {}));
    }

    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(new ApiResponse(401, "Invalid access token", {}));
    }

    return res
      .status(401)
      .json(new ApiResponse(401, "Authentication failed", {}));
  }
};

/**
 * Middleware to check if user has required role(s)
 * Usage: requireRole('ADMIN') or requireRole(['ADMIN', 'SUPERADMIN'])
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Authentication required", {}));
    }

    // Flatten array in case roles are passed as array
    const roles = allowedRoles.flat();

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            `Access denied. Required role: ${roles.join(" or ")}`,
            {}
          )
        );
    }

    next();
  };
};

/**
 * Middleware to check if user is admin (ADMIN or SUPERADMIN)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, "Authentication required", {}));
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    return res
      .status(403)
      .json(
        new ApiResponse(403, "Access denied. Admin privileges required", {})
      );
  }

  next();
};

/**
 * Middleware to check if user is superadmin
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, "Authentication required", {}));
  }

  if (req.user.role !== "SUPERADMIN") {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          "Access denied. Super admin privileges required",
          {}
        )
      );
  }

  next();
};

/**
 * Middleware to check if user is accessing their own resource
 * Admins can access any resource
 */
export const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, "Authentication required", {}));
  }

  // Extract user ID from params or body
  const resourceUserId = parseInt(req.params.userId || req.body.userId);

  // Allow if user is admin or accessing their own resource
  const isAdmin = req.user.role === "ADMIN" || req.user.role === "SUPERADMIN";
  const isOwner = req.user.id === resourceUserId;

  if (!isAdmin && !isOwner) {
    return res
      .status(403)
      .json(
        new ApiResponse(
          403,
          "Access denied. You can only access your own resources",
          {}
        )
      );
  }

  next();
};
