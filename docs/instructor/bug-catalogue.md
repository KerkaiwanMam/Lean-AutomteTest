# 🔒 Instructor Only — ShopLab Bug Catalogue (Bug Mode)

> อย่าแจกไฟล์นี้ให้ผู้เรียนก่อน Capstone · เปิด Bug Mode: `POST /api/test/config {"bugMode": true}` หรือ `BUG_MODE=1`
> รายการสั้นแบบ machine-readable: `GET /api/test/config?reveal=1`

| ID | Area | Defect | Requirement | Technique that finds it | Where in code | Reference tests that catch it |
|---|---|---|---|---|---|---|
| BUG-01 | Pricing | Free shipping uses `>` not `>=` (1,000 pays 50) | REQ-PRC-03 | BVA (999/1000/1001) | `src/pricing.js` | PW `cart-pricing.spec.ts` R2 · RF `03_cart_pricing.robot` R2 · unit test |
| BUG-02 | Pricing | VAT computed on subtotal before discount | REQ-PRC-05 | Decision table + oracle | `src/pricing.js` | PW R4, `cart-orders.api` quote · RF R4/R5/R6, `orders_api` totals |
| BUG-03 | Catalogue | Search is case-sensitive | REQ-CAT-02 | EP (case variants) | `routes/products.js` | PW `catalog.spec`, `products.api` · RF `02_catalog` |
| BUG-04 | Catalogue | Price sort compares as text | REQ-CAT-04 | Sorting oracle | `routes/products.js` | PW `catalog.spec`, `products.api` · RF `02_catalog`, `products_api` |
| BUG-05 | Catalogue | Pagination skips one product | REQ-CAT-05 | Completeness check across pages | `routes/products.js` | PW `catalog.spec`, `products.api` · RF `products_api` |
| BUG-06 | Registration | Age 17 accepted | REQ-REG-07 | BVA (17/18/60/61) | `routes/users.js` | PW `registration.spec`, `security.api` BVA |
| BUG-07 | Pricing | Expired coupon accepted | REQ-PRC-02/07 | EP (coupon states) | `src/pricing.js` | PW R9 · RF R9 |
| BUG-08 | Security | IDOR — read another user's order | REQ-SEC-01 | Two-user authz test | `routes/orders.js` | PW `security.api` · RF `orders_api` |
| BUG-09 | Security | Stored XSS in review comments | REQ-SEC-03 | Error guessing / OWASP | `public/product.html` | PW `registration.spec` › reviews |
| BUG-10 | Cart | API accepts qty 11 | REQ-CART-01 | BVA at API level | `routes/cart.js` | PW `cart-orders.api`, `cart-pricing.spec` qty>10 · RF `orders_api` |
| BUG-11 | Auth | Locked account can log in | REQ-AUTH-04 | State transition (account) | `routes/auth.js`, `middleware.js` | PW `auth.spec`, `security.api` · RF `01_login` |
| BUG-12 | Orders | Cancel does not restore stock | REQ-ORD-06 | State + data verification | `routes/orders.js` | PW `checkout.spec`, `cart-orders.api` · RF `orders_api` |
| BUG-13 | Security | Login message reveals username existence | REQ-AUTH-03 | Error guessing / security | `routes/auth.js` | PW `auth.spec`, `security.api` · RF `01_login` |
| (visual) | UI | Lab card 15 shifts 6px + button colour changes | – | Visual regression | `public/css/style.css` `.bug-visual` | PW `visual.spec` (opt-in project) |

## Teaching tips
- **Lab 01.2 / 02.4 / 03.3:** let learners find bugs manually first — then show that a good regression suite would have caught them automatically.
- **Capstone scoring:** run the learner suite in normal mode (must be green) and in bug mode; map each failing test to a BUG-ID. A failure that is not explained by a BUG-ID in bug mode = possible false positive (ask the learner).
- **Discussion:** which bugs are invisible to UI-only suites? (BUG-10 qty 11 via API, BUG-08 IDOR) → pyramid & API testing argument.
- **Chaos settings** for M17: `{"latencyMs": 1500}`, `{"failureRate": 0.3}`; `GET /api/lab/flaky` fails every 2nd call.
