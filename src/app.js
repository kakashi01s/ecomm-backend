// ============================================================================
// 1. ALL IMPORTS AT THE TOP
// ============================================================================
import express, { urlencoded } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

// Socket
import { socketService } from "./socket/socketService.js";

// Custom Middlewares
import { extractSduiContext } from "./middlewares/sdui.middleware.js";
import { optionalAuthenticate } from "./middlewares/optionalauth.middleware.js";

// Standard REST Routes
import { router as authRoutes } from "./features/auth/auth.routes.js";
import { router as s3Routes } from "./features/s3/s3.routes.js";
import { router as productRoutes } from "./features/product/product.routes.js";
import { router as dashBoardRoutes } from "./features/app/dashboard/dashboard.routes.js";
import { router as searchRoutes } from "./features/search/search.routes.js";

import categoryRoutes from "./features/category/category.routes.js";
import cartRoutes from "./features/cart/cart.routes.js";
import wishlistRoutes from "./features/wishlist/wishlist.routes.js";


import { AuthController } from "./features/auth/auth.controller.js";
import { redisManager } from './config/redisClient.js';
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketService(server);

// ============================================================================
// 3. CORS CONFIGURATION
// ============================================================================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:5000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:5000",
      "http://10.5.1.160:3000",
      "http://10.5.1.160:8080",
      "http://10.5.1.160:5000",
    ];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "app",
    "platform",
    "version",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ============================================================================
// 4. GLOBAL MIDDLEWARE
// ============================================================================
app.use(bodyParser.json());
app.use(express.json({ limit: "10kb" }));
app.use(urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Inject SDUI Context into every request (MUST BE AFTER INITIALIZING 'app')
app.use(extractSduiContext);

// ============================================================================
// 6. FEATURE ROUTES
// ============================================================================
app.use("/api/auth", authRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/product", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
console.log("Registering Cart Routes...");
app.use("/api/cart", cartRoutes);
app.use("/api/dashboard", dashBoardRoutes); // Protected route with optional auth for SDUI context
app.use("/api/wishlist", wishlistRoutes);  // toggle, remove, move-to-cart
app.use("/wishlist", wishlistRoutes); 
app.use("/api/search", searchRoutes); // Public search routes (no auth required)
// ============================================================================
// 7. ERROR HANDLING & HEALTH CHECKS
// ============================================================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Route not found",
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

export { app, server };