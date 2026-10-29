export const CATS = ['Vegetables', 'Fruits', 'Dairy', 'Grains'];
export const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
export const FREE_ABOVE = 499, DELIVERY = 40;
export const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
export const fee = sub => (sub === 0 || sub >= FREE_ABOVE ? 0 : DELIVERY);
export const fdate = t => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const FARMERS = [
  { id: 'f1', name: 'Ramesh Patel', farm: 'Patel Organic Farm', place: 'Anand', rating: 4.8, n: 42, verified: true, since: 2021, story: 'Three generations of the Patel family have farmed these fields in Anand. We grow without synthetic pesticides and harvest every morning so your vegetables reach you the same day.' },
  { id: 'f2', name: 'Sita Devi', farm: 'Green Valley Growers', place: 'Vadodara', rating: 4.7, n: 31, verified: true, since: 2022, story: 'A women-led cooperative of eleven small farms near Vadodara. We specialise in leafy greens, onions and potatoes, grown with drip irrigation to save water.' },
  { id: 'f3', name: 'Kiran Desai', farm: 'Desai Orchards', place: 'Navsari', rating: 4.9, n: 57, verified: true, since: 2020, story: 'Our orchards in Navsari grow Alphonso mangoes and bananas. Fruit stays on the tree until it is ready, then is packed by hand within hours.' },
  { id: 'f4', name: 'Mehta Dairy', farm: 'Mehta Dairy & Poultry', place: 'Anand', rating: 4.9, n: 64, verified: true, since: 2019, story: 'A family dairy with grass-fed cows and free-range hens. Milk is bottled and eggs are packed the same morning, with no additives.' },
  { id: 'f5', name: 'Arjun Singh', farm: 'Singh Agro', place: 'Rajkot', rating: 0, n: 0, verified: false, since: 2026, story: '' },
];

const P = (id, name, cat, price, unit, fid, stock, type, desc, harvest) => ({ id, name, cat, price, unit, fid, stock, type, desc, harvest });
export const PRODUCTS = [
  P(1, 'Vine Tomatoes', 'Vegetables', 48, 'kg', 'f1', 42, 'tomato', 'Firm, vine-ripened tomatoes picked at peak colour. Good for curries, salads and chutneys.', 'Today'),
  P(2, 'Potatoes', 'Vegetables', 32, 'kg', 'f2', 120, 'potato', 'Clean, medium-sized potatoes with a smooth skin. Stores well for weeks.', 'Yesterday'),
  P(3, 'Spinach', 'Vegetables', 25, 'bunch', 'f2', 9, 'leaf', 'Tender leaves, harvested in the morning and delivered the same day.', 'Today'),
  P(4, 'Carrots', 'Vegetables', 56, 'kg', 'f1', 36, 'carrot', 'Sweet, crunchy carrots dug fresh from the field.', 'Yesterday'),
  P(5, 'Farm Milk', 'Dairy', 62, 'litre', 'f4', 60, 'milk', 'Unprocessed full-cream milk from grass-fed cows, bottled the same morning.', 'Today'),
  P(6, 'Alphonso Mangoes', 'Fruits', 420, 'kg', 'f3', 24, 'mango', 'Naturally ripened Alphonso with a rich aroma. Graded and hand-packed.', 'Today'),
  P(7, 'Bananas', 'Fruits', 55, 'dozen', 'f3', 48, 'banana', 'Robusta bananas from Navsari, cut green and ripened naturally.', '2 days ago'),
  P(8, 'Farm Eggs', 'Dairy', 96, 'dozen', 'f4', 30, 'egg', 'Eggs from free-range hens, collected daily and packed in trays.', 'Today'),
  P(9, 'Basmati Rice', 'Grains', 118, 'kg', 'f1', 200, 'grain', 'Aged long-grain basmati. Fluffy, aromatic and non-sticky when cooked.', 'Last season'),
  P(10, 'Red Onions', 'Vegetables', 38, 'kg', 'f2', 85, 'onion', 'Sun-cured red onions with a firm bite and strong flavour.', '3 days ago'),
  P(11, 'Coriander', 'Vegetables', 20, 'bunch', 'f2', 5, 'leaf', 'Fragrant coriander with roots intact to keep it fresh longer.', 'Today'),
  P(12, 'Whole Wheat Flour', 'Grains', 46, 'kg', 'f1', 90, 'grain', 'Stone-ground atta from locally grown wheat. No additives.', 'This week'),
];

