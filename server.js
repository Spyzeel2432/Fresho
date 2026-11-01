// Fresho REST API. In-memory data so it runs with zero setup.
// To go further: replace the arrays with MongoDB (mongoose) models.
const express = require('express'), cors = require('cors'), jwt = require('jsonwebtoken'),
  bcrypt = require('bcryptjs'), path = require('path');
const app = express();
app.use(cors(), express.json());
const SECRET = process.env.JWT_SECRET || 'fresho-dev-secret';
let seq = 100; const nid = () => ++seq;

const users = [
  { id: 1, name: 'Fresho Admin', email: 'admin@fresho.in', role: 'admin', verified: true, hash: bcrypt.hashSync('admin123', 8) },
  { id: 2, name: 'Jayesh Patel', email: 'jayesh@fresho.in', role: 'farmer', city: 'Anand', verified: true, hash: bcrypt.hashSync('farmer123', 8) },
  { id: 3, name: 'Meena Solanki', email: 'meena@fresho.in', role: 'farmer', city: 'Surat', verified: false, hash: bcrypt.hashSync('farmer123', 8) },
  { id: 4, name: 'Riya Shah', email: 'riya@fresho.in', role: 'customer', verified: true, hash: bcrypt.hashSync('customer123', 8) }
];
const products = [
  { id: 1, name: 'Desi Tomatoes', category: 'Vegetables', price: 40, stock: 35, farmerId: 2, description: 'Ripe, sun-grown tomatoes.' },
  { id: 2, name: 'Kesar Mango', category: 'Fruits', price: 80, stock: 60, farmerId: 2, description: 'Sweet Kesar mangoes.' },
  { id: 3, name: 'Potatoes', category: 'Vegetables', price: 28, stock: 120, farmerId: 3, description: 'Firm table potatoes.' },
  { id: 4, name: 'Fresh Spinach', category: 'Vegetables', price: 30, stock: 20, farmerId: 3, description: 'Tender spinach bunches.' }
];
const orders = [], carts = {};
const STATUS = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const sign = u => jwt.sign({ id: u.id, role: u.role, name: u.name }, SECRET, { expiresIn: '7d' });
const auth = (...roles) => (req, res, next) => {
  try {
    const u = jwt.verify((req.headers.authorization || '').slice(7), SECRET);
    if (roles.length && !roles.includes(u.role)) return res.status(403).json({ error: 'Not allowed for this role' });
    req.user = u; next();
  } catch { res.status(401).json({ error: 'Please log in' }); }
};
const pub = ({ hash, ...u }) => u;

// ---- Auth ----
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password, role = 'customer', adminCode } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ error: 'Name, email and a 6+ character password are required' });
  if (!['customer', 'farmer', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (role === 'admin' && adminCode !== (process.env.ADMIN_CODE || 'fresho-admin')) return res.status(403).json({ error: 'Invalid admin code' });
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const u = { id: nid(), name, email, phone, role, verified: role !== 'farmer', hash: bcrypt.hashSync(password, 8) };
  users.push(u); res.status(201).json({ token: sign(u), user: pub(u) });
});
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const u = users.find(x => x.email === email || (x.phone && x.phone === email));
  if (!u || !bcrypt.compareSync(password || '', u.hash)) return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: sign(u), user: pub(u) });
});

