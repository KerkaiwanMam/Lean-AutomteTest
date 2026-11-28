# ตารางความครอบคลุมการทดสอบ (Coverage Matrix)

> **เทมเพลต 08** · บอกลูกค้าว่า **ตรวจอะไร ไม่ได้ตรวจอะไร** — สำคัญเท่ากับรายการบั๊ก เพราะป้องกันการเข้าใจผิดว่า "ทดสอบแล้ว = ไม่มีปัญหา"
> ข้อมูลมาจาก `02-risk-checklist.md` (ส่วนที่ 3) และ `05-test-run-log.csv` (ถ้าใช้ `tcm-generator` ให้นำส่วน "Condition coverage" ใน `out/coverage.md` มาแนบด้วย)

**สัญลักษณ์:** ✅ ตรวจครบ ผ่าน · ⚠️ ตรวจครบ พบปัญหา · 🔶 ตรวจบางส่วน · ⬜ ไม่ได้ตรวจ · ➖ ไม่เกี่ยวข้อง

## 1. ตาม flow ธุรกิจ

| Flow (จาก intake) | Risk | Chrome desktop | Safari iPhone | วิธี | Test cases | Findings | หมายเหตุ |
|---|---|---|---|---|---|---|---|
| สมัคร / ล็อกอิน / ลืมรหัสผ่าน | กลาง | ✅ | ✅ | Exploratory | – | – | |
| จองคิว | สูง | ⚠️ | ✅ | Scripted + Auto | TC-01–03 | F-01 | TC-03 Blocked รอแก้ F-01 |
| ดู / ยกเลิกการจองของฉัน | สูง | ⚠️ | 🔶 | Scripted | TC-04 | F-02 | Safari ทดสอบเฉพาะการดู |
| หลังร้าน (แอดมิน) | กลาง | 🔶 | ➖ | Exploratory | – | F-05 | ไม่ได้ทดสอบรายงานยอดขาย (หมดเวลา) |

## 2. ตามประเภทการทดสอบ

| ประเภท | สถานะ | เครื่องมือ / วิธี | Findings | หมายเหตุ |
|---|---|---|---|---|
| Functional — critical flows | ⚠️ | Manual + Playwright | F-01 | |
| Input validation / edge cases | ⚠️ | Exploratory CH-01 | F-03, F-04 | |
| Authentication & สิทธิ์ข้อมูล | ⚠️ | Manual, Postman | F-02 | |
| ความปลอดภัยพื้นฐาน (passive) | ✅ | Playwright security-basics, ZAP baseline | F-06 (Low) | ไม่ใช่ penetration test |
| Responsive / มือถือ | ✅ | Playwright responsive, iPhone จริง | – | |
| Cross-browser | 🔶 | Chrome, Safari | – | ไม่ได้ทดสอบ Firefox, Android |
| Accessibility | 🔶 | axe-core (อัตโนมัติ) + คีย์บอร์ด | F-07 | อัตโนมัติจับปัญหาได้ไม่ครบ ยังไม่ได้ทดสอบกับ screen reader |
| Performance เบื้องต้น | ✅ | Lighthouse mobile | F-08 | ไม่ใช่ load test |
| เนื้อหา / SEO พื้นฐาน | ✅ | Manual | F-09, F-10 | |
| Load / stress | ⬜ | – | – | นอกขอบเขตแพ็กเกจ |
| Penetration test | ⬜ | – | – | นอกขอบเขตแพ็กเกจ |

## 3. สรุปการรัน

| รอบ | วันที่ | Build | รัน | Pass | Fail | Blocked | Not Run |
|---|---|---|---|---|---|---|---|
| R1 | 2026-12-01 | abc1234 | 12 | 9 | 2 | 1 | 0 |
| RT1 | 2026-12-03 | def5678 | 2 | 2 | 0 | 0 | 0 |

## 4. ความเสี่ยงที่ยังเหลือ (Residual risk)
- ไม่ได้ทดสอบ Android — ผู้ใช้ ~__% (ถ้าลูกค้ามีข้อมูล) อาจเจอปัญหาที่ไม่ได้รายงาน
- ไม่ได้ทดสอบภายใต้ผู้ใช้พร้อมกันจำนวนมาก — ถ้าคาดว่าจะมีโปรโมชันใหญ่ ควรทำ load test แยก
