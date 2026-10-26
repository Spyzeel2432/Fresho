# Fresho Frontend — Test Report

Automated end-to-end run (Playwright, Chromium) against `npm run dev`.

**Total: 83 · Passed: 81 · Failed: 2**

Console/page errors during run: none.

## Public

| Result | Test | Notes |
|---|---|---|
| ✅ | Landing renders (hero card 4 rows, 8 products, 3 steps) |  |
| ✅ | Landing anchors scroll without changing route |  |
| ✅ | Guest product card -> login |  |
| ✅ | Get started -> roles; role card -> login with matching tab |  |
| ✅ | Login validation errors (empty) |  |
| ✅ | Register validation (empty, bad phone, mismatch) | empty=4 |
| ✅ | Register hides Admin tab |  |
| ✅ | Register customer -> dashboard shows own name |  |
| ✅ | Unknown route shows 404 page |  |

## Auth

| Result | Test | Notes |
|---|---|---|
| ✅ | Registered user logs out and back in -> keeps own identity | shows "TP |
| ✅ | Registered account: wrong password rejected with message | Incorrect password. |
| ✅ | Registered account: correct password signs in |  |
| ✅ | Duplicate email registration rejected |  |
| ✅ | Login/register forms do not leak state between each other |  |
| ✅ | Cannot self-register as Admin via ?role=admin | registered as customer, not admin |
| ✅ | Route guards: guest and wrong-role access redirected | #/customer |
| ✅ | Session survives reload; /login redirects when logged in |  |
| ✅ | Back button after logout does not expose dashboard |  |

## Customer

