const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helpers ────────────────────────────────────────────────────────────────

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendResponse = (res, statusCode, user, token) =>
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });

// ─── Register ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // 2. Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }

    // 3. Persist user (User model pre-save will hash `password`)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // 5. Issue token & respond
    const token = signToken(user._id);
    return sendResponse(res, 201, user, token);

  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ─── Login ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic field validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // 2. Look up user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Deliberately vague to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Issue token & respond
    const token = signToken(user._id);
    return sendResponse(res, 200, user, token);

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ─── Get current user ────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * Requires: auth middleware (sets req.user)
 */
const getMe = async (req, res) => {
  try {
    // req.user is attached by the JWT auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("[getMe]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

module.exports = { register, login, getMe };