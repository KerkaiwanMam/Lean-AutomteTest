# M19 — Non-functional Testing: Performance, Accessibility, Visual, Security, Mobile

> **Level 4 · Engineering** · ⏱ 10 ชม. · Prerequisite: M13, M18
> Reference: `tests/performance/k6-smoke-load.js`, `tests/playwright/tests/a11y/`, `tests/playwright/tests/visual/`

## 🎯 Learning Objectives
1. ออกแบบและรัน **performance test** (smoke/load/stress/spike/soak) ด้วย **k6** พร้อม thresholds
2. ทดสอบ **accessibility** อัตโนมัติด้วย **axe-core** + manual checks (keyboard, screen reader)
3. ทำ **visual regression testing** อย่างเสถียร
4. ทดสอบ **security** เบื้องต้นตาม OWASP Top 10 และใช้ **OWASP ZAP baseline**
5. เข้าใจแนวทาง **mobile testing** (responsive, device emulation, Appium)

---

## 📖 1. Performance Testing
| ประเภท | คำถาม | Profile |
|---|---|---|
| Smoke | script ทำงานไหม | 1 VU, 30s |
| Load | รับโหลดปกติ/คาดการณ์ได้ไหม | ramp → 20 VU, 2–10 นาที |
| Stress | จุดแตกหักอยู่ไหน | เพิ่มเรื่อยๆ จนพัง |
| Spike | รับโหลดพุ่งฉับพลันได้ไหม | 0 → 200 VU ใน 10s |
| Soak | ใช้นานแล้ว memory leak ไหม | โหลดปานกลาง 1–8 ชม. |

**Metrics:** response time (p50/p90/**p95**/p99 — อย่าดูแค่ average), throughput (RPS), error rate, resource (CPU/RAM/DB)

**k6** (JavaScript)
```js
export const options = {
  stages: [{ duration: '30s', target: 10 }, { duration: '1m', target: 20 }, { duration: '30s', target: 0 }],
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500'] },   // = REQ-NFR-01
};
export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);                                  // think time
}
```
```bash
k6 run tests/performance/k6-smoke-load.js
k6 run -e PROFILE=load tests/performance/k6-smoke-load.js
```
ฝึก: ตั้ง chaos `{"latencyMs": 300}` แล้วดู threshold `p(95)<500` เริ่ม fail
เครื่องมืออื่น: **JMeter** (GUI, protocol เยอะ), **Gatling** (Scala/Java), **Locust** (Python), **Artillery**
⚠️ ห้ามยิง load ใส่ production/ระบบคนอื่นโดยไม่ได้รับอนุญาต · ทดสอบใน env ที่ขนาดใกล้ prod

## 📖 2. Accessibility (a11y) — WCAG 2.1/2.2 AA
หลัก **POUR**: Perceivable · Operable · Understandable · Robust
**อัตโนมัติ** — axe-core · Deque (ผู้พัฒนา axe) รายงานในปี 2021 ว่าจาก audit กว่า 2,000 ครั้ง automated testing จับได้ราว **57% ของ *จำนวนปัญหา*** (ตัวเลขของผู้ผลิตเอง) — ถ้านับตามจำนวน WCAG success criteria ที่ตรวจอัตโนมัติได้ สัดส่วนจะต่ำกว่านี้มาก (ตัวเลขที่อ้างกันทั่วไปคือ 20–30%)
```ts
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
expect(results.violations).toEqual([]);
```
ShopLab: `/a11y.html` (ตั้งใจพัง — image-alt, button-name, link-name, html-has-lang, color-contrast, label, duplicate-id) vs `/a11y-fixed.html` (ผ่าน)
> 🔑 บทเรียนจริง: axe จับ `label-content-name-mismatch` ใน header ของ ShopLab — ลิงก์ Cart มี `aria-label="Cart"` แต่ข้อความที่เห็นคือ "Cart 0" → แก้โดยลบ aria-label

**Manual (ที่เหลือ):** ใช้ได้ด้วย keyboard ล้วน (Tab/Shift+Tab/Enter/Space/Esc/ลูกศร) · focus มองเห็นได้ · ลำดับ focus สมเหตุสมผล · screen reader (NVDA, VoiceOver) อ่านถูก · zoom 200% ไม่พัง · ไม่สื่อความหมายด้วยสีอย่างเดียว
Robot: `robotframework-browser` + `axe` ผ่าน `Evaluate JavaScript` หรือ library `robotframework-axelibrary`

## 📖 3. Visual Regression
```ts
await expect(page.getByTestId('visual-card')).toHaveScreenshot('visual-card.png', { maxDiffPixelRatio: 0.01 });
await expect(page).toHaveScreenshot({ fullPage: true, mask: [page.getByTestId('cart-count')] });
```
- ครั้งแรก: `npx playwright test --project=visual --update-snapshots` สร้าง baseline → commit baseline
- ใน Bug Mode การ์ด 15 ของ `/lab` เลื่อน 6px และเปลี่ยนสีปุ่ม → test ต้องจับได้
- ความเสถียร: รันใน Docker เดียวกัน, **mask** ส่วนที่เปลี่ยน (วันที่, ตัวเลขสุ่ม, รูปโฆษณา), ปิด animation (`animations: 'disabled'`), ขนาด viewport คงที่, ฟอนต์ติดตั้งครบ
- เครื่องมือ SaaS: Percy, Applitools (AI diff), Chromatic (Storybook)

