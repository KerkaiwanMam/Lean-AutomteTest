# 04 · Test Cases และ Test Run Log

> **คำศัพท์:** ในงานธนาคาร/องค์กรใหญ่ **TCM มักหมายถึง Test Coverage Matrix** (ตาราง condition ที่ต้องครอบคลุม) — ชุดนี้จึงใช้คำนั้นกับ `tcm-generator/input/conditions.csv` และเรียกไฟล์บันทึกผลว่า **Test Run Log**
> ถ้ามี scenario มากกว่า ~10 ข้อ หรือหลาย scenario ใช้ step ซ้ำกัน ให้ใช้ [`tcm-generator`](../tcm-generator/README.md) สร้าง test case แทนการเขียนมือ

> เขียน test case ละเอียดเฉพาะ scenario ระดับ **สูง** (ไฟล์ 03) · ตั้งเป้า **5–15 test case ต่องาน Launch Check** ไม่ใช่หลักร้อย
> 1 test case = 1 สิ่งที่ตรวจ (ผลคาดหวังเดียวที่ชัด) · ขั้นตอนไม่เกิน ~8 ขั้น ถ้ายาวกว่านี้ให้แยก
> เทคนิคเลือกข้อมูล: Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition (ISTQB CTFL v4.0.1 บทที่ 4)

---

## รูปแบบ test case

```
TC ID          : TC-xx
Scenario / Risk: SC-xx / R-xx
ชื่อ            : [ผลที่คาด] เมื่อ [เงื่อนไข]  เช่น "ปฏิเสธการจองเมื่อช่วงเวลาถูกจองแล้ว"
ระดับ           : สูง / กลาง / ต่ำ
Pre-condition  : สถานะระบบและบัญชีที่ต้องมีก่อนเริ่ม
Test data      : ค่าที่ใช้ (ระบุชัด ไม่ใช่ "ข้อมูลที่ถูกต้อง")
Steps          : 1. ...  2. ...
Expected       : ผลที่ต้องเห็น — ทั้งบนหน้าจอ และในระบบ (ข้อมูลถูกบันทึก/ไม่ถูกบันทึก)
Automated      : ใช่ (ไฟล์/ชื่อ test) / ไม่
```

## ตัวอย่าง (เว็บจองคิวร้านทำเล็บ)

**TC-01 · บันทึกการจองเมื่อเลือกช่วงเวลาว่าง** — SC-01 / R-01 · สูง
- **Pre-condition:** ล็อกอินเป็น `customer.a@test.local` · วันที่ทดสอบ +2 วัน เวลา 10:00 ว่าง
- **Test data:** บริการ "ทำเล็บเจล", วันที่ +2 วัน, 10:00, เบอร์ 0812345678
- **Steps:** 1. เปิด `/booking` 2. เลือกบริการ 3. เลือกวันและเวลา 4. กรอกเบอร์ 5. กด "ยืนยันการจอง"
- **Expected:** แสดงหน้า/ข้อความยืนยันพร้อมเลขการจอง · รีเฟรชหน้า "การจองของฉัน" แล้วยังเห็นรายการ · ช่อง 10:00 วันนั้นแสดงเป็น "ไม่ว่าง" สำหรับ customer B · อีเมลยืนยันมาถึง (ถ้า intake ระบุ)
- **Automated:** ใช่ — `critical-flow.example.spec.ts`

**TC-02 · ปฏิเสธการจองเมื่อช่วงเวลาถูกจองแล้ว** — SC-02 / R-01 · สูง
- **Pre-condition:** customer A จอง +2 วัน 10:00 แล้ว (TC-01) · ล็อกอินเป็น `customer.b@test.local`
- **Steps:** 1. เปิด `/booking` 2. เลือกวัน +2 วัน 3. พยายามเลือก 10:00 (ถ้า UI ซ่อน ให้ส่ง request เดียวกับ TC-01 ผ่าน DevTools/Postman ด้วยเวลา 10:00)
- **Expected:** UI ไม่ให้เลือก **และ** server ตอบ error (เช่น 409/400) · ไม่มีรายการจองซ้ำในระบบ

