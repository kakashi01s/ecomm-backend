import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { urlencoded } from "express";
import http, { Server } from "http";
import { socketService } from "./socket/socketService.js";

const app = express();

const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
socketService(server);

// ============================================================================
// CORS CONFIGURATION - CRITICAL FOR FLUTTER WEB
// ============================================================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // List of allowed origins
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
      // Add your production domain here when deploying
      // 'https://yourdomain.com'
    ];

    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, you can allow all origins (NOT RECOMMENDED FOR PRODUCTION)
      callback(null, true); // Change to callback(new Error('Not allowed by CORS')) in production
    }
  },
  credentials: true, // Allow cookies and authorization headers
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
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// ============================================================================
// OTHER MIDDLEWARE
// ============================================================================
app.use(bodyParser.json());
app.use(express.json({ limit: "10kb" }));
app.use(urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// app.use(morgan('tiny'))

// ============================================================================
// ROUTES
// ============================================================================
import { router as authRoutes } from "./features/auth/auth.routes.js";
import { router as s3Routes } from "./features/s3/s3.routes.js";
import { router as productRoutes } from "./features/product/product.routes.js";
import categoryRoutes from "./features/category/category.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/admin/product", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

export { app, server };
