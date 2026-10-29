import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication is required.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'This account no longer exists.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}

export const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission for this action.' });
  next();
};
