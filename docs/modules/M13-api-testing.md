# M13 — API & Contract Testing

> **Level 3 · Tools** · ⏱ 8 ชม. · Prerequisite: M07, M08
> Reference: `tests/playwright/tests/api/`, `tests/robot/tests/api/`, `tests/postman/`

## 🎯 Learning Objectives
1. ออกแบบ API test ครอบคลุม: **status, headers, body, schema, business rules, error handling, security**
2. ใช้ **Postman/Newman**, **Playwright `request`**, **Robot RequestsLibrary**
3. ทำ **contract testing** ด้วย OpenAPI + JSON Schema (Ajv)
4. ทดสอบ **authentication/authorization** (401/403/IDOR)
5. ใช้ API เป็น **test data factory** ให้ UI tests

---

## 📖 1. ทำไม API testing สำคัญ
- เร็วกว่า UI มาก (ไม่ต้องเปิด browser และ render หน้า), เสถียรกว่า, ทดสอบ business rule ได้ตรงจุด
- ทดสอบสิ่งที่ UI "ซ่อน" ได้ — เช่น UI จำกัดจำนวน ≤ 10 แต่ API ยอมรับ 11 ไหม? (**BUG-10**) · UI ไม่มีปุ่มดู order คนอื่น แต่ API ให้ดูไหม? (**BUG-08**)
- **Server is the source of truth** — validation ฝั่ง client ข้ามได้เสมอ

## 📖 2. Checklist การทดสอบ endpoint
| หมวด | ตรวจอะไร | ShopLab ตัวอย่าง |
|---|---|---|
| Happy path | status, body ถูกต้อง | `POST /api/orders` → 201, status PAID |
| Schema / contract | field ครบ, type ถูก, format | ProductList ตรง OpenAPI |
| Validation | required, type, range, format → 400 + รายละเอียด | `pageSize=51` → 400 details.pageSize |
| Business rules | คำนวณ, state machine | quote SAVE10 = 1016.5 |
| AuthN | ไม่มี/ผิด/หมดอายุ/ถูก revoke token → 401 | logout แล้วใช้ token เดิม |
| AuthZ | role, ownership → 403/404 | customer → `/api/admin/*` = 403, order คนอื่น = 404 |
| Error format | สม่ำเสมอ `{error:{code,message,details}}` | Error schema |
| Idempotency & concurrency | เรียกซ้ำ / พร้อมกัน | สั่งซื้อพร้อมกัน 2 ครั้งเกิน stock? |
| Headers | content-type, cache, security headers | `application/json; charset=utf-8` |
| Performance (เบื้องต้น) | response time | Postman `responseTime < 1000` |
| Robustness | JSON เสีย, body ใหญ่, unicode | `INVALID_JSON` |

## 📖 3. Postman / Newman
- **Collection** = ชุด request + test scripts · **Environment** = ตัวแปรต่อ env (`baseUrl`)
- ส่งค่าระหว่าง request: `pm.collectionVariables.set('token', body.token)`
- Assertion: `pm.test('200', () => pm.response.to.have.status(200))`, `pm.response.to.have.jsonSchema(schema)`
- รันใน CI: `newman run tests/postman/ShopLab.postman_collection.json -e tests/postman/local.postman_environment.json --reporters cli,junit`

> 🔑 **บทเรียนจริง:** request "Cart without token → 401" ได้ 200 เพราะ **cookie jar** ของ Postman/Newman ส่ง `sl_token` ที่ได้จาก login อัตโนมัติ → แก้ด้วย `protocolProfileBehavior.disableCookies: true` — ทดสอบ "ไม่ได้ login" ต้องมั่นใจว่าไม่มี credential แอบติดไปจริงๆ

## 📖 4. Playwright API testing
```ts
test('GET /products matches the OpenAPI contract', async ({ api, request }) => {
  const res = await api.products();
  expect(res.status()).toBe(200);
  const body = await res.json();
  const validate = await schemaValidator(request, 'ProductList');   // src/utils/contract.ts (Ajv)
  expect(validate(body), formatErrors(validate)).toBe(true);
  expect(body).toMatchObject({ total: 28, page: 1, pageSize: 8 });
});
```
- `ShopLabApi` (`src/api/ShopLabApi.ts`) = **service object** — คืน `APIResponse` ให้ test ตัดสินใจเรื่อง status เอง
- แยก `APIRequestContext` ต่อ "ผู้ใช้" (fixture `newApi`) เพื่อทดสอบ IDOR ด้วย 2 คนใน test เดียว

## 📖 5. Robot RequestsLibrary
```robotframework
Login Via API
    [Arguments]    ${user}    ${alias}=shoplab
    Create Session    ${alias}    ${BASE_URL}
    ${resp}=    POST On Session    ${alias}    /api/auth/login    json=${body}    expected_status=200
    Update Session    ${alias}    headers=${{ {"Authorization": "Bearer " + $resp.json()["token"]} }}
```
- `expected_status=any` เมื่อต้องการตรวจ status เอง · `json=` ต้องเป็น **dict** (ไม่ใช่ string) — ใช้ `${{ {...} }}` หรือ `Create Dictionary`

