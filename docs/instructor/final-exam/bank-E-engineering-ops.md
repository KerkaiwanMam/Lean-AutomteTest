# Final Exam Bank — Area E: Test Engineering & Operations (M14, M16, M17, M18, M19 · Ch 13–17)

> ⚠️ Spoiler (instructor key; this repository is public) · format: see [README.md](README.md)

### E-01
`area: E` · `module: M14` · `chapter: 13` · `level: K3` · `type: single` · `answer: C`

ตาราง `orders` มีคอลัมน์ `subtotal, discount, shipping, vat, total` query ใดหา order ที่ยอดรวมคำนวณไม่ตรงได้ถูกต้อง

- A) `SELECT order_no FROM orders WHERE total = subtotal;`
- B) `SELECT order_no FROM orders WHERE subtotal - discount + shipping + vat = total;`
- C) `SELECT order_no FROM orders WHERE ROUND(subtotal - discount + shipping + vat, 2) <> total;`
- D) `SELECT order_no FROM orders WHERE total < 0;`

> **เหตุผล:** หาแถวที่ "ไม่เท่ากัน" และปัดทศนิยม 2 ตำแหน่งเพื่อกันความคลาดเคลื่อนของ floating point · ข้อ B หาแถวที่ถูก · **อ้างอิง:** M14 §3

### E-02
`area: E` · `module: M14` · `chapter: 13` · `level: K2` · `type: single` · `answer: A`

ข้อใดเป็นเหตุผลที่ดีที่สุดที่จะตรวจที่ database เพิ่มจากการตรวจ UI หลัง checkout

- A) ข้อความ "สั่งซื้อสำเร็จ" ไม่พิสูจน์ว่า order ถูกบันทึก ยอดถูก stock ถูกตัด และตะกร้าถูกล้าง
- B) database test เร็วกว่า unit test
- C) UI test ไม่สามารถตรวจยอดเงินได้
- D) ควรตรวจทุกอย่างที่ database แทน UI ทั้งหมด

> **เหตุผล:** ต้องพิสูจน์ที่แหล่งข้อมูลเมื่อผลลัพธ์ไม่แสดงบนหน้าจอ · ข้อ D ผิดเพราะยังต้องตรวจสิ่งที่ผู้ใช้เห็น · **อ้างอิง:** M14 §1

### E-03
`area: E` · `module: M14` · `chapter: 13` · `level: K3` · `type: single` · `answer: D`

test ตรวจว่า stock ลดลงหลังสั่งซื้อ 2 ชิ้น และรันขนานกับ test อื่นที่ซื้อสินค้าเดียวกัน assertion ใดเสถียรที่สุด

- A) `stock == 48` (ค่าคงที่จาก seed 50)
- B) `stock < 50`
- C) อ่าน stock หลังสั่งซื้อเท่านั้นแล้วเทียบกับ seed
- D) สร้างสินค้าเฉพาะของ test นี้ผ่าน test hook (หรือแยกข้อมูล) แล้วตรวจ `stock_after == stock_before - 2`

> **เหตุผล:** ค่าคงที่ (ข้อ A, C) พังเมื่อ test อื่นซื้อสินค้าเดียวกัน · ข้อ B ผ่านได้แม้ตัดผิดจำนวน · ข้อมูลของตัวเอง + assertion แบบสัมพัทธ์จึงเสถียรและตรวจได้จริง · **อ้างอิง:** M14 §3, M16 §2

### E-04
`area: E` · `module: M16` · `chapter: 14` · `level: K2` · `type: single` · `answer: B`

ทำไม ShopLab mount `/api/test/reset`, `/api/test/config`, `/api/test/users` เฉพาะเมื่อ `NODE_ENV !== 'production'`

- A) เพื่อให้ test ใน production รันเร็วขึ้น
- B) เพราะ hook เหล่านี้ล้างข้อมูลหรือสร้างผู้ใช้ได้ หากเปิดใน production คือช่องโหว่ร้ายแรง
- C) เพราะ production ไม่มี database
- D) เพราะ Playwright เรียก hook ใน production ไม่ได้

> **เหตุผล:** test hook มีประโยชน์มากแต่ต้องปลอดภัย · **อ้างอิง:** M16 §4, REQUIREMENTS REQ-SEC-05

### E-05
`area: E` · `module: M16` · `chapter: 14` · `level: K3` · `type: single` · `answer: C`

test "บัตรที่หมดอายุเดือนนี้ยังใช้ได้" ใช้วันหมดอายุ `11/26` ผ่านในเดือนพฤศจิกายน 2026 แต่จะล้มตั้งแต่เดือนธันวาคม วิธีแก้ที่ดีที่สุดคือข้อใด

