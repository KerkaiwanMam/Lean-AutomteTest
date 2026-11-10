# Skills Assessments — การสอบภาคปฏิบัติประจำ Level

> สอบเมื่อจบแต่ละ Level (ดูตารางใน [01-course-overview.md](../01-course-overview.md#3-โครงสร้างหลักสูตร-5-levels--22-modules--140-ชั่วโมง)) · รวมเป็น **25%** ของคะแนนหลักสูตร (ข้อละ 6.25%)

| ครั้ง | หลังจบ | หัวข้อ | เวลา | ลักษณะ | ตรวจด้วย |
|---|---|---|---|---|---|
| [SA1](SA1-test-design.md) | Level 1 | ออกแบบ test จาก requirement + bug report | 3 ชม. | เอกสาร (ไม่ต้องเขียนโค้ด) | rubric |
| [SA2](SA2-locators-first-script.md) | Level 2 | Locator challenge + script แรก | 2 ชม. | โค้ด Playwright | **test อัตโนมัติ** + rubric |
| [SA3](SA3-automate-checkout.md) | Level 3 | Automate checkout ด้วย Playwright **และ** Robot Framework | 4 ชม. | โค้ด 2 เครื่องมือ | **grader (bug detection)** + rubric |
| [SA4](SA4-framework-review-pipeline.md) | Level 4 | Framework review + CI pipeline | 3 ชม. | เอกสาร + GitHub Actions | rubric + ผลรัน pipeline |

## กติกาทั่วไป (ทุกครั้ง)

1. **Open book** — ใช้เอกสารหลักสูตร, docs ทางการของเครื่องมือ และ [REQUIREMENTS.md](../../practice-app/REQUIREMENTS.md) ได้ · **ห้าม** เปิดโฟลเดอร์ `docs/instructor/` และไฟล์ `*.solution*` (repo นี้เป็น public — เป็นระบบเกียรติยศ ผู้สอนอาจถามให้อธิบายงานปากเปล่า)
2. **AI assistant:** SA1–SA2 ห้ามใช้ · SA3–SA4 ใช้ได้ แต่ต้องระบุใน README ของงานว่าใช้ส่วนไหน (ตามนโยบายใน M21) และต้องอธิบายโค้ดของตัวเองได้
3. **ทำคนเดียว** ส่งงานเป็น Git repo/branch ของตัวเอง (commit สุดท้ายก่อนหมดเวลาคือสิ่งที่ตรวจ)
4. **ผ่านเมื่อได้ ≥ 70 คะแนน** และผ่าน "เงื่อนไขบังคับ" ของแต่ละครั้ง · สอบซ่อมได้ 1 ครั้ง ด้วยโจทย์ชุดสำรองใน [instructor key](../instructor/assessment-keys.md)

## สภาพแวดล้อมสอบ (ผู้สอนเตรียม)

```bash
npm ci --prefix practice-app
npm start --prefix practice-app                     # ShopLab ปกติที่ http://localhost:3000
```
- **SA1** ผู้สอนเปิด ShopLab โดยฝังบั๊ก **หนึ่งตัว** ที่ผู้เรียนไม่รู้ว่าเป็นตัวไหน:
  `GRADING_BUGS=BUG-07 npm start --prefix practice-app` (PowerShell: `$env:GRADING_BUGS="BUG-07"; npm start --prefix practice-app`)
  ในโหมดนี้แถบ "BUG MODE is ON" **ไม่แสดง** และผู้เรียนปิดบั๊กผ่าน `/api/test/config` ไม่ได้
- **SA3 / Capstone** ตรวจด้วย grader ซึ่งเปิด ShopLab ใหม่ทีละบั๊กให้อัตโนมัติ (ดูหัวข้อถัดไป)

## Grader — วัดว่า test suite จับบั๊กได้จริงกี่ตัว

[`tools/grade_suite.py`](../../tools/grade_suite.py) (Python standard library) รันคำสั่งทดสอบของผู้เรียน:
1. **baseline** — ShopLab ไม่มีบั๊ก → suite **ต้องผ่านทั้งหมด** (exit code 0) ไม่งั้นผลเป็นโมฆะ
2. **ทีละบั๊ก** — เปิด ShopLab ใหม่ด้วย `GRADING_BUGS=<id>` → ถ้า suite **ล้ม** (exit ≠ 0) ถือว่าจับบั๊กนั้นได้

```bash
# Playwright (โครงสร้างแบบ reference — config อ่าน BASE_URL และ START_SERVER=0)
python tools/grade_suite.py --cwd tests/playwright --cmd "npx playwright test --project=api --project=ui --project=ui-admin" --report grading/student-01-pw
# Robot Framework (variables.py อ่าน BASE_URL จาก env)
python tools/grade_suite.py --cwd tests/robot --cmd "robot --outputdir {out} --exclude legacy tests" --report grading/student-01-rf
# Windows: เรียก robot ใน venv ด้วย path แบบ backslash (หรือ activate venv ก่อนรัน grader)
python tools/grade_suite.py --cwd tests/robot --cmd "..\..\.venv\Scripts\robot --outputdir {out} tests\api" --bugs BUG-10,BUG-12
# เฉพาะบางบั๊ก (เร็วกว่า)
python tools/grade_suite.py --cwd tests/playwright --cmd "npx playwright test" --bugs BUG-01,BUG-02,BUG-07,BUG-10,BUG-12
```
ผลอยู่ใน `report.md` และ `result.json` (โฟลเดอร์ `grading/` ไม่ถูก commit)

**ข้อกำหนดสำหรับ suite ของผู้เรียน** — ต้องอ่าน URL จาก env `BASE_URL` (หรือรับเป็น variable) และไม่ start ShopLab เองเมื่อ `START_SERVER=0` · ใช้ได้ทั้ง Windows และ Linux · ทั้ง 13 รอบใช้เวลาประมาณ 13 × เวลารัน suite หนึ่งรอบ

> **ข้อจำกัดของ grader:** "จับได้" หมายถึง suite ล้มเมื่อมีบั๊กนั้น — grader ไม่รู้ว่าล้มเพราะ test ที่ถูกต้องหรือเพราะ test ไม่เสถียร จึงต้องดูประกอบกับ baseline (ต้องเขียว) และการรันซ้ำ ผู้สอนควรเปิด `suite.log` ของบั๊กที่จับได้ อย่างน้อย 2 ตัวเพื่อยืนยันว่าล้มที่ assertion ที่เกี่ยวข้อง
