# SA3 — Automate ShopLab Checkout with Two Tools

> **หลัง Level 3 (M09–M14)** · ⏱ 4 ชั่วโมง · Playwright (TS) **และ** Robot Framework · AI assistant: ใช้ได้ (ต้องระบุใน README) · ผ่าน ≥ 70/100

## สถานการณ์
ทีมจะ refactor ระบบตะกร้าและการชำระเงิน ต้องการ regression ที่ **จับบั๊กได้จริง** ก่อนเริ่มแก้โค้ด คุณต้องส่ง automation 2 ชุดที่ครอบคลุม **REQ-CART, REQ-PRC, REQ-ORD** โดยเลือกเครื่องมือให้เหมาะกับแต่ละชั้น

## สิ่งที่ต้องส่ง
Repo/branch ที่มี
```
sa3/
├── playwright/      # project ของคุณเอง (เริ่มจาก npm init playwright หรือ copy โครงจาก reference ได้)
├── robot/           # suite ของคุณเอง (resource + tests)
└── README.md        # วิธีรัน, สิ่งที่ครอบคลุม, ตาราง REQ → test, การใช้ AI (ถ้ามี)
```
**ข้อกำหนดทางเทคนิค (ไม่ทำ = grader ตรวจไม่ได้)**
- อ่าน URL จาก env `BASE_URL` (ค่าเริ่มต้น `http://localhost:3000`) — Playwright: ใน `baseURL`; Robot: variable file หรือ `%{BASE_URL}`
- เมื่อ `START_SERVER=0` ห้าม start ShopLab เอง
- reset ข้อมูลด้วย `POST /api/test/reset` ได้ แต่ห้ามพึ่งข้อมูลที่ test อื่นสร้าง (ต้องรันขนานได้)

## เนื้อหาขั้นต่ำ
| ชุด | ต้องมี |
|---|---|
| **Playwright** | API tests ของ cart (จำนวน 1–10, stock) และ quote · UI tests ของ checkout ครบ 3 ขั้น (การ์ดสำเร็จ, การ์ดถูกปฏิเสธ, COD) · ตรวจสถานะหลังบ้านหลังสั่งซื้อผ่าน API |
| **Robot Framework** | Decision table ของราคาแบบ data-driven (Test Template หรือ DataDriver) อย่างน้อย 6 rules · การยกเลิก order + ตรวจ stock คืน · ตรวจ state machine อย่างน้อย 1 invalid transition |

## การให้คะแนน (100)

### ส่วนที่ 1 — Bug detection โดย grader (50 คะแนน)
ผู้สอนรัน [grader](README.md#grader--วัดว่า-test-suite-จับบั๊กได้จริงกี่ตัว) กับ **แต่ละชุด** ด้วยบั๊กในขอบเขต 5 ตัวของงานนี้ (ผู้เรียนไม่ได้รับรายชื่อ — เขียน test จาก requirement ให้ดีพอจะจับได้เอง)
- baseline ของทั้งสองชุดต้อง **เขียว** (เงื่อนไขบังคับ)
- คะแนน = 10 × จำนวนบั๊กในขอบเขตที่ **อย่างน้อยหนึ่งชุด** จับได้ (สูงสุด 50)
- โบนัส +2 ต่อบั๊กนอกขอบเขตที่จับได้ (สูงสุด +10 แต่คะแนนรวมไม่เกิน 100)

### ส่วนที่ 2 — คุณภาพโค้ด (35 คะแนน)
| เกณฑ์ | คะแนน |
|---|---|
| ชั้นชัดเจน: locator/endpoint อยู่ใน page object / resource ไม่อยู่ใน test | 10 |
| ไม่มี sleep, ใช้ assertion ที่ retry, ผ่าน `--repeat-each=3` (PW) / pabot 4 processes (RF) | 10 |
| Isolation: ผู้ใช้/ข้อมูลของตัวเองต่อ test | 5 |
| Test design เห็นได้ (BVA ที่ขอบจำนวน, decision table, state transition) และผูก REQ ID | 10 |

### ส่วนที่ 3 — README และการเลือกเครื่องมือ (15 คะแนน)
- อธิบายว่าทำไมแต่ละเรื่องอยู่ในเครื่องมือ/ชั้นนั้น (5)
- ตาราง REQ → test ครบตามขอบเขต (5)
- วิธีรันที่คนอื่นทำตามได้ใน 10 นาที (5)

## ตรวจงานตัวเองก่อนส่ง
```bash
# ShopLab ต้องไม่ได้รันอยู่ที่ port 3100 — grader จะเปิดเอง
python tools/grade_suite.py --cwd sa3/playwright --cmd "npx playwright test" --bugs BUG-01,BUG-02
python tools/grade_suite.py --cwd sa3/robot --cmd "robot --outputdir {out} tests" --bugs BUG-01,BUG-02
```
(ผลการรันกับบั๊ก 2 ตัวนี้บอกได้ว่าระบบตรวจทำงานกับงานของคุณ — ไม่ได้บอกคะแนนจริง)