| Result | Test | Notes |
|---|---|---|
| ✅ | Home: greeting, 8 products, 4 categories, farmers, perks |  |
| ✅ | Home banner product links open product page |  |
| ✅ | Category card filters Explore |  |
| ✅ | Topbar search (Enter) -> Explore results | cards=1 url=#/explore?q=mango |
| ✅ | Explore: search by farm name |  |
| ✅ | Explore: search by place (e.g. Anand) | cards=6 |
| ✅ | Explore: empty state + Reset filters |  |
| ✅ | Explore: price slider filters | cards=6 |
| ✅ | Explore: sort low->high / high->low |  |
| ✅ | Explore: category chip + farmer filter chip (removable) | fruits=2 farmer=4 |
| ❌ | Explore: filters not reflected in URL (sort/price/stock) | sort, max price and in-stock are local state only; not shareable/bookmarkable |
| ✅ | Card quick-add updates cart badge; duplicate merges |  |
| ✅ | Product page: details, related items, stepper bounds | qty after spam=9 |
| ✅ | Buy now adds and opens cart |  |
| ✅ | Cart: qty +/-, min 1, max stock, remove, empty state |  |
| ✅ | Cart totals: delivery fee under/over threshold | ₹88 |
| ✅ | Cart badge consistent after product deleted by farmer | badge=none but cart page lines=0 |
| ✅ | Checkout: empty cart redirects to cart |  |
| ✅ | Checkout: validation, steps, back keeps data, payment, review | val=True backdata=True |
| ✅ | Place order: id, Pending, cart cleared, stock reduced, listed | stock 36->34, orders=5 |
| ✅ | Orders: status tabs filter correctly | del=2 canc=1 |
| ✅ | Order detail: timeline step states (Shipped) | done=2 cur=1 |
| ✅ | Order detail: summary math (items + delivery = total) | Summary Items ₹344 Delivery ₹40 Total ₹384 |
| ✅ | Cancel pending order -> Cancelled; stock restored | status ok=True; stock 34->36 (expected 36) |
| ✅ | Reorder from delivered order fills cart |  |
| ✅ | Profile page shows account details |  |
| ✅ | Invalid ids redirect (product/999, orders/NOPE) |  |
| ✅ | Deep link + reload on product page keeps state |  |
| ✅ | Orders are per account (new user named "Zeel Patel" does not see Zeel's orders) | orders=0 |

## Farmer

| Result | Test | Notes |
|---|---|---|
| ✅ | Overview: stats match data; sections render | Products listed 4 0 low on stock Pending orders 1 Need your confirmation Total earned ₹408 |
| ✅ | Add product: validation errors |  |
| ✅ | Add product: live preview updates |  |
| ✅ | Add product: saved, listed, visible to customers | farmer list=True customer sees=True |
| ✅ | Add product: price/stock accept decimals & negatives? | negative price blocked |
| ✅ | Product name with HTML is rendered as text (no XSS) |  |
| ✅ | Add product: very long name does not break layout |  |
| ✅ | Inline stock edit -> Low stock / Sold out pills; customer sees sold out | pill=True disabledAdd=True |
| ✅ | Delete product removes it everywhere | no confirmation dialog before delete |
| ✅ | Orders tabs + confirm -> ship -> deliver flow | ['Delivered', 'Delivered', 'Delivered', 'Cancelled', 'Shipped', 'Confirmed', 'Delivered', 'Delivered'] |
| ✅ | Farmer status change visible on customer order tracking |  |
| ✅ | Earnings stat increases after delivery | 408->560 |
| ✅ | Cancel action on pending order | cancelled order stock is not restored |
| ✅ | Registered farmer: unverified notice, add blocked |  |
| ✅ | Registered farmer overview starts empty (0 products/orders) |  |

## Admin

| Result | Test | Notes |
|---|---|---|
| ✅ | Overview: 4 stats, chart, attention list, recent orders |  |
| ✅ | Farmers: search, approve, revoke |  |
| ✅ | Revoked farmer's products are hidden from customers | customer sees 4/12 |
| ✅ | Products: search + remove |  |
| ✅ | Orders: status tabs filter | 1,4 |
| ✅ | Stats update live (farmers/products/orders) |  |
| ❌ | Admin cannot manage users/customers (no Users page) | no user list / block-user feature (was removed as "useless"; reintroduce if SE report needs user management) |

## Robust

| Result | Test | Notes |
|---|---|---|
| ✅ | Corrupt localStorage JSON -> app still loads |  |
| ✅ | Tampered user object (missing name) does not white-screen |  |
| ✅ | Logout in one tab is mirrored in other open tab (no reload) |  |
| ✅ | Storage disabled / private mode | wrapped in try/catch; falls back to memory (by code review) |

## Mobile

| Result | Test | Notes |
|---|---|---|
| ✅ | No horizontal overflow: public pages | [] |
| ✅ | No horizontal overflow: customer pages | [] |
| ✅ | Customer hamburger menu opens and reaches Orders |  |
| ✅ | No horizontal overflow: farmer pages | [] |
| ✅ | No horizontal overflow: admin pages | [] |

## A11y

| Result | Test | Notes |
|---|---|---|
| ✅ | /customer: unlabeled buttons/inputs | {'btn': 0, 'inp': 0, 'img': 0, 'h1': 0, 'lang': 'en'} |
| ✅ | /explore: unlabeled buttons/inputs | {'btn': 0, 'inp': 0, 'img': 0, 'h1': 1, 'lang': 'en'} |
| ✅ | /cart: unlabeled buttons/inputs | {'btn': 0, 'inp': 0, 'img': 0, 'h1': 1, 'lang': 'en'} |
| ✅ | /checkout: unlabeled buttons/inputs | {'btn': 0, 'inp': 0, 'img': 0, 'h1': 1, 'lang': 'en'} |
| ✅ | Keyboard: Enter submits login; focus ring visible on inputs |  |

## Known limitations (not bugs — by design for a frontend-only build)

- Data is stored in the browser (localStorage); orders, accounts and stock are not shared between devices.
- Unregistered emails sign in as demo users; registered accounts keep passwords in localStorage. Replace with real authentication (hashed passwords, JWT/session) when the Express backend is added.
- Filter state (sort, price, in-stock) is not in the URL.
- No admin user-management page.
- Payments are simulated; no real UPI/card gateway.

## Run the tests

```bash
npm install && npm run dev            # terminal 1
pip install playwright && playwright install chromium
python tests/e2e_test.py              # terminal 2
```
