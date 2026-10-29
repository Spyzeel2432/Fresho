import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [itemSchema], validate: value => value.length > 0 },
  address: {
    name: String, phone: String, line: String, pin: String
  },
  slot: { type: String, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash on Delivery'], required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
