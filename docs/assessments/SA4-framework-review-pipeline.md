# SA4 — Framework Review + CI Pipeline

> **หลัง Level 4 (M15–M19)** · ⏱ 3 ชั่วโมง · เอกสาร + GitHub Actions · AI assistant: ใช้ได้ (ต้องระบุ) · ผ่าน ≥ 70/100

## Part A — Framework review (40 คะแนน)
Review **reference Robot Framework suite** ใน [`tests/robot/`](../../tests/robot/) (ไม่ใช่งานของตัวเอง) ด้วย [framework-review-checklist](../templates/framework-review-checklist.md)

ส่ง `SA4-review.md` ที่มี
1. คะแนน checklist ทุกข้อ (0–2) พร้อม **หลักฐาน** เป็นชื่อไฟล์/บรรทัด สำหรับทุกข้อที่ให้ 0 หรือ 1 (15)
2. **ข้อเสนอปรับปรุง 5 ข้อ** เรียงตามผลกระทบ × ความยาก แต่ละข้อมี: ปัญหา → ผลกระทบ → วิธีแก้ → ความเสี่ยงของการแก้ (15)
3. **ADR 1 ฉบับ** สำหรับข้อเสนอที่สำคัญที่สุด (Context / Decision / Consequences) (10)

| ระดับ | ลักษณะ |
|---|---|
| ดีเยี่ยม | หลักฐานชี้ตำแหน่งจริง, ข้อเสนอเฉพาะเจาะจงทำได้ทันที, เห็นทั้งข้อดีและข้อเสียของ framework |
| ผ่าน | หลักฐานส่วนใหญ่ถูก, ข้อเสนอกว้างไปบางข้อ |
| ต้องปรับปรุง | ให้คะแนนโดยไม่มีหลักฐาน / ข้อเสนอเป็นคำแนะนำทั่วไปที่ใช้กับทุกโปรเจกต์ได้ |

## Part B — CI pipeline (60 คะแนน)
สร้าง GitHub Actions workflow ใน repo ของคุณ สำหรับงาน **SA3** ของตัวเอง

| ข้อกำหนด | คะแนน |
|---|---|
| รันเมื่อ push และ pull request; ยกเลิกรอบเก่าเมื่อ push ใหม่ (`concurrency`) | 5 |
| ติดตั้ง + start ShopLab + รอ `/api/health` ก่อนรัน test | 10 |
| รัน Playwright และ Robot เป็น **job แยก** ขนานกัน | 10 |
| Playwright แบ่ง **shard ≥ 2** | 5 |
| เก็บ artifact (HTML report/trace, Robot log) **แม้ test ล้ม** | 10 |
| ส่งผลเป็น JUnit XML | 5 |
| มี `workflow_dispatch` input `grading_bug` ที่ start ShopLab ด้วย `GRADING_BUGS=<input>` และ **แสดงให้เห็นว่า pipeline แดง** เมื่อมีบั๊ก (แนบลิงก์ run ที่แดง 1 รอบ และเขียว 1 รอบ) | 15 |

**เงื่อนไขบังคับ:** ต้องมี run ที่เขียวอย่างน้อย 1 รอบบน GitHub (แนบลิงก์ใน README)

## ส่งงาน
- `SA4-review.md`
- ลิงก์ repo + ลิงก์ 2 runs (เขียว 1, แดงจาก `grading_bug` 1)
- ถ้าใช้ AI: ระบุว่าใช้กับส่วนไหน และส่วนไหนตรวจ/แก้เอง
