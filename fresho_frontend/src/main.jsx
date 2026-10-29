import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link, NavLink, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CATS, STATUSES, FARMERS, PRODUCTS, MONTHS, FARMER_SALES, GMV, FREE_ABOVE, money, fee, seedOrders, seedReviews, seedAddresses, PINCODES, SLOTS, FREQ, INT } from './data.js';
import { DICT } from './i18n.js';
import { api, apiEnabled } from './api.js';
import './styles.css';

/* ---------- icons & small UI ---------- */
let LANG = 'en';
const t = x => { if (LANG === 'en' || typeof x !== 'string') return x; const d = DICT[x]; return d ? d[LANG === 'hi' ? 0 : 1] : x; };
const tf = (k, ...a) => t(k).replace(/\{(\d)\}/g, (_, i) => a[+i]);
const fdate = v => new Date(v).toLocaleDateString({ en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' }[LANG] || 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
  leaf: <><path d="M12 21v-8" /><path d="M12 14c0-4.5-3.2-7-7.5-7 0 4.300 2.800 7 7.500 7Z" /><path d="M12 12c0-3.800 2.500-6.200 7.500-6.200 0 4-2.700 6.200-7.500 6.200Z" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
};
const Icon = ({ n, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{IC[n]}</svg>;
const Sprout = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21v-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /><path d="M12 14c0-4.500-3.200-7-7.500-7 0 4.300 2.800 7 7.500 7Z" fill="#fff" /><path d="M12 12c0-3.800 2.500-6.200 7.500-6.200 0 4-2.700 6.200-7.500 6.200Z" fill="#C6E35A" /></svg>;
const LANGS = [['en', 'EN', 'English'], ['hi', 'हि', 'हिन्दी'], ['gu', 'ગુ', 'ગુજરાતી']];
function LangSwitch() { const { lang, setLang } = useS(); return <div className="langsw" role="group" aria-label="Language">{LANGS.map(([k, l, n]) => <button key={k} className={lang === k ? 'on' : ''} onClick={() => setLang(k)} aria-pressed={lang === k} title={n} lang={k}>{l}</button>)}</div>; }
const Logo = ({ light }) => <Link to="/" className={'logo' + (light ? ' light' : '')} aria-label="Fresho home"><span className="mark"><Sprout /></span>Fresho</Link>;
const Ship = ({ sub }) => { const left = FREE_ABOVE - sub; return <div className="ship"><p>{sub === 0 ? tf('Free delivery above {0}', money(FREE_ABOVE)) : left > 0 ? tf('Add {0} more for free delivery', money(left)) : <><Icon n="check" s={14} /> {t("You've unlocked free delivery")}</>}</p><div className="bar"><i style={{ width: Math.min(100, sub / FREE_ABOVE * 100) + '%' }} /></div></div>; };
const useCount = (to, ms = 600) => { const [v, setV] = useState(0); useEffect(() => { let raf, t0; const f = t => { t0 = t0 ?? t; const p = Math.min(1, (t - t0) / ms); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [to, ms]); return v; };
const Count = ({ n, m }) => { const v = useCount(n); return m ? money(v) : v; };
const useReveal = () => useEffect(() => {
  const els = [...document.querySelectorAll('.rv')];
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => io.observe(e)); return () => io.disconnect();
}, []);
const TIPS = { Vegetables: 'Keep in the fridge crisper and use within 4–5 days for best freshness.', Fruits: 'Ripen at room temperature, then refrigerate. Wash just before eating.', Dairy: 'Keep refrigerated at 4°C or below and consume within 2 days of delivery.', Grains: 'Store in an airtight container in a cool, dry place away from sunlight.' };
const Btn = ({ to, v = 'p', sm, className = '', children, ...r }) => { const c = `btn ${v} ${sm ? 'sm' : ''} ${className}`; return to ? <Link to={to} className={c} {...r}>{children}</Link> : <button className={c} {...r}>{children}</button>; };
const Pill = ({ s }) => <span className={'pill ' + s.toLowerCase().replace(' ', '-')}>{t(s)}</span>;
const Head = ({ title, sub, action }) => <div className="head"><div><h1>{t(title)}</h1>{sub && <p>{t(sub)}</p>}</div>{action}</div>;
const Empty = ({ title, text, to, cta }) => <div className="card empty"><div className="ring"><Icon n="cart" s={26} /></div><h3>{t(title)}</h3><p>{t(text)}</p>{to && <Btn to={to}>{t(cta)}</Btn>}</div>;
const F = ({ label, err, children }) => <label className="f"><span>{t(label)}</span>{React.cloneElement(children, { 'aria-invalid': err ? 'true' : undefined })}{err && <em role="alert">{t(err)}</em>}</label>;
const Stars = ({ r, n }) => r ? <span className="stars"><Icon n="star" s={13} /> {r.toFixed(1)}{n ? <small className="cnt">({n})</small> : null}</span> : <span className="mu">{t("New")}</span>;
const StarInput = ({ v, set }) => <div className="sinput" role="radiogroup" aria-label={t("Rating")}>{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} role="radio" aria-checked={v === n} aria-label={n + (n === 1 ? ' star' : ' stars')} className={n <= v ? 'on' : ''} onClick={() => set(n)}><Icon n="star" s={24} /></button>)}</div>;

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
const Art = ({ p, big, sm }) => <div className={`art c-${t(p.cat)} ${big ? 'big' : ''} ${sm ? 'sm' : ''}`}><svg viewBox={big ? '25 5 150 150' : sm ? '38 22 124 124' : '0 0 200 150'} aria-hidden="true"><ellipse cx="100" cy="126" rx="60" ry="7" fill="#0d3b22" opacity=".13" />{SC[p.type]}</svg>{p.img && <img src={p.img} alt={t(p.name)} loading="lazy" onLoad={e => e.currentTarget.parentElement.classList.add('ld')} onError={e => e.currentTarget.remove()} />}</div>;

/* ---------- store ---------- */
const usePersist = (k, init) => {
  const key = 'fresho_v4_' + k;
  const [v, setV] = useState(() => { try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch (e) { } return typeof init === 'function' ? init() : init; });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { } }, [key, v]);
  useEffect(() => { const h = e => { if (e.key === key && e.newValue) { try { setV(JSON.parse(e.newValue)); } catch (_) { } } }; window.addEventListener('storage', h); return () => window.removeEventListener('storage', h); }, [key]);
  return [v, setV];
};
class Boundary extends React.Component {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? <div className="plain"><div className="wrap roles"><h1>{t("Something went wrong")}</h1><p>{t("Saved data may be out of date.")}</p><button className="btn p" onClick={() => { try { Object.keys(localStorage).filter(k => k.startsWith('fresho_')).forEach(k => localStorage.removeItem(k)); } catch (e) { } location.hash = '#/'; location.reload(); }}>{t("Reset app data")}</button></div></div> : this.props.children; }
}
const Ctx = createContext();
const useS = () => useContext(Ctx);
function Store({ children }) {
  const [rawUser, setUser] = usePersist('user', null);
  const [token, setToken] = usePersist('token', '');
  const user = rawUser && rawUser.name && NAV[rawUser.role] ? rawUser : null;
  const [accounts, setAccounts] = usePersist('accounts', []);
  const [cart, setCart] = usePersist('cart', []);
  const [orders, setOrders] = usePersist('orders', seedOrders);
  const [products, setProducts] = usePersist('products', PRODUCTS);
  const [farmers, setFarmers] = usePersist('farmers', FARMERS);
  const [reviews, setReviews] = usePersist('reviews', seedReviews);
  const [addresses, setAddresses] = usePersist('addresses', seedAddresses);
  const [subs, setSubs] = usePersist('subs', []);
  const [pin, setPin] = usePersist('pin', '');
  const [lang, setLang] = usePersist('lang', 'en'); LANG = lang;
  const [msg, setMsg] = useState(null); const [drawer, setDrawer] = useState(false); const [deferred, setDeferred] = useState(null);
  const timer = useRef();
  const toast = (m, a) => { clearTimeout(timer.current); setMsg({ t: t(m), a: a && { ...a, label: t(a.label) } }); timer.current = setTimeout(() => setMsg(null), a ? 5000 : 2400); };
  useEffect(() => { if (!user) setDrawer(false); }, [user]);
  useEffect(() => { if (drawer) setMsg(null); }, [drawer]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { const h = e => { e.preventDefault(); setDeferred(e); }; window.addEventListener('beforeinstallprompt', h); return () => window.removeEventListener('beforeinstallprompt', h); }, []);
  const install = async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } catch (e) { } setDeferred(null); };
  const prod = id => products.find(p => p.id === id);
  const farmer = id => farmers.find(f => f.id === id) || {};
  // Demo identities. Unregistered emails log in as these; registered accounts need their own password.
  // NOTE: passwords are kept in localStorage only because this is a mock — move auth to the backend.
  const DEMO = { customer: { name: 'Zeel Patel', email: 'zeel.patel@example.com', phone: '9876543210' }, farmer: { name: 'Ramesh Patel', email: 'ramesh@example.com', fid: 'f1' }, admin: { name: 'Fresho Admin', email: 'admin@fresho.in' } };
  const start = u => { setUser(u); setCart([]); return null; };
  const startApiSession = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    return start({ ...nextUser, fid: nextUser.id, farm: nextUser.farmName });
  };
  const logout = () => { setToken(''); setUser(null); };
  const login = async (role, email, pw) => {
    if (apiEnabled) {
      try { return startApiSession(await api('/auth/login', { method: 'POST', body: { role, email, password: pw } })); }
      catch (error) { return error.message; }
    }
    const a = accounts.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!a) return start({ role, ...DEMO[role] });
    if (a.role !== role) return 'This email is registered as a ' + a.role + '. Choose that role to log in.';
    if (a.pw !== pw) return 'Incorrect password.';
    return start({ role, name: a.name, email: a.email, phone: a.phone, fid: a.fid });
  };
  const register = async (role, d) => {
    if (apiEnabled) {
      try { return startApiSession(await api('/auth/register', { method: 'POST', body: { role, name: d.name, email: d.email, phone: d.phone, password: d.pw, farmName: d.farm } })); }
      catch (error) { return error.message; }
    }
    if (role === 'admin') return 'Administrator accounts cannot be self-registered.';
    if (accounts.some(x => x.email.toLowerCase() === d.email.toLowerCase())) return 'This email is already registered. Please log in.';
    let fid; if (role === 'farmer') { fid = 'f' + Date.now(); setFarmers(f => [...f, { id: fid, name: d.name, farm: d.farm, place: 'Gujarat', rating: 0, n: 0, verified: false, since: 2026, story: '' }]); }
    setAccounts(x => [...x, { role, name: d.name, email: d.email, phone: d.phone, pw: d.pw, fid }]);
    return start({ role, name: d.name, email: d.email, phone: d.phone, fid });
  };
  const shop = products.filter(p => farmers.some(f => f.id === p.fid && f.verified));
  const add = (id, q = 1) => { setCart(c => c.some(i => i.id === id) ? c.map(i => i.id === id ? { ...i, q: Math.min(i.q + q, prod(id).stock) } : i) : [...c, { id, q }]); toast(t(prod(id).name) + ' ' + t('added to cart'), { label: 'View cart', fn: () => setDrawer(true) }); };
  const setQty = (id, q) => setCart(c => c.map(i => i.id === id ? { ...i, q: Math.max(1, Math.min(q, prod(id).stock)) } : i));
  const remove = id => { const i = cart.findIndex(x => x.id === id); if (i < 0) return; const it = cart[i]; setCart(c => c.filter(x => x.id !== id)); toast(t(prod(id)?.name || 'Item') + ' ' + t('removed'), { label: 'Undo', fn: () => setCart(c => c.some(x => x.id === id) ? c : [...c.slice(0, i), it, ...c.slice(i)]) }); };
  const lines = cart.map(i => ({ ...prod(i.id), q: i.q })).filter(l => l.name);
  const sub = lines.reduce((a, l) => a + l.price * l.q, 0);
  const place = (addr, pay, slot) => {
    const id = 'FR' + (1050 + orders.filter(o => o.id.startsWith('FR10')).length);
    setOrders(o => [{ id, cust: user.name, email: user.email, status: 'Pending', date: Date.now(), addr, pay, slot, total: sub + fee(sub), items: lines.map(l => ({ id: l.id, name: l.name, price: l.price, unit: l.unit, fid: l.fid, type: l.type, cat: l.cat, q: l.q })) }, ...o]);
    setProducts(ps => ps.map(p => { const l = lines.find(x => x.id === p.id); return l ? { ...p, stock: p.stock - l.q } : p; }));
    setCart([]); return id;
  };
  const setStatus = (id, s) => {
    const o = orders.find(x => x.id === id); if (!o) return; const prev = o.status; const cancel = s === 'Cancelled' && prev !== 'Cancelled';
    const stock = d => setProducts(ps => ps.map(p => { const i = o.items.find(x => x.id === p.id); return i ? { ...p, stock: Math.max(0, p.stock + d * i.q) } : p; }));
    if (cancel) stock(1);
    setOrders(os => os.map(x => x.id === id ? { ...x, status: s } : x));
    if (cancel) toast(t('Order') + ' ' + id + ' ' + t('cancelled'), { label: 'Undo', fn: () => { stock(-1); setOrders(os => os.map(x => x.id === id ? { ...x, status: prev } : x)); } });
    else toast(t('Order') + ' ' + id + ' → ' + t(s));
  };
  const addProduct = p => { setProducts(ps => [{ ...p, id: Date.now(), harvest: 'Today' }, ...ps]); toast('Product published'); };
  const delProduct = id => { const i = products.findIndex(p => p.id === id); if (i < 0) return; const it = products[i]; setProducts(ps => ps.filter(p => p.id !== id)); toast(t(it.name) + ' ' + t('removed'), { label: 'Undo', fn: () => setProducts(ps => ps.some(p => p.id === id) ? ps : [...ps.slice(0, i), it, ...ps.slice(i)]) }); };
  const setStock = (id, n) => setProducts(ps => ps.map(p => p.id === id ? { ...p, stock: Math.max(0, n) } : p));
  const verify = (id, v) => { setFarmers(f => f.map(x => x.id === id ? { ...x, verified: v } : x)); toast(v ? t("Farmer verified") : t("Verification revoked")); };
  const ratingOf = fid => { const f = farmers.find(x => x.id === fid) || {}; const rs = reviews.filter(r => r.fid === fid); const base = f.rating || 0, bn = base ? 8 : 0, n = bn + rs.length; return { r: n ? Math.round(((base * bn + rs.reduce((a, r) => a + r.rating, 0)) / n) * 10) / 10 : 0, n: (f.n || 0) + rs.length }; };
  const addReview = (o, i, rating, text) => { const parts = user.name.split(' '); setReviews(r => [{ id: 'r' + Date.now(), oid: o.id, pid: i.id, fid: i.fid, email: user.email, name: parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : ''), rating, text, date: Date.now() }, ...r]); toast('Thanks for your review'); };
  const addrs = user ? (addresses[user.email] || []) : [];
  const saveAddr = a => { const em = user.email; setAddresses(m => { let list = m[em] || []; const id = a.id || 'a' + Date.now(); const n = { ...a, id, def: !!a.def || list.length === 0 }; list = a.id ? list.map(x => x.id === a.id ? n : x) : [...list, n]; if (n.def) list = list.map(x => ({ ...x, def: x.id === id })); return { ...m, [em]: list }; }); };
  const delAddr = id => { const em = user.email; const it = (addresses[em] || []).find(x => x.id === id); if (!it) return; setAddresses(m => { let l = (m[em] || []).filter(x => x.id !== id); if (it.def && l.length) l = l.map((x, k) => ({ ...x, def: k === 0 })); return { ...m, [em]: l }; }); toast('Address removed', { label: 'Undo', fn: () => setAddresses(m => ({ ...m, [em]: [...(m[em] || []).filter(x => x.id !== id), it] })) }); };
  const setDefault = id => setAddresses(m => ({ ...m, [user.email]: (m[user.email] || []).map(x => ({ ...x, def: x.id === id })) }));
  const addSub = (pid, q, freq) => { const nx = new Date(); nx.setDate(nx.getDate() + 1); nx.setHours(8, 0, 0, 0); setSubs(s => [...s, { id: 's' + Date.now(), email: user.email, pid, q, freq, status: 'Active', next: nx.getTime() }]); toast('Subscription started'); };
  const updSub = (id, patch) => setSubs(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
  const delSub = id => { const it = subs.find(x => x.id === id); if (!it) return; setSubs(s => s.filter(x => x.id !== id)); toast('Subscription cancelled', { label: 'Undo', fn: () => setSubs(s => [...s, it]) }); };
  return <Ctx.Provider value={{ user, setUser, token, logout, drawer, setDrawer, cart, lines, sub, orders, products, shop, farmers, reviews, prod, farmer, login, register, add, setQty, remove, place, setStatus, addProduct, delProduct, setStock, verify, toast, ratingOf, addReview, addrs, saveAddr, delAddr, setDefault, subs, addSub, updSub, delSub, pin, setPin, lang, setLang, canInstall: !!deferred, install }}>{children}{msg && <div className="toast" role="status"><Icon n="check" s={15} />{msg.t}{msg.a && <button onClick={() => { msg.a.fn(); setMsg(null); }}>{msg.a.label}</button>}</div>}</Ctx.Provider>;
}

