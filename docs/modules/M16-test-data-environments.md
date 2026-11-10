# M16 — Test Data & Environment Management

> **Level 4 · Engineering** · ⏱ 5 ชม. · Prerequisite: M15
> สาเหตุอันดับ 2 ของ flaky tests คือ **ข้อมูลที่ test ใช้ร่วมกัน**

## 🎯 Learning Objectives
1. เลือก **กลยุทธ์ test data** ที่เหมาะ: static seed, dynamic factory, API setup, DB snapshot, synthetic
2. ออกแบบ test ให้ **isolated & idempotent** รองรับ parallel
3. ใช้ **test hooks** (reset, seed, feature flags, time control) อย่างปลอดภัย
4. จัดการ **environments** (local/dev/staging/prod-like) และ **environment parity**
5. ใช้ **containers (Docker)** และ **service virtualization/mocks** สำหรับ dependency

---

## 📖 1. กลยุทธ์ข้อมูลทดสอบ
| กลยุทธ์ | ตัวอย่าง ShopLab | ข้อดี | ข้อเสีย |
|---|---|---|---|
| **Static seed** (อ่านอย่างเดียว) | สินค้า 28 ชิ้น, คูปอง, user `jane` มี 3 orders | คาดเดาได้ เร็ว | ถ้า test แก้ไข → ชนกัน |
| **Dynamic factory ต่อ test** | `POST /api/test/users` ใน fixture `freshUser` | isolation สมบูรณ์ | ต้องมี API/hook |
| **Setup ผ่าน API** | `userApi.addToCart()` ก่อนเปิดหน้า cart | เร็วกว่าคลิกผ่าน UI มาก | ต้องมี API |
| **Reset/restore** | `POST /api/test/reset` ใน global setup | กลับสู่สถานะรู้จัก | reset กลางคันทำลาย test อื่น |
| **DB snapshot/container** | Docker image ที่มีข้อมูลพร้อม | ทั้ง suite เริ่มเหมือนกัน | ใหญ่/ช้า |
| **Synthetic (Faker)** | ชื่อ/ที่อยู่สุ่ม | ไม่มีข้อมูลจริง (PDPA) | ต้องควบคุม seed เพื่อ reproduce |

## 📖 2. Isolation & Idempotency
**Isolated:** test ไม่ขึ้นกับลำดับ/ผลของ test อื่น · **Idempotent:** รันซ้ำกี่ครั้งก็ได้ผลเดิม
เทคนิค:
- **Unique data ต่อ test** — username/SKU สุ่ม (`randomSku()`), user ใหม่ต่อ test
- **ตรวจแบบ "relative" ไม่ใช่ "absolute"** — `stockAfter === stockBefore - 1` แทน `stock === 49`
- **แยกข้อมูลอ่านอย่างเดียว vs ที่ถูกแก้** — test ที่แก้ catalog อยู่ใน project `ui-admin` ที่รันหลัง
- **Cleanup** — teardown ลบสิ่งที่สร้าง (หรือใช้ soft delete / namespace ข้อมูล test)

> 🔑 Case study จากการสร้าง reference: test "account is locked after 5 wrong passwords" ถ้าใช้ user `customer` ร่วมกัน → test อื่นที่ login ด้วย `customer` จะ fail ไปด้วย → ใช้ `freshUser` แทน

## 📖 3. Time & randomness
- อายุ/วันหมดอายุบัตร/คูปอง ขึ้นกับ "วันนี้" → คำนวณ dynamic (`birthDateForAge(18, 1)`) หรือ **ควบคุมเวลา** (Playwright `page.clock`, server test hook ตั้งเวลา)
- ข้อมูลสุ่มต้อง **log seed** ไว้ เพื่อ reproduce ได้
- Timezone: ตั้ง `timezoneId: 'Asia/Bangkok'` ใน config ให้ตรงกับผู้ใช้จริง

## 📖 4. Test hooks — ต้องมี และต้องปลอดภัย
ShopLab มี `/api/test/reset`, `/api/test/config`, `/api/test/users` → mount เฉพาะเมื่อ `NODE_ENV !== 'production'` (REQ-SEC-05)
ในบริษัทจริงขอ dev ทำ: seed/reset endpoint, feature flag override, bypass CAPTCHA/OTP สำหรับ test account, ตั้งเวลา server, trigger batch job
✅ ป้องกันด้วย: ปิดใน prod, ต้องมี secret header, network-level restriction, audit log

## 📖 5. Environments
| Env | ใช้ทำ | ข้อมูล |
|---|---|---|
| Local / ephemeral (Docker) | dev + automation ระหว่างพัฒนา | seed |
| CI ephemeral | ทุก PR | seed ใหม่ทุกครั้ง |
| Dev/Integration | ทดสอบรวมหลายทีม | seed + ข้อมูลจากการทดสอบ |
| Staging / UAT | ใกล้ production ที่สุด | masked copy ของ prod |
| Production | smoke อ่านอย่างเดียว / synthetic monitoring | ข้อมูลจริง — ห้ามสร้างขยะ |

