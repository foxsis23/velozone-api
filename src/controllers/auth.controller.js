import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { User, RefreshToken, LoginAttempt } from '../../models/index.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import logger from '../utils/logger.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ─── Helpers ────────────────────────────────────────────────────────────────

function issueAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

async function issueRefreshToken(userId) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await RefreshToken.create({ user_id: userId, token, expires_at: expiresAt });
  return token;
}

async function countRecentFailedAttempts(email, ip) {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  return LoginAttempt.count({
    where: {
      [Op.or]: [{ email }, { ip_address: ip }],
      success: false,
      createdAt: { [Op.gte]: since },
    },
  });
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const email_token = uuidv4();
    const email_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      password_hash,
      email_token,
      email_token_expires,
    });

    try {
      await sendVerificationEmail(email, email_token);
    } catch (emailErr) {
      logger.error(`Failed to send verification email to ${email}: ${emailErr.message}`);
    }

    logger.info(`New user registered: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Registered successfully. Please verify your email.',
      data: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    logger.error(`Register error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function login(req, res) {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    // Check lockout
    const attempts = await countRecentFailedAttempts(email, ip);
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        error: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.password_hash) {
      await LoginAttempt.create({ email, ip_address: ip, success: false });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await LoginAttempt.create({ email, ip_address: ip, success: false });
      logger.warn(`Failed login attempt for ${email} from ${ip}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await LoginAttempt.create({ email, ip_address: ip, success: true });

    const accessToken = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    logger.info(`User logged in: ${email}`);

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
      },
    });
  } catch (err) {
    logger.error(`Login error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logout(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'refreshToken required' });
  }

  try {
    const record = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (record) {
      await record.update({ is_revoked: true });
    }
    logger.info(`User ${req.user.id} logged out`);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Logout failed' });
  }
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

export async function refreshToken(req, res) {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'refreshToken required' });
  }

  try {
    const record = await RefreshToken.findOne({
      where: { token, is_revoked: false },
      include: [{ model: User }],
    });

    if (!record) {
      return res.status(401).json({ success: false, error: 'Invalid or revoked refresh token' });
    }

    if (new Date() > record.expires_at) {
      await record.update({ is_revoked: true });
      return res.status(401).json({ success: false, error: 'Refresh token expired' });
    }

    // Rotate: revoke old, issue new
    await record.update({ is_revoked: true });
    const newRefreshToken = await issueRefreshToken(record.user_id);
    const accessToken = issueAccessToken(record.User);

    return res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    logger.error(`Refresh token error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Verification token required' });
  }

  try {
    const user = await User.findOne({
      where: {
        email_token: token,
        email_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    await user.update({
      is_email_verified: true,
      email_token: null,
      email_token_expires: null,
    });

    logger.info(`Email verified for user ${user.email}`);
    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    logger.error(`Verify email error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Email verification failed' });
  }
}

// ─── Resend Verification Email ────────────────────────────────────────────────

export async function resendVerification(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.is_email_verified) {
      // Don't reveal whether email exists
      return res.json({ success: true, message: 'If the email exists and is unverified, a new link was sent.' });
    }

    const email_token = uuidv4();
    const email_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({ email_token, email_token_expires });
    await sendVerificationEmail(email, email_token);

    return res.json({ success: true, message: 'Verification email resent.' });
  } catch (err) {
    logger.error(`Resend verification error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to resend verification email' });
  }
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // Always respond the same to prevent email enumeration
    const response = {
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    };

    if (!user) return res.json(response);

    const reset_token = uuidv4();
    const reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ reset_token, reset_token_expires });

    try {
      await sendPasswordResetEmail(email, reset_token);
    } catch (emailErr) {
      logger.error(`Failed to send reset email to ${email}: ${emailErr.message}`);
    }

    logger.info(`Password reset requested for ${email}`);
    return res.json(response);
  } catch (err) {
    logger.error(`Forgot password error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Password reset request failed' });
  }
}

// ─── Reset Password ──────────────────────────────────────────────────────────

export async function resetPassword(req, res) {
  const { token } = req.query;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Reset token required' });
  }

  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    await user.update({ password_hash, reset_token: null, reset_token_expires: null });

    // Revoke all refresh tokens for security
    await RefreshToken.update({ is_revoked: true }, { where: { user_id: user.id } });

    logger.info(`Password reset for user ${user.email}`);
    return res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
  } catch (err) {
    logger.error(`Reset password error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Password reset failed' });
  }
}

// ─── Change Password ─────────────────────────────────────────────────────────

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user || !user.password_hash) {
      return res.status(400).json({ success: false, error: 'Cannot change password for OAuth accounts' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.update({ password_hash });

    // Revoke all refresh tokens
    await RefreshToken.update({ is_revoked: true }, { where: { user_id: user.id } });

    logger.info(`Password changed for user ${user.email}`);
    return res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    logger.error(`Change password error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Password change failed' });
  }
}

// ─── Google OAuth callback ────────────────────────────────────────────────────

export async function googleCallback(req, res) {
  try {
    const user = req.user; // set by passport
    const accessToken = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    // Redirect with tokens (in real app, use a more secure mechanism)
    const redirectUrl = `${process.env.OAUTH_REDIRECT_URL || 'http://localhost:3000/oauth/callback'}?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    logger.error(`Google OAuth callback error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'OAuth login failed' });
  }
}
