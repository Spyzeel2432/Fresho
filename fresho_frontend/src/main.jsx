import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link, NavLink, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CATS, STATUSES, FARMERS, PRODUCTS, MONTHS, FARMER_SALES, GMV, FREE_ABOVE, money, fee, fdate, seedOrders } from './data.js';
import './styles.css';

/* ---------- icons & small UI ---------- */
const IC = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  cart: <><path d="M3 4h2l2 11h10l3-8H6" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />, check: <path d="m5 12 4 4L19 6" />, plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="m15 18-6-6 6-6" />, chev: <path d="m9 18 6-6-6-6" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  out: <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-7" />,
  pin: <><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4" />,
  truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></>,
  leaf: <path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l9-9" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
};
const Icon = ({ n, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{IC[n]}</svg>;
const Logo = ({ light }) => <Link to="/" className={'logo' + (light ? ' light' : '')}><span className="mark"><Icon n="leaf" s={16} /></span>Fresho</Link>;
const Btn = ({ to, v = 'p', sm, className = '', children, ...r }) => { const c = `btn ${v} ${sm ? 'sm' : ''} ${className}`; return to ? <Link to={to} className={c} {...r}>{children}</Link> : <button className={c} {...r}>{children}</button>; };
const Pill = ({ s }) => <span className={'pill ' + s.toLowerCase().replace(' ', '-')}>{s}</span>;
const Head = ({ title, sub, action }) => <div className="head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{action}</div>;
const Empty = ({ title, text, to, cta }) => <div className="card empty"><div className="ring"><Icon n="cart" s={26} /></div><h3>{title}</h3><p>{text}</p>{to && <Btn to={to}>{cta}</Btn>}</div>;
const F = ({ label, err, children }) => <label className="f"><span>{label}</span>{children}{err && <em>{err}</em>}</label>;
const Stars = ({ r }) => <span className="stars"><Icon n="star" s={13} /> {r}</span>;

const RG = (id, stops, o = {}) => <radialGradient id={id} cx=".35" cy=".3" r=".85" {...o}>{stops.map((c, i) => <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />)}</radialGradient>;
const LG = (id, a, b) => <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>;
const Defs = () => <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><defs>
  {RG('gTom', ['#ff8f72', '#e0401f', '#a82612'])}{RG('gPot', ['#ebca94', '#c19558', '#8f6636'])}{RG('gMan', ['#ffe27a', '#f7a323', '#dc6f12'])}{RG('gEgg', ['#fcecd6', '#e8caa0', '#d2ab78'])}{RG('gOn', ['#efb0c6', '#bd4a74', '#872a4e'])}{RG('gGr', ['#f9e08e', '#e2b04a', '#b98521'])}
  {LG('gCar', '#ffb04f', '#e15d08')}{LG('gLeaf', '#74cf80', '#2a8140')}{LG('gBan', '#ffeb92', '#efb41a')}{LG('gGls', '#ffffff', '#dce8f4')}
</defs></svg>;
const T = (x, y, r = 0, s = 1) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;
const Tom = ({ x, y, s }) => <g transform={T(x, y, 0, s)}><circle r="38" fill="url(#gTom)" /><path d="M-16-30c6 0 11 4 16 4s10-4 16-4c-3 7-8 11-16 12-8-1-13-5-16-12Z" fill="#2e7d38" /><path d="M0-26V-40" stroke="#2e7d38" strokeWidth="4" strokeLinecap="round" /><ellipse cx="-14" cy="-8" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-35 -14 -8)" /></g>;
const Pot = ({ x, y, r, s }) => <g transform={T(x, y, r, s)}><ellipse rx="34" ry="24" fill="url(#gPot)" /><path d="M-12-4h.01M10 6h.01M14-10h.01M-4 12h.01M-20 8h.01" stroke="#7a5429" strokeWidth="3" strokeLinecap="round" opacity=".6" /><ellipse cx="-10" cy="-10" rx="11" ry="4" fill="#fff" opacity=".25" /></g>;
const Lf = ({ r }) => <g transform={T(100, 124, r)}><path d="M0 0C-34-18-34-62 0-84 34-62 34-18 0 0Z" fill="url(#gLeaf)" /><path d="M0-4V-72M0-30l-12-12M0-30l12-12M0-48l-9-9M0-48l9-9" stroke="#c4ecc9" strokeWidth="2" strokeLinecap="round" opacity=".7" /></g>;
const Car = ({ x, y, r }) => <g transform={T(x, y, r, .85)}><path d="M-5-52c-2-10-8-14-12-18M0-52c0-12 0-16 0-22M5-52c2-10 8-14 12-18" stroke="#3f9a4d" strokeWidth="5" strokeLinecap="round" fill="none" /><path d="M-15-48C-6-52 6-52 15-48 12-20 6 20 0 52-6 20-12-20-15-48Z" fill="url(#gCar)" /><path d="M-9-30h8M3-14h8M-6 2h7M2 18h5" stroke="#b84a05" strokeWidth="2" strokeLinecap="round" opacity=".45" /></g>;
const Man = ({ x, y, r, s }) => <g transform={T(x, y, r, s)}><path d="M0-36C28-40 42-10 32 18 24 40-10 46-30 30-44 16-32-32 0-36Z" fill="url(#gMan)" /><ellipse cx="16" cy="12" rx="12" ry="18" fill="#e04a2a" opacity=".1" /><path d="M-6-36c-2-6 0-10 4-12" stroke="#5a7a2a" strokeWidth="4" strokeLinecap="round" fill="none" /><path d="M2-44c8-8 18-6 24-2-6 6-16 6-24 2Z" fill="#3f9a4d" /><ellipse cx="-14" cy="-12" rx="7" ry="13" fill="#fff" opacity=".3" transform="rotate(20 -14 -12)" /></g>;
const Ban = ({ y, r }) => <g transform={T(100, y, r)}><path d="M-58-26C-50 28 0 46 58 8 66 3 62-6 54-3 14 20-26 10-40-30Z" fill="url(#gBan)" stroke="#c99618" strokeWidth="1.5" /><path d="M-58-26l-3-8 8-2 3 8Z" fill="#6b4a1a" /><circle cx="58" cy="2" r="3.5" fill="#5a3b12" /></g>;
const Egg = ({ x, y, r, s }) => <g transform={T(x, y, r, s)}><path d="M0-32C18-32 28-6 28 12 28 28 16 38 0 38S-28 28-28 12C-28-6-18-32 0-32Z" fill="url(#gEgg)" /><ellipse cx="-9" cy="-10" rx="5" ry="9" fill="#fff" opacity=".4" transform="rotate(15 -9 -10)" /></g>;
const Wh = ({ r }) => <g transform={T(100, 126, r)}><path d="M0 0V-96" stroke="#b58a2f" strokeWidth="2.5" strokeLinecap="round" />{[0, 1, 2, 3, 4, 5].map(i => <g key={i}><ellipse cx="-6" cy={-34 - i * 10} rx="4.5" ry="9" transform={`rotate(-28 -6 ${-34 - i * 10})`} fill="url(#gGr)" /><ellipse cx="6" cy={-34 - i * 10} rx="4.5" ry="9" transform={`rotate(28 6 ${-34 - i * 10})`} fill="url(#gGr)" /></g>)}<ellipse cx="0" cy="-104" rx="4.5" ry="9" fill="url(#gGr)" /></g>;
const On = ({ x, y, s }) => <g transform={T(x, y, 0, s)}><path d="M0-38C6-26 36-18 36 6 36 26 20 36 0 36S-36 26-36 6C-36-18-6-26 0-38Z" fill="url(#gOn)" /><path d="M0-30C-16-10-16 20 0 34M0-30C16-10 16 20 0 34" stroke="#f3c6d6" strokeWidth="2" fill="none" opacity=".4" /><path d="M0-38c-1-6 1-9 3-13M-6 36h12" stroke="#a9763a" strokeWidth="3" strokeLinecap="round" /><ellipse cx="-14" cy="-6" rx="6" ry="12" fill="#fff" opacity=".22" /></g>;
const SC = {
  tomato: <><Tom x={58} y={98} s={.62} /><Tom x={144} y={99} s={.64} /><Tom x={100} y={82} s={.95} /></>,
  potato: <><Pot x={60} y={100} r={-12} s={.78} /><Pot x={140} y={102} r={14} s={.78} /><Pot x={100} y={90} r={-4} s={1.05} /></>,
  leaf: <><Lf r={-44} /><Lf r={44} /><Lf r={-18} /><Lf r={18} /><Lf r={0} /></>,
  carrot: <><Car x={66} y={76} r={-32} /><Car x={134} y={76} r={32} /><Car x={100} y={72} r={0} /></>,
  milk: <><path d="M84 34h32v14l12 16v54a7 7 0 0 1-7 7H79a7 7 0 0 1-7-7V64l12-16Z" fill="url(#gGls)" stroke="#c4d6e8" strokeWidth="2" /><rect x="84" y="26" width="32" height="12" rx="4" fill="#3a6a9c" /><rect x="72" y="78" width="56" height="34" fill="#dbe8f5" /><path d="M100 84c-5 7-8 10-8 15a8 8 0 0 0 16 0c0-5-3-8-8-15Z" fill="#3a6a9c" /><path d="M80 54l6-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".85" /><path d="M140 86h24l-3 38h-18Z" fill="url(#gGls)" stroke="#c4d6e8" strokeWidth="2" /><ellipse cx="152" cy="90" rx="11" ry="3" fill="#fff" stroke="#c4d6e8" /></>,
  mango: <><Man x={64} y={92} r={-16} s={.78} /><Man x={138} y={90} r={18} s={.82} /><Man x={100} y={84} r={0} s={1} /></>,
  banana: <g transform="translate(100 78) scale(.85) translate(-100 -78)"><Ban y={60} r={-5} /><Ban y={77} r={0} /><Ban y={94} r={4} /></g>,
  egg: <><Egg x={68} y={88} r={-10} s={.85} /><Egg x={132} y={88} r={10} s={.85} /><Egg x={100} y={90} r={0} s={.95} /><path d="M42 108h116l-6 18H48Z" fill="#d7c39a" /></>,
  grain: <><Wh r={-26} /><Wh r={26} /><Wh r={0} /></>,
  onion: <><On x={60} y={98} s={.7} /><On x={140} y={100} s={.72} /><On x={100} y={84} s={1} /></>,
};
const Art = ({ p, big, sm }) => <div className={`art c-${p.cat} ${big ? 'big' : ''} ${sm ? 'sm' : ''}`}><svg viewBox={big ? '25 5 150 150' : sm ? '38 22 124 124' : '0 0 200 150'} aria-hidden="true"><ellipse cx="100" cy="126" rx="60" ry="7" fill="#0d3b22" opacity=".13" />{SC[p.type]}</svg>{p.img && <img src={p.img} alt={p.name} onError={e => e.currentTarget.remove()} />}</div>;

/* ---------- store ---------- */
const usePersist = (k, init) => {
  const key = 'fresho_v3_' + k;
  const [v, setV] = useState(() => { try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch (e) { } return typeof init === 'function' ? init() : init; });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { } }, [key, v]);
  useEffect(() => { const h = e => { if (e.key === key && e.newValue) { try { setV(JSON.parse(e.newValue)); } catch (_) { } } }; window.addEventListener('storage', h); return () => window.removeEventListener('storage', h); }, [key]);
  return [v, setV];
};
class Boundary extends React.Component {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? <div className="plain"><div className="wrap roles"><h1>Something went wrong</h1><p>Saved data may be out of date.</p><button className="btn p" onClick={() => { try { Object.keys(localStorage).filter(k => k.startsWith('fresho_')).forEach(k => localStorage.removeItem(k)); } catch (e) { } location.hash = '#/'; location.reload(); }}>Reset app data</button></div></div> : this.props.children; }
}
const Ctx = createContext();
const useS = () => useContext(Ctx);
function Store({ children }) {
  const [rawUser, setUser] = usePersist('user', null);
  const user = rawUser && rawUser.name && NAV[rawUser.role] ? rawUser : null;
  const [accounts, setAccounts] = usePersist('accounts', []);
  const [cart, setCart] = usePersist('cart', []);
  const [orders, setOrders] = usePersist('orders', seedOrders);
  const [products, setProducts] = usePersist('products', PRODUCTS);
  const [farmers, setFarmers] = usePersist('farmers', FARMERS);
  const [msg, setMsg] = useState('');
  const toast = t => { setMsg(t); setTimeout(() => setMsg(''), 2400); };
  const prod = id => products.find(p => p.id === id);
  const farmer = id => farmers.find(f => f.id === id) || {};
  // Demo identities. Unregistered emails log in as these; registered accounts need their own password.
  // NOTE: passwords are kept in localStorage only because this is a mock — move auth to the backend.
  const DEMO = { customer: { name: 'Zeel Patel', email: 'zeel.patel@example.com', phone: '9876543210' }, farmer: { name: 'Ramesh Patel', email: 'ramesh@example.com', fid: 'f1' }, admin: { name: 'Fresho Admin', email: 'admin@fresho.in' } };
  const start = u => { setUser(u); setCart([]); return null; };
  const login = (role, email, pw) => {
    const a = accounts.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!a) return start({ role, ...DEMO[role] });
    if (a.role !== role) return 'This email is registered as a ' + a.role + '. Choose that role to log in.';
    if (a.pw !== pw) return 'Incorrect password.';
    return start({ role, name: a.name, email: a.email, phone: a.phone, fid: a.fid });
  };
  const register = (role, d) => {
    if (role === 'admin') return 'Administrator accounts cannot be self-registered.';
    if (accounts.some(x => x.email.toLowerCase() === d.email.toLowerCase())) return 'This email is already registered. Please log in.';
    let fid; if (role === 'farmer') { fid = 'f' + Date.now(); setFarmers(f => [...f, { id: fid, name: d.name, farm: d.farm, place: 'Gujarat', rating: 0, verified: false, since: 2026 }]); }
    setAccounts(x => [...x, { role, name: d.name, email: d.email, phone: d.phone, pw: d.pw, fid }]);
    return start({ role, name: d.name, email: d.email, phone: d.phone, fid });
  };
  const shop = products.filter(p => farmers.some(f => f.id === p.fid && f.verified));
  const add = (id, q = 1) => { setCart(c => c.some(i => i.id === id) ? c.map(i => i.id === id ? { ...i, q: Math.min(i.q + q, prod(id).stock) } : i) : [...c, { id, q }]); toast(prod(id).name + ' added to cart'); };
  const setQty = (id, q) => setCart(c => c.map(i => i.id === id ? { ...i, q: Math.max(1, Math.min(q, prod(id).stock)) } : i));
  const remove = id => setCart(c => c.filter(i => i.id !== id));
  const lines = cart.map(i => ({ ...prod(i.id), q: i.q })).filter(l => l.name);
  const sub = lines.reduce((a, l) => a + l.price * l.q, 0);
  const place = (addr, pay) => {
    const id = 'FR' + (1050 + orders.filter(o => o.id.startsWith('FR10')).length);
    setOrders(o => [{ id, cust: user.name, email: user.email, status: 'Pending', date: Date.now(), addr, pay, total: sub + fee(sub), items: lines.map(l => ({ id: l.id, name: l.name, price: l.price, unit: l.unit, fid: l.fid, type: l.type, cat: l.cat, q: l.q })) }, ...o]);
    setProducts(ps => ps.map(p => { const l = lines.find(x => x.id === p.id); return l ? { ...p, stock: p.stock - l.q } : p; }));
    setCart([]); return id;
  };
  const setStatus = (id, s) => {
    const o = orders.find(x => x.id === id);
    if (s === 'Cancelled' && o && o.status !== 'Cancelled') setProducts(ps => ps.map(p => { const i = o.items.find(x => x.id === p.id); return i ? { ...p, stock: p.stock + i.q } : p; }));
    setOrders(o => o.map(x => x.id === id ? { ...x, status: s } : x)); toast('Order ' + id + ' marked ' + s); };
  const addProduct = p => { setProducts(ps => [{ ...p, id: Date.now(), harvest: 'Today' }, ...ps]); toast('Product published'); };
  const delProduct = id => { setProducts(ps => ps.filter(p => p.id !== id)); toast('Product removed'); };
  const setStock = (id, n) => setProducts(ps => ps.map(p => p.id === id ? { ...p, stock: Math.max(0, n) } : p));
  const verify = (id, v) => { setFarmers(f => f.map(x => x.id === id ? { ...x, verified: v } : x)); toast(v ? 'Farmer verified' : 'Verification revoked'); };
  return <Ctx.Provider value={{ user, setUser, cart, lines, sub, orders, products, shop, farmers, prod, farmer, login, register, add, setQty, remove, place, setStatus, addProduct, delProduct, setStock, verify, toast }}>{children}{msg && <div className="toast"><Icon n="check" s={15} />{msg}</div>}</Ctx.Provider>;
}

