// Authentication routes
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import supabase from "../db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Email validation helper
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password validation helper
const isStrongPassword = (password) => {
  return password.length >= 8;
};

// Generate JWT token
const generateToken = (userId, userEmail) => {
  return jwt.sign(
    {
      id: userId,
      email: userEmail,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// Sign up route
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      const error = new Error("Email, password, and confirm password are required");
      error.statusCode = 400;
      throw error;
    }

    if (!isValidEmail(email)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    if (!isStrongPassword(password)) {
      const error = new Error("Password must be at least 8 characters long");
      error.statusCode = 400;
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error("Passwords do not match");
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      const error = new Error("User already exists with this email");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email,
          password: hashedPassword,
        },
      ])
      .select()
      .single();

    if (createError) {
      const error = new Error("Failed to create user");
      error.statusCode = 500;
      throw error;
    }

    // Generate token
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  })
);

// Login route
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    // Find user
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (queryError || !user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  })
);

// Get current user route
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      user,
    });
  })
);

export default router;
