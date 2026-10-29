import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ['Vegetables', 'Fruits', 'Dairy', 'Grains'], required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, required: true, trim: true, maxlength: 30 },
  description: { type: String, trim: true, maxlength: 1000 },
  imageUrl: { type: String, trim: true },
  harvest: { type: String, default: 'Today' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