/* ---------- shell ---------- */
const NAV = {
  customer: [['/customer', 'Home'], ['/explore', 'Explore'], ['/orders', 'My Orders'], ['/profile', 'Profile']],
  farmer: [['/farmer', 'Overview'], ['/farmer/products', 'My Products'], ['/farmer/add', 'Add Product'], ['/farmer/orders', 'Orders']],
  admin: [['/admin', 'Overview'], ['/admin/farmers', 'Farmers'], ['/admin/products', 'Products'], ['/admin/orders', 'Orders']],
};
const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
function Shell({ children }) {
  const { user, setUser, lines } = useS(); const nav = useNavigate(); const [q, setQ] = useState(''); const [open, setOpen] = useState(false);
  const c = user.role === 'customer'; const count = lines.reduce((a, l) => a + l.q, 0);
  const out = () => { setUser(null); nav('/'); };
  const links = NAV[user.role].map(([to, l]) => <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'on' : ''}>{l}</NavLink>);
  return <div className={'shell ' + (c ? 'top-layout' : 'side-layout')}>
    <header className="top"><div className="top-in">
      <Logo />
      {c && <nav className={'topnav' + (open ? ' open' : '')} onClick={() => setOpen(false)}>{links}</nav>}
      {c && <div className="search"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && nav('/explore?q=' + encodeURIComponent(q))} placeholder="Search produce, farmers…" aria-label="Search" /></div>}
      <div className="top-r">
        {c && <button className="icon menu-btn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon n="menu" /></button>}
        {c && <Link to="/cart" className="cartbtn" aria-label="Cart"><Icon n="cart" />{count > 0 && <b>{count}</b>}</Link>}
        <span className="chip-user"><span className="av">{initials(user.name)}</span><span className="hide-s">{user.name}</span></span>
        <button className="icon" onClick={out} aria-label="Log out" title="Log out"><Icon n="out" /></button>
      </div></div></header>
    {!c && <aside className="side"><div className="side-tag">{user.role === 'farmer' ? 'Farmer workspace' : 'Administration'}</div>{links}</aside>}
    <main className={c ? 'wrap page' : 'main page'} key={user.role}>{children}</main>
    {c && <Foot />}
  </div>;
}
const Foot = () => <footer className="foot"><div className="wrap foot-in"><div><Logo light /><p>Fresh produce from local farmers, delivered to your door.</p></div><div><h4>Shop</h4><Link to="/explore">All produce</Link><Link to="/explore?c=Vegetables">Vegetables</Link><Link to="/explore?c=Fruits">Fruits</Link></div><div><h4>Account</h4><Link to="/orders">My orders</Link><Link to="/cart">Cart</Link><Link to="/profile">Profile</Link></div><div><h4>Contact</h4><span>support@fresho.in</span><span>Ahmedabad, Gujarat</span></div></div><div className="wrap copy">© 2026 Fresho. Local farmer marketplace.</div></footer>;
function Guard({ role, children }) { const { user } = useS(); if (!user || user.role !== role) return <Navigate to="/login" replace />; return <Shell>{children}</Shell>; }

