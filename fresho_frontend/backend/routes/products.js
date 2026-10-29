import { Router } from 'express';
import { Product } from '../models/Product.js';
import { requireAuth, allow } from '../middleware/auth.js';

const router = Router();
const fields = ['name', 'category', 'price', 'stock', 'unit', 'description', 'imageUrl', 'harvest'];
const pick = body => Object.fromEntries(fields.filter(key => body[key] !== undefined).map(key => [key, body[key]]));

router.get('/', async (req, res, next) => {
  try {
    const query = { active: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.farmer) query.farmer = req.query.farmer;
    if (req.query.inStock === 'true') query.stock = { $gt: 0 };
    if (req.query.q) query.$or = [{ name: new RegExp(req.query.q, 'i') }, { category: new RegExp(req.query.q, 'i') }];
    res.json({ products: await Product.find(query).populate('farmer', 'name farmName verified').sort({ createdAt: -1 }) });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, allow('farmer'), async (req, res, next) => {
  try {
    if (!req.user.verified) return res.status(403).json({ message: 'Your farm must be verified before publishing products.' });
    const product = await Product.create({ ...pick(req.body), farmer: req.user.id });
    res.status(201).json({ product });
  } catch (error) { next(error); }
});

router.patch('/:id', requireAuth, allow('farmer', 'admin'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (req.user.role !== 'admin' && product.farmer.toString() !== req.user.id) return res.status(403).json({ message: 'You can only update your own products.' });
    Object.assign(product, pick(req.body));
    await product.save();
    res.json({ product });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, allow('farmer', 'admin'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (req.user.role !== 'admin' && product.farmer.toString() !== req.user.id) return res.status(403).json({ message: 'You can only remove your own products.' });
    await product.deleteOne();
    res.status(204).end();
  } catch (error) { next(error); }
});
export default router;
