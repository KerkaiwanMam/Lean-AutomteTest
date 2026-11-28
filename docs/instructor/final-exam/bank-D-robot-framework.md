# Final Exam Bank — Area D: Robot Framework (M11, M12, M17 · Ch 10–12)

> ⚠️ Spoiler (instructor key; this repository is public) · format: see [README.md](README.md)

### D-01
`area: D` · `module: M12` · `chapter: 12` · `level: K2` · `type: single` · `answer: C`

ตามกฎ keyword layers ของหลักสูตร บรรทัดใดใน **test case** ผิดกฎ

- A) `Given a logged in customer with "BOOK-001" in the cart`
- B) `When the customer pays by card`
- C) `Click    css=#checkout-btn`
- D) `Then the order should be confirmed`

> **เหตุผล:** test case ต้องเป็นภาษาธุรกิจ ห้ามมี selector หรือ URL · selector อยู่ใน page keyword (resources/pages) · **อ้างอิง:** M12 §1

### D-02
`area: D` · `module: M11` · `chapter: 10` · `level: K1` · `type: single` · `answer: B`

ในไฟล์ `.robot` แบบ space-separated ต้องแยก keyword กับ argument ด้วยอะไร

- A) ช่องว่าง 1 ตัว
- B) ช่องว่างอย่างน้อย 2 ตัว (หลักสูตรแนะนำ 4)
- C) เครื่องหมาย comma
- D) เครื่องหมาย `|` เท่านั้น

> **เหตุผล:** ช่องว่างตัวเดียวถือเป็นส่วนหนึ่งของชื่อ keyword/ค่า · **อ้างอิง:** M11 §3

### D-03
`area: D` · `module: M11` · `chapter: 10` · `level: K2` · `type: single` · `answer: A`

ข้อใดอธิบาย `Fill Secret    ${LOGIN_PASSWORD}    $password` ได้ถูกต้อง

- A) ไม่บันทึกค่าลับใน log ของ Robot · ส่งค่าเป็น `$password` (ไม่มีวงเล็บปีกกา) · แต่ถ้าเปิด Playwright debug log ค่าจะโผล่ใน debug log นั้น
- B) เข้ารหัส (encrypt) รหัสผ่านก่อนส่งให้ server
- C) ซ่อนค่าในทุก log รวมถึง Playwright debug log
- D) ต้องเขียน `${password}` เท่านั้น ไม่เช่นนั้น error

> **เหตุผล:** Browser library ซ่อนค่าใน log ของ Robot แต่ไม่ใช่การเข้ารหัส · `${password}` จะถูกแทนค่าก่อนส่งเข้า keyword และบันทึกลง log · **อ้างอิง:** M11 quiz ข้อ 1, REF-022

### D-04
`area: D` · `module: M11` · `chapter: 10` · `level: K3` · `type: single` · `answer: D`

ยอดรวมในหน้า cart อัปเดตหลังเรียก API ประมาณ 300 ms วิธีใดเสถียรที่สุดใน Browser library

- A) `${t}=    Get Text    id=summary-total` แล้ว `Should Be Equal    ${t}    ฿1,016.50`
- B) `Sleep    1s` แล้วทำแบบข้อ A
- C) `Wait Until Keyword Succeeds    3x    0s    Should Be Equal    ...`
- D) `Get Text    id=summary-total    ==    ฿1,016.50`

> **เหตุผล:** assertion ในตัวของ `Get Text` retry จนตรงหรือหมด timeout · ข้อ A อ่านครั้งเดียว · ข้อ C ไม่ได้อ่านค่าใหม่ทุกรอบ · **อ้างอิง:** M11 §5, M11 quiz ข้อ 4

### D-05
`area: D` · `module: M11` · `chapter: 10` · `level: K3` · `type: single` · `answer: B`

ช่อง Card holder อยู่ใน `<iframe id="payment-frame">` selector ใดถูกต้องใน Browser library

- A) `id=card-holder`
- B) `id=payment-frame >>> id=card-holder`
- C) `id=payment-frame >> id=card-holder`
- D) `xpath=//iframe//input[@id="card-holder"]`

> **เหตุผล:** `>>>` เข้าไปใน frame · `>>` เป็นการ chain ภายในเอกสารเดียวกัน · XPath ข้าม frame ไม่ได้ · **อ้างอิง:** M11 §5, `docs/cheatsheets/locator-cheatsheet.md`

### D-06
`area: D` · `module: M11` · `chapter: 10` · `level: K2` · `type: single` · `answer: C`

test case มี `[Teardown]    Close Context` และล้มที่ขั้นที่ 3 จะเกิดอะไรขึ้น

- A) teardown ไม่ทำงานเพราะ test ล้มก่อน
- B) teardown ทำงานเฉพาะเมื่อรันด้วย `--rerunfailed`
- C) teardown ทำงานเสมอ แม้ test ล้ม จึงเหมาะกับงาน cleanup
- D) teardown ทำงานแต่ทำให้ test กลายเป็น PASS

> **เหตุผล:** teardown ทำงานแม้ test fail และไม่เปลี่ยนผลของ test ให้เป็น PASS · **อ้างอิง:** M11 §6, M11 quiz ข้อ 3

### D-07
`area: D` · `module: M11` · `chapter: 10` · `level: K3` · `type: single` · `answer: A`

ตัวแปร `${coupon}` อาจเป็น `None` เงื่อนไขใดตรวจได้ปลอดภัยที่สุด

- A) `ELSE IF    $coupon is not None`
- B) `ELSE IF    '${coupon}' != 'None'`
- C) `ELSE IF    ${coupon} != None`
- D) `ELSE IF    coupon is not None`

