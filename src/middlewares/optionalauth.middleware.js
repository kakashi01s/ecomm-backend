import { verifyAccessToken } from "../utils/token.util.js";
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // if no token provided, just move on as guest user (no req.user)
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(); 
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        // if token is valid, attach user info to request object, else treat as guest
        req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
        next();
    } catch (err) {
        // Token galat hai tab bhi aage jaane do, hum use guest treat kar lenge
        next();
    }
};