//backend/server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// fail loudly at boot instead of failing mysteriously on first login
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set — check your .env file");
}

// catch anything that slips past try/catch blocks anywhere in the app
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(helmet());

// Auth rate limiter to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window`
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
});

// Connect Database — exit if it fails, rather than serving requests
// against a DB that was never connected
connectDB().catch((err) => {
  console.error("Failed to connect to database:", err.message);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // lock to your actual frontend before production
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/consumers", require("./routes/consumers"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/roles", require("./routes/roles"));
// Home Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// 404 handler — must come after all routes, before the error handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler — catches errors Express itself surfaces
// (malformed JSON, sync throws in middleware). Your route-level
// try/catch blocks handle everything else.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something broke on the server",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});