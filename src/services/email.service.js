import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM = process.env.EMAIL_FROM || '"Auth App" <noreply@authapp.dev>';

export async function sendVerificationEmail(email, token) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${url}">${url}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
  logger.info(`Verification email sent to ${email}`);
}

export async function sendPasswordResetEmail(email, token) {
  const url = `${APP_URL}/api/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">${url}</a>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  });
  logger.info(`Password reset email sent to ${email}`);
}

export async function verifySmtpConnection() {
  try {
    await transporter.verify();
    logger.info('SMTP connection verified');
  } catch (err) {
    logger.warn(`SMTP connection failed: ${err.message} — emails will be logged only`);
  }
}
