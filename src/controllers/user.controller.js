import { User, RefreshToken } from '../../models/index.js';
import logger from '../utils/logger.js';

// ─── Get current user profile ─────────────────────────────────────────────────

export async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'email_token', 'email_token_expires', 'reset_token', 'reset_token_expires'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    logger.error(`Get profile error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
}

// ─── Update profile ───────────────────────────────────────────────────────────

export async function updateProfile(req, res) {
  const { username, avatar_url } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    await user.update(updates);

    logger.info(`Profile updated for user ${user.email}`);

    return res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, error: 'Username already taken' });
    }
    logger.error(`Update profile error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Profile update failed' });
  }
}

// ─── Delete own account ───────────────────────────────────────────────────────

export async function deleteAccount(req, res) {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await RefreshToken.destroy({ where: { user_id: user.id } });
    await user.destroy();

    logger.info(`Account deleted: ${user.email}`);
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    logger.error(`Delete account error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Account deletion failed' });
  }
}

// ─── Admin: list users ────────────────────────────────────────────────────────

export async function listUsers(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password_hash', 'email_token', 'email_token_expires', 'reset_token', 'reset_token_expires'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      data: rows,
      meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    logger.error(`List users error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to list users' });
  }
}

// ─── Admin: delete a user ─────────────────────────────────────────────────────

export async function deleteUser(req, res) {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ success: false, error: 'Cannot delete your own account via this endpoint' });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await RefreshToken.destroy({ where: { user_id: user.id } });
    await user.destroy();

    logger.info(`Admin ${req.user.email} deleted user ${user.email}`);
    return res.json({ success: true, message: `User ${user.email} deleted` });
  } catch (err) {
    logger.error(`Admin delete user error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
}

// ─── Admin: update user role ──────────────────────────────────────────────────

export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Role must be admin or user' });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.update({ role });

    logger.info(`Admin ${req.user.email} set role of ${user.email} to ${role}`);
    return res.json({ success: true, message: `Role updated to ${role}`, data: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    logger.error(`Update role error: ${err.message}`, err);
    return res.status(500).json({ success: false, error: 'Failed to update role' });
  }
}