**TC-03 · ไม่เกิดการจองซ้ำเมื่อสองคนกดพร้อมกัน** — SC-02 / R-01 · สูง
- **Steps:** เปิดสองหน้าต่าง (customer A และ B) เลือกช่วงเวลาเดียวกันที่ว่าง แล้วกดยืนยันเกือบพร้อมกัน
- **Expected:** สำเร็จเพียงคนเดียว อีกคนได้ข้อความว่าช่วงเวลาไม่ว่าง · ระบบมีการจองช่วงนั้น 1 รายการ

**TC-04 · ลูกค้า A เปิดการจองของลูกค้า B ไม่ได้** — SC-03 / R-02 · สูง
- **Pre-condition:** B มีการจองเลขที่ `BK-0002` · ล็อกอินเป็น A
- **Steps:** 1. เปิด `/bookings/BK-0002` (หรือ ID จริงที่ B ได้) 2. เรียก API ที่หน้าใช้ดึงข้อมูลการจองด้วย ID ของ B 3. ลองเรียก API ยกเลิกด้วย ID ของ B
- **Expected:** ทุกขั้นตอบ 403/404 หรือ redirect · ไม่แสดงชื่อ เบอร์ หรือรายละเอียดของ B · การจองของ B ยังอยู่

**TC-05 · ไม่มี secret ใน JavaScript ฝั่ง client** — SC-04 / R-03 · สูง
- **Steps:** โหลดหน้าแรกและหน้า flow หลัก เก็บทุกไฟล์ JS ที่โหลด ค้นหารูปแบบ key
- **Expected:** ไม่พบ secret (anon/publishable key ที่ออกแบบให้อยู่ฝั่ง client ไม่ถือเป็น finding แต่ต้องตรวจว่ามีกฎ RLS)
- **Automated:** ใช่ — `security-basics.spec.ts`

---

## Test Run Log — ไฟล์ `05-test-run-log.csv`

(`tcm-generator` สร้าง `out/test-cases.csv` ที่มีคอลัมน์ execution ชุดเดียวกันนี้ไว้ให้แล้ว)

เปิดใน Google Sheets หรือ Excel (ไฟล์เป็น UTF-8 BOM ภาษาไทยแสดงถูก) · 1 แถว = 1 test case ต่อ 1 รอบการรัน

| คอลัมน์ | ความหมาย |
|---|---|
| `tc_id`, `scenario_id`, `risk_id` | ใช้โยงย้อนกลับ (traceability) ถึง risk |
| `title`, `priority` | ชื่อแบบ "[ผลที่คาด] เมื่อ [เงื่อนไข]" และระดับ สูง/กลาง/ต่ำ |
| `preconditions`, `test_data`, `steps`, `expected` | ตามรูปแบบข้างบน (ขั้นตอนคั่นด้วย `;`) |
| `type` | Positive / Negative / Edge / Security / UI / A11y |
| `automated` | `yes:<ไฟล์>` หรือ `no` |
| `round` | รอบการรัน: `R1` = รอบแรก, `RT1` = retest รอบ 1 |
| `status` | **Not Run / Pass / Fail / Blocked / N/A** |
| `actual` | ผลจริง (เขียนเมื่อ Fail หรือ Blocked) |
| `finding_id` | F-xx ในรายงาน findings (ไฟล์ 07) |
| `evidence` | ลิงก์ screenshot / วิดีโอ / Playwright trace |
| `browser`, `tester`, `run_date` | สภาพแวดล้อมที่รัน และวันที่ (YYYY-MM-DD) |

**กฎสถานะ:** Fail ต้องมี `finding_id` เสมอ · Blocked ต้องเขียนใน `actual` ว่าติดอะไร (เช่น "บัญชี admin ยังไม่ได้รับ") · Retest เพิ่มแถวใหม่ (`round = RT1`) ไม่แก้ทับแถวเดิม เพื่อให้เห็นประวัติ
