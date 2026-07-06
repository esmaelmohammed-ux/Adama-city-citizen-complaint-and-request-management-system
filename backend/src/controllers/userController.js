import User from '../models/User.js';
import { toClient, toClientList } from '../utils/toClient.js';

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users: toClientList(users) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { fullName, phoneNumber } = req.body;
    const updates = {};

    if (fullName != null) updates.fullName = fullName;
    if (phoneNumber != null) updates.phoneNumber = phoneNumber;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: toClient(user) });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserActive(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user: toClient(user) });
  } catch (err) {
    next(err);
  }
}
