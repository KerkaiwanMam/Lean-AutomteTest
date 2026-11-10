# ShopLab — Software Requirements Specification (SRS)

> เอกสารนี้คือ "requirement" ที่ผู้เรียนใช้ออกแบบ test case (Module 02–03) และทำ traceability matrix
> ทุกข้อมี ID เพื่ออ้างอิงใน test case / bug report / automation tag

## 1. Authentication — REQ-AUTH

| ID | Requirement |
|---|---|
| REQ-AUTH-01 | ผู้ใช้เข้าสู่ระบบด้วย username + password; สำเร็จแล้ว customer ไปหน้า `/`, admin ไปหน้า `/admin` |
| REQ-AUTH-02 | ช่อง username และ password เป็น required — แสดง "Username is required" / "Password is required" |
| REQ-AUTH-03 | ข้อมูลผิด (ไม่ว่าจะ username ไม่มีในระบบหรือ password ผิด) ต้องแสดงข้อความเดียวกัน: "Invalid username or password" |
| REQ-AUTH-04 | บัญชีสถานะ `locked` เข้าสู่ระบบไม่ได้ — HTTP 423 "Account is locked. Please contact support." |
| REQ-AUTH-05 | ใส่รหัสผิดติดกัน 5 ครั้ง บัญชี customer ถูก lock อัตโนมัติ (admin ไม่ถูก lock) |
| REQ-AUTH-06 | Logout ต้องทำให้ token เดิมใช้ไม่ได้อีก (HTTP 401) |
| REQ-AUTH-07 | หน้าที่ต้อง login (cart, checkout, orders) ถ้ายังไม่ login ให้ไปหน้า `/login?next=<path>` และกลับมาหน้าเดิมหลัง login |

## 2. Registration — REQ-REG

| ID | Field / Rule |
|---|---|
| REQ-REG-01 | username: 4–20 ตัวอักษร a-z A-Z 0-9 _ ; ห้ามซ้ำ (ไม่สนตัวพิมพ์เล็ก/ใหญ่) |
| REQ-REG-02 | email: รูปแบบถูกต้อง ; ห้ามซ้ำ |
| REQ-REG-03 | password: 8–64 ตัว ต้องมี ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ |
| REQ-REG-04 | confirm password ต้องตรงกับ password |
| REQ-REG-05 | full name: 2–100 ตัวอักษร |
| REQ-REG-06 | phone: 10 หลัก ขึ้นต้นด้วย 0 |
| REQ-REG-07 | อายุ (คำนวณจาก birth date ณ วันที่สมัคร) ต้องอยู่ระหว่าง **18 ถึง 60 ปี (รวมขอบ)** |
| REQ-REG-08 | province: ต้องเลือกจากรายการ |
| REQ-REG-09 | gender, interests: optional |
| REQ-REG-10 | avatar: optional, PNG/JPEG, ไม่เกิน 1 MB |
| REQ-REG-11 | ต้องติ๊กยอมรับเงื่อนไข |

## 3. Catalogue — REQ-CAT

| ID | Requirement |
|---|---|
| REQ-CAT-01 | แสดงสินค้า active หน้าละ 8 ชิ้น (API: pageSize 1–50) พร้อม "Showing X–Y of N products" |
| REQ-CAT-02 | ค้นหาจากชื่อ EN, ชื่อ TH หรือ SKU แบบ **ไม่สนตัวพิมพ์เล็ก/ใหญ่** |
| REQ-CAT-03 | กรองตามหมวดหมู่, ช่วงราคา (min/max รวมขอบ), เฉพาะสินค้ามีของ |
| REQ-CAT-04 | เรียงตาม ชื่อ A–Z/Z–A, ราคา ต่ำ→สูง/สูง→ต่ำ (**เชิงตัวเลข**), rating, ใหม่สุด |
| REQ-CAT-05 | การแบ่งหน้าต้องแสดงสินค้าครบทุกชิ้น ไม่ซ้ำ ไม่ตกหล่น |
| REQ-CAT-06 | สินค้าหมด (stock = 0) แสดงป้าย "Out of stock" และปุ่ม Add to cart ใช้ไม่ได้ |
| REQ-CAT-07 | ถ้า API ผิดพลาด แสดงข้อความ error และปุ่ม Retry |

## 4. Cart — REQ-CART

| ID | Requirement |
|---|---|
| REQ-CART-01 | จำนวนต่อสินค้าในตะกร้า 1–10 ชิ้น (รวมของที่มีอยู่แล้ว) |
| REQ-CART-02 | เพิ่มเกิน stock ไม่ได้ (409 INSUFFICIENT_STOCK / OUT_OF_STOCK) |
| REQ-CART-03 | แก้จำนวน / ลบรายการ / ล้างตะกร้าได้ ยอดคำนวณใหม่ทันที |

## 5. Pricing — REQ-PRC (ราคาสินค้าไม่รวม VAT)