- A) แก้ค่าในไฟล์ทุกเดือน
- B) ใส่ `test.skip()` เมื่อเปลี่ยนเดือน
- C) คำนวณเดือน/ปีจากวันปัจจุบันแบบ dynamic หรือควบคุมเวลาด้วย `page.clock.setFixedTime()`
- D) ใช้วันหมดอายุ `12/99`

> **เหตุผล:** ข้อมูลที่ขึ้นกับ "วันนี้" ต้องคำนวณหรือควบคุมเวลา · ข้อ D ทดสอบคนละกรณี (ไม่ใช่ "เดือนนี้") · **อ้างอิง:** M16 §3, REF-093

### E-06
`area: E` · `module: M16` · `chapter: 14` · `level: K4` · `type: single` · `answer: A`

ทีมรัน ShopLab 2 instance บนเครื่องเดียว: port 3000 ปกติ และ port 3001 `BUG_MODE=1` แล้วพบว่าผลของทั้งสองชุดปนกันแบบสุ่ม (order ของอีกชุดโผล่มา) สาเหตุที่น่าจะเป็นที่สุดคือข้อใด

- A) ทั้งสอง instance เขียน SQLite ไฟล์เดียวกัน — ต้องตั้ง `SHOPLAB_DATA_DIR` แยกกัน
- B) Bug Mode ทำให้ข้อมูลสุ่ม
- C) port ชนกัน
- D) browser cache ของ Playwright

> **เหตุผล:** สถานะร่วมระดับ environment ก็ทำให้ test ไม่ isolated ได้เหมือนข้อมูลร่วมใน test · port ต่างกันอยู่แล้ว · **อ้างอิง:** M16 Lab (2 instance)

### E-07
`area: E` · `module: M17` · `chapter: 14` · `level: K2` · `type: single` · `answer: D`

test ชุดหนึ่งผ่านทุกครั้งเมื่อรัน `--workers=1` แต่ล้มแบบสุ่มเมื่อรันขนาน หมวดสาเหตุใดน่าสงสัยที่สุด

- A) Locator ผิด
- B) Network ภายนอกช้า
- C) Browser version
- D) ข้อมูลหรือสถานะร่วมกันระหว่าง test (data / isolation)

> **เหตุผล:** อาการ "ผ่านเมื่อรันทีละตัว ล้มเมื่อขนาน" ชี้ไปที่ข้อมูลร่วม · locator ผิดจะล้มแม้รันทีละตัว · **อ้างอิง:** M17 §2

### E-08
`area: E` · `module: M10` · `chapter: 15` · `level: K3` · `type: single` · `answer: B`

endpoint ภายนอกที่ test ต้องเรียกตอบ 503 เป็นบางครั้ง และทีมยอมรับว่าต้อง retry การเรียก โค้ดใดเหมาะที่สุด

- A) `test.describe.configure({ retries: 5 })` ทั้งไฟล์
- B) `await expect(async () => { const r = await request.get(url); expect(r.status()).toBe(200); }).toPass();`
- C) `await page.waitForTimeout(5000)` ก่อนเรียก
- D) `try { … } catch { }` แล้วปล่อยผ่าน

> **เหตุผล:** `toPass` retry *การกระทำ* นั้นจนผ่าน ไม่ต้องรันทั้ง test ซ้ำ · ข้อ D กลืน error · **อ้างอิง:** M10 §6, M09 §5, REF-094

### E-09
`area: E` · `module: M17` · `chapter: 15` · `level: K2` · `type: single` · `answer: C`

ทีมเปิด `retries: 1` ใน CI ข้อใดคือเงื่อนไขที่หลักสูตรกำหนด

- A) ไม่ต้องทำอะไรเพิ่ม test ที่ผ่านรอบสองนับเป็นผ่าน
- B) ต้องปิด trace เพื่อลดเวลา
- C) ต้องรายงาน test ที่ผ่านหลัง retry เป็น "flaky" ใน report ติดตามแนวโน้ม และสร้าง ticket ไม่ใช่ซ่อน
- D) ต้องเพิ่ม `retries` จนกว่าทุก test จะผ่าน

> **เหตุผล:** retry ช่วยลดเสียงรบกวนได้ แต่ถ้าซ่อน flaky ทีมจะเลิกเชื่อ suite · **อ้างอิง:** M17 §5

### E-10
`area: E` · `module: M18` · `chapter: 16` · `level: K2` · `type: single` · `answer: A`

ความต่างระหว่าง `workers` กับ `--shard=i/n` ใน Playwright คือข้อใด

- A) workers = process ขนานในเครื่องเดียว · shard = แบ่ง suite ไปรันข้ามหลายเครื่อง/job
- B) workers ใช้กับ API test · shard ใช้กับ UI test
- C) shard ทำให้ test ใน shard เดียวกันรันขนาน ส่วน workers ไม่ใช่
- D) ทั้งสองคือสิ่งเดียวกัน

