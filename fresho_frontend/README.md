# Fresho — Local Farmer Marketplace (Frontend)

React + Vite single-page app. Customer, Farmer and Admin workflows run on in-memory mock data (resets on refresh), so the UI is fully demonstrable before the Express/DB backend is connected.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview
```
Deploy the `dist/` folder to Netlify, Vercel or GitHub Pages (hash routing — no rewrite rules needed).

## Demo
Log in with any valid email and a 6+ character password; pick Customer, Farmer or Admin with the tabs.

## Screens
- **Public:** landing, role selection, login, register
- **Customer:** home, explore (search/filter/sort), product, cart, 3-step checkout, orders + status timeline, profile
- **Farmer:** overview, my products (live stock edit), add product (live preview), incoming orders (confirm / ship / deliver / cancel)
- **Admin:** overview, farmer verification, product moderation, all orders

Order statuses: Pending → Confirmed → Shipped → Delivered (or Cancelled). A farmer updating an order is reflected in the customer's tracking view.

## Photos & backend
- Product images: add an `img` path (e.g. `/products/tomato.jpg`, file in `public/products/`) to a product in `src/data.js`. The line-icon tile is the fallback.
- Backend: all state lives in the `Store` component in `src/main.jsx`; replace its functions with REST calls.

## Testing
See `TEST_REPORT.md` and `tests/e2e_test.py` (Playwright).
