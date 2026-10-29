import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'farmer', 'admin'], default: 'customer' },
  phone: { type: String, trim: true },
  farmName: { type: String, trim: true, maxlength: 100 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
