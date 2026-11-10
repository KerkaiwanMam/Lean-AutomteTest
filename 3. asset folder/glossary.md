# Glossary — คำศัพท์เฉพาะของหลักสูตร

> คอลัมน์ **Canonical spelling** ใช้โดย `4. script folder/text_lint.py` ตรวจการสะกด — ใส่เฉพาะชื่อเฉพาะ (proper noun) ที่ต้องสะกดแบบเดียวทั้งหลักสูตร; คำทั่วไปเว้นว่าง

| Term | Canonical spelling | ภาษาไทย / คำอธิบาย | Module |
|---|---|---|---|
| Error / Defect / Failure | | ความผิดพลาดของคน / ข้อบกพร่องในงาน / อาการผิดที่สังเกตได้ | M01 |
| Equivalence Partitioning (EP) | | การแบ่งกลุ่มค่าที่ระบบน่าจะทำงานเหมือนกัน แล้วทดสอบตัวแทนกลุ่มละค่า | M02 |
| Boundary Value Analysis (BVA) | | ทดสอบค่าที่ขอบและติดขอบของช่วง | M02 |
| Decision table | | ตารางเงื่อนไข × ผลลัพธ์ ครอบคลุมทุก combination | M02 |
| State transition | | ทดสอบการเปลี่ยนสถานะ valid/invalid | M02 |
| Pairwise testing | | ครอบคลุมทุกคู่ของค่าพารามิเตอร์ด้วย case น้อยที่สุด | M02 |
| Exploratory testing | | เรียนรู้ ออกแบบ และรันไปพร้อมกัน ภายใต้ charter และ time-box | M02 |
| Regression testing | | ทดสอบซ้ำว่าส่วนเดิมยังไม่พังหลังการเปลี่ยนแปลง | M01 |
| Severity / Priority | | ความรุนแรงทางเทคนิค / ความเร่งด่วนทางธุรกิจ | M03 |
| Traceability (RTM) | | การโยง requirement ↔ test ↔ ผลลัพธ์ | M03 |
| Test pyramid | | สัดส่วน unit > API > UI | M04 |
| Shift-left / Shift-right | | ทดสอบเร็วขึ้นในวงจร / ทดสอบและสังเกตใน production | M04 |
| Locator | | วิธีระบุ element บนหน้าเว็บ | M07 |
| Auto-waiting | | เครื่องมือรอให้ element พร้อมก่อนทำ action อัตโนมัติ | M09 |
| Web-first assertion | | assertion ที่ retry จนผ่านหรือ timeout | M09 |
| Page Object Model (POM) | | รูปแบบห่อหน้าเว็บเป็น class/keyword ที่สื่อเจตนา | M10, M15 |
| Fixture | | สิ่งที่ framework เตรียมให้ test และเก็บกวาดอัตโนมัติ | M10 |
| Flaky test | | test ที่ผลไม่คงที่ทั้งที่โค้ดและข้อมูลไม่เปลี่ยน | M17 |
| Contract testing | | ตรวจว่า API ตรงกับสัญญา (schema) ที่ตกลงกัน | M13 |
| IDOR / BOLA | | เข้าถึงข้อมูลของผู้อื่นได้โดยเปลี่ยน id | M13, M19 |
| Mutation testing | | ฝังความผิดในโค้ดเพื่อวัดว่า test จับได้หรือไม่ | M20 |
| Bug Mode | | โหมดของ ShopLab ที่เปิดบั๊กฝังไว้ 13 ตัว | ทุกโมดูล |
| Playwright | Playwright | เครื่องมือ browser automation ของ Microsoft | M09–M10 |
| Robot Framework | Robot Framework | framework แบบ keyword-driven บน Python | M11–M12 |
| Browser library | Browser library | Robot Framework library ที่ใช้ Playwright เป็น engine | M11 |
| SeleniumLibrary | SeleniumLibrary | Robot Framework library บน Selenium WebDriver | M11 |
| RequestsLibrary | RequestsLibrary | Robot Framework library สำหรับ HTTP | M13 |
| DatabaseLibrary | DatabaseLibrary | Robot Framework library สำหรับ SQL | M14 |
| TypeScript | TypeScript | ภาษาที่ใช้กับ Playwright ในหลักสูตร | M08 |
| JavaScript | JavaScript | | M08 |
| GitHub Actions | GitHub Actions | CI/CD ของ GitHub | M18 |
| OpenAPI | OpenAPI | มาตรฐานอธิบาย REST API | M13 |
| ShopLab | ShopLab | เว็บฝึกของหลักสูตร | ทุกโมดูล |