/* ---------- public ---------- */
function Landing() {
  const { shop: products, farmer, user } = useS(); const feat = products.slice(0, 4);
  const dash = user && { customer: '/customer', farmer: '/farmer', admin: '/admin' }[user.role];
  const jump = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return <div className="landing">
    <header className="lnav"><div className="wrap lnav-in"><Logo /><nav><a href="#how" onClick={jump('how')}>How it works</a><a href="#featured" onClick={jump('featured')}>Produce</a><a href="#farmers" onClick={jump('farmers')}>For farmers</a></nav><div className="row">{dash ? <Btn to={dash}>Open dashboard</Btn> : <><Btn to="/login" v="g">Log in</Btn><Btn to="/roles">Get started</Btn></>}</div></div></header>
    <section className="wrap hero">
      <div className="hero-copy"><span className="eyebrow">Local produce, direct from farmers</span><h1>Fresh from the farm, straight to your door.</h1><p>Fresho connects households in Gujarat with verified local farmers — clear prices, harvest dates you can trust, and no middlemen.</p>
        <div className="row"><Btn to={dash || '/roles'}>{dash ? 'Open dashboard' : 'Get started'} <Icon n="arrow" s={16} /></Btn><Btn to={dash || '/login'} v="o">Browse produce</Btn></div>
        <div className="trust"><span><Icon n="shield" s={16} />Verified farmers</span><span><Icon n="truck" s={16} />Same-day delivery</span><span><Icon n="leaf" s={16} />Harvest-date labels</span></div></div>
      <div className="hero-card"><div className="hc-head"><span>Harvested today</span><span className="live"><i />24 farms nearby</span></div>
        {feat.map(p => <div className="hc-row" key={p.id}><Art p={p} sm /><div><b>{p.name}</b><small>{farmer(p.fid).farm}, {farmer(p.fid).place}</small></div><strong>{money(p.price)}<small>/{p.unit}</small></strong></div>)}
        <div className="hc-foot">Free delivery on orders above {money(FREE_ABOVE)}</div></div>
    </section>
    <section className="band"><div className="wrap stats4">{[['24', 'farms on Fresho'], ['1,100+', 'orders delivered'], ['4.8', 'average farmer rating'], ['< 24h', 'farm to doorstep']].map(s => <div key={s[1]}><b>{s[0]}</b><span>{s[1]}</span></div>)}</div></section>
    <section className="wrap sec" id="featured"><div className="sec-h"><div><span className="eyebrow">This week</span><h2>Fresh on Fresho</h2></div><Btn to="/login" v="g">View all <Icon n="arrow" s={15} /></Btn></div>
      <div className="grid4">{products.slice(0, 8).map(p => <Card key={p.id} p={p} guest />)}</div></section>
    <section className="sec alt" id="how"><div className="wrap"><div className="sec-h c"><div><span className="eyebrow">How it works</span><h2>A simpler way to buy local</h2></div></div>
      <div className="steps3">{[['01', 'Farmers list their harvest', 'Verified farmers add produce, set their own prices and keep stock up to date.'], ['02', 'You browse and order', 'Compare farmers, check harvest dates and check out in three quick steps.'], ['03', 'Delivered fresh', 'Track your order from confirmation to doorstep. Pay by UPI, card or cash.']].map(s => <div className="card step" key={s[0]}><span>{s[0]}</span><h3>{s[1]}</h3><p>{s[2]}</p></div>)}</div></div></section>
    <section className="wrap sec" id="farmers"><div className="cta"><div><span className="eyebrow lt">For local farmers</span><h2>Your harvest deserves a better storefront.</h2><p>List what you grow, manage incoming orders and track your earnings from one dashboard. You set the price — Fresho handles discovery.</p><ul>{['No listing fees for your first 20 products', 'Order, stock and earnings in one place', 'Direct payouts every week'].map(x => <li key={x}><Icon n="check" s={16} />{x}</li>)}</ul><Btn to="/register" v="lime">Start selling <Icon n="arrow" s={16} /></Btn></div>
      <div className="cta-card"><small>Farmer dashboard</small><b>₹42,850</b><span>earned this month</span><div className="mini-bars">{FARMER_SALES.map((h, i) => <i key={i} style={{ height: h * 2 + '%' }} />)}</div></div></div></section>
    <Foot />
  </div>;
}
function Roles() {
  const nav = useNavigate();
  const R = [['customer', 'Customer', 'Buy fresh produce directly from local farmers.', 'cart', ['Browse 12+ fresh products', 'Track every order', 'Free delivery above ' + money(FREE_ABOVE)]],
    ['farmer', 'Farmer', 'List your harvest and manage orders and earnings.', 'leaf', ['Set your own prices', 'Manage stock and orders', 'Weekly payouts']],
    ['admin', 'Administrator', 'Verify farmers and oversee the marketplace.', 'shield', ['Approve new farmers', 'Moderate listings', 'Monitor all orders']]];
  const prev = {
    customer: <div className="pv-tiles"><Art p={{ cat: 'Vegetables', type: 'tomato' }} sm /><Art p={{ cat: 'Fruits', type: 'mango' }} sm /><Art p={{ cat: 'Dairy', type: 'milk' }} sm /></div>,
    farmer: <div className="pv-farm"><div><small>This month</small><b>₹42,850</b></div><div className="mini-bars">{FARMER_SALES.map((h, i) => <i key={i} style={{ height: h * 2 + '%' }} />)}</div></div>,
    admin: <div className="pv-rows">{[['Sita Devi', 'Verified'], ['Arjun Singh', 'Pending']].map(r => <div key={r[0]}><span className="av">{initials(r[0])}</span><b>{r[0]}</b><Pill s={r[1]} /></div>)}</div>,
  };
  return <div className="plain"><header className="wrap lnav-in"><Logo /><Btn to="/" v="g"><Icon n="back" s={15} />Back</Btn></header>
    <div className="wrap roles"><span className="eyebrow">Welcome to Fresho</span><h1>How would you like to use Fresho?</h1><p>Choose a role to continue.</p>
      <div className="grid3">{R.map(r => <button key={r[0]} className="card role" onClick={() => nav('/login?role=' + r[0])}><div className={'rprev ' + r[0]}>{prev[r[0]]}</div><div className="rbody"><div className="row"><span className="ico"><Icon n={r[3]} s={20} /></span><h3 className="m0">{r[1]}</h3></div><p>{r[2]}</p><ul>{r[4].map(x => <li key={x}><Icon n="check" s={14} />{x}</li>)}</ul><span className="go">Continue <Icon n="arrow" s={15} /></span></div></button>)}</div>
      <p className="mu">New to Fresho? <Link to="/register">Create an account</Link></p></div></div>;
}
function Auth({ reg }) {
  const [sp] = useSearchParams(); const { login, register, user } = useS(); const nav = useNavigate();
  const [role, setRole] = useState(() => { const r = sp.get('role'); return ['customer', 'farmer', 'admin'].includes(r) && !(reg && r === 'admin') ? r : 'customer'; });
  const [f, setF] = useState({ name: '', email: '', phone: '', farm: '', pw: '', pw2: '' }); const [e, setE] = useState({});
  const set = k => ev => setF({ ...f, [k]: ev.target.value });
  const home = { customer: '/customer', farmer: '/farmer', admin: '/admin' };
  if (user) return <Navigate to={home[user.role]} replace />;
  const submit = ev => {
    ev.preventDefault(); const x = {};
    if (reg && f.name.trim().length < 3) x.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email address';
    if (reg && !/^[6-9]\d{9}$/.test(f.phone)) x.phone = 'Enter a valid 10-digit mobile number';
    if (reg && role === 'farmer' && !f.farm.trim()) x.farm = 'Enter your farm name';
    if (f.pw.length < 6) x.pw = 'Password must be at least 6 characters';
    if (reg && f.pw !== f.pw2) x.pw2 = 'Passwords do not match';
    setE(x); if (Object.keys(x).length) return;
    const err = reg ? register(role, f) : login(role, f.email, f.pw);
    if (err) { setE({ form: err }); return; }
    nav(home[role]);
  };
  return <div className="auth"><div className="auth-l"><Logo /><form onSubmit={submit} noValidate>
    <span className="eyebrow">{reg ? 'Join Fresho' : 'Welcome back'}</span><h1>{reg ? 'Create your account' : 'Log in to Fresho'}</h1>
    <p className="mu">{reg ? 'Join the local farm community.' : 'Continue to your Fresho account.'}</p>
    <div className="seg">{['customer', 'farmer', 'admin'].map(r => (reg && r === 'admin') ? null : <button type="button" key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>{r}</button>)}</div>
    {reg && <F label="Full name" err={e.name}><input value={f.name} onChange={set('name')} placeholder="e.g. Zeel Patel" /></F>}
    <F label="Email" err={e.email}><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" /></F>
    {reg && <F label="Mobile number" err={e.phone}><input value={f.phone} onChange={set('phone')} placeholder="98XXXXXXXX" maxLength={10} /></F>}
    {reg && role === 'farmer' && <F label="Farm name" err={e.farm}><input value={f.farm} onChange={set('farm')} placeholder="e.g. Patel Organic Farm" /></F>}
    <F label="Password" err={e.pw}><input type="password" value={f.pw} onChange={set('pw')} placeholder="At least 6 characters" /></F>
    {reg && <F label="Confirm password" err={e.pw2}><input type="password" value={f.pw2} onChange={set('pw2')} /></F>}
    {e.form && <div className="err-box">{e.form}</div>}
    <Btn className="full" type="submit">{reg ? 'Create account' : 'Log in'}</Btn>
    {!reg && <p className="hint">Demo: any email + 6-character password signs in as a demo user. Registered accounts need their own password.</p>}
    <p className="mu c">{reg ? 'Already have an account?' : 'New to Fresho?'} <Link to={(reg ? '/login' : '/register') + '?role=' + (role === 'admin' && !reg ? 'customer' : role)}>{reg ? 'Log in' : 'Sign up'}</Link></p>
  </form></div>
  <div className="auth-r"><div><span className="eyebrow lt">Fresh from farms</span><h2>Good food starts with the people who grow it.</h2><p>Buy straight from verified local farmers, or open your own storefront in minutes.</p>
    <div className="auth-stats"><div><b>24</b><span>local farms</span></div><div><b>1,100+</b><span>orders delivered</span></div><div><b>4.8★</b><span>farmer rating</span></div></div></div></div></div>;
}