/* ---------- shell ---------- */
const NAV = {
  customer: [['/customer', 'Home'], ['/explore', 'Explore'], ['/orders', 'My Orders'], ['/subscriptions', 'Subscriptions'], ['/profile', 'Profile']],
  farmer: [['/farmer', 'Overview'], ['/farmer/products', 'My Products'], ['/farmer/add', 'Add Product'], ['/farmer/orders', 'Orders'], ['/farmer/welfare', 'Welfare']],
  admin: [['/admin', 'Overview'], ['/admin/farmers', 'Farmers'], ['/admin/products', 'Products'], ['/admin/orders', 'Orders']],
};
const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
function Shell({ children }) {
  const { user, logout, lines, setDrawer, shop, farmer } = useS(); const nav = useNavigate(); const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const [foc, setFoc] = useState(false);
  const sug = q.trim() ? shop.filter(p => p.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : [];
  const c = user.role === 'customer'; const count = lines.reduce((a, l) => a + l.q, 0);
  const out = () => { logout(); nav('/'); };
  const links = NAV[user.role].map(([to, l]) => <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'on' : ''}>{t(l)}</NavLink>);
  return <div className={'shell ' + (c ? 'top-layout' : 'side-layout')}>
    <a className="skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('Skip to content')}</a>
    <header className="top"><div className="top-in">
      <Logo />
      {c && <nav className={'topnav' + (open ? ' open' : '')} onClick={() => setOpen(false)}>{links}</nav>}
      {c && <div className="search"><Icon n="search" s={16} /><input value={q} onChange={e => { setQ(e.target.value); setFoc(true); }} onFocus={() => setFoc(true)} onBlur={() => setTimeout(() => setFoc(false), 150)} onKeyDown={e => { if (e.key === 'Enter') { setFoc(false); nav('/explore?q=' + encodeURIComponent(q)); } if (e.key === 'Escape') setFoc(false); }} placeholder={t("Search produce, farmers…")} aria-label={t("Search")} autoComplete="off" />
        {foc && sug.length > 0 && <div className="sug">{sug.map(p => <Link key={p.id} to={'/product/' + p.id} onClick={() => { setQ(''); setFoc(false); }}><Art p={p} sm /><div><b>{t(p.name)}</b><small>{farmer(p.fid).farm}</small></div><span>{money(p.price)}</span></Link>)}<button onMouseDown={e => e.preventDefault()} onClick={() => { setFoc(false); nav('/explore?q=' + encodeURIComponent(q)); }}>See all results for “{q}” <Icon n="arrow" s={14} /></button></div>}</div>}
      <div className="top-r"><LangSwitch />
        {c && <button className="icon menu-btn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon n="menu" /></button>}
        {c && <button className="cartbtn" onClick={() => setDrawer(true)} aria-label={'Open cart, ' + count + ' items'}><Icon n="cart" />{count > 0 && <b key={count}>{count}</b>}</button>}
        <span className="chip-user"><span className="av">{initials(user.name)}</span><span className="hide-s">{user.name}</span></span>
        <button className="icon" onClick={out} aria-label={t("Log out")} title={t("Log out")}><Icon n="out" /></button>
      </div></div></header>
    {!c && <aside className="side"><div className="side-tag">{user.role === 'farmer' ? t("Farmer workspace") : t("Administration")}</div>{links}</aside>}
    <main id="main" tabIndex={-1} className={c ? 'wrap page' : 'main page'} key={user.role}>{children}</main>
    {c && <Foot />}{c && <Drawer />}
  </div>;
}
function Drawer() {
  const { drawer, setDrawer, lines, sub, setQty, remove } = useS(); const nav = useNavigate(); const close = () => setDrawer(false); const box = useRef();
  useEffect(() => { if (!drawer) return; const prev = document.activeElement; document.body.classList.add('dr-open'); setTimeout(() => box.current?.querySelector('.dr-h .icon')?.focus(), 30);
    const h = e => { if (e.key === 'Escape') setDrawer(false); if (e.key === 'Tab' && box.current) { const f = [...box.current.querySelectorAll('button,a[href],input,select,textarea')].filter(x => !x.disabled); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } };
    window.addEventListener('keydown', h); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; document.body.classList.remove('dr-open'); prev && prev.focus && prev.focus(); }; }, [drawer, setDrawer]);
  if (!drawer) return null; const n = lines.reduce((a, l) => a + l.q, 0);
  return <><div className="scrim" onClick={close} /><aside className="drawer" role="dialog" aria-modal="true" aria-label={t("Shopping cart")} ref={box}>
    <div className="dr-h"><h3 className="m0">{tf('Your cart ({0})', n)}</h3><button className="icon" onClick={close} aria-label={t("Close cart")}><Icon n="close" /></button></div>
    <Ship sub={sub} />
    <div className="dr-b">{lines.length ? lines.map(l => <div className="dl" key={l.id}><Art p={l} sm /><div className="grow"><b>{t(l.name)}</b><small>{money(l.price)} / {t(l.unit)}</small><div className="qs"><button onClick={() => l.q > 1 ? setQty(l.id, l.q - 1) : remove(l.id)} aria-label="Decrease">−</button><span>{l.q}</span><button onClick={() => setQty(l.id, l.q + 1)} aria-label="Increase">+</button></div></div><div className="dr-r"><b>{money(l.price * l.q)}</b><button className="icon" onClick={() => remove(l.id)} aria-label={'Remove ' + l.name}><Icon n="trash" s={15} /></button></div></div>) : <div className="dr-empty"><div className="ring"><Icon n="cart" s={24} /></div><p>{t("Your cart is empty.")}</p><Btn v="o" onClick={() => { close(); nav('/explore'); }}>{t("Browse produce")}</Btn></div>}</div>
    {lines.length > 0 && <div className="dr-f"><div className="between"><span className="mu">{t("Subtotal")}</span><b>{money(sub)}</b></div><Btn className="full" onClick={() => { close(); nav('/checkout'); }}>{t("Checkout")} <Icon n="arrow" s={16} /></Btn><Btn v="o" className="full" onClick={() => { close(); nav('/cart'); }}>{t("View full cart")}</Btn></div>}
  </aside></>;
}
const useOnline = () => { const [on, setOn] = useState(navigator.onLine); useEffect(() => { const a = () => setOn(true), b = () => setOn(false); window.addEventListener('online', a); window.addEventListener('offline', b); return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); }; }, []); return on; };
const Foot = () => <footer className="foot"><div className="wrap foot-in"><div><Logo light /><p>{t("Fresh produce from local farmers, delivered to your door.")}</p></div><div><h4>{t("Shop")}</h4><Link to="/explore">{t("All produce")}</Link><Link to="/explore?c=Vegetables">{t("Vegetables")}</Link><Link to="/explore?c=Fruits">{t("Fruits")}</Link></div><div><h4>{t("Account")}</h4><Link to="/orders">{t("My orders")}</Link><Link to="/cart">{t("Cart")}</Link><Link to="/profile">{t("Profile")}</Link></div><div><h4>{t("Contact")}</h4><span>support@fresho.in</span><span>Ahmedabad, Gujarat</span></div></div><div className="wrap copy">{t("© 2026 Fresho. Local farmer marketplace.")}</div></footer>;
function Guard({ role, children }) { const { user } = useS(); if (!user || user.role !== role) return <Navigate to="/login" replace />; return <Shell>{children}</Shell>; }

