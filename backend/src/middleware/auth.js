import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { toClient } from '../utils/toClient.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
  };
}

export async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account inactive or not found.' });
    }
    req.user = user;
    req.userClient = toClient(user);
    next();
  } catch (err) {
    next(err);
  }
}
