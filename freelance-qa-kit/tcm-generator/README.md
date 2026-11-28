# TCM Generator — Test Coverage Matrix → Test Cases

สร้าง test case แบบ 1 แถวต่อ step จาก CSV 3 ไฟล์ แนวคิดเดียวกับเทมเพลต TCM ที่องค์กรใหญ่ใช้ คือ **เขียน step และ expected ครั้งเดียว แล้วให้ scenario ติ๊กเลือก** แต่ไม่ต้องพึ่งสูตร Excel
ไฟล์ input แก้ได้ใน Google Sheets หรือ Excel รุ่นไหนก็ได้ ตัวสคริปต์ใช้ Python 3 standard library อย่างเดียว

```
conditions.csv ──┐   (Test Coverage Matrix: ค่า condition ที่ต้องครอบคลุม)
steps.csv ───────┼─► tcm_build.py ─► out/test-cases.csv      1 แถว/step + คอลัมน์บันทึกผล
scenarios.csv ───┘                   out/import-generic.csv   สำหรับนำเข้า Jira/Xray/TestRail
  (E2E scenario +                    out/test-data-prep.csv   ข้อมูลที่ต้องเตรียมต่อ scenario
   step matrix ติ๊ก x)               out/coverage.md          condition ที่ยังไม่ถูกทดสอบ, สถิติ
                                     out/playwright/*.spec.ts โครง test.step() สำหรับ scenario ที่ Automatable
```

## ใช้งาน

รันจาก root ของ repo (ตัวอย่างใน `input/` คือเว็บจองคิวร้านทำเล็บ ชุดเดียวกับเทมเพลต 03/04)

```powershell
python "freelance-qa-kit/tcm-generator/tcm_build.py" --release R-2026.12
```

ต่องานลูกค้า: คัดลอก `input/` ไปไว้ในโฟลเดอร์ของงาน แก้ไฟล์ แล้วรัน

```powershell
python "freelance-qa-kit/tcm-generator/tcm_build.py" --input "jobs/acme/input" --out "jobs/acme/out"
```

ตรวจ input อย่างเดียวโดยไม่เขียนไฟล์ (ถ้าพบ error จะ exit 1):

```powershell
python "freelance-qa-kit/tcm-generator/tcm_build.py" --check
```

## ไฟล์ input

### `conditions.csv` — Test Coverage Matrix
1 แถว = 1 ค่าของ condition

| คอลัมน์ | ความหมาย |
|---|---|
| `dimension` | มิติที่ทดสอบ เช่น `lead_days` (ห้ามมีช่องว่าง เพราะใช้เป็นชื่อคอลัมน์ `cond:lead_days`) |
| `value` | ค่า เช่น `30` |
| `technique` | ที่มาของค่า: EP, BVA, Decision table, State transition |
| `risk_id` | โยงกับ `R-xx` ในเทมเพลต 02 |
| `note` | เหตุผล เช่น "ขอบบน" |

### `steps.csv` — คลัง step
1 แถว = 1 step ที่นำไปใช้ซ้ำได้ มีคอลัมน์ `step_id`, `screen`, `section`, `action`, `expected` (ค่าเริ่มต้น) และ `user_story`

### `scenarios.csv` — E2E scenario + step matrix
1 แถว = 1 scenario

| คอลัมน์ | ค่า |
|---|---|
| `scenario_id` | เว้นว่างได้ ระบบจะสร้าง `<feature>-001`, `-002` … ให้ |
| `feature` | ห้ามมีช่องว่าง (ใช้ใน ID, label และชื่อไฟล์ spec) |
| `title` | ชื่อ scenario · ID รวมกับ title ต้องยาวไม่เกิน 255 ตัวอักษรและห้ามมี `__` |
| `negative` | `Y` / `N` |
| `priority` | `High` / `Medium` / `Low` |
| `test_type` | `Smoke` / `Regression` / `Non-regression` / `Functional` / `Security` / `UI` / `A11y` / `Performance` |
| `automation` | `Manual` / `Automatable` / `Automated` |
| `user_story`, `test_data` | ข้อความอิสระ |
| `cond:<dimension>` | 1 คอลัมน์ต่อมิติ ค่าต้องมีอยู่ใน `conditions.csv` |
| `<step_id>` (เช่น `ST-03`) | 1 คอลัมน์ต่อ step · `x` = ใช้ step นี้กับ expected ค่าเริ่มต้น · **`x\|ข้อความ`** = ใช้ step นี้ แต่ expected ของ scenario นี้ต่างออกไป (เหมาะกับ negative case) · เว้นว่าง = ไม่ใช้ · step เรียงตามลำดับคอลัมน์ |

## สิ่งที่สคริปต์ตรวจให้

- **Error (ไม่เขียนไฟล์):**
  - ค่า condition ที่ไม่มีใน coverage matrix
  - step_id หรือ scenario_id ซ้ำ
  - คอลัมน์ที่ไม่รู้จัก
  - ค่า enum ผิด
  - ช่อง step ที่ไม่ใช่ `x`
  - scenario ที่ไม่มี step
  - summary ยาวเกิน 255 ตัวอักษรหรือมี `__`
  - feature ที่มีช่องว่าง
  - step ที่ไม่มี expected
- **Warning:**
  - ค่า condition ที่ยังไม่มี scenario ใดใช้ (เป็น coverage gap)
  - negative scenario ที่ใช้แต่ expected แบบ positive

## ต่างจากเทมเพลต Excel แบบสูตรอย่างไร

| เรื่อง | เทมเพลต Excel แบบสูตร | Generator นี้ |
|---|---|---|
| โปรแกรมที่ต้องใช้ | Excel 365 (ใช้ `FILTER` และ array formula) | CSV เปิดได้ทุกโปรแกรม + Python |
| เพิ่มแถว/คอลัมน์ | ต้องลากสูตรเอง แทรกคอลัมน์ไม่ได้ | เพิ่มได้อิสระ |
| Expected ของ negative case | ต้องสร้าง step ใหม่ | ใช้ `x\|expected` เฉพาะ scenario |
| ตรวจความครอบคลุมของ condition | ไม่มี | `coverage.md` บอกค่าที่ยังไม่ถูกทดสอบ |
| บันทึกผลการรัน | ไม่มี (ทำใน Jira) | `test-cases.csv` มีคอลัมน์ round, status, actual, finding_id, evidence |
| Automation | มีแค่สถานะ | สร้างโครง Playwright ให้ด้วย |

## หมายเหตุ

- **`import-generic.csv`:** เป็นรูปแบบกลาง 1 แถวต่อ step และซ้ำ Test ID ในทุกแถว ยังไม่ได้ทดลอง import เข้า Jira, Xray หรือ TestRail จริง ต้องจับคู่คอลัมน์ในหน้า import ของเครื่องมือนั้นๆ เองก่อนใช้
- **โครง Playwright:** ทุก test เป็น `test.fixme` (ถูกข้ามไว้ ไม่ผ่านแบบหลอกๆ) ให้คัดลอกไปไว้ใน `playwright-smoke/tests/` แล้วเติม action และ assertion ในแต่ละ `test.step` ก่อนเปลี่ยนเป็น `test`
- **`out/`:** เป็นผลจากตัวอย่างใน `input/` เพื่อให้เห็นรูปแบบ ทุกครั้งที่รันจะถูกเขียนทับ
