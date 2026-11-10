# SA2 — Locator Challenge + First Script

> **หลัง Level 2 (M05–M08)** · ⏱ 2 ชั่วโมง · Playwright (TypeScript) · AI assistant: ห้ามใช้ · ผ่าน ≥ 70/100

## เตรียมตัว
```bash
cd tests/playwright
npm ci
# PowerShell: $env:EXERCISES="1"   ·   bash: export EXERCISES=1
npx playwright test tests/exercises/sa2-locators.spec.ts --project=exercises     # ตอนเริ่มต้องแดงทุกข้อ
```

## Part A — Locator challenge (50 คะแนน, 10 ข้อ × 5)
แก้ไฟล์ [`tests/playwright/tests/exercises/sa2-locators.spec.ts`](../../tests/playwright/tests/exercises/sa2-locators.spec.ts) — แต่ละข้อมีฟังก์ชัน `locate(page)` ที่ตอนนี้คืน `page.locator('TODO')` ให้แทนด้วย locator ของคุณ **ห้ามแก้ส่วน assertion**

| ข้อ | หน้า | เป้าหมาย |
|---|---|---|
| A1 | `/` | ปุ่ม "Add to cart" ของสินค้า SKU `SPRT-001` |
| A2 | `/` | ราคาของสินค้า "Clean Code" |
| A3 | `/login` | ช่อง Password (ไม่ใช่ checkbox "Show password") |
| A4 | `/lab` | ปุ่ม "Save changes" ในการ์ด Dynamic IDs (id/class สุ่มทุกครั้ง) |
| A5 | `/lab` | ช่องกรอกชื่อใน **open** shadow DOM |
| A6 | `/lab` | ปุ่ม "Submit inside frame" ที่อยู่ใน iframe |
| A7 | `/lab` | หัวคอลัมน์ "Salary" ของตาราง employees |
| A8 | `/lab` | ลิงก์ "Billing" ในเมนู Account (ต้อง hover ก่อน — ฟังก์ชันทำ hover ได้) |
| A9 | `/lab` | ตัวเลือก "Mangosteen" ใน custom dropdown (ต้องเปิด dropdown ก่อน) |
| A10 | `/lab` | แถวในตาราง employees ที่ ID = 3 (ทั้งแถว) |

**การให้คะแนน:** แต่ละข้อได้ 5 คะแนนเมื่อ test ของข้อนั้นผ่าน **และ** locator ผ่านกฎความทนทาน (ผู้สอนตรวจด้วยตา):
- ห้ามใช้ id/class ที่สุ่ม (`#btn-x8k2f1`), XPath แบบ absolute (`/html/body/...`), ตำแหน่งลอยๆ (`nth-child(7)`) เมื่อมีทางเลือกที่ดีกว่า
- ลำดับที่แนะนำ: role → label → test id → text → CSS ที่มีความหมาย → XPath (ดู [M07](../modules/M07-web-fundamentals-locators.md))
- ผ่าน test แต่ผิดกฎความทนทาน = 2 คะแนน

## Part B — First script (50 คะแนน)
สร้างไฟล์ `tests/exercises/sa2-first-script.spec.ts` (ไม่ต้องใช้ POM) ที่:
1. สร้างผู้ใช้ใหม่ผ่าน `POST /api/test/users` แล้ว login (ผ่าน API หรือ UI ก็ได้)
2. เพิ่ม `ELEC-001` × 2 และ `BOOK-002` × 1 ลงตะกร้า
3. เปิด `/cart` ใส่คูปอง `SAVE10`
4. ตรวจว่า **subtotal, discount, shipping, VAT, total** ที่หน้าเว็บ ตรงกับค่าที่คุณ **คำนวณเองในโค้ด** ตาม REQ-PRC (ห้าม hard-code ตัวเลขผลลัพธ์จากการดูหน้าเว็บ)
5. ผ่าน `--repeat-each=5 --workers=5`

| เกณฑ์ | คะแนน |
|---|---|
| ผ่าน 5/5 รอบแบบขนาน | 15 |
| ค่าคาดหวังคำนวณจากกฎ ไม่ใช่ตัวเลขที่ลอกมา | 10 |
| ใช้ web-first assertions, ไม่มี `waitForTimeout` | 10 |
| ใช้ผู้ใช้ใหม่ต่อ test (ไม่ใช้บัญชี seed ร่วม) | 5 |
| locator ทนทาน + ชื่อ test สื่อความหมาย | 5 |
| อ่านง่าย (ตัวแปรมีความหมาย ไม่มี magic number) | 5 |

**เงื่อนไขบังคับ:** Part B ต้องรันผ่านอย่างน้อย 1 ครั้ง ไม่งั้น Part B ได้สูงสุด 15 คะแนน