/* ---------- customer ---------- */
function Card({ p, guest }) {
  const { farmer, add } = useS(); const f = farmer(p.fid); const to = guest ? '/login' : '/product/' + p.id;
  return <div className="card pcard"><Link to={to} aria-label={p.name}><Art p={p} />{p.stock > 0 && p.stock < 10 ? <span className="low">Only {p.stock} left</span> : p.harvest === 'Today' && <span className="low fresh"><i />Harvested today</span>}</Link>
    <div className="pbody"><span className="cat">{p.cat}</span><Link to={to}><h3>{p.name}</h3></Link><p className="mu">{f.farm} · {f.place}</p>
      <div className="meta"><Stars r={f.rating} />{f.verified && <span className="vf"><Icon n="shield" s={12} />Verified</span>}</div>
      <div className="prow"><div><b>{money(p.price)}</b><small> / {p.unit}</small></div>{guest ? <Link to={to} className="addbtn" aria-label="View"><Icon n="arrow" s={15} /></Link> : <button className="addbtn" disabled={p.stock <= 0} onClick={() => add(p.id)} aria-label={'Add ' + p.name}><Icon n="plus" s={16} /></button>}</div></div></div>;
}
function Home() {
  const { user, shop: products, farmers } = useS();
  return <>
    <section className="banner"><div><span className="eyebrow lt">Harvested this week</span><h2>Good morning, {user.name.split(' ')[0]}.<br />What's fresh today?</h2><p>Order before 6 PM for same-day delivery in Ahmedabad. Free delivery above {money(FREE_ABOVE)}.</p><Btn to="/explore" v="lime">Shop produce <Icon n="arrow" s={16} /></Btn></div>
      <div className="banner-tiles">{products.slice(0, 4).map(p => <Link key={p.id} to={'/product/' + p.id} className="bt"><Art p={p} sm /><div><b>{p.name}</b><small>{money(p.price)} / {p.unit}</small></div></Link>)}</div></section>
    <div className="sec-h"><h2>Shop by category</h2></div>
    <div className="grid4 cats">{CATS.map(c => <Link key={c} to={'/explore?c=' + c} className="card cat-card"><Art p={{ cat: c, type: { Vegetables: 'tomato', Fruits: 'mango', Dairy: 'milk', Grains: 'grain' }[c] }} sm /><div><b>{c}</b><small>{products.filter(p => p.cat === c).length} items</small></div><Icon n="chev" s={16} /></Link>)}</div>
    <div className="sec-h"><h2>Fresh this week</h2><Btn to="/explore" v="g" sm>View all <Icon n="arrow" s={14} /></Btn></div>
    <div className="grid4">{products.slice(0, 8).map(p => <Card key={p.id} p={p} />)}</div>
    <div className="sec-h"><h2>Farmers near you</h2></div>
    <div className="grid4">{farmers.filter(f => f.verified).map(f => <Link key={f.id} to={'/explore?f=' + f.id} className="card fcard"><span className="av lg">{initials(f.name)}</span><div><b>{f.name}</b><small>{f.farm}</small><small><Icon n="pin" s={12} /> {f.place} · <Stars r={f.rating} /></small></div></Link>)}</div>
    <div className="perks">{[['shield', 'Verified farmers', 'Every farm is reviewed before listing.'], ['truck', 'Same-day delivery', 'Order by 6 PM across Ahmedabad.'], ['leaf', 'Harvest-date labels', 'Know exactly when it was picked.']].map(x => <div key={x[0]}><span className="ico"><Icon n={x[0]} /></span><div><b>{x[1]}</b><small>{x[2]}</small></div></div>)}</div>
  </>;
}
function Explore() {
  const { shop: products, farmer } = useS(); const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '', cat = sp.get('c') || 'All', fid = sp.get('f') || '';
  const [sort, setSort] = useState('rel'); const [max, setMax] = useState(500); const [inStock, setIn] = useState(false);
  const upd = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };
  let list = products.filter(p => (cat === 'All' || p.cat === cat) && (!fid || p.fid === fid) && p.price <= max && (!inStock || p.stock > 0) && (p.name + farmer(p.fid).farm + farmer(p.fid).place).toLowerCase().includes(q.toLowerCase()));
  if (sort === 'lo') list = [...list].sort((a, b) => a.price - b.price); if (sort === 'hi') list = [...list].sort((a, b) => b.price - a.price);
  return <><Head title="Explore produce" sub="Fresh products from verified farmers across Gujarat." />
    <div className="toolbar"><div className="search wide"><Icon n="search" s={16} /><input value={q} onChange={e => upd('q', e.target.value)} placeholder="Search produce, farms or places…" aria-label="Search products" /></div>
      <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort"><option value="rel">Sort: Relevance</option><option value="lo">Price: Low to high</option><option value="hi">Price: High to low</option></select></div>
    <div className="chips">{['All', ...CATS].map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => upd('c', c === 'All' ? '' : c)}>{c}</button>)}{fid && <button className="on" onClick={() => upd('f', '')}>{farmer(fid).farm} ✕</button>}</div>
    <div className="explore"><aside className="card filters"><h4>Filters</h4><label className="f"><span>Max price: {money(max)}</span><input type="range" min="20" max="500" step="10" value={max} onChange={e => setMax(+e.target.value)} /></label><label className="chk"><input type="checkbox" checked={inStock} onChange={e => setIn(e.target.checked)} />In stock only</label><button className="lnk" onClick={() => { setMax(500); setIn(false); setSp({}); }}>Reset filters</button></aside>
      <div><p className="mu count">{list.length} product{list.length !== 1 && 's'}</p>{list.length ? <div className="grid3 pg">{list.map(p => <Card key={p.id} p={p} />)}</div> : <Empty title="No produce found" text="Try a different search or reset your filters." />}</div></div></>;
}
function Product() {
  const { id } = useParams(); const { prod, farmer, add, shop: products } = useS(); const p = prod(+id); const [q, setQ] = useState(1); const nav = useNavigate();
  if (!p || !products.some(x => x.id === p.id)) return <Navigate to="/explore" replace />;
  const f = farmer(p.fid);
  return <><div className="crumbs"><Link to="/explore">Explore</Link><Icon n="chev" s={13} /><Link to={'/explore?c=' + p.cat}>{p.cat}</Link><Icon n="chev" s={13} /><span>{p.name}</span></div>
    <div className="detail"><Art p={p} big />
      <div><span className="cat">{p.cat}</span><h1>{p.name}</h1><div className="row mu"><Stars r={f.rating} /><span>· {f.farm}, {f.place}</span></div>
        <div className="bigp">{money(p.price)}<small> / {p.unit}</small></div><p className="desc">{p.desc}</p>
        <div className="row buy"><div className="step-q"><button onClick={() => setQ(Math.max(1, q - 1))}>−</button><span>{q}</span><button onClick={() => setQ(Math.min(p.stock, q + 1))}>+</button></div>
          <Btn disabled={p.stock <= 0} onClick={() => add(p.id, q)}>Add to cart · {money(p.price * q)}</Btn><Btn v="o" disabled={p.stock <= 0} onClick={() => { add(p.id, q); nav('/cart'); }}>Buy now</Btn></div>
        <table className="kv"><tbody><tr><th>Harvested</th><td>{p.harvest}</td></tr><tr><th>Availability</th><td>{p.stock > 0 ? p.stock + ' ' + p.unit + ' in stock' : 'Out of stock'}</td></tr><tr><th>Delivery</th><td>Same day if ordered by 6 PM</td></tr><tr><th>Farmer</th><td>{f.name} {f.verified && <span className="pill delivered">Verified</span>}</td></tr></tbody></table></div></div>
    <div className="sec-h"><h2>More from {f.farm}</h2></div><div className="grid4">{products.filter(x => x.fid === p.fid && x.id !== p.id).slice(0, 4).map(x => <Card key={x.id} p={x} />)}</div></>;
}
function Totals({ cta }) {
  const { sub } = useS(); const d = fee(sub);
  return <aside className="card sum"><h3>Order summary</h3><div><span>Subtotal</span><b>{money(sub)}</b></div><div><span>Delivery</span><b>{d ? money(d) : 'Free'}</b></div>{d > 0 && sub > 0 && <p className="mu">Add {money(FREE_ABOVE - sub)} more for free delivery.</p>}<div className="tot"><span>Total</span><b>{money(sub + d)}</b></div>{cta}</aside>;
}
function Cart() {
  const { lines, setQty, remove } = useS();
  if (!lines.length) return <><Head title="My cart" /><Empty title="Your cart is empty" text="Add some fresh produce to get started." to="/explore" cta="Browse produce" /></>;
  return <><Head title="My cart" sub={lines.length + ' item' + (lines.length > 1 ? 's' : '')} /><div className="two">
    <div className="card lines">{lines.map(l => <div className="line" key={l.id}><Art p={l} sm /><div className="grow"><Link to={'/product/' + l.id}><b>{l.name}</b></Link><small>{money(l.price)} / {l.unit}</small></div><div className="step-q"><button onClick={() => setQty(l.id, l.q - 1)}>−</button><span>{l.q}</span><button onClick={() => setQty(l.id, l.q + 1)}>+</button></div><b className="lt">{money(l.price * l.q)}</b><button className="icon" onClick={() => remove(l.id)} aria-label="Remove"><Icon n="trash" s={16} /></button></div>)}</div>
    <Totals cta={<Btn to="/checkout" className="full">Proceed to checkout <Icon n="arrow" s={16} /></Btn>} /></div></>;
}
function Checkout() {
  const { user, lines, sub, place } = useS(); const nav = useNavigate();
  const [step, setStep] = useState(1); const [pay, setPay] = useState('UPI'); const done = useRef(false);
  const [a, setA] = useState({ name: user.name, phone: user.phone || '', line: '', pin: '' }); const [e, setE] = useState({});
  if (!lines.length && !done.current) return <Navigate to="/cart" replace />;
  const set = k => ev => setA({ ...a, [k]: ev.target.value });
  const next = () => { const x = {}; if (a.name.trim().length < 3) x.name = 'Enter the recipient name'; if (!/^[6-9]\d{9}$/.test(a.phone)) x.phone = 'Enter a valid 10-digit number'; if (a.line.trim().length < 8) x.line = 'Enter the full delivery address'; if (!/^\d{6}$/.test(a.pin)) x.pin = 'Enter a 6-digit pincode'; setE(x); if (!Object.keys(x).length) setStep(2); };
  return <><Head title="Checkout" /><div className="steps">{['Address', 'Payment', 'Review'].map((s, i) => <span key={s} className={step > i + 1 ? 'done' : step === i + 1 ? 'on' : ''}><i>{step > i + 1 ? <Icon n="check" s={12} /> : i + 1}</i>{s}</span>)}</div>
    <div className="two"><div className="card pad">
      {step === 1 && <><h3>Delivery address</h3><div className="fgrid"><F label="Full name" err={e.name}><input value={a.name} onChange={set('name')} /></F><F label="Mobile number" err={e.phone}><input value={a.phone} onChange={set('phone')} maxLength={10} /></F><div className="span2"><F label="Address" err={e.line}><textarea rows="3" value={a.line} onChange={set('line')} placeholder="House no., street, area, city" /></F></div><F label="Pincode" err={e.pin}><input value={a.pin} onChange={set('pin')} maxLength={6} /></F></div><Btn onClick={next}>Continue to payment</Btn></>}
      {step === 2 && <><h3>Payment method</h3>{[['UPI', 'Pay with any UPI app'], ['Card', 'Credit or debit card'], ['Cash on Delivery', 'Pay when your order arrives']].map(([m, d]) => <label key={m} className={'opt ' + (pay === m ? 'on' : '')}><input type="radio" name="pay" checked={pay === m} onChange={() => setPay(m)} /><div><b>{m}</b><small>{d}</small></div></label>)}<div className="row"><Btn v="o" onClick={() => setStep(1)}>Back</Btn><Btn onClick={() => setStep(3)}>Review order</Btn></div></>}
      {step === 3 && <><h3>Review your order</h3><div className="rev"><div><small>Deliver to</small><b>{a.name}</b><span>{a.line}, {a.pin}</span><span>+91 {a.phone}</span></div><div><small>Payment</small><b>{pay}</b></div></div>{lines.map(l => <div className="line slim" key={l.id}><Art p={l} sm /><div className="grow"><b>{l.name}</b><small>{l.q} × {money(l.price)}</small></div><b>{money(l.q * l.price)}</b></div>)}<div className="row"><Btn v="o" onClick={() => setStep(2)}>Back</Btn><Btn onClick={() => { done.current = true; const id = place(a, pay); nav('/orders/' + id); }}>Place order · {money(sub + fee(sub))}</Btn></div></>}
    </div><Totals /></div></>;
}
const FLOW = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
function Orders() {
  const { orders, user } = useS(); const [t, setT] = useState('All');
  const mine = orders.filter(o => o.email === user.email); const list = mine.filter(o => t === 'All' || o.status === t);
  return <><Head title="My orders" sub="Track and manage your orders." /><div className="chips">{['All', ...STATUSES].map(s => <button key={s} className={t === s ? 'on' : ''} onClick={() => setT(s)}>{s}{s === 'All' ? ` (${mine.length})` : ''}</button>)}</div>
    {list.length ? <div className="ostack">{list.map(o => <Link to={'/orders/' + o.id} className="card ocard" key={o.id}><div className="thumbs">{o.items.slice(0, 3).map(i => <Art key={i.id} p={i} sm />)}</div><div className="grow"><b>#{o.id}</b><small>{fdate(o.date)} · {o.items.length} item{o.items.length > 1 && 's'}</small></div><b>{money(o.total)}</b><Pill s={o.status} /><Icon n="chev" s={16} /></Link>)}</div> : <Empty title="No orders here" text="Orders you place will show up here." to="/explore" cta="Start shopping" />}</>;
}
function OrderDetail() {
  const { id } = useParams(); const { orders, setStatus, add } = useS(); const o = orders.find(x => x.id === id); const nav = useNavigate();
  if (!o) return <Navigate to="/orders" replace />;
  const cur = FLOW.indexOf(o.status); const isub = o.items.reduce((a, i) => a + i.price * i.q, 0);
  return <><Link to="/orders" className="back"><Icon n="back" s={15} />My orders</Link><Head title={'Order #' + o.id} sub={'Placed on ' + fdate(o.date)} action={<Pill s={o.status} />} />
    <div className="two"><div>
      <div className="card pad"><h3>Order status</h3>{o.status === 'Cancelled' ? <p className="mu">This order was cancelled.</p> : <div className="tl">{FLOW.map((s, i) => <div key={s} className={'tl-r ' + (i < cur || o.status === 'Delivered' ? 'done' : i === cur ? 'cur' : '')}><span>{i < cur || o.status === 'Delivered' ? <Icon n="check" s={12} /> : ''}</span><div><b>{s}</b><small>{['Order received', 'Farmer confirmed your order', 'On the way to you', 'Delivered to your address'][i]}</small></div></div>)}</div>}
        {o.status === 'Pending' && <Btn v="danger" sm onClick={() => setStatus(o.id, 'Cancelled')}>Cancel order</Btn>}</div>
      <div className="card pad"><h3>Items</h3>{o.items.map(i => <div className="line slim" key={i.id}><Art p={i} sm /><div className="grow"><b>{i.name}</b><small>{i.q} × {money(i.price)} / {i.unit}</small></div><b>{money(i.q * i.price)}</b></div>)}</div></div>
    <aside><div className="card sum"><h3>Summary</h3><div><span>Items</span><b>{money(isub)}</b></div><div><span>Delivery</span><b>{o.total - isub ? money(o.total - isub) : 'Free'}</b></div><div className="tot"><span>Total</span><b>{money(o.total)}</b></div></div>
      <div className="card pad"><h3>Delivery &amp; payment</h3><p className="mu"><b>{o.addr.name}</b><br />{o.addr.line}, {o.addr.pin}<br />+91 {o.addr.phone}</p><p className="mu">Paid via <b>{o.pay}</b></p>{o.status === 'Delivered' && <Btn v="o" sm onClick={() => { o.items.forEach(i => add(i.id, i.q)); nav('/cart'); }}>Reorder</Btn>}</div></aside></div></>;
}
function Profile() {
  const { user, orders } = useS(); const mine = orders.filter(o => o.email === user.email);
  return <><Head title="Profile" sub="Your account details." /><div className="two"><div className="card pad"><div className="row"><span className="av xl">{initials(user.name)}</span><div><h2 className="m0">{user.name}</h2><span className="mu">Customer · Ahmedabad, Gujarat</span></div></div>
    <table className="kv"><tbody><tr><th>Email</th><td>{user.email}</td></tr><tr><th>Mobile</th><td>+91 {user.phone || '—'}</td></tr><tr><th>Default address</th><td>24 Sunrise Park, Vastrapur, Ahmedabad 380015</td></tr><tr><th>Member since</th><td>October 2026</td></tr></tbody></table></div>
    <div className="card pad"><h3>Your activity</h3><div className="stats2"><div><b>{mine.length}</b><span>orders placed</span></div><div><b>{money(mine.filter(o => o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0))}</b><span>total spent</span></div></div></div></div></>;
}

/* ---------- farmer ---------- */
const mineItems = (o, fid) => o.items.filter(i => i.fid === fid);
const share = (o, fid) => mineItems(o, fid).reduce((a, i) => a + i.price * i.q, 0);
const Bars = ({ data, fmt }) => { const m = Math.max(...data); return <div className="chart">{data.map((v, i) => <div key={i} title={fmt(v)}><i style={{ height: (v / m) * 100 + '%', animationDelay: i * 50 + 'ms' }} /><span>{MONTHS[i]}</span></div>)}</div>; };
const Stat = ({ l, v, d }) => <div className="card stat"><span>{l}</span><b>{v}</b><small>{d}</small></div>;
const NEXT = { Pending: ['Confirmed', 'Confirm order'], Confirmed: ['Shipped', 'Mark shipped'], Shipped: ['Delivered', 'Mark delivered'] };
const OrderActions = ({ o }) => { const { setStatus } = useS(); const n = NEXT[o.status]; if (!n) return <span className="mu">—</span>; return <div className="row">{<Btn sm onClick={() => setStatus(o.id, n[0])}>{n[1]}</Btn>}{o.status !== 'Shipped' && <Btn sm v="o" onClick={() => setStatus(o.id, 'Cancelled')}>Cancel</Btn>}</div>; };
function FarmerHome() {
  const { user, products, orders, farmer } = useS(); const fid = user.fid; const me = farmer(fid);
  const prods = products.filter(p => p.fid === fid); const os = orders.filter(o => mineItems(o, fid).length);
  const earned = os.filter(o => o.status === 'Delivered').reduce((a, o) => a + share(o, fid), 0); const pending = os.filter(o => o.status === 'Pending');
  return <><Head title={'Good morning, ' + user.name.split(' ')[0]} sub={me.farm} action={<Btn to="/farmer/add"><Icon n="plus" s={16} />Add product</Btn>} />
    {!me.verified && <div className="notice">Your farm is awaiting admin verification. You can add products once it is approved.</div>}
    <div className="grid4 stats"><Stat l="Products listed" v={prods.length} d={prods.filter(p => p.stock < 10).length + ' low on stock'} /><Stat l="Pending orders" v={pending.length} d="Need your confirmation" /><Stat l="Total earned" v={money(earned)} d="From delivered orders" /><Stat l="Farm rating" v={me.rating || '—'} d="Based on customer reviews" /></div>
    <div className="two eq"><div className="card pad"><div className="between"><h3>Monthly sales</h3><span className="mu">₹ thousand, 2026</span></div><Bars data={FARMER_SALES} fmt={v => '₹' + v + 'k'} /></div>
      <div className="card pad"><h3>Low stock</h3>{prods.filter(p => p.stock < 20).length ? prods.filter(p => p.stock < 20).map(p => <div className="line slim" key={p.id}><Art p={p} sm /><div className="grow"><b>{p.name}</b><small>{p.stock} {p.unit} left</small></div><Link to="/farmer/products" className="lnk">Restock</Link></div>) : <p className="mu">All products are well stocked.</p>}</div></div>
    <div className="card pad"><div className="between"><h3>Recent orders</h3><Link to="/farmer/orders" className="lnk">View all</Link></div><OrdersTable rows={os.slice(0, 5)} fid={fid} /></div></>;
}
const OrdersTable = ({ rows, fid, actions }) => rows.length ? <div className="tbl"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>{fid ? 'Your share' : 'Total'}</th><th>Status</th>{actions && <th>Action</th>}</tr></thead><tbody>{rows.map(o => <tr key={o.id}><td><b>#{o.id}</b><small>{fdate(o.date)}</small></td><td>{o.cust}</td><td>{(fid ? mineItems(o, fid) : o.items).map(i => i.name + ' × ' + i.q).join(', ')}</td><td><b>{money(fid ? share(o, fid) : o.total)}</b></td><td><Pill s={o.status} /></td>{actions && <td><OrderActions o={o} /></td>}</tr>)}</tbody></table></div> : <p className="mu pad0">No orders yet.</p>;
const stockPill = n => n <= 0 ? 'Sold out' : n < 10 ? 'Low stock' : 'Available';
function FarmerProducts() {
  const { user, products, setStock, delProduct } = useS(); const [q, setQ] = useState(''); const rows = products.filter(p => p.fid === user.fid && p.name.toLowerCase().includes(q.toLowerCase()));
  return <><Head title="My products" sub="Keep your storefront accurate." action={<Btn to="/farmer/add"><Icon n="plus" s={16} />Add product</Btn>} />
    <div className="card pad"><div className="search wide mb"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your products…" /></div>
      {rows.length ? <div className="tbl"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><div className="row"><Art p={p} sm /><b>{p.name}</b></div></td><td>{p.cat}</td><td>{money(p.price)} / {p.unit}</td><td><input className="mini" type="number" min="0" value={p.stock} onChange={e => setStock(p.id, +e.target.value)} aria-label="Stock" /></td><td><Pill s={stockPill(p.stock)} /></td><td><button className="icon" onClick={() => window.confirm('Delete ' + p.name + '?') && delProduct(p.id)} aria-label="Delete"><Icon n="trash" s={16} /></button></td></tr>)}</tbody></table></div> : <p className="mu">No products found.</p>}</div></>;
}
function AddProduct() {
  const { user, farmer, addProduct } = useS(); const nav = useNavigate(); const me = farmer(user.fid);
  const [p, setP] = useState({ name: '', cat: 'Vegetables', price: '', unit: 'kg', stock: '', desc: '' }); const [e, setE] = useState({});
  const set = k => ev => setP({ ...p, [k]: ev.target.value });
  const submit = ev => { ev.preventDefault(); const x = {}; if (p.name.trim().length < 3) x.name = 'Enter a product name'; if (!(+p.price > 0)) x.price = 'Enter a valid price'; if (!(+p.stock > 0)) x.stock = 'Enter available stock'; if (p.desc.trim().length < 10) x.desc = 'Add a short description (10+ characters)'; setE(x); if (Object.keys(x).length) return;
    addProduct({ ...p, price: +p.price, stock: +p.stock, fid: user.fid, type: { Vegetables: 'tomato', Fruits: 'mango', Dairy: 'milk', Grains: 'grain' }[p.cat] }); nav('/farmer/products'); };
  const pv = { ...p, id: 0, price: +p.price || 0, stock: +p.stock || 0, name: p.name || 'Product name', fid: user.fid, type: { Vegetables: 'tomato', Fruits: 'mango', Dairy: 'milk', Grains: 'grain' }[p.cat] };
  return <><Head title="Add product" sub="Create a clear listing customers can trust." />
    {!me.verified && <div className="notice">Your farm must be verified by an admin before you can publish products.</div>}
    <div className="two"><form className="card pad" onSubmit={submit} noValidate><div className="fgrid"><div className="span2"><F label="Product name" err={e.name}><input value={p.name} onChange={set('name')} placeholder="e.g. Fresh Red Tomatoes" /></F></div>
      <F label="Category"><select value={p.cat} onChange={set('cat')}>{CATS.map(c => <option key={c}>{c}</option>)}</select></F><F label="Unit"><select value={p.unit} onChange={set('unit')}>{['kg', 'dozen', 'bunch', 'litre'].map(c => <option key={c}>{c}</option>)}</select></F>
      <F label="Price (₹)" err={e.price}><input type="number" min="1" value={p.price} onChange={set('price')} /></F><F label="Available stock" err={e.stock}><input type="number" min="1" value={p.stock} onChange={set('stock')} /></F>
      <div className="span2"><F label="Description" err={e.desc}><textarea rows="4" value={p.desc} onChange={set('desc')} placeholder="Growing method, freshness, harvest details…" /></F></div></div>
      <Btn type="submit" disabled={!me.verified}>Publish product</Btn></form>
      <aside><div className="mu mb">Customer preview</div><Card p={pv} guest /></aside></div></>;
}
function FarmerOrders() {
  const { user, orders } = useS(); const [t, setT] = useState('Pending'); const os = orders.filter(o => mineItems(o, user.fid).length);
  return <><Head title="Incoming orders" sub="Confirm, ship and complete customer orders." /><div className="chips">{STATUSES.map(s => <button key={s} className={t === s ? 'on' : ''} onClick={() => setT(s)}>{s} ({os.filter(o => o.status === s).length})</button>)}</div>
    <div className="card pad"><OrdersTable rows={os.filter(o => o.status === t)} fid={user.fid} actions /></div></>;
}

/* ---------- admin ---------- */
function AdminHome() {
  const { farmers, products, orders } = useS(); const gmv = orders.filter(o => o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0); const pend = farmers.filter(f => !f.verified);
  return <><Head title="Marketplace overview" sub="Keep Fresho trusted and running smoothly." />
    <div className="grid4 stats"><Stat l="Active farmers" v={farmers.filter(f => f.verified).length} d={pend.length + ' awaiting verification'} /><Stat l="Products live" v={products.length} d="Across 4 categories" /><Stat l="Orders" v={orders.length} d={orders.filter(o => o.status === 'Pending').length + ' pending'} /><Stat l="Order value" v={money(gmv)} d="Excluding cancelled" /></div>
    <div className="two eq"><div className="card pad"><div className="between"><h3>Marketplace sales</h3><span className="mu">₹ lakh, 2026</span></div><Bars data={GMV} fmt={v => '₹' + v + 'L'} /></div>
      <div className="card pad"><h3>Needs attention</h3>{pend.length ? pend.map(f => <div className="line slim" key={f.id}><span className="av">{initials(f.name)}</span><div className="grow"><b>{f.name}</b><small>{f.farm}, {f.place}</small></div><Link to="/admin/farmers" className="lnk">Review</Link></div>) : <p className="mu">No pending farmer applications.</p>}</div></div>
    <div className="card pad"><div className="between"><h3>Recent orders</h3><Link to="/admin/orders" className="lnk">View all</Link></div><OrdersTable rows={orders.slice(0, 5)} /></div></>;
}
function AdminFarmers() {
  const { farmers, products, verify } = useS(); const [q, setQ] = useState(''); const rows = farmers.filter(f => (f.name + f.farm).toLowerCase().includes(q.toLowerCase()));
  return <><Head title="Farmers" sub="Verify new farmers before they can list products." /><div className="card pad"><div className="search wide mb"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search farmers…" /></div>
    <div className="tbl"><table><thead><tr><th>Farmer</th><th>Location</th><th>Products</th><th>Rating</th><th>Status</th><th /></tr></thead><tbody>{rows.map(f => <tr key={f.id}><td><div className="row"><span className="av">{initials(f.name)}</span><div><b>{f.name}</b><small>{f.farm}</small></div></div></td><td>{f.place}</td><td>{products.filter(p => p.fid === f.id).length}</td><td>{f.rating ? '★ ' + f.rating : '—'}</td><td><Pill s={f.verified ? 'Verified' : 'Pending'} /></td><td>{f.verified ? <Btn sm v="o" onClick={() => verify(f.id, false)}>Revoke</Btn> : <Btn sm onClick={() => verify(f.id, true)}>Approve</Btn>}</td></tr>)}</tbody></table></div></div></>;
}
function AdminProducts() {
  const { products, farmer, delProduct } = useS(); const [q, setQ] = useState(''); const rows = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  return <><Head title="Products" sub="Review and moderate marketplace listings." /><div className="card pad"><div className="search wide mb"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" /></div>
    <div className="tbl"><table><thead><tr><th>Product</th><th>Farmer</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><div className="row"><Art p={p} sm /><b>{p.name}</b></div></td><td>{farmer(p.fid).farm}</td><td>{money(p.price)} / {p.unit}</td><td>{p.stock}</td><td><Pill s={stockPill(p.stock)} /></td><td><button className="icon" onClick={() => window.confirm('Remove ' + p.name + ' from the marketplace?') && delProduct(p.id)} aria-label="Remove"><Icon n="trash" s={16} /></button></td></tr>)}</tbody></table></div></div></>;
}
function AdminOrders() { const { orders } = useS(); const [t, setT] = useState('All'); return <><Head title="Orders" sub="All orders across Fresho." /><div className="chips">{['All', ...STATUSES].map(s => <button key={s} className={t === s ? 'on' : ''} onClick={() => setT(s)}>{s}</button>)}</div><div className="card pad"><OrdersTable rows={orders.filter(o => t === 'All' || o.status === t)} /></div></>; }

const NotFound = () => <div className="plain"><div className="wrap roles"><Logo /><h1>Page not found</h1><p>That page isn't here.</p><Btn to="/">Go home</Btn></div></div>;
const G = (role, el) => <Guard role={role}>{el}</Guard>;
function App() {
  return <><Defs /><Routes><Route path="/" element={<Landing />} /><Route path="/roles" element={<Roles />} /><Route path="/login" element={<Auth key="login" />} /><Route path="/register" element={<Auth key="register" reg />} />
    <Route path="/customer" element={G('customer', <Home />)} /><Route path="/explore" element={G('customer', <Explore />)} /><Route path="/product/:id" element={G('customer', <Product />)} /><Route path="/cart" element={G('customer', <Cart />)} /><Route path="/checkout" element={G('customer', <Checkout />)} /><Route path="/orders" element={G('customer', <Orders />)} /><Route path="/orders/:id" element={G('customer', <OrderDetail />)} /><Route path="/profile" element={G('customer', <Profile />)} />
    <Route path="/farmer" element={G('farmer', <FarmerHome />)} /><Route path="/farmer/products" element={G('farmer', <FarmerProducts />)} /><Route path="/farmer/add" element={G('farmer', <AddProduct />)} /><Route path="/farmer/orders" element={G('farmer', <FarmerOrders />)} />
    <Route path="/admin" element={G('admin', <AdminHome />)} /><Route path="/admin/farmers" element={G('admin', <AdminFarmers />)} /><Route path="/admin/products" element={G('admin', <AdminProducts />)} /><Route path="/admin/orders" element={G('admin', <AdminOrders />)} /><Route path="*" element={<NotFound />} /></Routes></>;
}
createRoot(document.getElementById('root')).render(<Boundary><HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Store><App /></Store></HashRouter></Boundary>);