> **เหตุผล:** `$coupon` (ไม่มีวงเล็บปีกกา) ส่งค่าจริงเข้า Python expression · แบบ B เปรียบเทียบข้อความและพังถ้าค่ามี quote · แบบ D ไม่ใช่ตัวแปร Robot · **อ้างอิง:** M11 §7

### D-08
`area: D` · `module: M12` · `chapter: 11` · `level: K2` · `type: single` · `answer: D`

suite มี `Test Template    Cart Total Should Follow Pricing Rules` และ test case หลายแถว แต่ละแถวมีแต่ค่า สิ่งนี้คืออะไร

- A) แต่ละแถวเรียก keyword ต่างกันตามชื่อ test
- B) Robot สุ่มค่าจากแถวมารันหนึ่งครั้ง
- C) template ใช้ได้เฉพาะกับ DataDriver
- D) แต่ละแถวคือ test case ที่เรียก keyword เดียวกันด้วยค่าในแถวนั้น (data-driven)

> **เหตุผล:** Test Template เปลี่ยน test case ให้เป็นตารางข้อมูล · DataDriver เป็นอีกทางที่อ่านจากไฟล์ CSV/Excel · **อ้างอิง:** M12 §3, `tests/robot/tests/ui/03_cart_pricing.robot`

### D-09
`area: D` · `module: M12` · `chapter: 11` · `level: K3` · `type: single` · `answer: B`

ใช้ `Library    DataDriver    file=../data/pricing.csv    dialect=excel    encoding=utf-8` ไฟล์ CSV ต้องมีหัวตารางแบบใด

- A) คอลัมน์แรก `name` ตามด้วยชื่อ argument ไม่มีเครื่องหมาย
- B) คอลัมน์แรก `*** Test Cases ***` (ชื่อ test) ตามด้วย `${argument}` ตรงกับ argument ของ template keyword
- C) ไม่มีหัวตาราง DataDriver เดาจากตำแหน่งคอลัมน์
- D) หัวตารางต้องเป็นภาษาอังกฤษตัวพิมพ์ใหญ่ทั้งหมด

> **เหตุผล:** DataDriver ใช้คอลัมน์ `*** Test Cases ***` เป็นชื่อ test และหัวคอลัมน์แบบ `${var}` เป็น argument · `encoding=utf-8` จำเป็นเมื่อชื่อ test มีภาษาไทย · **อ้างอิง:** M12 Lab 12.2, REF-087

### D-10
`area: D` · `module: M12` · `chapter: 11` · `level: K4` · `type: single` · `answer: C`

`robot tests` ผ่านทั้งหมด แต่ `pabot --processes 4 tests` ล้มแบบสุ่ม: ตะกร้าว่างและผู้ใช้หายกลางคัน `__init__.robot` มี Suite Setup ที่ reset DB สาเหตุและวิธีแก้ที่ดีที่สุดคือข้อใด

- A) pabot ไม่รองรับ Browser library — กลับไปรันแบบปกติ
- B) เครื่องช้า — เพิ่ม timeout ทุก keyword
- C) pabot รัน `__init__` ในทุก process จึง reset ข้อมูลระหว่างที่ process อื่นทดสอบ — ปิด reset ด้วย `--variable RESET_DATA:False` (reset ครั้งเดียวก่อนรัน) หรือใช้ `PabotLib` `Run Setup Only Once`
- D) เพิ่ม `--processes 8` เพื่อให้จบเร็วก่อน reset

> **เหตุผล:** สถานะร่วม (DB) + setup ที่รันซ้ำทุก process = test ชนกัน · **อ้างอิง:** M12 §5, M12 quiz ข้อ 3, REF-023

### D-11
`area: D` · `module: M12` · `chapter: 11` · `level: K2` · `type: single` · `answer: A`

`robot --skiponfailure flaky tests` ทำอะไรกับ test ที่มี tag `flaky`

- A) ถ้าล้ม จะถูกรายงานเป็น SKIP แทน FAIL ทำให้ไม่ทำให้ build แดง แต่ยังรันและเห็นผล (quarantine)
- B) ไม่รัน test เหล่านั้นเลย
- C) รัน test เหล่านั้นซ้ำจนผ่าน
- D) ลบ tag `flaky` ออกเมื่อ test ผ่าน

> **เหตุผล:** quarantine ต้องยังมองเห็น ไม่ใช่ซ่อน · `--exclude flaky` คือการไม่รัน · **อ้างอิง:** M12 §7, REF-081

### D-12
`area: D` · `module: M17` · `chapter: 12` · `level: K4` · `type: single` · `answer: B`

test logout ของ Robot เขียน `Click    text=Log out` แล้ว `Wait For Navigation    ${BASE_URL}/login` ผ่านบนเครื่อง dev แต่ใน CI ล้มด้วย `waitForNavigation timeout` เป็นบางครั้ง วิเคราะห์ข้อใดถูกต้อง

- A) server ใน CI ช้า — เพิ่ม timeout เป็น 60 วินาที
- B) race: เริ่มรอ *หลัง* action — หน้าเปลี่ยนเสร็จก่อนเริ่มรอ จึงรอเหตุการณ์ที่ผ่านไปแล้ว · แก้ด้วย assertion ที่ retry เช่น `Get Url    ==    ${BASE_URL}/login`
- C) ลิงก์ Log out ถูกบัง — ใช้ `force`
- D) ต้องใช้ `--rerunfailed` ใน CI เสมอ

> **เหตุผล:** เคสจริงของ reference suite: stress ด้วย `pabot --processes 8` ล้ม 2/2 ก่อนแก้ ผ่าน 3/3 หลังแก้ · ข้อ A ไม่แก้ race · ข้อ D ซ่อนปัญหา · **อ้างอิง:** M17 §6 (ตารางเคสจริง)
