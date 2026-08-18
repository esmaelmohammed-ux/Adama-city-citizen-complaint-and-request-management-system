import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { toClient } from '../utils/toClient.js';
import { sendEmail } from '../services/email.js';
import { sendSms } from '../services/sms.js';

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const FORGOT_MSG =
  'If an account exists for that email, we sent password reset instructions.';

/** Simple in-memory throttle: max N forgot-password attempts per email per window */
const forgotAttempts = new Map();
const FORGOT_LIMIT = 5;
const FORGOT_WINDOW_MS = 15 * 60 * 1000;

function allowForgot(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const entry = forgotAttempts.get(key) || { count: 0, start: now };
  if (now - entry.start > FORGOT_WINDOW_MS) {
    forgotAttempts.set(key, { count: 1, start: now });
    return true;
  }
  if (entry.count >= FORGOT_LIMIT) return false;
  entry.count += 1;
  forgotAttempts.set(key, entry);
  return true;
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role: ROLES.CITIZEN,
      phoneNumber: phoneNumber || '',
      isActive: true,
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      token,
      user: toClient(user),
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: toClient(user),
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, user: req.userClient });
}

export async function forgotPassword(req, res, next) {
  try {
    const email = String(req.body.email || '')
      .toLowerCase()
      .trim();

    if (!allowForgot(email)) {
      return res.status(429).json({
        success: false,
        message: 'Too many reset requests. Please try again later.',
      });
    }

    const user = await User.findOne({ email, isActive: true });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetTokenHash = hashToken(rawToken);
      user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MS);
      await user.save();

      const origin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${origin}/reset-password?token=${rawToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Reset your Adama Citizen Portal password',
        text: `Hi ${user.fullName},\n\nReset your password using this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Hi ${user.fullName},</p>
<p>Reset your password using this link (valid for 1 hour):</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you did not request this, you can ignore this email.</p>
<p>— Adama City Citizen Portal</p>`,
      });

      if (user.phoneNumber) {
        await sendSms({
          to: user.phoneNumber,
          message: `Adama portal password reset (1h): ${resetUrl}`,
        });
      }
    }

    res.json({ success: true, message: FORGOT_MSG });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(String(token || ''));

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.',
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated. You can sign in with your new password.',
    });
  } catch (err) {
    next(err);
  }
}
