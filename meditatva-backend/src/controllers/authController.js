const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const emailService = require('../services/emailService'); // Commented out for now

/**
 * Authentication Controller
 * Handles user registration, login, logout, and token management
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists with this email',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // TODO: Send verification email
    // await emailService.sendVerificationEmail(user.email, user.emailVerificationToken);

    console.log(`👤 New user registered: ${email} (${role})`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Registration failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account has been deactivated',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isPasswordValid = await user.correctPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    console.log(`🔓 User logged in: ${email} (${user.role})`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          stats: user.stats
        },
        tokens: {
          accessToken,
          refreshToken
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Login failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const { user } = req;

    // Clear refresh token
    user.refreshToken = undefined;
    await user.save();

    console.log(`🔐 User logged out: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Logout failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to logout',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token is required',
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(token);
      
      // Find user with matching refresh token
      const user = await User.findOne({ 
        _id: decoded.userId, 
        refreshToken: token 
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid refresh token',
          timestamp: new Date().toISOString()
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

      // Update refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (tokenError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh token',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const { user } = req;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
          preferences: user.preferences,
          stats: user.stats,
          subscription: user.subscription,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get current user failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { user } = req;
    const allowedFields = ['firstName', 'lastName', 'preferences'];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    console.log(`👤 Profile updated: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          preferences: updatedUser.preferences
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Profile update failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { user } = req;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.correctPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect',
        timestamp: new Date().toISOString()
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    userWithPassword.refreshToken = undefined; // Invalidate all sessions
    await userWithPassword.save();

    console.log(`🔐 Password changed: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully. Please login again.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Password change failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Demo login (for testing)
 * POST /api/auth/demo-login
 */
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;

    // Demo credentials
    const demoCredentials = {
      patient: {
        email: 'patient@meditatva.com',
        firstName: 'John',
        lastName: 'Patient',
        role: 'user'
      },
      pharmacy: {
        email: 'pharmacy@meditatva.com',
        firstName: 'MediStore',
        lastName: 'Pharmacy',
        role: 'pharmacy'
      }
    };

    const demo = demoCredentials[role];
    if (!demo) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid demo role',
        timestamp: new Date().toISOString()
      });
    }

    // Find or create demo user
    let user = await User.findOne({ email: demo.email });
    
    if (!user) {
      user = new User({
        ...demo,
        password: 'demo123456', // Demo password
        isEmailVerified: true
      });
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    console.log(`🎭 Demo login: ${demo.email} (${role})`);

    res.status(200).json({
      status: 'success',
      message: 'Demo login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isDemoUser: true
        },
        tokens: {
          accessToken,
          refreshToken
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Demo login failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to demo login',
      timestamp: new Date().toISOString()
    });
  }
};

// Validation middleware
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters'),
  body('role')
    .optional()
    .isIn(['patient', 'user', 'pharmacy', 'instructor', 'admin'])
    .withMessage('Invalid role')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateDemoLogin = [
  body('role')
    .isIn(['patient', 'pharmacy'])
    .withMessage('Role must be either patient or pharmacy')
];

module.exports = {
  register: [validateRegister, register],
  login: [validateLogin, login],
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile: [validateProfileUpdate, updateProfile],
  changePassword: [validateChangePassword, changePassword],
  demoLogin: [validateDemoLogin, demoLogin]
};
