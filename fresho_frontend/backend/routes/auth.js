import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const publicUser = user => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, farmName: user.farmName, verified: user.verified });
const issueToken = user => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'customer', farmName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (!['customer', 'farmer'].includes(role)) return res.status(400).json({ message: 'Choose a valid account role.' });
    if (role === 'farmer' && !farmName?.trim()) return res.status(400).json({ message: 'Farm name is required for farmers.' });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account already uses this email.' });
    const user = await User.create({ name, email, phone, role, farmName, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Incorrect email or password.' });
    if (role && user.role !== role) return res.status(403).json({ message: `This account is registered as a ${user.role}.` });
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
