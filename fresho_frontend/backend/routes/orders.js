import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { requireAuth, allow } from '../middleware/auth.js';

const router = Router();
const transitions = { Pending: ['Confirmed', 'Cancelled'], Confirmed: ['Shipped', 'Cancelled'], Shipped: ['Delivered'], Delivered: [], Cancelled: [] };

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const query = req.user.role === 'customer' ? { customer: req.user.id } : req.user.role === 'farmer' ? { 'items.farmer': req.user.id } : {};
    res.json({ orders: await Order.find(query).populate('customer', 'name email phone').sort({ createdAt: -1 }) });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allow('customer'), async (req, res, next) => {
  try {
    const { items, address, slot, paymentMethod } = req.body;
    if (!Array.isArray(items) || !items.length || !address?.line || !slot || !paymentMethod) return res.status(400).json({ message: 'Items, delivery address, slot and payment method are required.' });
    const ids = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: ids }, active: true });
    if (products.length !== ids.length) return res.status(400).json({ message: 'One or more products are unavailable.' });
    const savedItems = [];
    for (const item of items) {
      const product = products.find(entry => entry.id === item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) return res.status(400).json({ message: `${product.name} does not have enough stock.` });
      product.stock -= quantity;
      savedItems.push({ product: product.id, farmer: product.farmer, name: product.name, price: product.price, unit: product.unit, quantity });
    }
    await Promise.all(products.map(product => product.save()));
    const subtotal = savedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const order = await Order.create({ customer: req.user.id, items: savedItems, address, slot, paymentMethod, subtotal, deliveryFee, total: subtotal + deliveryFee });
    res.status(201).json({ order });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    const nextStatus = req.body.status;
    if (!transitions[order.status].includes(nextStatus)) return res.status(400).json({ message: 'That order status transition is not allowed.' });
    const isCustomerCancellation = req.user.role === 'customer' && order.customer.toString() === req.user.id && nextStatus === 'Cancelled';
    const isFarmerOrder = req.user.role === 'farmer' && order.items.every(item => item.farmer.toString() === req.user.id);
    if (!isCustomerCancellation && !isFarmerOrder && req.user.role !== 'admin') return res.status(403).json({ message: 'You cannot update this order.' });
    if (nextStatus === 'Cancelled') await Promise.all(order.items.map(item => Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })));
    order.status = nextStatus;
    await order.save();
    res.json({ order });
  } catch (error) { next(error); }
});
export default router;
