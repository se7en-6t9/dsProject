// Main Express server
import express from "express";
import dotenv from "dotenv";
import {
  corsMiddleware,
  securityHeaders,
  rateLimitMiddleware,
} from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspace.js";
import catRoutes from "./routes/cat.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware
// ==========================================

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Security middleware
app.use(securityHeaders);

// CORS middleware
app.use(corsMiddleware);

// Rate limiting middleware
app.use(rateLimitMiddleware(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// ==========================================
// Routes
// ==========================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Workspace routes (protected)
app.use("/api/workspace", workspaceRoutes);

// Cat routes
app.use("/api/cat", catRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    error: "NOT_FOUND",
  });
});

// Error handling middleware
app.use(errorHandler);

// ==========================================
// Server
// ==========================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      MiniGitHub Backend Server          ║
║      Running on port ${PORT}              ║
╚════════════════════════════════════════╝
`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});
