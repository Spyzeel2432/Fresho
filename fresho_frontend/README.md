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

## Experience highlights
- Slide-out cart with free-delivery progress, quantity steppers on product cards, live search suggestions
- UPI / card / COD payment with validation, processing state and animated order confirmation
- Scroll-reveal sections, count-up dashboard stats, chart tooltips, Estimated-delivery banner on active orders

## Language, install & accessibility
- English / हिन्दी / ગુજરાતી switcher in every header (choice is remembered). Translations live in `src/i18n.js` — add entries as `"English text": ["Hindi", "Gujarati"]`.
- Installable web app (manifest + offline cache via `public/sw.js`, active in production builds).
- Skip link, focus trap in the cart drawer, labelled form errors, offline banner.

## Customer features
Delivery pincode check and slots, farmer profile pages, ratings and reviews after delivery, saved addresses, subscriptions (Subscribe & save 5%), undo on removals, filters kept in the URL.

## Screens
- **Public:** landing, role selection, login, register
- **Customer:** home, explore (search/filter/sort), product, cart, 3-step checkout, orders + status timeline, profile
- **Farmer:** overview, my products (live stock edit), add product (live preview), incoming orders (confirm / ship / deliver / cancel)
- **Admin:** overview, farmer verification, product moderation, all orders

Order statuses: Pending → Confirmed → Shipped → Delivered (or Cancelled). A farmer updating an order is reflected in the customer's tracking view.

## Photos & backend
- Product images: add an `img` path (e.g. `/products/tomato.jpg`, file in `public/products/`) to a product in `src/data.js`. The line-icon tile is the fallback.
- Backend: all state lives in the `Store` component in `src/main.jsx`; replace its functions with REST calls.



## Farmer Welfare directory
The farmer workspace includes a **Welfare** section (`#/farmer/welfare`) with searchable cards linking to official government portals:
- PM-KISAN Samman Nidhi — income-support overview and beneficiary portal.
- Pradhan Mantri Fasal Bima Yojana — crop-insurance information; notes that Gujarat enrolment follows the state process.
- Gujarat i-Khedut — state scheme notices, components and application windows.
- PMKSY / Per Drop More Crop — official irrigation and micro-irrigation programme information.
- e-NAM — official farmer information for participating APMC market access.

The directory is informational. Scheme eligibility, benefits, application windows and required documents can change; users are directed to the official portal and are advised to follow current notifications. Fresho does not guarantee eligibility or administer government benefits.

## Backend setup

The Express and MongoDB API lives in `backend/`. It provides JWT authentication, role protection, products, orders, stock updates and reviews. Login and registration use it whenever `VITE_API_URL` is configured; the remaining screens retain their demo data while their API migration is completed.

1. Install MongoDB locally, or create a MongoDB Atlas database.
2. Copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI` and a strong `JWT_SECRET`.
3. Copy `.env.example` to `.env` to point the frontend at `http://localhost:5000/api`.
4. Run these commands in separate terminals:

```bash
npm.cmd install --prefix backend
npm.cmd run api:seed
npm.cmd run api:dev
npm.cmd run dev
```

The API runs on `http://localhost:5000`. Open `http://localhost:5000/api/health` to confirm that it is available.

## Production deployment (Vercel + Render)

The Vercel project hosts the frontend; Render runs the Express API. MongoDB must be hosted separately, for example with MongoDB Atlas. Push the project to GitHub before connecting either provider.

### Deploy the frontend to Vercel

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `fresho_frontend`. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
3. Deploy once to obtain the site's `*.vercel.app` URL. The app can run in demo mode before the API is configured.

### Deploy the API to Render

1. Create a MongoDB database and copy its connection URI.
2. In Render, create a Blueprint from the GitHub repository and set **Blueprint Path** to `fresho_frontend/render.yaml`.
3. Provide the `MONGODB_URI` value when prompted. The Blueprint generates `JWT_SECRET`; set `CLIENT_ORIGIN` to the exact Vercel site origin, such as `https://your-site.vercel.app` (no trailing slash).
4. Deploy the Blueprint and verify `https://<your-render-service>.onrender.com/api/health` returns `{"status":"ok"}`.

### Connect and redeploy

In Vercel's project environment variables, set `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`, then redeploy the frontend. If the Vercel domain changes, update `CLIENT_ORIGIN` in Render to match it exactly.

For a safe key/value import template, use `backend/.env.render.example` and replace its placeholders in the hosting dashboard. Do not commit your actual `.env.render` file or real credentials.

The free Render web service can take a while to respond after being idle. Also, only login and registration currently use the API; other screens still use demo/in-memory data until their API integration is completed.
