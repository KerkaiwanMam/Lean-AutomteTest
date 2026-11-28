# Pre-launch Smoke Kit (Playwright)

ชุดตรวจอัตโนมัติที่ใช้ซ้ำได้กับทุกเว็บลูกค้า **ไม่ต้องแก้ไฟล์ test** ตั้งค่าผ่าน `.env` อย่างเดียว
ส่งมอบให้ลูกค้ารันเองก่อน deploy ทุกครั้งได้ด้วย

| ไฟล์ | ตรวจอะไร | Checklist 02 |
|---|---|---|
| `tests/smoke.spec.ts` | หน้าโหลดได้ (HTTP < 400), มี title และเนื้อหา, ไม่มี JS error, ไม่มี asset 404 / 5xx, ไม่มีข้อความ placeholder ค้าง | A, E |
| `tests/responsive.spec.ts` | ไม่มี scroll แนวนอนที่ 375px (บอกชื่อ element ที่ล้น) | E |
| `tests/a11y.spec.ts` | axe-core WCAG 2.0/2.1 A + AA — fail เฉพาะ serious/critical, แนบผลทั้งหมด | F |
| `tests/security-basics.spec.ts` | secret ใน JS ฝั่ง client (Stripe, AWS, OpenAI, Supabase `service_role` ฯลฯ — ปิดค่าในรายงาน), security headers + cookie flags (รายงานอย่างเดียว ไม่ fail), HTTP → HTTPS, หน้า error ไม่เปิดเผย stack trace | D |
| `tests/critical-flow.example.spec.ts` | **ตัวอย่างที่ต้องแก้ต่อ:** login, รหัสผิดถูกปฏิเสธ, URL ที่ต้องล็อกอินปฏิเสธผู้ไม่ล็อกอิน, เปิดข้อมูลของผู้ใช้อื่นไม่ได้ (IDOR) — ข้ามเองเมื่อไม่ได้ตั้งค่า | A, C |

> ⚠️ รันกับเว็บที่ลูกค้า **อนุญาตเป็นลายลักษณ์อักษรแล้ว** เท่านั้น (intake ส่วน D) · ชุดนี้อ่านเฉพาะสิ่งที่เว็บส่งให้ผู้เข้าชมทั่วไป ไม่ใช่ penetration test

## เริ่มใช้ (ครั้งแรก)

ต้องมี Node.js 22 ขึ้นไป

```powershell
npm install
```

```powershell
npx playwright install chromium webkit
```

ถ้าไม่อยากดาวน์โหลด browser ให้ใช้ Google Chrome ที่ติดตั้งอยู่แล้ว: ตั้ง `PW_CHANNEL=chrome` ใน `.env`

## ต่องานลูกค้า 1 งาน

1. คัดลอก `.env.example` เป็น `.env` แล้วกรอก `BASE_URL`, `SMOKE_PATHS` และบัญชีทดสอบที่ลูกค้าให้ (ไฟล์ `.env` ถูก gitignore ไว้ ห้าม commit)
2. รัน

```powershell
npx playwright test
```

3. เปิดรายงาน HTML — ทุก test ที่ fail มี screenshot, วิดีโอ และ trace สำหรับแนบใน findings (เทมเพลต 07)

```powershell
npx playwright show-report
```

4. แปลผลเป็น finding: test fail ≠ finding อัตโนมัติ **ต้องดูหลักฐานและยืนยันด้วยตาก่อนเสมอ** แล้วให้ severity ตามนิยามในเทมเพลต 07
5. ปรับ `critical-flow.example.spec.ts` ให้ครอบ flow เงินของลูกค้า (TC-01) ถ้าแพ็กเกจรวม automation

## หมายเหตุการออกแบบ

- **Retry 1 ครั้ง** เพื่อ *ตรวจจับ* ผลที่ไม่นิ่ง — Playwright รายงานเป็น "flaky" แยกจาก passed/failed ให้บันทึกเป็นข้อสังเกต ไม่ใช่ซ่อนไว้
- **Locator แบบ role/label** (`getByRole`, `getByLabel`) ตาม Playwright best practices — ทนกว่า CSS selector เมื่อ AI สร้าง markup ใหม่
- **Console error:** ไม่นับข้อความ "Failed to load resource" ของ browser เพราะ 401 จากการเช็ก "ล็อกอินอยู่ไหม" เป็นเรื่องปกติ ปัญหาเครือข่ายตัดสินจาก status ของ response แทน (5xx หรือ asset 404) · widget ภายนอกที่ log error เยอะให้กรองด้วย `IGNORE_CONSOLE`
- **IDOR กับ Supabase / Firebase:** token อยู่ใน localStorage ไม่ใช่ cookie การเรียกผ่าน `page.request` จึงอาจไม่ส่ง token — ตรวจ TC-04 ด้วย Postman ร่วมด้วย
- **Security headers ไม่ทำให้ fail** เพราะความรุนแรงขึ้นกับบริบท ดูรายการที่ขาดได้ใน annotations และไฟล์แนบ `headers-and-cookies.json`

## ตรวจแล้วกับ ShopLab (2026-11-28)

รันกับ ShopLab บนเครื่อง (desktop-chrome, Chrome ที่ติดตั้งไว้): **18 ผ่าน, 2 ข้าม** (IDOR ไม่ได้ตั้ง `FORBIDDEN_URLS` · HTTPS redirect ข้ามบน localhost) · ทดสอบกับหน้า `/a11y.html` ที่ตั้งใจใส่ปัญหาไว้ → a11y test **fail ถูกต้อง** พบ 6 violation (button-name, color-contrast, html-has-lang, image-alt, link-name, select-name)
**ยังไม่ได้ตรวจ:** project `mobile-safari` (ยังไม่ได้ติดตั้ง WebKit บนเครื่องนี้) และการตรวจ secret กับเว็บจริงที่มี key หลุด (ตรวจเฉพาะ pattern กับข้อความตัวอย่าง)
