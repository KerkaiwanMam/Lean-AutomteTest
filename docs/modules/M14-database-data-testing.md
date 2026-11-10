# M14 — Database & Data Testing

> **Level 3 · Tools** · ⏱ 4 ชม. · Prerequisite: M13 · Reference: `tests/robot/tests/db/database_checks.robot`

## 🎯 Learning Objectives
1. เขียน **SQL** ที่ tester ใช้บ่อย (SELECT, WHERE, JOIN, GROUP BY, COUNT/SUM)
2. ตรวจ **data integrity** หลัง action ผ่าน UI/API (persisted, consistent, no orphan)
3. ใช้ **DatabaseLibrary** (Robot) และ driver ในโค้ด (Node/Python)
4. ทดสอบ **data migration / ETL / report** ด้วยแนวคิด reconciliation
5. เข้าใจความเสี่ยงด้าน **ข้อมูลส่วนบุคคล (PDPA)** ใน test data

---

## 📖 1. ทำไมต้องตรวจ database
UI แสดง "สั่งซื้อสำเร็จ" ไม่ได้แปลว่า: order ถูกบันทึก, ยอดถูก, stock ถูกตัด, ตะกร้าถูกล้าง — **ต้องพิสูจน์ที่แหล่งข้อมูล**
แต่ระวัง: test ที่ผูกกับ schema DB มาก จะเปราะเมื่อ dev เปลี่ยนโครงสร้าง → ตรวจ DB เมื่อ **API ไม่มีให้ตรวจ** หรือเป็น **data integrity rule**

