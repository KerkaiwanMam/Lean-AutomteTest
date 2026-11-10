# M15 — Test Framework Architecture & Design Patterns

> **Level 4 · Engineering** · ⏱ 10 ชม. · Prerequisite: M10, M12 · ISTQB CTAL-TAE บทที่ 3
> โมดูลหลักของทักษะ **"ออกแบบโครงสร้าง"** — สิ่งที่แยก Automation Engineer ออกจากคนเขียน script

## 🎯 Learning Objectives
1. ออกแบบ **layered architecture** ของ test framework และอธิบายเหตุผลของแต่ละชั้น
2. เลือกใช้ **design patterns**: Page Object, Component, Screenplay, Service Object, Builder/Factory, Fixture/DI, Strategy
3. ประยุกต์ **SOLID / DRY / DAMP / KISS** กับ test code
4. ออกแบบ **folder structure, naming, configuration, secrets** สำหรับหลาย environment
5. ทำ **framework review** และเขียน **Architecture Decision Records (ADR)**
6. วางแผน **scale**: หลายทีม, หลาย repo, monorepo, shared libraries

---

## 📖 1. คุณสมบัติของ framework ที่ดี (Quality attributes)
| คุณสมบัติ | คำถามทดสอบตัวเอง |
|---|---|
| **Readability** | คนใหม่อ่าน test แล้วรู้ว่าทดสอบอะไรใน 30 วินาทีไหม? |
| **Maintainability** | UI เปลี่ยน 1 จุด ต้องแก้กี่ไฟล์? (เป้า: 1) |
| **Reliability** | flaky rate < 1% ไหม? |
| **Speed** | smoke < 5 นาที, regression < 30 นาทีไหม? |
| **Isolation** | test รันลำดับไหนก็ได้ ขนานกันได้ไหม? |
| **Debuggability** | fail แล้วรู้สาเหตุจาก report โดยไม่ต้องรันซ้ำไหม? |
| **Portability** | รัน local/CI/staging ได้โดยเปลี่ยนแค่ env var ไหม? |
| **Extensibility** | เพิ่ม browser/ภาษา/ประเภท test ใหม่ง่ายไหม? |