**Environment parity:** เวอร์ชัน OS/browser/DB/config ใกล้ prod · ใช้ Docker/IaC · ระวัง "works on staging"
**Ephemeral environments** (preview env ต่อ PR) = isolation สูงสุด

## 📖 6. Docker สำหรับ tester
```bash
docker build -t shoplab ./practice-app
docker run --rm -p 3000:3000 shoplab                 # normal
docker run --rm -p 3001:3000 -e BUG_MODE=1 shoplab   # bug mode อีก instance พร้อมกัน!
```
**docker compose** (แอป + DB + mock + test runner) ทำให้ทุกคนได้ env เดียวกัน · Playwright มี image ทางการ `mcr.microsoft.com/playwright:v1.xx.x-noble` สำหรับรัน test ใน container (ฟอนต์/OS ตรงกัน → visual test เสถียร)

## 📖 7. Dependencies ภายนอก — Mock / Stub / Service virtualization
Payment gateway, SMS, email, ระบบ core banking ฯลฯ มักไม่มี test env ที่เสถียร
- **Stub ใน browser:** `page.route` (M10)
- **Mock server:** WireMock, MockServer, Prism (จาก OpenAPI), json-server
- **Email/SMS capture:** MailHog, Mailpit
- **Contract tests** ยืนยันว่า mock ตรงกับของจริง (M13)

---

## 🧪 Lab 16.1 — Isolation audit (45 นาที)
รัน `npx playwright test --workers=8 --repeat-each=3` — มี test ไหน fail แบบสุ่ม? วิเคราะห์ว่าเกิดจากข้อมูลร่วมกันหรือไม่ แล้วแก้

## 🧪 Lab 16.2 — Data factory (60 นาที)
สร้าง factory `createOrderInStatus(status)` ที่ใช้ API (customer + admin) สร้าง order ในสถานะใดก็ได้ (PENDING/PAID/SHIPPED/DELIVERED/CANCELLED) → ใช้เขียน test UI ของปุ่ม Cancel ว่าแสดงเฉพาะ PENDING/PAID

## 🧪 Lab 16.3 — สอง environment พร้อมกัน (30 นาที)
รัน ShopLab 2 instance (port 3000 ปกติ, port 3001 Bug Mode) ด้วย Docker หรือ `PORT=3001 BUG_MODE=1 SHOPLAB_DATA_DIR=./data-bugs npm start` (**ต้องแยก data dir** ไม่งั้นสอง instance เขียน SQLite ไฟล์เดียวกัน — อีกหนึ่งบทเรียนเรื่อง isolation) แล้วรัน suite เดียวกันกับทั้งสองด้วย `BASE_URL` ต่างกัน และ `START_SERVER=0`

## 🧪 Lab 16.4 — Time control (30 นาที)
ใช้ `page.clock.setFixedTime()` ทดสอบว่าบัตรที่หมดอายุ "เดือนนี้" ยังใช้ได้ถึงสิ้นเดือน (ฝั่ง client) — แล้วอภิปรายว่าฝั่ง server ต้องควบคุมเวลาอย่างไร

---

## ✅ Check Your Understanding
1. ตรวจ `stock === 49` หลังซื้อ 1 ชิ้นมีปัญหาอะไรเมื่อรัน parallel?
2. ทำไม test hooks ต้องปิดใน production?
3. ข้อดีของ ephemeral environment ต่อ PR?
4. เมื่อไรควร mock payment gateway และเมื่อไรไม่ควร?

<details><summary>เฉลย</summary>

1. test อื่นอาจซื้อสินค้าเดียวกันพร้อมกัน → ค่าไม่แน่นอน ควรเทียบกับค่าก่อนหน้า (relative) หรือใช้สินค้าเฉพาะของ test
2. ผู้ไม่หวังดีจะ reset ข้อมูล, สร้าง admin, เปิด bug mode ได้ — เป็นช่องโหว่ร้ายแรง
3. isolation สมบูรณ์ ไม่แย่งข้อมูล, ทดสอบ feature ก่อน merge, ทิ้งได้หลังจบ
4. mock ใน UI/integration tests ส่วนใหญ่ (เร็ว/เสถียร/ควบคุม case ได้) · ไม่ mock ใน contract/E2E ชุดเล็กกับ sandbox ของ provider เพื่อยืนยันการเชื่อมต่อจริง
</details>

## 📋 Skills Checklist
- [ ] เลือกกลยุทธ์ข้อมูลที่เหมาะกับแต่ละ test
- [ ] เขียน test ที่ isolated/idempotent รัน parallel ได้
- [ ] ใช้ Docker รันแอปทดสอบได้
- [ ] รู้วิธี mock dependency ภายนอก
