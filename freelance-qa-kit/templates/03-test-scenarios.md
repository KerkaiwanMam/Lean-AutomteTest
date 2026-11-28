# 03 · Test Scenarios — สถานการณ์ทดสอบ

> **Scenario** = "จะพิสูจน์อะไร" ในระดับ flow (1 บรรทัด) · **Test case** = "ทำอย่างไร ด้วยข้อมูลอะไร คาดผลอะไร" (ไฟล์ 04)
> ทุก scenario ต้องโยงกลับไปที่ Risk ID ในไฟล์ 02 — scenario ที่ไม่โยงกับ risk ใดคือสัญญาณว่ากำลังทำเกินขอบเขต
> **กฎประหยัดเวลา:** เขียน test case ละเอียด (ไฟล์ 04) เฉพาะ scenario ระดับ **สูง** · ระดับกลางทดสอบด้วย exploratory charter (ด้านล่าง) แล้วบันทึกผลสั้นๆ

---

## รูปแบบ

| Scenario ID | Risk ID | Flow / พื้นที่ | Scenario (ต้องพิสูจน์ว่า…) | ประเภท | ระดับ | วิธี | Test cases |
|---|---|---|---|---|---|---|---|
| SC-xx | R-xx | | | Positive / Negative / Edge / Security / UI / A11y | สูง/กลาง/ต่ำ | Scripted / Exploratory / Automated | TC-xx |

## ตัวอย่าง — เว็บจองคิวร้านทำเล็บ (สร้างด้วย AI builder + Supabase)

| Scenario ID | Risk ID | Flow / พื้นที่ | Scenario (ต้องพิสูจน์ว่า…) | ประเภท | ระดับ | วิธี | Test cases |
|---|---|---|---|---|---|---|---|
| SC-01 | R-01 | จองคิว | ลูกค้าที่ล็อกอินแล้วจองช่วงเวลาว่างได้ และการจองถูกบันทึกจริง | Positive | สูง | Scripted + Automated | TC-01 |
| SC-02 | R-01 | จองคิว | จองช่วงเวลาที่มีคนจองแล้วไม่ได้ (รวมกรณีสองคนกดพร้อมกัน) | Negative / Edge | สูง | Scripted | TC-02, TC-03 |
| SC-03 | R-02 | สิทธิ์ข้อมูล | ลูกค้า A ดู/ยกเลิกการจองของลูกค้า B ไม่ได้ ทั้งผ่าน UI และ API | Security | สูง | Scripted | TC-04 |
| SC-04 | R-03 | ความปลอดภัย | ไม่มี secret/service key ใน JavaScript ที่ส่งไปยัง browser | Security | สูง | Automated | TC-05 |
| SC-05 | R-04 | ฟอร์มจอง | ฟอร์มปฏิเสธค่าที่ไม่ถูกต้อง (วันที่ผ่านมา, เบอร์โทรผิดรูปแบบ, ช่องว่าง) ทั้งฝั่ง UI และ server | Negative | กลาง | Exploratory | – |
| SC-06 | R-05 | มือถือ | Flow จองทำได้ครบบน iPhone (Safari) กว้าง 375px | UI | กลาง | Exploratory + Automated | – |
| SC-07 | R-06 | Accessibility | หน้าแรกและหน้าจองไม่มี axe violation ระดับ serious/critical | A11y | กลาง | Automated | – |
| SC-08 | R-07 | เนื้อหา | ไม่มีข้อความ placeholder ของ AI ค้าง ราคาและเวลาเปิดร้านถูกต้อง | UI / Content | ต่ำ | Exploratory | – |

---

## Exploratory charter (สำหรับ scenario ระดับกลาง)

> 1 charter = 1 session 60–90 นาที · จดสั้นๆ ระหว่างทำ · ปัญหาที่เจอเปิดเป็น finding ทันที

```
Charter ID : CH-01
Scenario   : SC-05
สำรวจ      : ฟอร์มจองคิว
ด้วย        : ค่าว่าง, วันที่ในอดีต/ไกลเกิน 1 ปี, เบอร์โทร 8/11 หลัก, ชื่อยาว 300 ตัวอักษร, emoji, ส่งซ้ำเร็วๆ,
             แก้ request ใน DevTools ให้ข้าม validation ฝั่ง browser
เพื่อหา     : ข้อมูลผิดที่ถูกบันทึกลงระบบ หรือ error ที่ผู้ใช้ไม่เข้าใจ
เวลา        : 60 นาที (เริ่ม __:__ จบ __:__)
บันทึก      :
  - __:__  ...
ผล          : พบ finding F-__, F-__ · ไม่พบปัญหาใน ...
ยังไม่ได้ดู  : ... (บันทึกไว้ใน coverage matrix)
```
