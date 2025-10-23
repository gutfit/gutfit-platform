#!/usr/bin/env node

/**
 * GutfitOS Autonomous Management API Service
 * Enhanced Automation Layer - REST API + AI Integration
 * Version: 1.0.0
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "gutfit-os-secret-key";

// Configuration
const AUTH_ENABLED = process.env.AUTH_ENABLED !== "false";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gutfit2025!";
const CLI_PATH = path.join(__dirname, "gutfit-os-cli.sh");

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Authentication middleware
function authenticate(req, res, next) {
  if (!AUTH_ENABLED) return next();

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
}

// CLI execution wrapper
function executeCLI(command, args = []) {
  return new Promise((resolve, reject) => {
    const cliProcess = spawn(CLI_PATH, [command, ...args], {
      cwd: __dirname,
      env: { ...process.env, FORCE_COLOR: "1" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    cliProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    cliProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    cliProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject({ code, stdout, stderr });
      }
    });

    cliProcess.on("error", (error) => {
      reject({ error: error.message });
    });
  });
}

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});