## 📖 2. Schema ของ ShopLab (SQLite: `practice-app/data/shoplab.db`)
```
users(id, username, password_hash, email, role, status, failed_attempts, …)
products(id, sku, name, name_th, category, price, stock, active, …)
coupons(code, type, value, max_discount, min_subtotal, expires_at, active)
cart_items(id, user_id → users, product_id → products, qty)
orders(id, order_no, user_id → users, status, payment_method, subtotal, discount, shipping, vat, total, …)
order_items(id, order_id → orders, product_id → products, sku, name, price, qty)
reviews(id, product_id, user_id, rating, comment, created_at)
```
เปิดดูได้ด้วย [DB Browser for SQLite](https://sqlitebrowser.org/) หรือ VS Code extension "SQLite Viewer"

## 📖 3. SQL สำหรับ tester
```sql
-- order ล่าสุดของ user
SELECT o.order_no, o.status, o.total FROM orders o JOIN users u ON u.id = o.user_id
WHERE u.username = 'jane' ORDER BY o.created_at DESC LIMIT 1;

-- integrity: total = subtotal - discount + shipping + vat
SELECT order_no FROM orders WHERE ROUND(subtotal - discount + shipping + vat, 2) <> total;

-- integrity: subtotal = Σ order_items
SELECT o.order_no FROM orders o JOIN order_items i ON i.order_id = o.id
GROUP BY o.id HAVING ROUND(SUM(i.price * i.qty), 2) <> o.subtotal;

-- orphan: order_items ที่ไม่มี order
SELECT i.id FROM order_items i LEFT JOIN orders o ON o.id = i.order_id WHERE o.id IS NULL;

-- ไม่มี stock ติดลบ / รหัสผ่านไม่ถูกเก็บเป็น plain text
SELECT id FROM products WHERE stock < 0;
SELECT id FROM users WHERE password_hash NOT LIKE '%:%';
```

## 📖 4. DatabaseLibrary (Robot)
```robotframework
Library             DatabaseLibrary
Suite Setup         Connect To Database    sqlite3    database=${DB_PATH}    isolation_level=${None}
Suite Teardown      Disconnect From Database

Order Is Persisted With Items And Correct Totals
    ${resp}=    Checkout Via API
    ${order}=   Query    SELECT id, status, total FROM orders WHERE order_no = '${resp.json()}[orderNo]'
    Should Be Equal    ${order}[0][1]    PAID
    Check Row Count    SELECT id FROM cart_items WHERE user_id = ${user}[id]    ==    0
```
- DB อื่น: `pymysql` (MySQL), `psycopg2` (PostgreSQL), `oracledb` (Oracle), `pyodbc`/`pymssql` (SQL Server)
- ⚠️ ใช้ **parameterized query** เมื่อค่ามาจากภายนอก (`Query    SELECT … WHERE id = %s    parameters=${{ [id] }}`) — ฝึกนิสัยกัน SQL injection แม้ใน test

**ใน Node/Playwright** (ตัวอย่าง)
```ts
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('../../practice-app/data/shoplab.db', { readOnly: true });
const row = db.prepare('SELECT status FROM orders WHERE order_no = ?').get(order.orderNo);
```

## 📖 5. Data testing ในงานจริง
- **Migration testing:** นับแถว (row count) ต้นทาง = ปลายทาง · checksum/hash ต่อคอลัมน์ · sample record เทียบทีละ field · ตรวจ null/default/encoding (ภาษาไทย!)
- **ETL / report / feed file:** reconciliation — ยอดรวมใน report = SUM ใน source · ตรวจ format ไฟล์ (fixed-width, CSV, delimiter, BOM, encoding)
- **Data quality dimensions:** completeness, accuracy, consistency, timeliness, uniqueness, validity
- **ShopLab export CSV** — มี BOM (`﻿`) เพื่อให้ Excel แสดงไทยถูก → test ควรตรวจด้วย

## 📖 6. Test data & PDPA
- ห้ามใช้ข้อมูลลูกค้าจริงใน test env โดยไม่ **mask/anonymize**
- ใช้ **synthetic data** (Faker) หรือ data factory (`POST /api/test/users`)
- เก็บ connection string/รหัสผ่าน DB ใน secret store ไม่ใช่ใน repo

---

## 🧪 Lab 14.1 — SQL warm-up (45 นาที)
เขียน query: (1) สินค้าที่หมด (2) ยอดขายรวมต่อหมวดหมู่ (3) ผู้ใช้ที่ไม่เคยสั่งซื้อ (4) order ที่ใช้คูปอง (5) integrity checks ทั้ง 4 ข้อในหัวข้อ 3

## 🧪 Lab 14.2 — DB verification suite (60 นาที)
ต่อยอด `database_checks.robot`: หลัง **cancel order** stock กลับเท่าเดิม · หลัง **admin import CSV** แถวที่ถูกต้องถูกเพิ่ม/อัปเดตตรงตาม CSV · รันใน Bug Mode — test ใดจับ BUG-12 ได้?

## 🧪 Lab 14.3 — Export reconciliation (30 นาที)
ดาวน์โหลด `/api/admin/products/export.csv` (login admin) แล้วเขียนสคริปต์เทียบกับ `SELECT … FROM products` ทุกแถว ทุกคอลัมน์

---

## ✅ Check Your Understanding
1. เมื่อไรควรตรวจผ่าน DB แทน API?
2. Query ใดหา order ที่ยอดรวมไม่ตรงกับรายการสินค้า?
3. ทำไม migration test ต้องสนใจ encoding?
4. ทำไมต้อง `isolation_level=${None}` กับ sqlite ใน DatabaseLibrary?

<details><summary>เฉลย</summary>

1. เมื่อ API ไม่เปิดเผยข้อมูลนั้น, ตรวจ integrity ข้ามตาราง, ตรวจ side effect (audit log, ข้อมูลถูกลบจริง), migration/ETL
2. JOIN orders กับ order_items, GROUP BY order, HAVING SUM(price*qty) <> subtotal
3. ข้อมูลภาษาไทย/อักขระพิเศษอาจเพี้ยน (เช่น TIS-620 → UTF-8) โดย row count ยังตรง
4. ให้ sqlite3 ทำงานแบบ autocommit — อ่านเห็นข้อมูลล่าสุดที่แอปเขียน และไม่ล็อก DB ค้างระหว่าง test
</details>

## 📋 Skills Checklist
- [ ] เขียน SQL JOIN/GROUP BY/HAVING ได้
- [ ] ออกแบบ integrity checks ของระบบได้
- [ ] ใช้ DatabaseLibrary หรือ driver ในโค้ดได้
- [ ] อธิบายแนวทาง migration/ETL testing ได้
