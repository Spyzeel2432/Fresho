import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) throw new Error('Configure backend/.env before seeding.');
await mongoose.connect(process.env.MONGODB_URI);
const email = (process.env.ADMIN_EMAIL || 'admin@fresho.in').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
await User.findOneAndUpdate(
  { email },
  { name: 'Fresho Admin', email, role: 'admin', verified: true, passwordHash: await bcrypt.hash(password, 12) },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
console.log(`Admin account is ready for ${email}`);
const demoEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'zeel.test@gmail.com').toLowerCase();
const demoPassword = process.env.DEMO_CUSTOMER_PASSWORD || '123456';
await User.findOneAndUpdate(
  { email: demoEmail },
  { name: 'Zeel Test', email: demoEmail, role: 'customer', phone: '9876543210', verified: false, passwordHash: await bcrypt.hash(demoPassword, 12) },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
console.log(`Demo customer account is ready for ${demoEmail}`);
await mongoose.disconnect();