/* ---------- public ---------- */
function Landing() {
  const { shop: products, farmer, user } = useS(); const feat = products.slice(0, 4);
  const dash = user && { customer: '/customer', farmer: '/farmer', admin: '/admin' }[user.role];
  const [sc, setSc] = useState(false); useReveal();
  useEffect(() => { const h = () => setSc(window.scrollY > 8); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const jump = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return <div className="landing">
    <header className={'lnav' + (sc ? ' sc' : '')}><div className="wrap lnav-in"><Logo /><nav><a href="#how" onClick={jump('how')}>{t("How it works")}</a><a href="#featured" onClick={jump('featured')}>{t("Produce")}</a><a href="#farmers" onClick={jump('farmers')}>{t("For farmers")}</a></nav><div className="row"><LangSwitch />{dash ? <Btn to={dash}>{t("Open dashboard")}</Btn> : <><Btn to="/login" v="g">{t("Log in")}</Btn><Btn to="/roles">{t("Get started")}</Btn></>}</div></div></header>
    <section className="wrap hero">
      <div className="hero-copy"><span className="eyebrow">{t("Local produce, direct from farmers")}</span><h1>{t("Fresh from the farm, straight to your door.")}</h1><p>{t("Fresho connects households in Gujarat with verified local farmers — clear prices, harvest dates you can trust, and no middlemen.")}</p>
        <div className="row"><Btn to={dash || '/roles'}>{dash ? t("Open dashboard") : t("Get started")} <Icon n="arrow" s={16} /></Btn><Btn to={dash || '/login'} v="o">{t("Browse produce")}</Btn></div>
        <div className="trust"><span><Icon n="shield" s={16} />{t("Verified farmers")}</span><span><Icon n="truck" s={16} />{t("Same-day delivery")}</span><span><Icon n="leaf" s={16} />{t("Harvest-date labels")}</span></div></div>
      <div className="hero-card"><div className="hc-head"><span>{t("Harvested today")}</span><span className="live"><i />{t('24 farms nearby')}</span></div>
        {feat.map(p => <div className="hc-row" key={p.id}><Art p={p} sm /><div><b>{t(p.name)}</b><small>{farmer(p.fid).farm}, {farmer(p.fid).place}</small></div><strong>{money(p.price)}<small>/{t(p.unit)}</small></strong></div>)}
        <div className="hc-foot">{tf('Free delivery on orders above {0}', money(FREE_ABOVE))}</div></div>
    </section>
    <section className="band"><div className="wrap stats4 rv">{[['24', 'farms on Fresho'], ['1,100+', 'orders delivered'], ['4.8', 'average farmer rating'], ['< 24h', 'farm to doorstep']].map(s => <div key={s[1]}><b>{s[0]}</b><span>{t(s[1])}</span></div>)}</div></section>
    <section className="wrap sec" id="featured"><div className="sec-h rv"><div><span className="eyebrow">{t("This week")}</span><h2>{t("Fresh on Fresho")}</h2></div><Btn to="/login" v="g">{t("View all")} <Icon n="arrow" s={15} /></Btn></div>
      <div className="grid4 rv stag">{products.slice(0, 8).map(p => <Card key={p.id} p={p} guest />)}</div></section>
    <section className="sec alt" id="how"><div className="wrap"><div className="sec-h c"><div><span className="eyebrow">{t("How it works")}</span><h2>{t("A simpler way to buy local")}</h2></div></div>
      <div className="steps3 rv stag">{[['01', 'Farmers list their harvest', 'Verified farmers add produce, set their own prices and keep stock up to date.'], ['02', 'You browse and order', 'Compare farmers, check harvest dates and check out in three quick steps.'], ['03', 'Delivered fresh', 'Track your order from confirmation to doorstep. Pay by UPI, card or cash.']].map(s => <div className="card step" key={s[0]}><span>{s[0]}</span><h3>{t(s[1])}</h3><p>{t(s[2])}</p></div>)}</div></div></section>
    <section className="wrap sec" id="farmers"><div className="cta rv"><div><span className="eyebrow lt">{t("For local farmers")}</span><h2>{t("Your harvest deserves a better storefront.")}</h2><p>{t("List what you grow, manage incoming orders and track your earnings from one dashboard. You set the price — Fresho handles discovery.")}</p><ul>{['No listing fees for your first 20 products', 'Order, stock and earnings in one place', 'Direct payouts every week'].map(x => <li key={x}><Icon n="check" s={16} />{t(x)}</li>)}</ul><Btn to="/register" v="lime">{t("Start selling")} <Icon n="arrow" s={16} /></Btn></div>
      <div className="cta-card"><small>{t("Farmer dashboard")}</small><b>₹42,850</b><span>{t("earned this month")}</span><div className="mini-bars">{FARMER_SALES.map((h, i) => <i key={i} style={{ height: h * 2 + '%' }} />)}</div></div></div></section>
    <Foot />
  </div>;
}
function Roles() {
  const nav = useNavigate(); useS();
  const R = [['customer', 'Customer', 'Buy fresh produce directly from local farmers.', 'cart', ['Browse 12+ fresh products', 'Track every order', tf('Free delivery above {0}', money(FREE_ABOVE))]],
    ['farmer', 'Farmer', 'List your harvest and manage orders and earnings.', 'leaf', ['Set your own prices', 'Manage stock and orders', 'Weekly payouts']],
    ['admin', 'Administrator', 'Verify farmers and oversee the marketplace.', 'shield', ['Approve new farmers', 'Moderate listings', 'Monitor all orders']]];
  const prev = {
    customer: <div className="pv-tiles"><Art p={{ cat: 'Vegetables', type: 'tomato' }} sm /><Art p={{ cat: 'Fruits', type: 'mango' }} sm /><Art p={{ cat: 'Dairy', type: 'milk' }} sm /></div>,
    farmer: <div className="pv-farm"><div><small>{t("This month")}</small><b>₹42,850</b></div><div className="mini-bars">{FARMER_SALES.map((h, i) => <i key={i} style={{ height: h * 2 + '%' }} />)}</div></div>,
    admin: <div className="pv-rows">{[['Sita Devi', 'Verified'], ['Arjun Singh', 'Pending']].map(r => <div key={r[0]}><span className="av">{initials(r[0])}</span><b>{r[0]}</b><Pill s={r[1]} /></div>)}</div>,
  };
  return <div className="plain"><header className="wrap lnav-in"><Logo /><div className="row"><LangSwitch /><Btn to="/" v="g"><Icon n="back" s={15} />{t("Back")}</Btn></div></header>
    <div className="wrap roles"><span className="eyebrow">{t("Welcome to Fresho")}</span><h1>{t("How would you like to use Fresho?")}</h1><p>{t("Choose a role to continue.")}</p>
      <div className="grid3">{R.map(r => <button key={r[0]} className="card role" onClick={() => nav('/login?role=' + r[0])}><div className={'rprev ' + r[0]}>{prev[r[0]]}</div><div className="rbody"><div className="row"><span className="ico"><Icon n={r[3]} s={20} /></span><h3 className="m0">{t(r[1])}</h3></div><p>{t(r[2])}</p><ul>{r[4].map(x => <li key={x}><Icon n="check" s={14} />{t(x)}</li>)}</ul><span className="go">{t("Continue")} <Icon n="arrow" s={15} /></span></div></button>)}</div>
      <p className="mu">{t("New to Fresho?")} <Link to="/register">{t("Create an account")}</Link></p></div></div>;
}
function Auth({ reg }) {
  const [sp] = useSearchParams(); const { login, register, user } = useS(); const nav = useNavigate();
  const [role, setRole] = useState(() => { const r = sp.get('role'); return ['customer', 'farmer', 'admin'].includes(r) && !(reg && r === 'admin') ? r : 'customer'; });
  const [f, setF] = useState({ name: '', email: '', phone: '', farm: '', pw: '', pw2: '' }); const [e, setE] = useState({}); const [saving, setSaving] = useState(false);
  const set = k => ev => setF({ ...f, [k]: ev.target.value });
  const home = { customer: '/customer', farmer: '/farmer', admin: '/admin' };
  if (user) return <Navigate to={home[user.role]} replace />;
  const submit = async ev => {
    ev.preventDefault(); const x = {};
    if (reg && f.name.trim().length < 3) x.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email address';
    if (reg && !/^[6-9]\d{9}$/.test(f.phone)) x.phone = 'Enter a valid 10-digit mobile number';
    if (reg && role === 'farmer' && !f.farm.trim()) x.farm = 'Enter your farm name';
    if (f.pw.length < 6) x.pw = 'Password must be at least 6 characters';
    if (reg && f.pw !== f.pw2) x.pw2 = 'Passwords do not match';
    setE(x); if (Object.keys(x).length) return;
    setSaving(true);
    const err = await (reg ? register(role, f) : login(role, f.email, f.pw));
    setSaving(false);
    if (err) { setE({ form: err }); return; }
    nav(home[role]);
  };
  return <div className="auth"><div className="auth-l"><div className="between"><Logo /><LangSwitch /></div><form onSubmit={submit} noValidate>
    <span className="eyebrow">{reg ? t("Join Fresho") : t("Welcome back")}</span><h1>{reg ? t("Create your account") : t("Log in to Fresho")}</h1>
    <p className="mu">{reg ? t("Join the local farm community.") : t("Continue to your Fresho account.")}</p>
    <div className="seg">{['customer', 'farmer', 'admin'].map(r => (reg && r === 'admin') ? null : <button type="button" key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>{t(r)}</button>)}</div>
    {reg && <F label="Full name" err={e.name}><input value={f.name} onChange={set('name')} placeholder="e.g. Zeel Patel" /></F>}
    <F label="Email" err={e.email}><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" /></F>
    {reg && <F label="Mobile number" err={e.phone}><input value={f.phone} onChange={set('phone')} placeholder="98XXXXXXXX" maxLength={10} /></F>}
    {reg && role === 'farmer' && <F label="Farm name" err={e.farm}><input value={f.farm} onChange={set('farm')} placeholder="e.g. Patel Organic Farm" /></F>}
    <F label="Password" err={e.pw}><input type="password" value={f.pw} onChange={set('pw')} placeholder="At least 6 characters" /></F>
    {reg && <F label="Confirm password" err={e.pw2}><input type="password" value={f.pw2} onChange={set('pw2')} /></F>}
    {e.form && <div className="err-box">{t(e.form)}</div>}
    <Btn className="full" type="submit" disabled={saving}>{saving ? t("Please wait…") : reg ? t("Create account") : t("Log in")}</Btn>
    {!reg && <p className="hint">{t("Demo: any email + 6-character password signs in as a demo user. Registered accounts need their own password.")}</p>}
    <p className="mu c">{reg ? t("Already have an account?") : t("New to Fresho?")} <Link to={(reg ? '/login' : '/register') + '?role=' + (role === 'admin' && !reg ? t("customer") : role)}>{reg ? t("Log in") : t("Sign up")}</Link></p>
  </form></div>
  <div className="auth-r"><div><span className="eyebrow lt">{t("Fresh from farms")}</span><h2>{t("Good food starts with the people who grow it.")}</h2><p>{t("Buy straight from verified local farmers, or open your own storefront in minutes.")}</p>
    <div className="auth-stats"><div><b>24</b><span>{t("local farms")}</span></div><div><b>1,100+</b><span>{t("orders delivered")}</span></div><div><b>4.8★</b><span>{t("farmer rating")}</span></div></div></div></div></div>;
}

/* ---------- customer ---------- */
function Card({ p, guest }) {
  const { farmer, add, cart, setQty, remove, ratingOf } = useS(); const f = farmer(p.fid); const rt = ratingOf(p.fid); const to = guest ? '/login' : '/product/' + p.id; const inCart = guest ? null : cart.find(i => i.id === p.id);
  return <div className="card pcard"><Link to={to} aria-label={t(p.name)}><Art p={p} />{p.stock > 0 && p.stock < 10 ? <span className="low">{tf('Only {0} left', p.stock)}</span> : p.harvest === 'Today' && <span className="low fresh"><i />{t("Harvested today")}</span>}</Link>
    <div className="pbody"><span className="cat">{t(p.cat)}</span><Link to={to}><h3>{t(p.name)}</h3></Link><p className="mu">{f.farm} · {f.place}</p>
      <div className="meta"><Stars r={rt.r} n={rt.n} />{f.verified && <span className="vf"><Icon n="shield" s={12} />{t("Verified")}</span>}</div>
      <div className="prow"><div><b>{money(p.price)}</b><small> / {t(p.unit)}</small></div>{guest ? <Link to={to} className="addbtn" aria-label="View"><Icon n="arrow" s={15} /></Link> : inCart ? <div className="qs"><button onClick={() => inCart.q > 1 ? setQty(p.id, inCart.q - 1) : remove(p.id)} aria-label={'Decrease ' + p.name}>−</button><span>{inCart.q}</span><button onClick={() => setQty(p.id, inCart.q + 1)} aria-label={'Increase ' + p.name}>+</button></div> : <button className="addbtn" disabled={p.stock <= 0} onClick={() => add(p.id)} aria-label={'Add ' + p.name}><Icon n="plus" s={16} /></button>}</div></div></div>;
}
function PinBox() {
  const { pin, setPin } = useS(); const [v, setV] = useState(pin); const [edit, setEdit] = useState(!pin); const [err, setErr] = useState('');
  const ok = PINCODES.includes(pin);
  const check = () => { if (!/^\d{6}$/.test(v)) { setErr('Enter a 6-digit pincode'); return; } setErr(''); setPin(v); setEdit(false); };
  if (!edit && pin) return <div className={'pinbox ' + (ok ? 'ok' : 'bad')}><Icon n="pin" s={16} /><span>{ok ? tf('Delivering to {0} · same-day available', pin) : tf('Sorry, we don’t deliver to {0} yet', pin)}</span><button className="lnk" onClick={() => { setEdit(true); setV(pin); }}>{t("Change")}</button></div>;
  return <div className="pinbox"><Icon n="pin" s={16} /><input value={v} onChange={e => setV(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => e.key === 'Enter' && check()} placeholder={t("Enter delivery pincode")} inputMode="numeric" aria-label={t("Delivery pincode")} /><button className="btn p sm" onClick={check}>{t("Check")}</button>{err && <em className="err" role="alert">{err}</em>}</div>;
}
function Home() {
  const { user, shop: products, farmers, ratingOf } = useS();
  return <>
    <section className="banner"><div><span className="eyebrow lt">{t("Harvested this week")}</span><h2>{t('Good morning')}, {user.name.split(' ')[0]}.<br />{t("What's fresh today?")}</h2><p>{t('Order before 2 PM for same-day delivery in Ahmedabad.')} {tf('Free delivery above {0}', money(FREE_ABOVE))}.</p><Btn to="/explore" v="lime">{t("Shop produce")} <Icon n="arrow" s={16} /></Btn></div>
      <div className="banner-tiles">{products.slice(0, 4).map(p => <Link key={p.id} to={'/product/' + p.id} className="bt"><Art p={p} sm /><div><b>{t(p.name)}</b><small>{money(p.price)} / {t(p.unit)}</small></div></Link>)}</div></section>
    <PinBox />
    <div className="sec-h"><h2>{t("Shop by category")}</h2></div>
    <div className="grid4 cats">{CATS.map(c => <Link key={c} to={'/explore?c=' + c} className="card cat-card"><Art p={{ cat: c, type: { Vegetables: 'tomato', Fruits: 'mango', Dairy: 'milk', Grains: 'grain' }[c] }} sm /><div><b>{t(c)}</b><small>{products.filter(p => p.cat === c).length} {t('items')}</small></div><Icon n="chev" s={16} /></Link>)}</div>
    <div className="sec-h"><h2>{t("Fresh this week")}</h2><Btn to="/explore" v="g" sm>{t("View all")} <Icon n="arrow" s={14} /></Btn></div>
    <div className="grid4">{products.slice(0, 8).map(p => <Card key={p.id} p={p} />)}</div>
    <div className="sec-h"><h2>{t("Farmers near you")}</h2></div>
    <div className="grid4">{farmers.filter(f => f.verified).map(f => { const rt = ratingOf(f.id); return <Link key={f.id} to={'/farmers/' + f.id} className="card fcard"><span className="av lg">{initials(f.name)}</span><div><b>{f.name}</b><small>{f.farm}</small><small><Icon n="pin" s={12} /> {f.place} · <Stars r={rt.r} n={rt.n} /></small></div></Link>; })}</div>
    <div className="perks">{[['shield', 'Verified farmers', 'Every farm is reviewed before listing.'], ['truck', 'Same-day delivery', 'Order by 2 PM across Ahmedabad.'], ['leaf', 'Harvest-date labels', 'Know exactly when it was picked.']].map(x => <div key={x[0]}><span className="ico"><Icon n={x[0]} /></span><div><b>{t(x[1])}</b><small>{t(x[2])}</small></div></div>)}</div>
  </>;
}
function Explore() {
  const { shop: products, farmer } = useS(); const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '', cat = sp.get('c') || 'All', fid = sp.get('f') || '', sort = sp.get('s') || 'rel', max = +(sp.get('max') || 500), inStock = sp.get('stock') === '1';
  const upd = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); };
  let list = products.filter(p => (cat === 'All' || p.cat === cat) && (!fid || p.fid === fid) && p.price <= max && (!inStock || p.stock > 0) && (p.name + farmer(p.fid).farm + farmer(p.fid).place).toLowerCase().includes(q.toLowerCase()));
  if (sort === 'lo') list = [...list].sort((a, b) => a.price - b.price); if (sort === 'hi') list = [...list].sort((a, b) => b.price - a.price);
  return <><Head title={t("Explore produce")} sub="Fresh products from verified farmers across Gujarat." />
    <div className="toolbar"><div className="search wide"><Icon n="search" s={16} /><input value={q} onChange={e => upd('q', e.target.value)} placeholder={t("Search produce, farms or places…")} aria-label={t("Search products")} /></div>
      <select value={sort} onChange={e => upd('s', e.target.value === 'rel' ? '' : e.target.value)} aria-label="Sort"><option value="rel">{t("Sort: Relevance")}</option><option value="lo">{t("Price: Low to high")}</option><option value="hi">{t("Price: High to low")}</option></select></div>
    <div className="chips">{['All', ...CATS].map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => upd('c', c === 'All' ? '' : c)}>{t(c)}</button>)}{fid && <button className="on" onClick={() => upd('f', '')}>{farmer(fid).farm} ✕</button>}</div>
    <div className="explore"><aside className="card filters"><h4>{t("Filters")}</h4><label className="f"><span>{tf('Max price: {0}', money(max))}</span><input type="range" min="20" max="500" step="10" value={max} onChange={e => upd('max', +e.target.value >= 500 ? '' : e.target.value)} /></label><label className="chk"><input type="checkbox" checked={inStock} onChange={e => upd('stock', e.target.checked ? '1' : '')} />{t("In stock only")}</label><button className="lnk" onClick={() => setSp({})}>{t("Reset filters")}</button></aside>
      <div><p className="mu count" aria-live="polite">{list.length} {t(list.length === 1 ? t("product") : t("products"))}</p>{list.length ? <div className="grid3 pg">{list.map(p => <Card key={p.id} p={p} />)}</div> : <Empty title={t("No produce found")} text="Try a different search or reset your filters." />}</div></div></>;
}
function SubBox({ p }) {
  const { addSub } = useS(); const nav = useNavigate(); const [on, setOn] = useState(false); const [freq, setFreq] = useState('Weekly'); const [q, setQ] = useState(1);
  return <div className="subbox"><div className="between"><div><b>{t("Subscribe & save 5%")}</b><small>{t("Delivered on repeat. Pause, skip or cancel anytime.")}</small></div><button className="btn o sm" onClick={() => setOn(!on)} aria-expanded={on}>{on ? t("Close") : t("Set up")}</button></div>
    {on && <div className="subf"><F label="Frequency"><select value={freq} onChange={e => setFreq(e.target.value)}>{FREQ.map(f => <option key={f} value={f}>{t(f)}</option>)}</select></F>
      <div className="row"><div className="qs"><button onClick={() => setQ(Math.max(1, q - 1))} aria-label="Decrease quantity">−</button><span>{q}</span><button onClick={() => setQ(Math.min(10, q + 1))} aria-label="Increase quantity">+</button></div><Btn onClick={() => { addSub(p.id, q, freq); nav('/subscriptions'); }}>{tf('Subscribe · {0} / delivery', money(p.price * q * .95))}</Btn></div></div>}</div>;
}
function Product() {
  const { id } = useParams(); const { prod, farmer, add, shop: products, ratingOf, reviews } = useS(); const p = prod(+id); const [q, setQ] = useState(1); const nav = useNavigate(); const [added, setAdded] = useState(false);
  if (!p || !products.some(x => x.id === p.id)) return <Navigate to="/explore" replace />;
  const f = farmer(p.fid); const rt = ratingOf(p.fid); const revs = reviews.filter(r => r.pid === p.id).sort((a, b) => b.date - a.date);
  return <><div className="crumbs"><Link to="/explore">{t("Explore")}</Link><Icon n="chev" s={13} /><Link to={'/explore?c=' + p.cat}>{t(p.cat)}</Link><Icon n="chev" s={13} /><span>{t(p.name)}</span></div>
    <div className="detail"><Art p={p} big />
      <div><span className="cat">{t(p.cat)}</span><h1>{t(p.name)}</h1><div className="row mu"><Stars r={rt.r} n={rt.n} /><span>· <Link to={'/farmers/' + f.id} className="lnk">{f.farm}</Link>, {f.place}</span></div>
        <div className="bigp">{money(p.price)}<small> / {t(p.unit)}</small></div><p className="desc">{t(p.desc)}</p><div className="tip"><Icon n="leaf" s={16} /><span><b>{t("Storage tip.")}</b> {t(TIPS[p.cat])}</span></div>
        <PinBox />
        <div className="row buy"><div className="step-q"><button onClick={() => setQ(Math.max(1, q - 1))} aria-label="Decrease quantity">−</button><span>{q}</span><button onClick={() => setQ(Math.min(p.stock, q + 1))} aria-label="Increase quantity">+</button></div>
          <Btn className={added ? 'done' : ''} disabled={p.stock <= 0} onClick={() => { add(p.id, q); setAdded(true); setTimeout(() => setAdded(false), 1400); }}>{added ? <><Icon n="check" s={16} />{t("Added to cart")}</> : <>{tf('Add to cart · {0}', money(p.price * q))}</>}</Btn><Btn v="o" disabled={p.stock <= 0} onClick={() => { add(p.id, q); nav('/cart'); }}>{t("Buy now")}</Btn></div>
        <SubBox p={p} />
        <table className="kv"><tbody><tr><th>{t("Harvested")}</th><td>{t(p.harvest)}</td></tr><tr><th>{t("Availability")}</th><td>{p.stock > 0 ? tf('{0} {1} in stock', p.stock, t(p.unit)) : t('Out of stock')}</td></tr><tr><th>{t("Delivery")}</th><td>{t("Same day if ordered by 2 PM")}</td></tr><tr><th>{t("Farmer")}</th><td>{f.name} {f.verified && <span className="pill delivered">{t("Verified")}</span>}</td></tr></tbody></table></div></div>
    <div className="sec-h"><h2>{t('Customer reviews')}{revs.length > 0 && <small className="inl"> ({revs.length})</small>}</h2></div>
    <div className="card pad revs">{revs.length ? revs.map(r => <Rev1 key={r.id} r={r} />) : <p className="mu m0">{t("No reviews for this product yet. Order it and rate it after delivery.")}</p>}</div>
    <div className="sec-h"><h2>{tf('More from {0}', f.farm)}</h2></div><div className="grid4">{products.filter(x => x.fid === p.fid && x.id !== p.id).slice(0, 4).map(x => <Card key={x.id} p={x} />)}</div></>;
}
const Rev1 = ({ r, pn }) => <div className="rev1"><span className="av">{initials(r.name)}</span><div><div className="row"><b>{r.name}</b><Stars r={r.rating} /><small>{fdate(r.date)}</small></div>{pn && <small>on {pn}</small>}<p>{r.text}</p></div></div>;
function FarmerPage() {
  const { id } = useParams(); const { farmers, shop, reviews, ratingOf, prod } = useS(); const f = farmers.find(x => x.id === id);
  if (!f || !f.verified) return <Navigate to="/explore" replace />;
  const rt = ratingOf(f.id); const list = shop.filter(p => p.fid === f.id); const rs = reviews.filter(r => r.fid === f.id).sort((a, b) => b.date - a.date);
  return <><Link to="/customer" className="back"><Icon n="back" s={15} />{t("Home")}</Link>
    <div className="card fprof"><div className="fp-top"><span className="av xl">{initials(f.name)}</span><div className="grow"><div className="row"><h1 className="m0">{f.farm}</h1><span className="pill delivered">{t("Verified")}</span></div><p className="mu fp-loc"><Icon n="pin" s={14} /> {f.name} · {f.place}, Gujarat</p></div></div>
      <p className="story">{f.story || t('Growing fresh produce for local families.')}</p>
      <div className="fstats"><div><b>{rt.r ? rt.r.toFixed(1) : '—'}</b><span>{t("rating")}</span></div><div><b>{rt.n}</b><span>{t("reviews")}</span></div><div><b>{list.length}</b><span>{t("products")}</span></div><div><b>{Math.max(1, 2026 - f.since)}</b><span>{t("years on Fresho")}</span></div></div></div>
    <div className="sec-h"><h2>{tf('Fresh from {0}', f.farm)}</h2></div><div className="grid4">{list.map(p => <Card key={p.id} p={p} />)}</div>
    <div className="sec-h"><h2>{t("Customer reviews")}</h2></div><div className="card pad revs">{rs.length ? rs.slice(0, 8).map(r => <Rev1 key={r.id} r={r} pn={prod(r.pid)?.name} />) : <p className="mu m0">{t("No reviews yet.")}</p>}</div></>;
}
function Totals({ cta }) {
  const { sub } = useS(); const d = fee(sub);
  return <aside className="card sum"><h3>{t("Order summary")}</h3><div><span>{t("Subtotal")}</span><b>{money(sub)}</b></div><div><span>{t("Delivery")}</span><b>{d ? money(d) : 'Free'}</b></div>{sub > 0 && <Ship sub={sub} />}<div className="tot"><span>{t("Total")}</span><b>{money(sub + d)}</b></div>{cta}</aside>;
}
function Cart() {
  const { lines, setQty, remove, shop } = useS();
  if (!lines.length) return <><Head title={t("My cart")} /><Empty title={t("Your cart is empty")} text="Add some fresh produce to get started." to="/explore" cta="Browse produce" /><div className="sec-h"><h2>{t("Popular right now")}</h2></div><div className="grid4">{shop.slice(0, 4).map(p => <Card key={p.id} p={p} />)}</div></>;
  return <><Head title={t("My cart")} sub={lines.length + ' ' + t(lines.length > 1 ? t("items") : t("item"))} /><div className="two">
    <div className="card lines">{lines.map(l => <div className="line" key={l.id}><Art p={l} sm /><div className="grow"><Link to={'/product/' + l.id}><b>{t(l.name)}</b></Link><small>{money(l.price)} / {t(l.unit)}</small></div><div className="step-q"><button onClick={() => setQty(l.id, l.q - 1)}>−</button><span>{l.q}</span><button onClick={() => setQty(l.id, l.q + 1)}>+</button></div><b className="lt">{money(l.price * l.q)}</b><button className="icon" onClick={() => remove(l.id)} aria-label={t("Remove")}><Icon n="trash" s={16} /></button></div>)}</div>
    <Totals cta={<Btn to="/checkout" className="full">{t("Proceed to checkout")} <Icon n="arrow" s={16} /></Btn>} /></div></>;
}
function AddressForm({ init, onSave, onCancel, submit = 'Save address', offerSave }) {
  const [f, setF] = useState({ label: 'Home', name: '', phone: '', line: '', pin: '', ...init }); const [e, setE] = useState({}); const [save, setSave] = useState(false);
  const set = k => ev => setF({ ...f, [k]: ev.target.value });
  const go = ev => { ev.preventDefault(); const x = {}; if (f.name.trim().length < 3) x.name = 'Enter the recipient name'; if (!/^[6-9]\d{9}$/.test(f.phone)) x.phone = 'Enter a valid 10-digit number'; if (f.line.trim().length < 8) x.line = 'Enter the full delivery address'; if (!/^\d{6}$/.test(f.pin)) x.pin = 'Enter a 6-digit pincode'; else if (!PINCODES.includes(f.pin)) x.pin = 'We don’t deliver to this pincode yet'; setE(x); if (!Object.keys(x).length) onSave(f, save); };
  return <form onSubmit={go} noValidate><div className="fgrid"><F label="Full name" err={e.name}><input value={f.name} onChange={set('name')} /></F><F label="Mobile number" err={e.phone}><input value={f.phone} onChange={set('phone')} maxLength={10} inputMode="numeric" /></F>
    <div className="span2"><F label="Address" err={e.line}><textarea rows="3" value={f.line} onChange={set('line')} placeholder={t("House no., street, area, city")} /></F></div>
    <F label="Pincode" err={e.pin}><input value={f.pin} onChange={set('pin')} maxLength={6} inputMode="numeric" /></F><F label="Save as"><select value={f.label} onChange={set('label')}>{['Home', 'Work', 'Other'].map(l => <option key={l} value={l}>{t(l)}</option>)}</select></F></div>
    {offerSave && <label className="chk"><input type="checkbox" checked={save} onChange={ev => setSave(ev.target.checked)} />{t("Save this address for next time")}</label>}
    <div className="row"><Btn type="submit">{submit}</Btn>{onCancel && <Btn v="o" type="button" onClick={onCancel}>{t("Cancel")}</Btn>}</div></form>;
}
function Checkout() {
  const { user, lines, sub, place, addrs, saveAddr, setPin } = useS();
  const def = addrs.find(x => x.def) || addrs[0];
  const [step, setStep] = useState(1); const [sel, setSel] = useState(def ? def.id : ''); const [newMode, setNewMode] = useState(!addrs.length); const [a, setA] = useState(null); const [pay, setPay] = useState('UPI'); const done = useRef(false);
  const [e, setE] = useState({}); const [upi, setUpi] = useState(''); const [cd, setCd] = useState({ num: '', exp: '', cvv: '' }); const [proc, setProc] = useState(false); const [ok, setOk] = useState(null);
  const hr = new Date().getHours(); const slots = SLOTS.map(x => ({ ...x, off: x.id === 'today' && hr >= 14 })); const [slot, setSlot] = useState(slots.find(x => !x.off).id); const slotLabel = SLOTS.find(x => x.id === slot).label;
  if (ok) return <div className="card ok-card"><svg className="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l8 8 14-16" /></svg><h2>{t("Order placed!")}</h2><p className="mu">{tf('Thank you, {0}. Your order #{1} has been sent to the farmers. Estimated delivery: {2}.', a.name.split(' ')[0], ok.id, t(ok.slot))}</p><div className="row"><Btn to={'/orders/' + ok.id}>{t("Track order")}</Btn><Btn to="/explore" v="o">{t("Continue shopping")}</Btn></div></div>;
  if (!lines.length && !done.current) return <Navigate to="/cart" replace />;
  const useSaved = () => { const x = addrs.find(v => v.id === sel); if (!PINCODES.includes(x.pin)) { setE({ pin: tf('We don’t deliver to {0} yet. Choose another address.', x.pin) }); return; } setE({}); setPin(x.pin); setA(x); setStep(2); };
  const payNext = () => { const x = {};
    if (pay === 'UPI' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())) x.upi = 'Enter a valid UPI ID, e.g. name@okbank';
    if (pay === 'Card') { if (cd.num.replace(/\s/g, '').length !== 16) x.num = 'Enter the 16-digit card number'; if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cd.exp)) x.exp = 'Use MM/YY'; if (!/^\d{3}$/.test(cd.cvv)) x.cvv = 'Enter the 3-digit CVV'; }
    setE(x); if (!Object.keys(x).length) setStep(3); };
  const go = () => { setProc(true); setTimeout(() => { done.current = true; const id = place(a, pay, slotLabel); setOk({ id, slot: slotLabel }); }, 900); };
  return <><Head title={t("Checkout")} /><div className="steps">{['Address', 'Payment', 'Review'].map((s, i) => <span key={s} className={step > i + 1 ? 'done' : step === i + 1 ? 'on' : ''}><i>{step > i + 1 ? <Icon n="check" s={12} /> : i + 1}</i>{t(s)}</span>)}</div>
    <div className="two"><div className="card pad">
      {step === 1 && <><h3>{t("Delivery address")}</h3>{!newMode && addrs.length > 0 ? <><div className="addrs">{addrs.map(x => <label key={x.id} className={'addr-opt ' + (sel === x.id ? 'on' : '')}><input type="radio" name="addr" checked={sel === x.id} onChange={() => setSel(x.id)} /><div><b>{t(x.label)} · {x.name}</b><span>{x.line}, {x.pin}</span><small>+91 {x.phone}</small></div></label>)}</div>{e.pin && <div className="err-box" role="alert">{e.pin}</div>}<div className="row"><Btn onClick={useSaved}>{t("Continue to payment")}</Btn><Btn v="g" onClick={() => { setE({}); setNewMode(true); }}><Icon n="plus" s={15} />{t("Add a new address")}</Btn></div></>
        : <AddressForm init={a || { name: user.name, phone: user.phone || '' }} offerSave submit="Continue to payment" onCancel={addrs.length ? () => setNewMode(false) : null} onSave={(ad, save) => { if (save) saveAddr(ad); setPin(ad.pin); setA(ad); setStep(2); }} />}</>}
      {step === 2 && <><h3>{t("Delivery slot")}</h3><div className="slots">{slots.map(x => <label key={x.id} className={'slot ' + (slot === x.id ? 'on' : '') + (x.off ? ' off' : '')}><input type="radio" name="slot" disabled={x.off} checked={slot === x.id} onChange={() => setSlot(x.id)} /><div><b>{t(x.label)}</b><small>{x.off ? t("Order before 2 PM for same-day") : x.id === 'today' ? t("Same-day delivery") : t("Fresh harvest next morning")}</small></div></label>)}</div>
        <h3>{t("Payment method")}</h3>{[['UPI', 'Pay with any UPI app'], ['Card', 'Credit or debit card'], ['Cash on Delivery', 'Pay when your order arrives']].map(([m, d]) => <div key={m}><label className={'opt ' + (pay === m ? 'on' : '')}><input type="radio" name="pay" checked={pay === m} onChange={() => { setPay(m); setE({}); }} /><div><b>{t(m)}</b><small>{t(d)}</small></div></label>
        {pay === m && m === 'UPI' && <div className="opt-x"><F label="UPI ID" err={e.upi}><input value={upi} onChange={ev => setUpi(ev.target.value)} placeholder="name@okbank" autoComplete="off" /></F></div>}
        {pay === m && m === 'Card' && <div className="opt-x fgrid"><div className="span2"><F label="Card number" err={e.num}><input inputMode="numeric" value={cd.num} onChange={ev => setCd({ ...cd, num: ev.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ') })} placeholder="1234 5678 9012 3456" autoComplete="off" /></F></div><F label="Expiry" err={e.exp}><input value={cd.exp} onChange={ev => { let v = ev.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); setCd({ ...cd, exp: v }); }} placeholder="MM/YY" /></F><F label="CVV" err={e.cvv}><input type="password" inputMode="numeric" maxLength={3} value={cd.cvv} onChange={ev => setCd({ ...cd, cvv: ev.target.value.replace(/\D/g, '') })} autoComplete="off" /></F></div>}</div>)}
        <div className="row"><Btn v="o" onClick={() => { setE({}); setStep(1); }}>{t("Back")}</Btn><Btn onClick={payNext}>{t("Review order")}</Btn></div></>}
      {step === 3 && <><h3>{t("Review your order")}</h3><div className="rev"><div><small>{t("Deliver to")}</small><b>{a.name}</b><span>{a.line}, {a.pin}</span><span>+91 {a.phone}</span></div><div><small>{t("Delivery & payment")}</small><b>{t(slotLabel)}</b><span>{t(pay)}{pay === 'UPI' ? ' · ' + upi : pay === 'Card' ? ' · ' + t('ending') + ' ' + cd.num.slice(-4) : ' · ' + t('pay on delivery')}</span></div></div>{lines.map(l => <div className="line slim" key={l.id}><Art p={l} sm /><div className="grow"><b>{t(l.name)}</b><small>{l.q} × {money(l.price)}</small></div><b>{money(l.q * l.price)}</b></div>)}<div className="row"><Btn v="o" disabled={proc} onClick={() => setStep(2)}>{t("Back")}</Btn><Btn disabled={proc} onClick={go}>{proc ? <><i className="spin" />{t("Processing…")}</> : <>{tf('Place order · {0}', money(sub + fee(sub)))}</>}</Btn></div></>}
    </div><Totals /></div></>;
}
const FLOW = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
function Orders() {
  const { orders, user } = useS(); const [tab, setTab] = useState('All');
  const mine = orders.filter(o => o.email === user.email); const list = mine.filter(o => tab === 'All' || o.status === tab);
  return <><Head title={t("My orders")} sub="Track and manage your orders." /><div className="chips">{['All', ...STATUSES].map(s => <button key={s} className={tab === s ? 'on' : ''} onClick={() => setTab(s)}>{t(s)}{s === 'All' ? ` (${mine.length})` : ''}</button>)}</div>
    {list.length ? <div className="ostack">{list.map(o => <Link to={'/orders/' + o.id} className="card ocard" key={o.id}><div className="thumbs">{o.items.slice(0, 3).map(i => <Art key={i.id} p={i} sm />)}</div><div className="grow"><b>#{o.id}</b><small>{fdate(o.date)} · {o.items.length} {t(o.items.length > 1 ? t("items") : t("item"))}</small></div><b>{money(o.total)}</b><Pill s={o.status} /><Icon n="chev" s={16} /></Link>)}</div> : <Empty title={t("No orders here")} text="Orders you place will show up here." to="/explore" cta="Start shopping" />}</>;
}
function ReviewRow({ o, i }) {
  const { reviews, addReview } = useS(); const done = reviews.find(r => r.oid === o.id && r.pid === i.id);
  const [open, setOpen] = useState(false); const [v, setV] = useState(0); const [tx, setTx] = useState(''); const [err, setErr] = useState('');
  if (done) return <span className="mu rated"><Icon n="star" s={13} /> {tf('You rated this {0}/5', done.rating)}</span>;
  if (!open) return <button className="lnk" onClick={() => setOpen(true)}>{t("Rate & review")}</button>;
  return <div className="rform"><StarInput v={v} set={setV} /><textarea rows="2" value={tx} onChange={e => setTx(e.target.value)} placeholder={t("How was the freshness and quality? (optional)")} aria-label={t("Review")} />{err && <em className="err" role="alert">{err}</em>}<div className="row"><Btn sm onClick={() => { if (!v) { setErr('Please choose a star rating'); return; } addReview(o, i, v, tx.trim() || 'Great quality.'); }}>{t("Submit review")}</Btn><Btn sm v="g" onClick={() => setOpen(false)}>{t("Cancel")}</Btn></div></div>;
}
function OrderDetail() {
  const { id } = useParams(); const { orders, setStatus, add } = useS(); const o = orders.find(x => x.id === id); const nav = useNavigate();
  if (!o) return <Navigate to="/orders" replace />;
  const cur = FLOW.indexOf(o.status); const isub = o.items.reduce((a, i) => a + i.price * i.q, 0);
  return <><Link to="/orders" className="back"><Icon n="back" s={15} />{t("My orders")}</Link><Head title={'Order #' + o.id} sub={tf('Placed on {0}', fdate(o.date))} action={<Pill s={o.status} />} />
    {['Pending', 'Confirmed', 'Shipped'].includes(o.status) && <div className="eta"><Icon n="truck" />{tf('Estimated delivery: {0}', t(o.slot || 'Today, 4–7 PM'))}</div>}
    <div className="two"><div>
      <div className="card pad"><h3>{t("Order status")}</h3>{o.status === 'Cancelled' ? <p className="mu">{t("This order was cancelled.")}</p> : <div className="tl">{FLOW.map((s, i) => <div key={s} className={'tl-r ' + (i < cur || o.status === 'Delivered' ? 'done' : i === cur ? 'cur' : '')}><span>{i < cur || o.status === 'Delivered' ? <Icon n="check" s={12} /> : ''}</span><div><b>{t(s)}</b><small>{t(['Order received', 'Farmer confirmed your order', 'On the way to you', 'Delivered to your address'][i])}</small></div></div>)}</div>}
        {o.status === 'Pending' && <Btn v="danger" sm onClick={() => setStatus(o.id, 'Cancelled')}>{t("Cancel order")}</Btn>}</div>
      <div className="card pad"><h3>{t("Items")}</h3>{o.items.map(i => <div key={i.id}><div className="line slim"><Art p={i} sm /><div className="grow"><b>{t(i.name)}</b><small>{i.q} × {money(i.price)} / {t(i.unit)}</small></div><b>{money(i.q * i.price)}</b></div>{o.status === 'Delivered' && <div className="rrow"><ReviewRow o={o} i={i} /></div>}</div>)}</div></div>
    <aside><div className="card sum"><h3>{t("Summary")}</h3><div><span>{t("Items")}</span><b>{money(isub)}</b></div><div><span>{t("Delivery")}</span><b>{o.total - isub ? money(o.total - isub) : 'Free'}</b></div><div className="tot"><span>{t("Total")}</span><b>{money(o.total)}</b></div></div>
      <div className="card pad"><h3>{t("Delivery & payment")}</h3><p className="mu"><b>{o.addr.name}</b><br />{o.addr.line}, {o.addr.pin}<br />+91 {o.addr.phone}</p><p className="mu">{t('Slot:')} <b>{t(o.slot || 'Today, 4–7 PM')}</b><br />{t('Paid via')} <b>{t(o.pay)}</b></p>{o.status === 'Delivered' && <Btn v="o" sm onClick={() => { o.items.forEach(i => add(i.id, i.q)); nav('/cart'); }}>{t("Reorder")}</Btn>}</div></aside></div></>;
}
function Profile() {
  const { user, orders, addrs, saveAddr, delAddr, setDefault, canInstall, install, toast, subs } = useS(); const mine = orders.filter(o => o.email === user.email); const [form, setForm] = useState(null); const def = addrs.find(x => x.def);
  const mySubs = subs.filter(x => x.email === user.email && x.status === 'Active').length;
  return <><Head title={t("Profile")} sub="Your account details and saved addresses." /><div className="two"><div>
    <div className="card pad"><div className="row"><span className="av xl">{initials(user.name)}</span><div><h2 className="m0">{user.name}</h2><span className="mu">{t("Customer · Ahmedabad, Gujarat")}</span></div></div>
      <table className="kv"><tbody><tr><th>{t("Email")}</th><td>{user.email}</td></tr><tr><th>{t("Mobile")}</th><td>+91 {user.phone || '—'}</td></tr><tr><th>{t("Default address")}</th><td>{def ? def.line + ', ' + def.pin : t('Not set')}</td></tr></tbody></table></div>
    <div className="card pad"><div className="between mb"><h3 className="m0">{t("Saved addresses")}</h3>{!form && <Btn sm v="o" onClick={() => setForm('new')}><Icon n="plus" s={15} />{t("Add address")}</Btn>}</div>
      {form ? <AddressForm init={form === 'new' ? { name: user.name, phone: user.phone || '' } : form} submit={form === 'new' ? t("Save address") : t("Update address")} onCancel={() => setForm(null)} onSave={ad => { saveAddr(form === 'new' ? ad : { ...ad, id: form.id, def: form.def }); setForm(null); toast('Address saved'); }} />
        : addrs.length ? <div className="addrs">{addrs.map(x => <div className="addr-card" key={x.id}><div className="row"><b>{t(x.label)}</b>{x.def && <span className="pill delivered">{t("Default")}</span>}</div><p className="mu">{x.name}<br />{x.line}, {x.pin}<br />+91 {x.phone}</p><div className="row"><button className="lnk" onClick={() => setForm(x)}>{t("Edit")}</button>{!x.def && <button className="lnk" onClick={() => setDefault(x.id)}>{t("Make default")}</button>}<button className="lnk dng" onClick={() => delAddr(x.id)}>{t("Delete")}</button></div></div>)}</div> : <p className="mu m0">{t("No saved addresses yet. Add one to check out faster.")}</p>}</div></div>
    <aside><div className="card pad"><h3>{t("Your activity")}</h3><div className="stats2"><div><b>{mine.length}</b><span>{t("orders placed")}</span></div><div><b>{money(mine.filter(o => o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0))}</b><span>{t("total spent")}</span></div></div><Link to="/subscriptions" className="lnk sublnk">{mySubs} {t('Active subscriptions')} →</Link></div>
      {canInstall && <div className="card pad"><h3>{t("Install Fresho")}</h3><p className="mu">{t("Add Fresho to your home screen for faster access and offline browsing.")}</p><Btn onClick={install}>{t("Install app")}</Btn></div>}</aside></div></>;
}
function Subs() {
  const { subs, user, prod, updSub, delSub, toast } = useS(); const mine = subs.filter(s => s.email === user.email && prod(s.pid));
  const act = mine.filter(s => s.status === 'Active'); const month = act.reduce((a, s) => a + prod(s.pid).price * .95 * s.q * (30 / INT[s.freq]), 0);
  return <><Head title={t("Subscriptions")} sub="Fresh produce on repeat — pause, skip or cancel anytime." action={<Btn to="/explore" v="o">{t("Find products")}</Btn>} />
    {!mine.length ? <Empty title={t("No subscriptions yet")} text="Open any product and choose “Subscribe & save 5%” to get it delivered on repeat." to="/explore" cta="Browse produce" /> : <>
      <div className="grid4 stats"><Stat l="Active subscriptions" v={act.length} d={tf('{0} paused', mine.length - act.length)} /><Stat l="Estimated monthly" v={Math.round(month)} m d="After 5% subscriber discount" /></div>
      <div className="ostack">{mine.map(s => { const p = prod(s.pid); return <div className="card sub" key={s.id}><Art p={p} sm /><div className="grow"><b>{t(p.name)}</b><small>{tf('{0} {1} · {2} · {3} per delivery', s.q, t(p.unit), t(s.freq), money(p.price * .95 * s.q))}</small><small>{s.status === 'Active' ? tf('Next delivery: {0}, 7–10 AM', fdate(s.next)) : t('Paused — no deliveries scheduled')}</small></div><Pill s={s.status} />
        <div className="qs"><button onClick={() => updSub(s.id, { q: Math.max(1, s.q - 1) })} aria-label={'Decrease ' + p.name}>−</button><span>{s.q}</span><button onClick={() => updSub(s.id, { q: Math.min(10, s.q + 1) })} aria-label={'Increase ' + p.name}>+</button></div>
        <div className="row">{s.status === 'Active' ? <><Btn sm v="o" onClick={() => { updSub(s.id, { next: s.next + INT[s.freq] * 864e5 }); toast('Next delivery skipped'); }}>{t("Skip next")}</Btn><Btn sm v="o" onClick={() => updSub(s.id, { status: 'Paused' })}>{t("Pause")}</Btn></> : <Btn sm onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(8, 0, 0, 0); updSub(s.id, { status: 'Active', next: d.getTime() }); }}>{t("Resume")}</Btn>}<Btn sm v="danger" className="nm" onClick={() => delSub(s.id)}>{t("Cancel")}</Btn></div></div>; })}</div></>}</>;
}

/* ---------- farmer ---------- */
const mineItems = (o, fid) => o.items.filter(i => i.fid === fid);
const share = (o, fid) => mineItems(o, fid).reduce((a, i) => a + i.price * i.q, 0);
const Bars = ({ data, fmt }) => { const m = Math.max(...data); return <div className="chart">{data.map((v, i) => <div key={i} title={fmt(v)}><i style={{ height: (v / m) * 100 + '%', animationDelay: i * 50 + 'ms' }}><span>{fmt(v)}</span></i><span>{t(MONTHS[i])}</span></div>)}</div>; };
const Stat = ({ l, v, d, m }) => <div className="card stat"><span>{t(l)}</span><b>{typeof v === 'number' ? <Count n={v} m={m} /> : v}</b><small>{t(d)}</small></div>;
const NEXT = { Pending: ['Confirmed', 'Confirm order'], Confirmed: ['Shipped', 'Mark shipped'], Shipped: ['Delivered', 'Mark delivered'] };
const OrderActions = ({ o }) => { const { setStatus } = useS(); const n = NEXT[o.status]; if (!n) return <span className="mu">—</span>; return <div className="row">{<Btn sm onClick={() => setStatus(o.id, n[0])}>{t(n[1])}</Btn>}{o.status !== 'Shipped' && <Btn sm v="o" onClick={() => setStatus(o.id, 'Cancelled')}>{t("Cancel")}</Btn>}</div>; };
function FarmerHome() {
  const { user, products, orders, farmer, ratingOf } = useS(); const fid = user.fid; const me = farmer(fid); const rt = ratingOf(fid);
  const prods = products.filter(p => p.fid === fid); const os = orders.filter(o => mineItems(o, fid).length);
  const earned = os.filter(o => o.status === 'Delivered').reduce((a, o) => a + share(o, fid), 0); const pending = os.filter(o => o.status === 'Pending');
  return <><Head title={t('Good morning') + ', ' + user.name.split(' ')[0]} sub={me.farm} action={<Btn to="/farmer/add"><Icon n="plus" s={16} />{t("Add product")}</Btn>} />
    {!me.verified && <div className="notice">{t("Your farm is awaiting admin verification. You can add products once it is approved.")}</div>}
    <div className="grid4 stats"><Stat l="Products listed" v={prods.length} d={tf('{0} low on stock', prods.filter(p => p.stock < 10).length)} /><Stat l="Pending orders" v={pending.length} d="Need your confirmation" /><Stat l="Total earned" v={earned} m d="From delivered orders" /><Stat l="Farm rating" v={rt.r ? rt.r.toFixed(1) : '—'} d={tf('{0} reviews', rt.n)} /></div>
    <div className="two eq"><div className="card pad"><div className="between"><h3>{t("Monthly sales")}</h3><span className="mu">{t("₹ thousand, 2026")}</span></div><Bars data={FARMER_SALES} fmt={v => '₹' + v + 'k'} /></div>
      <div className="card pad"><h3>{t("Low stock")}</h3>{prods.filter(p => p.stock < 20).length ? prods.filter(p => p.stock < 20).map(p => <div className="line slim" key={p.id}><Art p={p} sm /><div className="grow"><b>{t(p.name)}</b><small>{tf('{0} {1} left', p.stock, t(p.unit))}</small></div><Link to="/farmer/products" className="lnk">{t("Restock")}</Link></div>) : <p className="mu">{t("All products are well stocked.")}</p>}</div></div>
    <div className="card pad"><div className="between"><h3>{t("Recent orders")}</h3><Link to="/farmer/orders" className="lnk">{t("View all")}</Link></div><OrdersTable rows={os.slice(0, 5)} fid={fid} /></div></>;
}
const OrdersTable = ({ rows, fid, actions }) => rows.length ? <div className="tbl"><table><thead><tr><th>{t("Order")}</th><th>{t("Customer")}</th><th>{t("Items")}</th><th>{fid ? t("Your share") : t("Total")}</th><th>{t("Status")}</th>{actions && <th>{t("Action")}</th>}</tr></thead><tbody>{rows.map(o => <tr key={o.id}><td><b>#{o.id}</b><small>{fdate(o.date)}</small>{fid && <small>{o.slot || 'Today, 4–7 PM'}</small>}</td><td>{o.cust}</td><td>{(fid ? mineItems(o, fid) : o.items).map(i => i.name + ' × ' + i.q).join(', ')}</td><td><b>{money(fid ? share(o, fid) : o.total)}</b></td><td><Pill s={o.status} /></td>{actions && <td><OrderActions o={o} /></td>}</tr>)}</tbody></table></div> : <p className="mu pad0">{t("No orders yet.")}</p>;
const stockPill = n => n <= 0 ? 'Sold out' : n < 10 ? 'Low stock' : 'Available';
function FarmerProducts() {
  const { user, products, setStock, delProduct } = useS(); const [q, setQ] = useState(''); const rows = products.filter(p => p.fid === user.fid && p.name.toLowerCase().includes(q.toLowerCase()));
  return <><Head title={t("My products")} sub="Keep your storefront accurate." action={<Btn to="/farmer/add"><Icon n="plus" s={16} />{t("Add product")}</Btn>} />
    <div className="card pad"><div className="search wide mb"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t("Search your products…")} /></div>
      {rows.length ? <div className="tbl"><table><thead><tr><th>{t("Product")}</th><th>{t("Category")}</th><th>{t("Price")}</th><th>{t("Stock")}</th><th>{t("Status")}</th><th /></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><div className="row"><Art p={p} sm /><b>{t(p.name)}</b></div></td><td>{t(p.cat)}</td><td>{money(p.price)} / {t(p.unit)}</td><td><input className="mini" type="number" min="0" value={p.stock} onChange={e => setStock(p.id, +e.target.value)} aria-label={t("Stock")} /></td><td><Pill s={stockPill(p.stock)} /></td><td><button className="icon" onClick={() => delProduct(p.id)} aria-label={t("Delete")}><Icon n="trash" s={16} /></button></td></tr>)}</tbody></table></div> : <p className="mu">{t("No products found.")}</p>}</div></>;
}
function AddProduct() {
  const { user, farmer, addProduct } = useS(); const nav = useNavigate(); const me = farmer(user.fid);
  const [p, setP] = useState({ name: '', cat: 'Vegetables', price: '', unit: 'kg', stock: '', desc: '' }); const [e, setE] = useState({});
  const set = k => ev => setP({ ...p, [k]: ev.target.value });
  const submit = ev => { ev.preventDefault(); const x = {}; if (p.name.trim().length < 3) x.name = 'Enter a product name'; if (!(+p.price > 0)) x.price = 'Enter a valid price'; if (!(+p.stock > 0)) x.stock = 'Enter available stock'; if (p.desc.trim().length < 10) x.desc = 'Add a short description (10+ characters)'; setE(x); if (Object.keys(x).length) return;
    addProduct({ ...p, price: +p.price, stock: +p.stock, fid: user.fid, type: { Vegetables: 'tomato', Fruits: 'mango', Dairy: 'milk', Grains: 'grain' }[p.cat] }); nav('/farmer/products'); };
  const pv = { ...p, id: 0, price: +p.price || 0, stock: +p.stock || 0, name: p.name || 'Product name', fid: user.fid, type: { Vegetables: 'tomato', Fruits: 'mango', Dairy: 'milk', Grains: 'grain' }[p.cat] };
  return <><Head title={t("Add product")} sub="Create a clear listing customers can trust." />
    {!me.verified && <div className="notice">{t("Your farm must be verified by an admin before you can publish products.")}</div>}
    <div className="two"><form className="card pad" onSubmit={submit} noValidate><div className="fgrid"><div className="span2"><F label="Product name" err={e.name}><input value={t(p.name)} onChange={set('name')} placeholder="e.g. Fresh Red Tomatoes" /></F></div>
      <F label="Category"><select value={t(p.cat)} onChange={set('cat')}>{CATS.map(c => <option key={c} value={c}>{t(c)}</option>)}</select></F><F label="Unit"><select value={t(p.unit)} onChange={set('unit')}>{['kg', 'dozen', 'bunch', 'litre'].map(c => <option key={c} value={c}>{t(c)}</option>)}</select></F>
      <F label="Price (₹)" err={e.price}><input type="number" min="1" value={p.price} onChange={set('price')} /></F><F label="Available stock" err={e.stock}><input type="number" min="1" value={p.stock} onChange={set('stock')} /></F>
      <div className="span2"><F label="Description" err={e.desc}><textarea rows="4" value={p.desc} onChange={set('desc')} placeholder={t("Growing method, freshness, harvest details…")} /></F></div></div>
      <Btn type="submit" disabled={!me.verified}>{t("Publish product")}</Btn></form>
      <aside><div className="mu mb">{t("Customer preview")}</div><Card p={pv} guest /></aside></div></>;
}
function FarmerOrders() {
  const { user, orders } = useS(); const [tab, setTab] = useState('Pending'); const os = orders.filter(o => mineItems(o, user.fid).length);
  return <><Head title={t("Incoming orders")} sub="Confirm, ship and complete customer orders." /><div className="chips">{STATUSES.map(s => <button key={s} className={tab === s ? 'on' : ''} onClick={() => setTab(s)}>{t(s)} ({os.filter(o => o.status === s).length})</button>)}</div>
    <div className="card pad"><OrdersTable rows={os.filter(o => o.status === tab)} fid={user.fid} actions /></div></>;
}


/* ---------- farmer welfare & official schemes ---------- */
const WELFARE_SCHEMES = [
  {
    id: 'pm-kisan', category: 'Income support', tag: 'Central government',
    title: 'PM-KISAN Samman Nidhi',
    summary: 'Income support for eligible landholding farmer families.',
    details: 'The scheme provides ₹6,000 per year to eligible landholding farmer families, paid in three equal instalments of ₹2,000. Eligibility, exclusions, e-KYC and land-record requirements apply; check the official portal for your current beneficiary status.',
    who: 'Eligible landholding farmer families, subject to scheme exclusions and verification.',
    action: 'Check eligibility & status', url: 'https://pmkisan.gov.in/',
    icon: '₹', tone: 'mint', source: 'PM-KISAN official portal'
  },
  {
    id: 'pmfby', category: 'Crop protection', tag: 'Central government',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    summary: 'Crop insurance support against notified crop risks.',
    details: 'PMFBY provides crop insurance for notified crops and areas under the applicable season guidelines. Coverage, enrolment windows, premium and claim conditions depend on the notified crop, area and season. For Gujarat, the national portal notes that enrolment is handled through the state process rather than direct enrolment on the national portal.',
    who: 'Farmers growing notified crops in notified areas, under current season rules.',
    action: 'Open crop insurance portal', url: 'https://pmfby.gov.in/',
    icon: '✓', tone: 'blue', source: 'PMFBY official portal'
  },
  {
    id: 'ikhedut', category: 'Equipment & assistance', tag: 'Government of Gujarat',
    title: 'i-Khedut — Gujarat farmer schemes',
    summary: 'State portal for agriculture, horticulture, animal husbandry and other farmer assistance schemes.',
    details: 'Use the Gujarat Agriculture, Farmers Welfare & Co-operation Department’s i-Khedut portal to review scheme components, current application notices, eligibility and required documents. Available components and application dates change; a scheme may only accept applications during its announced window. Beneficiary registration and Aadhaar-linked OTP verification may be required.',
    who: 'Applicants meeting the eligibility rules of the specific Gujarat scheme.',
    action: 'Browse Gujarat schemes', url: 'https://ikhedut.gujarat.gov.in/iKhedutPublicScheme/',
    icon: 'GJ', tone: 'lime', source: 'Government of Gujarat — i-Khedut'
  },
  {
    id: 'pmksy', category: 'Irrigation & water', tag: 'Central government',
    title: 'PMKSY — Per Drop More Crop',
    summary: 'Support for improving on-farm water-use efficiency through micro-irrigation.',
    details: 'The Per Drop More Crop component focuses on micro-irrigation, including drip and sprinkler systems, to improve water-use efficiency. Assistance and eligible equipment depend on current guidelines, state implementation and approved plans. Check the state agriculture department or i-Khedut for Gujarat application details; do not assume a fixed subsidy percentage.',
    who: 'Farmers meeting the current state and scheme component requirements.',
    action: 'Read official scheme guidelines', url: 'https://pmksy.gov.in/',
    icon: '滴', tone: 'blue', source: 'PMKSY official portal'
  },
  {
    id: 'enam', category: 'Market access', tag: 'Central government',
    title: 'e-NAM — National Agriculture Market',
    summary: 'An online trading platform connecting participating APMC mandis and agricultural markets.',
    details: 'e-NAM is a pan-India electronic trading portal that links participating APMC mandis. Its official farmer information describes benefits such as more market and buyer access, transparent price discovery, information on prices and arrivals, and online payment facilities where supported. Registration and participation depend on the relevant mandi/APMC process.',
    who: 'Farmers able to register with a participating e-NAM mandi/APMC.',
    action: 'Explore e-NAM for farmers', url: 'https://www.enam.gov.in/web/stakeholders-Involved/farmers',
    icon: '↗', tone: 'mint', source: 'e-NAM official portal'
  }
];
function FarmerWelfare() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const categories = ['All', ...new Set(WELFARE_SCHEMES.map(x => x.category))];
  const rows = WELFARE_SCHEMES.filter(x => (cat === 'All' || x.category === cat) && (x.title + ' ' + x.summary + ' ' + x.details + ' ' + x.category).toLowerCase().includes(q.toLowerCase()));
  return <div className="welfare-page">
    <div className="welfare-hero">
      <div className="welfare-hero-copy">
        <span className="eyebrow lt">FARMER SUPPORT DIRECTORY</span>
        <h1>Support for your farm.<br/><span>All in one place.</span></h1>
        <p>A carefully curated guide to official Indian and Gujarat government schemes, support programmes and farmer services.</p>
        <div className="welfare-hero-points"><span><Icon n="check" s={15}/> Official portals</span><span><Icon n="check" s={15}/> Eligibility notes</span><span><Icon n="check" s={15}/> Direct links</span></div>
      </div>
      <div className="welfare-hero-art" aria-hidden="true"><div className="welfare-sun"/><div className="welfare-field field-one"/><div className="welfare-field field-two"/><div className="welfare-field field-three"/><div className="welfare-plant"><span/><i/><b/></div><div className="welfare-hero-label"><span className="welfare-label-icon"><Icon n="leaf" s={18}/></span><span><b>Grow with support</b><small>Know what help may be available</small></span></div></div>
    </div>
    <div className="welfare-notice"><span className="welfare-notice-icon"><Icon n="shield" s={20}/></span><div><b>Use official sources before applying</b><p>Scheme rules, application windows, benefits and eligibility can change. Fresho is an information directory, not a government department; final decisions are made by the relevant authority.</p></div></div>
    <div className="welfare-toolbar">
      <div><h2>Government schemes & services</h2><p className="mu">Verified starting points for farmer support</p></div>
      <label className="search welfare-search"><Icon n="search" s={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search schemes or support…" aria-label="Search government schemes"/></label>
    </div>
    <div className="welfare-cats" aria-label="Filter schemes by category">{categories.map(c=><button key={c} className={cat===c?'on':''} onClick={()=>setCat(c)} aria-pressed={cat===c}>{c}</button>)}</div>
    <div className="welfare-grid">{rows.map((x,i)=><article className="card welfare-card" key={x.id}>
      <div className="welfare-card-top"><span className={'welfare-icon '+x.tone}>{x.icon}</span><span className="welfare-tag">{x.tag}</span></div>
      <span className="welfare-category">{x.category}</span><h3>{x.title.trim()}</h3><p className="welfare-summary">{x.summary}</p>
      <div className="welfare-detail"><b>What it offers</b><p>{x.details}</p></div>
      <div className="welfare-eligibility"><b>Who should check</b><p>{x.who}</p></div>
      <div className="welfare-card-footer"><small>Source: {x.source}</small><a className="btn p welfare-link" href={x.url} target="_blank" rel="noopener noreferrer">{x.action}<Icon n="out" s={15}/></a></div>
    </article>)}</div>
    {!rows.length&&<div className="card welfare-empty"><h3>No schemes match your search</h3><p>Try another keyword or select a different category.</p><button className="btn o" onClick={()=>{setQ('');setCat('All')}}>Clear filters</button></div>}
    <div className="welfare-help card"><div className="welfare-help-icon"><Icon n="pin" s={22}/></div><div className="grow"><h3>Need help finding the right scheme?</h3><p>For Gujarat-specific assistance, start with i-Khedut or contact the Agriculture, Farmers Welfare & Co-operation Department. Keep your land records, bank details and identity documents ready only when the official portal requests them.</p></div><a className="btn o" href="https://ikhedut.gujarat.gov.in/scheme/" target="_blank" rel="noopener noreferrer">Gujarat scheme portal <Icon n="out" s={14}/></a></div>
    <p className="welfare-disclaimer">Information reviewed against official government portals on 29 October 2026. This summary is for navigation only and is not a guarantee of eligibility or benefit. Always follow the latest official notification and application dates.</p>
  </div>;
}

/* ---------- admin ---------- */
function AdminHome() {
  const { farmers, products, orders } = useS(); const gmv = orders.filter(o => o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0); const pend = farmers.filter(f => !f.verified);
  return <><Head title={t("Marketplace overview")} sub="Keep Fresho trusted and running smoothly." />
    <div className="grid4 stats"><Stat l="Active farmers" v={farmers.filter(f => f.verified).length} d={tf('{0} awaiting verification', pend.length)} /><Stat l="Products live" v={products.length} d="Across 4 categories" /><Stat l="Orders" v={orders.length} d={tf('{0} pending', orders.filter(o => o.status === 'Pending').length)} /><Stat l="Order value" v={gmv} m d="Excluding cancelled" /></div>
    <div className="two eq"><div className="card pad"><div className="between"><h3>{t("Marketplace sales")}</h3><span className="mu">{t("₹ lakh, 2026")}</span></div><Bars data={GMV} fmt={v => '₹' + v + 'L'} /></div>
      <div className="card pad"><h3>{t("Needs attention")}</h3>{pend.length ? pend.map(f => <div className="line slim" key={f.id}><span className="av">{initials(f.name)}</span><div className="grow"><b>{f.name}</b><small>{f.farm}, {f.place}</small></div><Link to="/admin/farmers" className="lnk">{t("Review")}</Link></div>) : <p className="mu">{t("No pending farmer applications.")}</p>}</div></div>
    <div className="card pad"><div className="between"><h3>{t("Recent orders")}</h3><Link to="/admin/orders" className="lnk">{t("View all")}</Link></div><OrdersTable rows={orders.slice(0, 5)} /></div></>;
}
function AdminFarmers() {
  const { farmers, products, verify, ratingOf } = useS(); const [q, setQ] = useState(''); const rows = farmers.filter(f => (f.name + f.farm).toLowerCase().includes(q.toLowerCase()));
  return <><Head title={t("Farmers")} sub="Verify new farmers before they can list products." /><div className="card pad"><div className="search wide mb"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t("Search farmers…")} /></div>
    <div className="tbl"><table><thead><tr><th>{t("Farmer")}</th><th>{t("Location")}</th><th>{t("Products")}</th><th>{t("Rating")}</th><th>{t("Status")}</th><th /></tr></thead><tbody>{rows.map(f => <tr key={f.id}><td><div className="row"><span className="av">{initials(f.name)}</span><div><b>{f.name}</b><small>{f.farm}</small></div></div></td><td>{f.place}</td><td>{products.filter(p => p.fid === f.id).length}</td><td>{ratingOf(f.id).r ? '★ ' + ratingOf(f.id).r.toFixed(1) : '—'}</td><td><Pill s={f.verified ? 'Verified' : 'Pending'} /></td><td>{f.verified ? <Btn sm v="o" onClick={() => verify(f.id, false)}>{t("Revoke")}</Btn> : <Btn sm onClick={() => verify(f.id, true)}>{t("Approve")}</Btn>}</td></tr>)}</tbody></table></div></div></>;
}
function AdminProducts() {
  const { products, farmer, delProduct } = useS(); const [q, setQ] = useState(''); const rows = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  return <><Head title={t("Products")} sub="Review and moderate marketplace listings." /><div className="card pad"><div className="search wide mb"><Icon n="search" s={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t("Search products…")} /></div>
    <div className="tbl"><table><thead><tr><th>{t("Product")}</th><th>{t("Farmer")}</th><th>{t("Price")}</th><th>{t("Stock")}</th><th>{t("Status")}</th><th /></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><div className="row"><Art p={p} sm /><b>{t(p.name)}</b></div></td><td>{farmer(p.fid).farm}</td><td>{money(p.price)} / {t(p.unit)}</td><td>{p.stock}</td><td><Pill s={stockPill(p.stock)} /></td><td><button className="icon" onClick={() => delProduct(p.id)} aria-label={t("Remove")}><Icon n="trash" s={16} /></button></td></tr>)}</tbody></table></div></div></>;
}
function AdminOrders() { const { orders } = useS(); const [tab, setTab] = useState('All'); return <><Head title={t("Orders")} sub="All orders across Fresho." /><div className="chips">{['All', ...STATUSES].map(s => <button key={s} className={tab === s ? 'on' : ''} onClick={() => setTab(s)}>{s}</button>)}</div><div className="card pad"><OrdersTable rows={orders.filter(o => tab === 'All' || o.status === tab)} /></div></>; }

const NotFound = () => <div className="plain"><div className="wrap roles"><Logo /><h1>{t("Page not found")}</h1><p>{t("That page isn't here.")}</p><Btn to="/">{t("Go home")}</Btn></div></div>;
const G = (role, el) => <Guard role={role}>{el}</Guard>;
function App() {
  const online = useOnline();
  return <><Defs />{!online && <div className="offline" role="status">{t("You're offline. You can keep browsing; some features may be limited.")}</div>}<Routes><Route path="/" element={<Landing />} /><Route path="/roles" element={<Roles />} /><Route path="/login" element={<Auth key="login" />} /><Route path="/register" element={<Auth key="register" reg />} />
    <Route path="/customer" element={G('customer', <Home />)} /><Route path="/explore" element={G('customer', <Explore />)} /><Route path="/product/:id" element={G('customer', <Product />)} /><Route path="/cart" element={G('customer', <Cart />)} /><Route path="/checkout" element={G('customer', <Checkout />)} /><Route path="/orders" element={G('customer', <Orders />)} /><Route path="/orders/:id" element={G('customer', <OrderDetail />)} /><Route path="/profile" element={G('customer', <Profile />)} /><Route path="/subscriptions" element={G('customer', <Subs />)} /><Route path="/farmers/:id" element={G('customer', <FarmerPage />)} />
    <Route path="/farmer" element={G('farmer', <FarmerHome />)} /><Route path="/farmer/products" element={G('farmer', <FarmerProducts />)} /><Route path="/farmer/add" element={G('farmer', <AddProduct />)} /><Route path="/farmer/orders" element={G('farmer', <FarmerOrders />)} /><Route path="/farmer/welfare" element={G('farmer', <FarmerWelfare />)} />
    <Route path="/admin" element={G('admin', <AdminHome />)} /><Route path="/admin/farmers" element={G('admin', <AdminFarmers />)} /><Route path="/admin/products" element={G('admin', <AdminProducts />)} /><Route path="/admin/orders" element={G('admin', <AdminOrders />)} /><Route path="*" element={<NotFound />} /></Routes></>;
}
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => { }));
createRoot(document.getElementById('root')).render(<Boundary><HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Store><App /></Store></HashRouter></Boundary>);