> **เหตุผล:** สองกลไกใช้ร่วมกันได้ · **อ้างอิง:** M18 §3, REF-090

### E-11
`area: E` · `module: M18` · `chapter: 16` · `level: K3` · `type: single` · `answer: D`

แบ่ง Playwright เป็น 4 shard ใน GitHub Actions แล้วต้องการ HTML report เดียว ขั้นตอนใดถูกต้อง

- A) ใช้ `--reporter=html` ทุก shard แล้วเปิดไฟล์ของ shard สุดท้าย
- B) รวมโฟลเดอร์ `test-results` แล้วเปิดด้วย browser
- C) ใช้ `--reporter=list` แล้ว copy ผลใส่ไฟล์
- D) ทุก shard ใช้ `--reporter=blob` upload เป็น artifact แล้ว job ถัดไป download มารวมด้วย `npx playwright merge-reports --reporter html ./all-blob-reports`

> **เหตุผล:** blob reporter ออกแบบมาสำหรับรวมผลข้าม shard · **อ้างอิง:** M18 §3, REF-090

### E-12
`area: E` · `module: M18` · `chapter: 16` · `level: K2` · `type: single` · `answer: B`

ทำไมขั้น upload artifact (report, trace) ใน workflow ควรมี `if: ${{ !cancelled() }}`

- A) เพื่อให้ upload เฉพาะเมื่อ test ผ่าน
- B) เพื่อให้ upload แม้ขั้น test ก่อนหน้าล้ม — ซึ่งเป็นตอนที่ต้องการ report/trace มากที่สุด
- C) เพื่อให้ job ไม่ถูกยกเลิก
- D) เพื่อลดขนาด artifact

> **เหตุผล:** ค่าปริยายของ step คือรันเมื่อขั้นก่อนหน้าสำเร็จ · **อ้างอิง:** M18 §2

### E-13
`area: E` · `module: M19` · `chapter: 17` · `level: K2` · `type: single` · `answer: C`

ผล load test: average 180 ms, p95 1,900 ms, SLO "p95 < 800 ms" ข้อใดสรุปถูกต้อง

- A) ผ่าน เพราะ average ต่ำกว่า 800 ms
- B) ผ่าน เพราะ request ส่วนใหญ่เร็ว
- C) ไม่ผ่าน — ผู้ใช้ราว 5% รอเกือบ 2 วินาที ซึ่ง average ซ่อนไว้
- D) สรุปไม่ได้จนกว่าจะรู้ p50

> **เหตุผล:** percentile สะท้อนประสบการณ์ของผู้ใช้กลุ่มช้า · SLO กำหนดที่ p95 · **อ้างอิง:** M19 §1

### E-14
`area: E` · `module: M19` · `chapter: 17` · `level: K2` · `type: single` · `answer: A`

ข้อใดอธิบายตัวเลข "automated testing จับปัญหา accessibility ได้ราว 57%" ได้ถูกต้องที่สุด

- A) เป็นตัวเลขของ Deque (ผู้พัฒนา axe) นับตาม *จำนวนปัญหา* ที่พบใน audit ของตน · ถ้านับตามจำนวน WCAG success criteria สัดส่วนจะต่ำกว่ามาก จึงยังต้องมี manual check
- B) เป็นมาตรฐาน WCAG 2.2 ที่กำหนดว่าเครื่องมือต้องจับได้ 57%
- C) แปลว่า axe ครอบคลุม success criteria 57% ของ WCAG
- D) แปลว่าถ้า axe ไม่พบ violation หน้านั้นผ่าน WCAG AA แล้ว

> **เหตุผล:** อ่านตัวเลขพร้อมแหล่งที่มาและวิธีนับ (vendor data) · keyboard และ screen reader ยังต้องตรวจเอง · **อ้างอิง:** M19 §2, REF-069

### E-15
`area: E` · `module: M19` · `chapter: 17` · `level: K3` · `type: multi` · `answer: A,D`

ผู้ทดสอบพบว่าเปลี่ยนเลข order ใน URL แล้วเห็น order ของลูกค้าคนอื่น (BUG-08) ควรจัดหมวดตามมาตรฐานใด **(เลือก 2 ข้อ)**

- A) OWASP Top 10:2025 — A01 Broken Access Control
- B) OWASP Top 10:2025 — A05 Injection
- C) OWASP API Security Top 10 2023 — API4 Unrestricted Resource Consumption
- D) OWASP API Security Top 10 2023 — API1 Broken Object Level Authorization (BOLA)

> **เหตุผล:** IDOR คือการเข้าถึง object ของคนอื่นโดยไม่ตรวจสิทธิ์ระดับ object · ไม่ใช่ injection หรือการใช้ทรัพยากรเกิน · **อ้างอิง:** M19 §4, M13 §7, REF-076, REF-006