## 📖 6. Contract testing
**ปัญหา:** frontend/mobile/partner พังเพราะ backend เปลี่ยนชื่อ field โดยไม่บอก
- **Schema/spec-based (provider):** ตรวจ response ทุกตัวกับ OpenAPI ที่ประกาศไว้ (`/api/openapi.json`) — ทำใน reference แล้ว
- **Consumer-driven (Pact):** consumer เขียน "สัญญา" ว่าต้องการ field อะไร → provider รัน verify ใน CI — เหมาะกับ microservices
- **Backward compatibility rules:** เพิ่ม field ได้ · ลบ/เปลี่ยนชื่อ/เปลี่ยน type = breaking → ต้อง version (`/v2`)

## 📖 7. Security testing ระดับ API (OWASP API Security Top 10 – 2023 ที่ QA ทดสอบได้)
| หมวด (2023) | ทดสอบอย่างไร | ShopLab |
|---|---|---|
| **API1 Broken Object Level Authorization (BOLA / IDOR)** | user B เรียก resource ของ user A | `security.api.spec.ts` (BUG-08) |
| API2 Broken Authentication | token หมดอายุ/revoke ยังใช้ได้? brute force? ข้อความ error เผยว่ามี user ไหม? | logout revoke, lock หลังผิด 5 ครั้ง, BUG-13 |
| API3 Broken Object Property Level Authorization *(รวม Excessive Data Exposure + Mass Assignment จากฉบับ 2019)* | response มีข้อมูลเกินจำเป็นไหม · ส่ง `"role":"admin"` ตอนสมัครได้ไหม | `/api/admin/users` ไม่มี hash · ลอง mass assignment! |
| API4 Unrestricted Resource Consumption | ไม่จำกัดขนาด/จำนวน request | `pageSize` สูงสุด 50, ไฟล์ ≤ 1–2 MB |
| API5 Broken Function Level Authorization | customer เรียก admin endpoint | 403 |
| *(Injection — อยู่ในฉบับ 2019 และใน OWASP Top 10 web A05:2025)* | `' OR 1=1 --` ใน search | ShopLab ใช้ parameterized query |

---

## 🧪 Lab 13.1 — Postman (60 นาที)
Import collection + environment รันใน Postman → เพิ่ม folder "06 Admin" (login admin, เปลี่ยนสถานะ order, export CSV ตรวจ header `Content-Disposition`) → รันด้วย Newman

## 🧪 Lab 13.2 — API suite ใน Playwright (90 นาที)
เขียน tests สำหรับ `/api/users/register`: happy path, ทุก validation field (EP), duplicate (409), BVA อายุ และ **mass assignment** (`role: "admin"` ต้องไม่ได้ admin)

## 🧪 Lab 13.3 — API suite ใน Robot (60 นาที)
เขียน `reviews_api.robot`: เพิ่มรีวิว (201), rating 0/6 (400), comment 501 ตัว (400), ไม่ login (401), สินค้าไม่มี (404)

## 🧪 Lab 13.4 — Contract (45 นาที)
เพิ่ม schema `Review` ใน `practice-app/src/openapi.js` แล้วเขียน contract test · จากนั้นลอง "ทำ breaking change" (เปลี่ยน `username` เป็น `user`) ดูว่า test จับได้ไหม แล้ว revert

---

## ✅ Check Your Understanding
1. ทำไม validation ฝั่ง client ไม่พอ?
2. ทำไม ShopLab คืน 404 (ไม่ใช่ 403) เมื่อดู order ของคนอื่น?
3. เพิ่ม field ใหม่ใน response เป็น breaking change หรือไม่?
4. ทดสอบ IDOR ต้องมีผู้ใช้กี่คน?
5. API test ที่ assert เฉพาะ status 200 มีปัญหาอะไร?

<details><summary>เฉลย</summary>

1. ผู้ใช้/ผู้โจมตีเรียก API ตรงได้เสมอ — server ต้อง validate ทุกอย่าง (ตัวอย่าง BUG-10)
2. ไม่เปิดเผยว่า order id นั้นมีอยู่จริง → ป้องกันการไล่เดา id (enumeration)
3. โดยทั่วไปไม่ (backward compatible) — ยกเว้น consumer เขียน parser แบบ strict
4. อย่างน้อย 2 (เจ้าของ resource และผู้บุกรุก)
5. ไม่ได้ตรวจว่า "ข้อมูลถูกต้อง" — API อาจคืน 200 พร้อมข้อมูลผิด/ว่าง
</details>

## 📋 Skills Checklist
- [ ] ออกแบบ API test ครบ 10 หมวดในตาราง
- [ ] ใช้ได้ทั้ง Postman, Playwright request, RequestsLibrary
- [ ] ทำ schema validation จาก OpenAPI
- [ ] ทดสอบ 401/403/IDOR ได้

## 🚀 Real-world Notes
- ขอ **OpenAPI spec** จาก dev ตั้งแต่ต้น — ถ้าไม่มี ผลักดันให้มี (ช่วยทั้ง dev, QA, partner)
- อย่าทดสอบ API กับ **production data** · ระวัง rate limit และ side effect (ส่งอีเมล/SMS จริง) → ใช้ sandbox/mock ของ third party
