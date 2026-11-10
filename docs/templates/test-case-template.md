# Test Case Template

> Spreadsheet columns or test-management fields. One row = one test case.

| Field | Example |
|---|---|
| ID | TC-PRC-004 |
| Requirement(s) | REQ-PRC-02, REQ-PRC-03, REQ-PRC-05 |
| Title | SAVE10 drops subtotal below free-shipping threshold → shipping charged, VAT after discount |
| Technique | Decision table (rule R3) |
| Priority | High |
| Preconditions | New customer logged in, empty cart |
| Test data | ELEC-003 (1,000 THB) × 1 · coupon SAVE10 · standard shipping |
| Steps | 1. Add ELEC-003 to cart 2. Open /cart 3. Enter SAVE10 → Apply |
| Expected result | Discount 100.00 · Shipping 50.00 · VAT 66.50 · Total 1,016.50 · message "Coupon SAVE10 applied" |
| Automation | Yes — `cart-pricing.spec.ts` R4 / `03_cart_pricing.robot` R4 |
| Status / Last run | Pass · 2026-11-10 |

## Writing rules
- One behaviour per test case; the title states condition + expected outcome
- Expected results are observable and specific (numbers, messages, status codes)
- Test data is explicit (or produced by a named factory)
- Independent: no dependency on other test cases