## 📖 2. Layered Architecture (ของ reference framework)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. TESTS (specs)           tests/ui/*.spec.ts · tests/ui/*.robot           │ "อะไร" ที่ทดสอบ — ภาษาธุรกิจ
├──────────────────────────────────────────────────────────────────────────┤
│ 2. FIXTURES / KEYWORDS     src/fixtures/test.ts · resources/common.resource│ เตรียม/ทำลายสภาพแวดล้อม, DI
├──────────────────────────────────────────────────────────────────────────┤
│ 3. DOMAIN ADAPTERS         src/pages/* (UI) · src/api/ShopLabApi.ts (API)  │ "อย่างไร" ที่คุยกับระบบ
│                            resources/pages/* · resources/api/*             │
├──────────────────────────────────────────────────────────────────────────┤
│ 4. TEST DATA               src/data/testData.ts (builders, constants)      │ ข้อมูล + factories
├──────────────────────────────────────────────────────────────────────────┤
│ 5. UTILITIES               src/utils/money.ts · contract.ts · ShopLabLib.py│ ไม่รู้จักโดเมน ใช้ซ้ำได้
├──────────────────────────────────────────────────────────────────────────┤
│ 6. CONFIG                  src/config/env.ts · playwright.config.ts        │ env, secrets, runner settings
└──────────────────────────────────────────────────────────────────────────┘
        ▼ dependency ไหลลงเท่านั้น (ชั้นล่างห้าม import ชั้นบน)
```

**กฎเหล็ก**
1. Tests ไม่มี selector, URL ภายใน, หรือ HTTP โดยตรง
2. Page/API objects ไม่มี assertion ทางธุรกิจ และไม่รู้จัก test
3. Config อ่านจาก **ที่เดียว** (`env.ts`) — ห้าม `process.env.X` กระจายทั่วโค้ด
4. Test data สร้างผ่าน **builder/factory** — ไม่ hard-code ซ้ำทุกไฟล์

## 📖 3. Folder structure ที่แนะนำ

**Playwright (TypeScript)**
```
tests/playwright/
├── playwright.config.ts        projects, reporters, webServer
├── src/
│   ├── config/env.ts           ← BASE_URL, users จาก env/secret
│   ├── api/ShopLabApi.ts       ← service object
│   ├── pages/                  ← page + component objects
│   ├── fixtures/test.ts        ← test.extend (DI)
│   ├── data/testData.ts        ← builders, constants, generators
│   └── utils/                  ← money parsing, contract (Ajv), helpers
└── tests/
    ├── global.setup.ts         ← reset / seed / bug mode
    ├── api/   ui/   lab/   a11y/   visual/
```

**Robot Framework**
```
tests/robot/
├── libraries/                  ← Python keyword libraries
├── resources/
│   ├── variables.py            ← config ต่อ env
│   ├── browser.resource        ← import library ครั้งเดียว
│   ├── common.resource         ← setup/teardown/shared keywords
│   ├── api/                    ← service keywords
│   └── pages/                  ← page keywords + locators
├── data/                       ← CSV/JSON สำหรับ data-driven
└── tests/
    ├── __init__.robot          ← suite-level setup
    └── api/  ui/  db/  legacy/
```

**Naming conventions**
- ไฟล์: `<feature>.spec.ts`, `<feature>.api.spec.ts`, `NN_<feature>.robot`
- Test name: **พฤติกรรม + เงื่อนไข + ผล** — `cancelling an order restores stock` ไม่ใช่ `test_cancel_2`
- Requirement/bug ID ใน tag หรือชื่อ (`(BUG-12 guard)`, `@REQ-ORD-06`)

## 📖 4. Design Patterns

### 4.1 Page Object & Component Object
ดู M10 — เสริม: **Component** สำหรับส่วนที่ซ้ำ (header, modal, data table, date picker) แล้ว *ประกอบ* เข้า page (composition over inheritance)

### 4.2 Service Object (API client)
`ShopLabApi` ห่อ HTTP — test เรียก `userApi.addToCart(id, 2)` แทน `request.post('/api/cart/items', …)` · เปลี่ยน endpoint/auth ที่เดียว

### 4.3 Builder / Factory (Test Data)
```ts
const order = buildCheckout({ paymentMethod: 'cod', card: undefined });   // default ครบ + override เฉพาะที่สนใจ
const user  = await api.createUser();                                      // factory ผ่าน test hook
```
ทำให้ test **บอกเฉพาะสิ่งที่สำคัญต่อ case นั้น** (intention-revealing)

### 4.4 Fixture / Dependency Injection
Playwright `test.extend` / Robot `Suite Setup`+resource — test "ขอ" สิ่งที่ต้องใช้ framework จัดหาและเก็บกวาด

### 4.5 Screenplay Pattern (ทางเลือกสำหรับ framework ใหญ่)
```
Actor (Jane) ──has──▶ Abilities (BrowseTheWeb, CallAnApi)
     │ attemptsTo
     ▼
  Tasks (AddToCart, Checkout) ──composed of──▶ Interactions (Click, Fill)
     │ asks
     ▼
  Questions (TheCartTotal) ──▶ assertions
```
ข้อดี: reuse สูง, หลาย actor ใน test เดียว (customer + admin) อ่านง่าย · ข้อเสีย: abstraction เยอะ เรียนรู้นาน — ใช้เมื่อ POM เริ่มบวม (เครื่องมือ: Serenity/JS, ScreenPy)

### 4.6 Strategy / Adapter
เช่น `PaymentStrategy` (card/cod/qr) หรือ adapter ระหว่าง SeleniumLibrary → Browser library ตอน migrate (keyword ชื่อเดิม implementation ใหม่)

### 4.7 Keyword-driven / Data-driven / BDD — เมื่อไรใช้อะไร
| แนวทาง | เหมาะกับ | ระวัง |
|---|---|---|
| Keyword-driven | ทีมผสม non-coder | keyword ซ้ำซ้อน/ตั้งชื่อไม่สม่ำเสมอ |
| Data-driven | business rule หลาย combination | test name ต้องบอก row ที่ fail |
| BDD | สื่อสารกับ business, living documentation | Gherkin แบบ UI-steps = แย่กว่าไม่ใช้ |

## 📖 5. หลักการออกแบบโค้ด (สำหรับ test)
- **S**ingle responsibility — `CartPage` ไม่ควรรู้เรื่อง checkout
- **O**pen/closed — เพิ่ม project/browser ผ่าน config ไม่ต้องแก้ test
- **D**ependency inversion — test พึ่ง fixture/abstraction ไม่ใช่ `new Browser()` เอง
- **DRY** สำหรับ framework code · **DAMP** สำหรับ test body
- **KISS / YAGNI** — อย่าสร้าง "framework ของ framework" ก่อนมีความต้องการจริง
- **Fail fast, fail clearly** — message ใน assertion: `expect(res.status(), await res.text()).toBe(201)`

## 📖 6. Configuration & Secrets
```ts
// src/config/env.ts — ที่เดียวที่อ่าน process.env
export const env = {
  baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  users: { admin: { username: process.env.ADMIN_USER ?? 'admin', password: process.env.ADMIN_PASS ?? '…' } },
};
```
| Environment | วิธีส่งค่า |
|---|---|
| Local | `.env` (gitignored) / ค่า default สำหรับ practice app |
| CI | GitHub Actions secrets / GitLab CI variables (masked) |
| องค์กร | HashiCorp Vault, Azure Key Vault, AWS Secrets Manager |

❌ ห้าม commit รหัสผ่านจริง · ❌ ห้าม log รหัสผ่าน (`Fill Secret`, mask ใน report)

## 📖 7. Anti-patterns ที่เจอบ่อย (Framework smells)
| Smell | อาการ | แก้ |
|---|---|---|
| God page object | ไฟล์ 2,000 บรรทัด | แยก component |
| Test inter-dependency | test B ต้องรันหลัง test A | แต่ละ test เตรียมข้อมูลเอง |
| Hard-coded waits | `sleep(5)` | web-first assertions / wait for response |
| Assertion-free test | คลิกครบแต่ไม่ assert | assert ผลทางธุรกิจ |
| Over-abstraction | 6 ชั้น wrapper ของ `click()` | KISS |
| Copy-paste locators | selector เดียวกันใน 20 ไฟล์ | page object |
| Shared mutable state | ทุก test ใช้ user `customer` | factory ต่อ test |
| Logic in tests | if/else ใน test body | แยกเป็น test หลายตัว / data-driven |

## 📖 8. Scaling
- **หลายทีม:** shared library เป็น package (npm/pip) มี version · แต่ละทีมมี test ของตัวเอง
- **Monorepo:** test อยู่ข้างโค้ดแอป → test เปลี่ยนพร้อม feature ใน PR เดียว (แนะนำ)
- **Test ownership:** CODEOWNERS ต่อโฟลเดอร์
- **Documentation:** README ของ framework + ADR ในโฟลเดอร์ `docs/adr/`
- **Code review checklist** สำหรับ test code (ดู M20)

## 📖 9. Architecture Decision Record (ADR)
```markdown
# ADR-003: Use API login + cookie injection instead of storageState
Status: Accepted (2026-11-10)
Context: UI tests run fully parallel. A shared storageState user caused cart collisions.
Decision: Each test creates its own user via POST /api/test/users and injects sl_token cookie.
Consequences: + isolation, + speed. − requires test hooks in every non-prod env.
```

---

## 💡 Worked Example — Framework walkthrough
อ่าน reference ตามลำดับนี้แล้วตอบคำถาม:
1. `playwright.config.ts` → มีกี่ project? ทำไม `ui-admin` depend on `ui`?
2. `src/fixtures/test.ts` → fixture `userPage` ขึ้นกับ fixture ไหนบ้าง (วาด dependency graph)?
3. `src/pages/CartPage.ts` → ทำไม `applyCouponCode()` รอ `waitForResponse`?
4. `tests/ui/cart-pricing.spec.ts` → ค่าคาดหวังมาจากไหน? ทำไมไม่อ่านจากแอป?
5. `tests/robot/resources/browser.resource` → แก้ปัญหาอะไร?

## 🧪 Lab 15.1 — Framework review (60 นาที, กลุ่ม)
ใช้ checklist ใน [templates/framework-review-checklist.md](../templates/framework-review-checklist.md) review reference framework (หรือ framework ของบริษัท) → ให้คะแนน + ข้อเสนอแนะ 5 ข้อ เรียงตามผลกระทบ

## 🧪 Lab 15.2 — สร้าง framework ใหม่จากศูนย์ (180 นาที)
สร้าง framework ของตัวเอง (Playwright **หรือ** Robot) สำหรับ ShopLab **โดยไม่ copy reference** ต้องมี: 6 ชั้นตามหัวข้อ 2, config 2 environments (local, docker), 1 builder, 1 factory, 3 page objects, 1 component, 10 tests (UI+API) · เขียน README และ ADR 2 ฉบับ

## 🧪 Lab 15.3 — Screenplay spike (90 นาที, optional)
implement flow "customer ซื้อ → admin ส่งของ → customer เห็น SHIPPED" แบบ Screenplay (Actor/Task/Question) เทียบความอ่านง่ายกับ POM

## 🧪 Lab 15.4 — Refactor kata (60 นาที)
ไฟล์โจทย์: [`tests/playwright/tests/exercises/bad-checkout.spec.ts`](../../tests/playwright/tests/exercises/bad-checkout.spec.ts) — test ที่ **ผ่าน (เขียว)** แต่เขียนไม่ดี มี smell ครบ 8 แบบตามตาราง หัวข้อ 7 (God page object ในตารางแทนด้วย "god test" ที่ทำทุกอย่างใน test เดียว)
```bash
# PowerShell: $env:EXERCISES="1"
npx playwright test tests/exercises/bad-checkout.spec.ts --project=exercises   # ต้องผ่านทั้งก่อนและหลัง refactor
```
Refactor เป็น page objects + fixtures + data builders แล้วให้ผ่าน [framework-review-checklist](../templates/framework-review-checklist.md) · **ห้ามลบการตรวจเดิม และต้องเพิ่มการตรวจที่ขาด** (test บางตัวไม่มี assertion) · เฉลย smell สำหรับผู้สอน: [instructor/exercise-keys.md](../instructor/exercise-keys.md)

---

## ✅ Check Your Understanding
1. ชั้นใดควรแก้เมื่อ (a) URL ของ API เปลี่ยน (b) ปุ่มเปลี่ยน testid (c) กฎส่งฟรีเปลี่ยนเป็น 1,500?
2. ทำไม page object ไม่ควร import จาก tests/?
3. Builder ช่วยเรื่องความอ่านง่ายของ test อย่างไร?
4. เมื่อไรควรพิจารณา Screenplay แทน POM?
5. ยก framework smell 3 อย่างและวิธีแก้

<details><summary>เฉลย</summary>

1. (a) Service object `ShopLabApi` / config (b) Page object (c) Test data/oracle (`expectedQuote`) + requirement — test body ไม่ต้องแก้
2. ผิดทิศทาง dependency → วงจร import, page object ผูกกับ test ใดๆ ใช้ซ้ำไม่ได้
3. Test ระบุเฉพาะค่าที่สำคัญต่อ case (`{ postcode: '1011' }`) ที่เหลือเป็น default — เห็นเจตนาชัดเจน
4. เมื่อมีหลาย actor/บทบาท, task ซ้ำข้ามหลาย page, POM บวมจนเป็น god object, ทีมใหญ่ต้องการ reuse สูง
5. ดูตาราง หัวข้อ 7
</details>

## 📋 Skills Checklist
- [ ] วาด architecture ของ framework ตัวเองได้ 6 ชั้น
- [ ] อธิบายและใช้ pattern ≥ 5 แบบ
- [ ] ตั้ง config หลาย env + secrets อย่างปลอดภัย
- [ ] ทำ framework review และเขียน ADR ได้
- [ ] ระบุ framework smell และ refactor ได้

## 🚀 Real-world Notes
- **อย่าเริ่มจากการสร้าง framework ใหญ่** — เริ่มจาก 5–10 tests จริง แล้ว extract pattern เมื่อเห็นความซ้ำ (rule of three)
- Framework ที่ดีที่สุดคือที่ **ทีมใช้จริงและ dev ช่วยแก้ได้** — เขียน README ให้คนใหม่รัน test แรกได้ใน 15 นาที
