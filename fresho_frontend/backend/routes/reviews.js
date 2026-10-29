import { Router } from 'express';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { requireAuth, allow } from '../middleware/auth.js';

const router = Router();
router.get('/product/:productId', async (req, res, next) => {
  try { res.json({ reviews: await Review.find({ product: req.params.productId }).populate('customer', 'name').sort({ createdAt: -1 }) }); } catch (error) { next(error); }
});
router.post('/', requireAuth, allow('customer'), async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const delivered = await Order.exists({ customer: req.user.id, status: 'Delivered', 'items.product': productId });
    if (!delivered) return res.status(403).json({ message: 'You can review products after delivery.' });
    const review = await Review.findOneAndUpdate({ product: productId, customer: req.user.id }, { rating, comment }, { new: true, upsert: true, runValidators: true });
    res.status(201).json({ review });
  } catch (error) { next(error); }
});
export default router;