| ID | Rule |
|---|---|
| REQ-PRC-01 | subtotal = Σ (price × qty) |
| REQ-PRC-02 | ใช้คูปองได้ 1 ใบ: **SAVE10** ลด 10% สูงสุด 500 ฿ · **BIG500** ลด 500 ฿ เมื่อ subtotal ≥ 3,000 · **FREESHIP** ส่งฟรีแบบ standard · **EXPIRED20** หมดอายุแล้ว · **DISABLED** ใช้ไม่ได้ |
| REQ-PRC-03 | ค่าส่ง standard 50 ฿ — **ฟรีเมื่อ (subtotal − discount) ≥ 1,000 ฿** |
| REQ-PRC-04 | ค่าส่ง express 120 ฿ เสมอ (FREESHIP ไม่มีผล) |
| REQ-PRC-05 | VAT 7% คิดจาก (subtotal − discount + shipping) ปัดทศนิยม 2 ตำแหน่ง |
| REQ-PRC-06 | total = subtotal − discount + shipping + VAT |
| REQ-PRC-07 | ข้อความคูปอง: "Coupon X applied" / "Coupon code is invalid" / "Coupon has expired" / "Subtotal is too low for this coupon" |

### Decision table (ตัวอย่างสำหรับ Module 02)

| Rule | Coupon | Shipping | (Subtotal − Discount) ≥ 1000 | Discount | Shipping fee |
|---|---|---|---|---|---|
| R1 | none | standard | No | 0 | 50 |
| R2 | none | standard | Yes | 0 | 0 |
| R3 | SAVE10 | standard | No | 10% (≤500) | 50 |
| R4 | SAVE10 | standard | Yes | 10% (≤500) | 0 |
| R5 | FREESHIP | standard | – | 0 | 0 |
| R6 | any | express | – | per coupon | 120 |
| R7 | BIG500 & subtotal < 3000 | – | – | 0 + error | per rule |
| R8 | EXPIRED20 | – | – | 0 + error | per rule |

## 6. Orders — REQ-ORD

| ID | Requirement |
|---|---|
| REQ-ORD-01 | Checkout 3 ขั้น: Address → Payment → Review → Done; ย้อนกลับได้ |
| REQ-ORD-02 | Address: ชื่อ, เบอร์ (10 หลักขึ้นต้น 0), ที่อยู่, เขต, จังหวัด, รหัสไปรษณีย์ 5 หลัก |
| REQ-ORD-03 | บัตร: 16 หลัก ผ่าน Luhn, MM/YY ยังไม่หมดอายุ, CVV 3 หลัก, ชื่อบนบัตร · บัตร 4000 0000 0000 0002 ถูกปฏิเสธ (402) |
| REQ-ORD-04 | COD ได้เมื่อ total ≤ 5,000 ฿ |
| REQ-ORD-05 | State machine: `PENDING→PAID|CANCELLED`, `PAID→SHIPPED|CANCELLED`, `SHIPPED→DELIVERED`; สถานะอื่นเปลี่ยนไม่ได้ (409) · บัตร = PAID ทันที, COD = PENDING |
| REQ-ORD-06 | สร้าง order แล้ว ตัด stock และล้างตะกร้า; ยกเลิก order ต้อง **คืน stock** |
| REQ-ORD-07 | เลข order รูปแบบ `SL-YYYYMMDD-NNNN` |
| REQ-ORD-08 | ลูกค้าดาวน์โหลดใบแจ้งหนี้ CSV ของ order ตัวเองได้ |

## 7. Security — REQ-SEC

| ID | Requirement |
|---|---|
| REQ-SEC-01 | ผู้ใช้เห็น/แก้ได้เฉพาะ order ของตัวเอง — order ของคนอื่นตอบ 404 |
| REQ-SEC-02 | Endpoint `/api/admin/*` และการแก้สินค้า ใช้ได้เฉพาะ admin (401 ไม่ login / 403 ไม่ใช่ admin) |
| REQ-SEC-03 | ข้อความที่ผู้ใช้กรอก (รีวิว) ต้องแสดงเป็น text ไม่ถูกตีความเป็น HTML |
| REQ-SEC-04 | รหัสผ่านเก็บแบบ hash เท่านั้น |
| REQ-SEC-05 | Test hooks (`/api/test/*`) ต้องปิดใน production (`NODE_ENV=production`) |

## 8. Back office — REQ-ADM

| ID | Requirement |
|---|---|
| REQ-ADM-01 | Dashboard แสดงจำนวนผู้ใช้, สินค้า, สินค้าหมด, orders, รายได้ (PAID+SHIPPED+DELIVERED) |
| REQ-ADM-02 | เพิ่ม/แก้/ลบ (soft delete) สินค้า; SKU รูปแบบ `AAAA-999` ห้ามซ้ำ |
| REQ-ADM-03 | Import สินค้าจาก CSV (sku,name,category,price,stock) — แถวที่ผิดรายงานเลขบรรทัด; Export CSV |
| REQ-ADM-04 | เปลี่ยนสถานะ order ตาม REQ-ORD-05 |
| REQ-ADM-05 | Lock/Unlock ผู้ใช้ (ห้าม lock ตัวเอง) |

## 9. Non-functional — REQ-NFR

| ID | Requirement |
|---|---|
| REQ-NFR-01 | p95 response time ของ API < 500 ms ที่ 20 concurrent users |
| REQ-NFR-02 | หน้าเว็บหลักผ่าน WCAG 2.1 AA ระดับ serious/critical = 0 |
| REQ-NFR-03 | รองรับ Chrome, Firefox, Safari (WebKit) และหน้าจอมือถือ ≥ 375px |
| REQ-NFR-04 | UI รองรับภาษาไทยและอังกฤษ |