const EM = { 'Zeel Patel': 'zeel.patel@example.com' };
const mk = (id, cust, status, daysAgo, pairs, pay = 'UPI') => {
  const items = pairs.map(([pid, q]) => { const p = PRODUCTS.find(x => x.id === pid); return { id: pid, name: p.name, price: p.price, unit: p.unit, fid: p.fid, type: p.type, cat: p.cat, q }; });
  const sub = items.reduce((a, i) => a + i.price * i.q, 0);
  return { id, slot: 'Today, 4–7 PM', cust, email: EM[cust] || cust.toLowerCase().replace(' ', '.') + '@example.com', status, date: Date.now() - daysAgo * 864e5, items, total: sub + fee(sub), pay, addr: { name: cust, phone: '9876543210', line: '24 Sunrise Park, Vastrapur, Ahmedabad', pin: '380015' } };
};
export const seedOrders = () => [
  mk('FR1048', 'Zeel Patel', 'Shipped', 1, [[1, 2], [4, 1], [3, 2]]),
  mk('FR1043', 'Zeel Patel', 'Delivered', 6, [[5, 4], [8, 1]]),
  mk('FR1037', 'Zeel Patel', 'Delivered', 14, [[6, 2], [7, 1]], 'Card'),
  mk('FR1031', 'Zeel Patel', 'Cancelled', 21, [[9, 2]], 'Cash on Delivery'),
  mk('FR1049', 'Priya Shah', 'Pending', 0, [[1, 3], [2, 4]]),
  mk('FR1047', 'Neel Mehta', 'Confirmed', 1, [[12, 2], [9, 1]], 'Cash on Delivery'),
  mk('FR1045', 'Aditi Desai', 'Delivered', 3, [[4, 3], [10, 2]]),
  mk('FR1041', 'Karan Mehta', 'Delivered', 8, [[1, 5], [11, 4], [3, 3]]),
];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
export const FARMER_SALES = [21, 24, 22, 29, 31, 28, 35, 37, 39, 43];
export const GMV = [3.1, 3.4, 3.9, 4.2, 4.8, 5.1, 5.9, 6.4, 7.0, 7.8];

export const PINCODES = ['380001', '380004', '380005', '380006', '380007', '380008', '380009', '380013', '380014', '380015', '380051', '380052', '380054', '380055', '380058', '380059', '380060', '380061', '382350', '382424', '382481'];
export const SLOTS = [{ id: 'today', label: 'Today, 4–7 PM' }, { id: 'tam', label: 'Tomorrow, 7–10 AM' }, { id: 'tpm', label: 'Tomorrow, 4–7 PM' }];
export const FREQ = ['Daily', 'Alternate days', 'Weekly'];
export const INT = { Daily: 1, 'Alternate days': 2, Weekly: 7 };
const R = (id, pid, fid, name, rating, text, days) => ({ id, pid, fid, name, rating, text, email: name + '@seed', date: Date.now() - days * 864e5 });
export const seedReviews = () => [
  R('r1', 1, 'f1', 'Priya S.', 5, 'Firm, deeply red tomatoes — they taste nothing like the supermarket ones.', 9),
  R('r2', 1, 'f1', 'Neel M.', 5, 'Arrived the same afternoon and still cool. Great in salads.', 15),
  R('r3', 4, 'f1', 'Aditi D.', 4, 'Sweet and crunchy. A few were small but the flavour is excellent.', 20),
  R('r4', 9, 'f1', 'Karan M.', 5, 'Fluffy, fragrant basmati. Will reorder every month.', 26),
  R('r5', 3, 'f2', 'Meera J.', 5, 'The spinach was so fresh it needed no extra washing effort. Lovely leaves.', 5),
  R('r6', 2, 'f2', 'Rohan P.', 4, 'Clean, even-sized potatoes. Good value.', 12),
  R('r7', 10, 'f2', 'Hetal B.', 5, 'Proper sun-cured onions with a strong flavour.', 18),
  R('r8', 6, 'f3', 'Zeel P.', 5, 'The best Alphonso I have had in Ahmedabad. Perfectly ripe and sweet.', 30),
  R('r9', 6, 'f3', 'Dev S.', 5, 'Fragrant, juicy and carefully packed. Worth every rupee.', 33),
  R('r10', 7, 'f3', 'Nisha K.', 5, 'Naturally ripened bananas — no chemical taste at all.', 21),
  R('r11', 5, 'f4', 'Ankit T.', 5, 'Rich, creamy milk. You can taste the difference immediately.', 4),
  R('r12', 8, 'f4', 'Sneha R.', 5, 'Deep yellow yolks and fresh every time.', 11),
];
export const seedAddresses = () => ({ 'zeel.patel@example.com': [
  { id: 'a1', label: 'Home', name: 'Zeel Patel', phone: '9876543210', line: '24 Sunrise Park, Vastrapur, Ahmedabad', pin: '380015', def: true },
  { id: 'a2', label: 'Work', name: 'Zeel Patel', phone: '9876543210', line: '12 Corporate Road, Prahladnagar, Ahmedabad', pin: '380015', def: false }] });
