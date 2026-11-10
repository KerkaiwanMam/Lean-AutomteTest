# M11 — Robot Framework Fundamentals

> **Level 3 · Tools** · ⏱ 8 ชม. · Prerequisite: M07 · Reference: `tests/robot/` · RFCP syllabus

## 🎯 Learning Objectives
1. อธิบายสถาปัตยกรรม Robot Framework: **test data → keywords → libraries**
2. เขียนไฟล์ `.robot` ด้วย sections, variables (scalar/list/dict), keywords, arguments, return values
3. ใช้ **Browser library** (Playwright engine) และรู้จัก **SeleniumLibrary**
4. ใช้ **Setup/Teardown**, **Tags**, **Documentation**, **resource files**
5. ใช้ control structures: `IF/ELSE`, `FOR`, `WHILE`, `TRY/EXCEPT`, `VAR`
6. อ่าน **log.html / report.html / output.xml** เพื่อ debug

---

## 📖 1. แนวคิด
```
   *.robot (test cases ที่อ่านง่าย)
        │ เรียก
   User keywords (*.resource)       ← ทีม QA สร้าง "ภาษา" ของโดเมน: Login As Customer, Apply Coupon
        │ เรียก
   Library keywords                 ← Browser, RequestsLibrary, DatabaseLibrary, Collections, custom Python
        │ ควบคุม
   System Under Test (ShopLab)
```
จุดแข็ง: **keyword-driven** — test อ่านเหมือน test case manual, คนไม่ถนัดโค้ดเข้าใจได้, library ครอบคลุม web/API/DB/SSH/mobile/desktop

## 📖 2. ติดตั้ง
```powershell
python -m venv .venv ; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
rfbrowser init                  # หรือ rfbrowser init --skip-browsers แล้วใช้ BROWSER_CHANNEL=chrome
cd tests/robot
robot --outputdir results tests                       # รันทั้งหมด
robot --include smoke --outputdir results tests       # ตาม tag
robot -t "Locked Account Is Rejected" tests            # ตามชื่อ
robot --variable HEADLESS:False tests/ui/01_login.robot
```

## 📖 3. โครงสร้างไฟล์
```robotframework
*** Settings ***
Documentation       Login (REQ-AUTH)
Resource            ../../resources/common.resource
Resource            ../../resources/pages/login_page.resource
Suite Setup         Open ShopLab Browser
Test Setup          New ShopLab Page    /login
Test Tags           ui    auth

*** Variables ***
${GREETING}         Hello
@{CATEGORIES}       books    electronics    fashion
&{USER}             username=customer    password=Passw0rd!

*** Test Cases ***
Locked Account Is Rejected
    [Documentation]    Guards BUG-11
    [Tags]    negative
    Submit Credentials    ${LOCKED}[username]    ${LOCKED}[password]
    Login Should Fail With    Account is locked. Please contact support.

*** Keywords ***
Submit Credentials
    [Arguments]    ${username}    ${password}
    Fill Text    ${LOGIN_USERNAME}    ${username}
    Fill Secret    ${LOGIN_PASSWORD}    $password      # ไม่แสดงรหัสผ่านใน log
    Click    ${LOGIN_BUTTON}
```
**กฎ syntax:** แยก argument ด้วย **ช่องว่าง ≥ 2 ตัว** (แนะนำ 4) · comment ด้วย `#` · ต่อบรรทัดด้วย `...`

## 📖 4. Variables
| ชนิด | ประกาศ | ใช้ |
|---|---|---|
| Scalar | `${NAME}    value` | `${NAME}` |
| List | `@{ITEMS}    a    b` | `@{ITEMS}` (กระจาย) / `${ITEMS}[0]` |
| Dict | `&{USER}    k=v` | `${USER}[username]` |
| Environment | – | `%{BASE_URL}` |
| Python expression | – | `${{ 1 + 2 }}`, `${{ [1,2,3] }}` |
| Built-in | – | `${EMPTY}`, `${NONE}`, `${TRUE}`, `${CURDIR}`, `${TEMPDIR}` |

ลำดับความสำคัญ: command line (`--variable`) > variable file/section > ค่าใน resource
ไฟล์ตัวแปร Python: `resources/variables.py` อ่าน env var ได้ (`BASE_URL`, `HEADLESS`, `BROWSER_CHANNEL`)

**RF 7 syntax:** `VAR    ${total}    ${0}` · `VAR    ${x}    value    scope=SUITE` (แทน `Set Suite Variable`)

## 📖 5. Browser library — คำสั่งหลัก
| งาน | Keyword |
|---|---|
| เปิด | `New Browser    chromium    headless=True` → `New Context` → `New Page    url` |
| ไปหน้า | `Go To    url` |
| กรอก/คลิก | `Fill Text`, `Fill Secret`, `Type Text`, `Click`, `Check Checkbox`, `Select Options By` |
| อ่าน+ตรวจ (มี assertion ในตัว + auto-retry) | `Get Text    sel    ==    expected` · `Get Element Count    sel    ==    8` · `Get Url    contains    /login` · `Get Element States    sel    contains    visible` |
| รอ | `Wait For Elements State    sel    visible`, `Wait For Condition`, `Wait For Response` (ผ่าน `Promise To`) |
| Selector | `id=x`, `css=…`, `text=…`, `"exact text"`, `data-testid=…`, `xpath=…`, chain `>>`, เข้า iframe `>>>` |

**Assertion operators:** `==`, `!=`, `contains`, `not contains`, `starts`, `matches` (regex), `>`, `>=`, `validate` (python expression)