// ---- Products ----
app.get('/api/products', (req, res) => {
  const { category, q } = req.query;
  res.json(products.filter(p => (!category || p.category === category) && (!q || p.name.toLowerCase().includes(q.toLowerCase())))
    .map(p => ({ ...p, farmer: users.find(u => u.id === p.farmerId)?.name })));
});
app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id == req.params.id);
  p ? res.json({ ...p, farmer: pub(users.find(u => u.id === p.farmerId)) }) : res.status(404).json({ error: 'Product not found' });
});
app.post('/api/products', auth('farmer'), (req, res) => {
  const { name, category, price, stock, description } = req.body;
  if (!name || !category || !(price > 0) || !(stock >= 0)) return res.status(400).json({ error: 'Name, category, price and stock are required' });
  const p = { id: nid(), name, category, price: +price, stock: +stock, description, farmerId: req.user.id };
  products.push(p); res.status(201).json(p);
});
app.put('/api/products/:id', auth('farmer'), (req, res) => {
  const p = products.find(x => x.id == req.params.id && x.farmerId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  Object.assign(p, ['name', 'category', 'price', 'stock', 'description'].reduce((o, k) => (k in req.body ? { ...o, [k]: req.body[k] } : o), {}));
  res.json(p);
});

// ---- Cart ----
app.get('/api/cart', auth('customer'), (req, res) => res.json(carts[req.user.id] || []));
app.post('/api/cart', auth('customer'), (req, res) => {
  const { productId, qty } = req.body; const c = carts[req.user.id] ||= [];
  const p = products.find(x => x.id == productId);
  if (!p || !(qty > 0) || qty > p.stock) return res.status(400).json({ error: 'Invalid product or quantity' });
  const i = c.find(x => x.productId == productId); i ? (i.qty = qty) : c.push({ productId: p.id, qty });
  res.json(c);
});
app.delete('/api/cart/:productId', auth('customer'), (req, res) => {
  carts[req.user.id] = (carts[req.user.id] || []).filter(i => i.productId != req.params.productId); res.json(carts[req.user.id]);
});

// ---- Orders ----
app.post('/api/orders', auth('customer'), (req, res) => {
  const cart = carts[req.user.id] || [];
  if (!cart.length || !req.body.address) return res.status(400).json({ error: 'Cart and delivery address are required' });
  const items = cart.map(i => { const p = products.find(x => x.id === i.productId); return { productId: p.id, name: p.name, farmerId: p.farmerId, qty: i.qty, price: p.price }; });
  items.forEach(i => (products.find(p => p.id === i.productId).stock -= i.qty));
  const o = { id: nid(), customerId: req.user.id, items, address: req.body.address, payment: req.body.payment || 'COD',
    total: items.reduce((s, i) => s + i.qty * i.price, 0), status: 'Pending', createdAt: new Date().toISOString() };
  orders.push(o); carts[req.user.id] = []; res.status(201).json(o);
});
app.get('/api/orders', auth(), (req, res) => {
  const r = req.user.role;
  res.json(orders.filter(o => r === 'admin' || (r === 'customer' ? o.customerId === req.user.id : o.items.some(i => i.farmerId === req.user.id))));
});
app.get('/api/orders/:id', auth(), (req, res) => {
  const o = orders.find(x => x.id == req.params.id);
  o ? res.json(o) : res.status(404).json({ error: 'Order not found' });
});
app.patch('/api/orders/:id/status', auth('farmer', 'admin'), (req, res) => {
  const o = orders.find(x => x.id == req.params.id);
  if (!o || !STATUS.includes(req.body.status)) return res.status(400).json({ error: 'Invalid order or status' });
  o.status = req.body.status; res.json(o);
});

// ---- Farmer + Admin ----
app.get('/api/farmer/summary', auth('farmer'), (req, res) => {
  const mine = orders.filter(o => o.items.some(i => i.farmerId === req.user.id));
  const earn = o => o.items.filter(i => i.farmerId === req.user.id).reduce((s, i) => s + i.qty * i.price, 0);
  res.json({ earnings: mine.filter(o => o.status === 'Delivered').reduce((s, o) => s + earn(o), 0),
    pendingOrders: mine.filter(o => o.status === 'Pending').length,
    products: products.filter(p => p.farmerId === req.user.id).length, recent: mine.slice(-5).reverse() });
});
app.get('/api/admin/summary', auth('admin'), (req, res) => res.json({
  users: users.filter(u => u.role === 'customer').length, farmers: users.filter(u => u.role === 'farmer').length,
  products: products.length, orders: orders.length, farmerList: users.filter(u => u.role === 'farmer').map(pub) }));
app.patch('/api/admin/farmers/:id/verify', auth('admin'), (req, res) => {
  const f = users.find(u => u.id == req.params.id && u.role === 'farmer');
  if (!f) return res.status(404).json({ error: 'Farmer not found' });
  f.verified = req.body.verified !== false; res.json(pub(f));
});

app.use(express.static(path.join(__dirname, '../frontend')));
app.listen(process.env.PORT || 3000, () => console.log('Fresho running on http://localhost:' + (process.env.PORT || 3000)));
