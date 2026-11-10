# M12 — Robot Framework Advanced

> **Level 3 · Tools** · ⏱ 8 ชม. · Prerequisite: M11 · Reference: `tests/robot/`

## 🎯 Learning Objectives
1. ออกแบบ **keyword layers** (business → page/service → library)
2. สร้าง **custom Python library** พร้อม `@keyword`, scope, logging
3. ทำ **data-driven testing** (Test Template, ตาราง, ไฟล์ CSV/Excel ด้วย DataDriver)
4. เขียน **BDD** (Given/When/Then, embedded arguments)
5. รัน **parallel ด้วย pabot** อย่างปลอดภัย
6. ใช้ **listeners**, `--rerunfailed`, tag strategy และ integrate รายงาน

---

## 📖 1. Keyword layers
```
Test case            Customer Buys A Book With A Card                       ← ภาษาธุรกิจ
  Business keywords  Given a logged in customer with "BOOK-001" in the cart ← 04_checkout_bdd.robot
    Page/Service kw  Fill Shipping Address · Pay By Card · Add To Cart Via API   ← resources/pages, resources/api
      Library kw     Fill Text · Click · POST On Session                    ← Browser, RequestsLibrary
```
กฎ: test case **ห้ามมี selector หรือ URL** · page keyword **ห้ามมีกฎธุรกิจ**

โครงสร้างของ reference:
```
tests/robot/
├── libraries/ShopLabLibrary.py          ← custom Python keywords
├── resources/
│   ├── variables.py                     ← env config
│   ├── browser.resource                 ← import Browser ครั้งเดียว (แก้ warning "imported with different arguments")
│   ├── common.resource                  ← เปิด browser, login ผ่าน API + inject cookie
│   ├── api/shoplab_api.resource         ← service keywords (RequestsLibrary)
│   └── pages/*.resource                 ← page objects (locators + actions)
└── tests/{ui,api,db,legacy}/*.robot
```

## 📖 2. Custom Python library
```python
from robot.api.deco import keyword, library
from robot.api import logger

@library(scope="GLOBAL", auto_keywords=False)
class ShopLabLibrary:
    @keyword("Expected Quote")
    def expected_quote(self, subtotal, discount=0, shipping_method="standard", free_ship_coupon=False):
        ...
        logger.info(f"Expected quote: {result}")
        return result
```
- `scope`: `GLOBAL` (instance เดียวทั้ง run) / `SUITE` / `TEST`
- `auto_keywords=False` → เฉพาะ method ที่มี `@keyword` เป็น keyword (ปลอดภัยกว่า)
- argument จาก Robot เป็น **string** เสมอ (ถ้าไม่มี type hint) → แปลง type เองหรือใช้ type hints (`def f(self, n: int)`)
- เมื่อไรควรเขียน Python: คำนวณ, parse, วันเวลา, สุ่มข้อมูล, เรียก SDK/โปรโตคอลพิเศษ, logic ที่มี if/loop เยอะ

## 📖 3. Data-driven testing
**Test Template** (ดู `03_cart_pricing.robot`)
```robotframework
*** Settings ***
Test Template       Cart Total Should Follow Pricing Rules

*** Test Cases ***                          SKU         QTY    COUPON       SHIPPING    DISCOUNT    FREESHIP    MESSAGE
R2 Exactly On Threshold (BUG-01)            ELEC-003    1      ${NONE}      standard    0           False       ${NONE}
R4 Discount Applied Before VAT (BUG-02)     ELEC-003    1      SAVE10       standard    100         False       Coupon SAVE10 applied
```
**[Template] ใน test เดียว** — หลายแถว = หลายรอบใน test เดียว (ดู `01_login.robot`)
**DataDriver** (`pip install robotframework-datadriver`) — อ่าน CSV/Excel แล้วสร้าง test case ให้อัตโนมัติ เหมาะเมื่อ BA ดูแลตารางข้อมูลเอง
```robotframework
Library    DataDriver    file=../data/pricing.csv    dialect=excel
Test Template    Cart Total Should Follow Pricing Rules
```

## 📖 4. BDD และ Embedded arguments
```robotframework
*** Test Cases ***
Customer Buys A Book With A Card
    Given a logged in customer with "BOOK-001" in the cart
    When the customer checks out paying by card    ${VALID_CARD}
    Then the order is confirmed with status "PAID"

*** Keywords ***
A Logged In Customer With "${sku}" In The Cart
    ...
```
Robot ตัดคำ Given/When/Then/And/But ออกเอง · argument ฝังในชื่อ keyword อ่านเป็นภาษาธรรมชาติ

## 📖 5. Parallel with pabot
```bash
# activate venv ก่อนเสมอ! (pabot เรียก "robot" จาก PATH)
curl -X POST http://localhost:3000/api/test/reset
pabot --processes 4 --outputdir results --variable RESET_DATA:False --exclude legacy tests
pabot --testlevelsplit --processes 8 tests        # แบ่งระดับ test case (ละเอียดกว่า suite)
```
ผลจริงของ reference: **44 tests · ต่อเนื่อง 93 วินาที → pabot 4 processes 32 วินาที**

**เงื่อนไขของการรันขนาน**
- test ต้อง **อิสระ** — ใช้ `Create Test User` ต่อ test, ไม่แชร์ตะกร้า
- ห้าม reset DB ระหว่างรัน — `__init__.robot` จะ reset ทุก process! (จึงมีตัวแปร `RESET_DATA`)
- ทรัพยากรที่ต้องใช้คนเดียว → `PabotLib` (`Acquire Lock`, `Run Setup Only Once`, value sets)