## 📖 4. Security Testing พื้นฐาน (สำหรับ QA)
**OWASP Top 10:2025 (Web) — หมวดที่ QA ทดสอบได้** (ฉบับก่อนหน้าคือ 2021; รหัสหมวดเปลี่ยนไป)
| ความเสี่ยง (2025) | ทดสอบ | ShopLab |
|---|---|---|
| A01 Broken Access Control | IDOR, เข้าหน้า admin ด้วย customer, เปลี่ยน id ใน URL | BUG-08, `/admin` 403 |
| A02 Security Misconfiguration | debug endpoint เปิดใน prod, header | test hooks ปิดใน prod, `x-powered-by` ถูกปิด |
| A04 Cryptographic Failures | password plain text, HTTP ไม่เข้ารหัส | DB check password_hash |
| A05 Injection (SQLi, XSS) | `' OR 1=1--`, `<img src=x onerror=…>` | BUG-09 stored XSS ในรีวิว |
| A06 Insecure Design | ไม่มี rate limit/lock | lock หลังผิด 5 ครั้ง |
| A07 Authentication Failures | user enumeration, token ไม่หมดอายุ/ไม่ revoke | BUG-13, logout revoke |
| A10 Mishandling of Exceptional Conditions | error เปิดเผยข้อมูลภายใน, ระบบล่มเมื่อ input ผิดรูปแบบ | `INVALID_JSON` ตอบ 400 ไม่ใช่ 500 |

**OWASP ZAP baseline scan** (passive, ปลอดภัย)
```bash
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:3000 -r zap-report.html
```
⚠️ **จริยธรรม:** สแกน/โจมตีเฉพาะระบบที่ได้รับอนุญาตเป็นลายลักษณ์อักษรเท่านั้น · Pentest เชิงลึกเป็นงานของผู้เชี่ยวชาญ security — QA ช่วยทำ "security regression" ของบั๊กที่เคยพบ

## 📖 5. Mobile & Cross-browser
- **Responsive / emulation:** Playwright `devices['Pixel 7']`, `devices['iPhone 15']` (viewport, touch, user agent) — ดู project ที่ comment ไว้ใน `playwright.config.ts`
- **Cross-browser:** Chromium, Firefox, WebKit (`npx playwright install firefox webkit`)
- **Real devices / native app:** Appium (+ Robot `AppiumLibrary`), device farms (BrowserStack, Sauce Labs, LambdaTest, AWS Device Farm)
- ShopLab roadmap v1.3: mobile app ที่ใช้ API เดียวกัน

---

## 🧪 Lab 19.1 — k6 (60 นาที)
ติดตั้ง k6 → รัน smoke → รัน load → ตั้ง latency 300ms รันใหม่ → เขียนรายงาน 1 หน้า: p95, error rate, จุดคอขวด, ข้อเสนอ

## 🧪 Lab 19.2 — a11y audit (60 นาที)
(1) รัน axe บนทุกหน้าของ ShopLab สรุป violation ตาม impact (2) ทดสอบ checkout ด้วย keyboard ล้วน (3) เขียน bug report a11y 3 ฉบับพร้อม WCAG criterion

## 🧪 Lab 19.3 — Visual (45 นาที)
สร้าง baseline 3 หน้า → เปิด Bug Mode → ดู diff ใน HTML report · เพิ่ม mask ให้ส่วน dynamic

## 🧪 Lab 19.4 — Security regression (60 นาที, Bug Mode ON)
เขียน automated test ที่จับ BUG-08, BUG-09, BUG-11, BUG-13 (ถ้าเขียนแล้วใน Level 3 ให้ทำ mass assignment + SQLi probe ที่ search) · รัน ZAP baseline แล้วสรุป 5 findings

---

## ✅ Check Your Understanding
1. ทำไม p95 สำคัญกว่า average?
2. axe ผ่าน 100% แปลว่าเว็บ accessible แล้วหรือไม่?
3. วิธีลด false positive ของ visual test มีอะไรบ้าง?
4. IDOR อยู่ใน OWASP หมวดใด?
5. Device emulation แทน real device ได้ทั้งหมดหรือไม่?

<details><summary>เฉลย</summary>

1. average ซ่อน "หาง" ที่ผู้ใช้ส่วนหนึ่งเจอช้ามาก; p95 บอกประสบการณ์ของผู้ใช้ 95%
2. ไม่ — แม้ตามตัวเลขของ Deque automated จะจับได้ราวครึ่งหนึ่งของจำนวนปัญหา ที่เหลือต้อง manual (keyboard, screen reader, ความหมายของ alt text)
3. Docker/OS เดียวกัน, mask ส่วน dynamic, ปิด animation, viewport/ฟอนต์คงที่, threshold เหมาะสม, screenshot เฉพาะ component
4. A01 Broken Access Control (ทั้งฉบับ 2021 และ 2025) · ฝั่ง API คือ API1:2023 BOLA
5. ไม่ — ไม่ได้จำลอง CPU/GPU, rendering engine จริงของ iOS Safari, gesture, sensor, network จริง
</details>

## 📋 Skills Checklist
- [ ] เขียน k6 script พร้อม thresholds และอ่านผลได้
- [ ] รัน axe และทำ manual a11y check ได้
- [ ] สร้าง/ดูแล visual baseline ได้
- [ ] ทดสอบ OWASP พื้นฐานและรัน ZAP baseline ได้