## 📖 6. Setup/Teardown & ขอบเขต
- `Suite Setup` — เปิด browser ครั้งเดียวต่อ suite · `Test Setup` — `New Context` ใหม่ต่อ test (cookie สะอาด)
- `[Teardown]    Close Context` — ทำงาน **แม้ test fail** (ใช้ cleanup)
- `__init__.robot` ในโฟลเดอร์ = setup ของทั้งโฟลเดอร์ (โปรเจกต์นี้ใช้ reset ข้อมูล)

## 📖 7. Control structures
```robotframework
FOR    ${p}    IN    @{products}
    IF    ${p}[stock] == 0    CONTINUE
    Log    ${p}[name]
END

FOR    ${i}    IN RANGE    1    5
    ...
END

IF    '${shipping}' == 'express'
    Choose Shipping    express
ELSE IF    $coupon is not None
    Apply Coupon    ${coupon}
END

TRY
    Click    id=maybe-popup-close
EXCEPT    *TimeoutError*    type=glob
    Log    no popup this time
END

WHILE    ${retries} < 3    limit=10
    ...
END
```
> `$coupon is not None` (ไม่มีวงเล็บปีกกา) = ใช้ค่าตัวแปรจริงใน Python expression → ปลอดภัยกว่า `'${coupon}' != 'None'`

## 📖 8. Logs & Reports
- `report.html` — ภาพรวม pass/fail ตาม tag/suite
- `log.html` — ทุก keyword แบบขยายได้ + screenshot ตอน fail (`run_on_failure=Take Screenshot`)
- `output.xml` — ข้อมูลดิบ ใช้ `rebot` รวมผลหลายรอบ/ส่งเข้า CI/Allure
```bash
rebot --merge results/run1/output.xml results/rerun/output.xml     # รวมผล rerun
robot --rerunfailed results/output.xml --output rerun.xml tests     # รันเฉพาะที่ fail
```

## 📖 9. SeleniumLibrary (โปรเจกต์ legacy)
ดู `tests/robot/tests/legacy/selenium_login.robot` — ต่างจาก Browser library ตรงที่ต้อง `Wait Until Element Is Visible` เอง, ไม่มี assertion operators ในตัว, ใช้ WebDriver
**การย้ายจาก Selenium → Browser:** ทำทีละ suite, สร้าง keyword ชื่อเดิมใน resource ใหม่ (adapter) เพื่อไม่ต้องแก้ test case

---

## 🧪 Lab 11.1 — Suite แรก (60 นาที)
เขียน `my_catalog.robot`: search "coffee" (1 รายการ), category home (5), Thai search "เมาส์" — ใช้ selector ใน `catalog_page.resource`

## 🧪 Lab 11.2 — Resource file & keywords (60 นาที)
สร้าง `register_page.resource` ที่มี keyword `Register New Customer` (รับ dict) และ `Field Error Should Be` · เขียน 5 test case ของการสมัคร (happy path, password mismatch, duplicate username, อายุ 17, empty form)

## 🧪 Lab 11.3 — Control flow (45 นาที)
เขียน test ที่วน FOR ทุกหมวดหมู่จาก `GET /api/categories` (ผ่าน RequestsLibrary) แล้วตรวจจำนวนการ์ดใน UI ตรงกับ count จาก API

## 🧪 Lab 11.4 — อ่าน log (20 นาที)
เปิด Bug Mode รัน `03_cart_pricing.robot` แล้วใช้ `log.html` หาว่า R4 fail เพราะค่าอะไรต่างกัน (ดู screenshot ที่ฝังไว้)

---

## ✅ Check Your Understanding
1. ทำไม `Fill Secret` ดีกว่า `Fill Text` สำหรับรหัสผ่าน?
2. `${USER}[username]` กับ `&{USER}` ต่างกันอย่างไร?
3. `[Teardown]` ทำงานเมื่อ test fail หรือไม่?
4. `Get Text    sel    ==    x` ต่างจาก `${t}= Get Text sel` + `Should Be Equal ${t} x` อย่างไร?
5. ลำดับความสำคัญของตัวแปรจาก command line vs Variables section?

<details><summary>เฉลย</summary>

1. ค่าไม่ถูกเขียนลงใน log.html/output.xml — ป้องกันข้อมูลลับรั่วจาก report
2. `${USER}[username]` เข้าถึงค่าใน dict · `&{USER}` ใช้ประกาศ หรือกระจาย dict เป็น named arguments
3. ทำงานเสมอ — จึงใช้สำหรับ cleanup
4. แบบแรก **retry** จนตรงหรือ timeout (assertion engine) · แบบหลังอ่านครั้งเดียว อาจ flaky
5. command line ชนะ
</details>

## 📋 Skills Checklist
- [ ] เขียน .robot ที่มี Settings/Variables/Test Cases/Keywords ถูกต้อง
- [ ] ใช้ Browser library + assertion operators
- [ ] ใช้ resource files แยก locator ออกจาก test
- [ ] ใช้ IF/FOR/TRY และ setup/teardown ได้
- [ ] อ่าน log.html หาสาเหตุ fail ได้

## 🚀 Real-world Notes
- ตั้ง **naming convention** ของ keyword ทั้งทีม (เช่น `<Verb> <Object>`: `Apply Coupon`, `Cart Count Should Be`)
- ใช้ **RobotCode** extension (VS Code/PyCharm) — autocomplete, go-to-definition, debugger
- ใช้ **Robocop** (lint) และ **Robotidy** (format) ใน CI