## 📖 6. Listeners & hooks
Listener = Python class ที่ Robot เรียกเมื่อ start/end suite/test/keyword — ใช้ส่งผลเข้า Jira/Xray/Slack, เก็บ metric, แนบ log
```python
class SlackOnFailure:
    ROBOT_LISTENER_API_VERSION = 3
    def end_test(self, data, result):
        if result.failed:
            post_to_slack(f"❌ {result.longname}: {result.message}")
```
`robot --listener listeners/SlackOnFailure.py tests`

## 📖 7. Tag strategy
| Tag | ใช้ |
|---|---|
| `smoke` | รันทุก PR (< 5 นาที) |
| `regression` | nightly |
| `ui`, `api`, `db` | เลือกตามชั้น |
| `REQ-PRC-03` | traceability |
| `known-issue`, `flaky` | quarantine (`--exclude flaky` + `--noncritical` ในเวอร์ชันเก่า / `--skiponfailure` ใน RF 4+) |

```bash
robot --include smokeANDui --exclude legacy tests
robot --skiponfailure flaky tests
```

---

## 🧪 Lab 12.1 — Custom library (60 นาที)
เพิ่ม keyword ใน `ShopLabLibrary.py`: `Luhn Check Digit`, `Generate Valid Card Number` (prefix 4242…), `Order Number Should Be Valid` — เขียน test ที่ใช้ทั้ง 3 keyword

## 🧪 Lab 12.2 — DataDriver (45 นาที)
ไฟล์ข้อมูลพร้อมใช้: [`tests/robot/data/pricing.csv`](../../tests/robot/data/pricing.csv) (11 แถว = decision table ของ REQ-PRC)
1. `pip install robotframework-datadriver`
2. สร้าง suite ใหม่ที่ import `DataDriver    file=../data/pricing.csv    dialect=excel    encoding=utf-8` + `Test Template` แล้วย้าย keyword `Cart Total Should Follow Pricing Rules` ไปไว้ใน resource
3. เพิ่ม row ใหม่ใน CSV (เช่น `SAVE10` กับ BOOK-004) โดยไม่แตะไฟล์ .robot → ต้องมี test case ใหม่ปรากฏ
4. รันใน Bug Mode — แถวใดที่ fail?

กฎของ CSV: คอลัมน์แรกต้องชื่อ `*** Test Cases ***` · ชื่อคอลัมน์ที่เหลือต้องตรงกับ argument ของ template keyword (`${sku}` …) · `${NONE}` ในเซลล์ถูกแปลงเป็นค่า None · เฉลยสำหรับผู้สอน: `tests/robot/solutions/06_pricing_datadriver.robot`

## 🧪 Lab 12.3 — BDD suite (45 นาที)
เขียน `registration_bdd.robot` 4 scenarios แบบ Given/When/Then ด้วย embedded arguments

## 🧪 Lab 12.4 — Parallel (30 นาที)
รัน suite ทั้งหมดแบบปกติและแบบ pabot 2/4/8 processes บันทึกเวลา · ลองลบ `RESET_DATA:False` แล้วอธิบายผลที่เกิดขึ้น

---

## ✅ Check Your Understanding
1. ทำไม test case ไม่ควรมี selector?
2. argument ที่ส่งจาก Robot เข้า Python เป็น type อะไรถ้าไม่มี type hint?
3. ทำไม `__init__.robot` ที่ reset DB เป็นปัญหาเมื่อใช้ pabot?
4. Listener ใช้ทำอะไรได้บ้าง ยก 3 ตัวอย่าง
5. เมื่อไรควรใช้ DataDriver แทน Test Template ปกติ?

<details><summary>เฉลย</summary>

1. UI เปลี่ยน → ต้องแก้ทุก test; test อ่านยาก; ผิดหลักแยกชั้น
2. `str` (Robot 4+ แปลงตาม type hint ให้ถ้ามี)
3. pabot รัน suite setup ของ `__init__` ในทุก process → reset ข้อมูลกลางคันขณะ process อื่นกำลังทดสอบ
4. ส่งผลเข้า test management, แจ้ง Slack/Teams, เก็บเวลา keyword, แนบ artifact, เปลี่ยนสถานะ test ตามเงื่อนไข
5. เมื่อข้อมูลเยอะ/ถูกดูแลโดยคนนอกทีม automation (BA) หรือข้อมูลมาจาก Excel/CSV ที่เปลี่ยนบ่อย
</details>

## 📋 Skills Checklist
- [ ] ออกแบบ keyword 3 ชั้นได้
- [ ] เขียน Python library ที่มี logging และ type hints
- [ ] ทำ data-driven ด้วย Template และ DataDriver
- [ ] รัน pabot ได้ถูกต้องและอธิบายข้อควรระวัง

## 🚀 Real-world Notes
- องค์กรใหญ่มักมี **"keyword library กลาง"** เป็น Python package แยก version — หลายทีมใช้ร่วมกัน
- ใช้ **Robot Framework + Browser** สำหรับ web, **RequestsLibrary** สำหรับ API, **SSHLibrary** สำหรับ server/batch job, **DatabaseLibrary** สำหรับ data — ทั้งหมดใน report เดียว คือจุดขายที่ Playwright ทำไม่ได้ง่ายๆ
