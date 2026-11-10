'use strict';
/**
 * Deterministic seed data. Every call to POST /api/test/reset restores exactly this state,
 * so tests can rely on known IDs, prices and stock levels.
 *
 * TEST ACCOUNTS (local practice app only — never reuse real passwords here)
 *   customer / Passw0rd!   regular customer, empty cart, no orders
 *   jane     / Passw0rd!   customer with 3 existing orders (used for IDOR & history labs)
 *   admin    / Admin123!   administrator (back-office)
 *   locked   / Passw0rd!   account with status=locked
 *   slow     / Passw0rd!   login takes ~3 seconds (practice timeouts)
 */
const users = [
  { username: 'customer', password: 'Passw0rd!', email: 'customer@shoplab.test', full_name: 'Somchai Customer', role: 'customer', status: 'active', phone: '0812345678' },
  { username: 'jane', password: 'Passw0rd!', email: 'jane@shoplab.test', full_name: 'Jane Doe', role: 'customer', status: 'active', phone: '0898765432' },
  { username: 'admin', password: 'Admin123!', email: 'admin@shoplab.test', full_name: 'Alice Admin', role: 'admin', status: 'active', phone: '0800000001' },
  { username: 'locked', password: 'Passw0rd!', email: 'locked@shoplab.test', full_name: 'Larry Locked', role: 'customer', status: 'locked', phone: '0800000002' },
  { username: 'slow', password: 'Passw0rd!', email: 'slow@shoplab.test', full_name: 'Sam Slow', role: 'customer', status: 'active', phone: '0800000003' },
];

// [sku, name, name_th, category, price, stock, rating]
// Prices are VAT-exclusive. Several prices sit on business-rule boundaries
// (999 / 1000 / 1001 around the free-shipping threshold, 3000 for BIG500).
const productRows = [
  ['ELEC-001', 'Wireless Mouse', 'เมาส์ไร้สาย', 'electronics', 499, 50, 4.3],
  ['ELEC-002', 'Mechanical Keyboard', 'คีย์บอร์ดแมคคานิคอล', 'electronics', 2590, 20, 4.7],
  ['ELEC-003', 'USB-C Hub 7-in-1', 'ยูเอสบี-ซี ฮับ 7 พอร์ต', 'electronics', 1000, 35, 4.1],
  ['ELEC-004', '27" 4K Monitor', 'จอมอนิเตอร์ 27 นิ้ว 4K', 'electronics', 12900, 8, 4.6],
  ['ELEC-005', 'Noise Cancelling Headphones', 'หูฟังตัดเสียงรบกวน', 'electronics', 7990, 12, 4.8],
  ['ELEC-006', 'Webcam Full HD', 'เว็บแคม Full HD', 'electronics', 1290, 0, 3.9],
  ['ELEC-007', 'Power Bank 20000mAh', 'พาวเวอร์แบงก์ 20000mAh', 'electronics', 899, 60, 4.2],
  ['BOOK-001', 'Clean Code', 'คลีนโค้ด', 'books', 1001, 15, 4.5],
  ['BOOK-002', 'The Art of Software Testing', 'ศิลปะการทดสอบซอฟต์แวร์', 'books', 999, 10, 4.4],
  ['BOOK-003', 'Agile Testing', 'การทดสอบแบบอไจล์', 'books', 1150, 7, 4.6],
  ['BOOK-004', 'Lessons Learned in Software Testing', 'บทเรียนจากการทดสอบซอฟต์แวร์', 'books', 890, 9, 4.7],
  ['BOOK-005', 'Explore It!', 'สำรวจมัน!', 'books', 750, 11, 4.3],
  ['BOOK-006', 'Python for Testers', 'ไพธอนสำหรับนักทดสอบ', 'books', 650, 25, 4.0],
  ['FASH-001', 'Cotton T-Shirt', 'เสื้อยืดคอตตอน', 'fashion', 290, 100, 4.1],
  ['FASH-002', 'Denim Jacket', 'แจ็กเก็ตยีนส์', 'fashion', 1890, 14, 4.4],
  ['FASH-003', 'Running Shoes', 'รองเท้าวิ่ง', 'fashion', 3000, 18, 4.6],
  ['FASH-004', 'Baseball Cap', 'หมวกแก๊ป', 'fashion', 350, 40, 3.8],
  ['FASH-005', 'Leather Wallet', 'กระเป๋าสตางค์หนัง', 'fashion', 1200, 22, 4.2],
  ['HOME-001', 'Coffee Maker', 'เครื่องชงกาแฟ', 'home', 2490, 9, 4.5],
  ['HOME-002', 'Desk Lamp LED', 'โคมไฟตั้งโต๊ะ LED', 'home', 590, 30, 4.0],
  ['HOME-003', 'Ergonomic Chair', 'เก้าอี้เพื่อสุขภาพ', 'home', 5990, 5, 4.7],
  ['HOME-004', 'Air Purifier', 'เครื่องฟอกอากาศ', 'home', 4590, 6, 4.4],
  ['HOME-005', 'Bamboo Cutting Board', 'เขียงไม้ไผ่', 'home', 320, 45, 4.1],
  ['SPRT-001', 'Yoga Mat', 'เสื่อโยคะ', 'sports', 690, 33, 4.3],
  ['SPRT-002', 'Dumbbell Set 10kg', 'ชุดดัมเบล 10 กก.', 'sports', 1490, 16, 4.5],
  ['SPRT-003', 'Water Bottle 1L', 'ขวดน้ำ 1 ลิตร', 'sports', 250, 80, 4.2],
  ['SPRT-004', 'Bicycle Helmet', 'หมวกกันน็อกจักรยาน', 'sports', 1350, 12, 4.4],
  ['SPRT-005', 'Jump Rope', 'เชือกกระโดด', 'sports', 150, 0, 3.7],
];

const products = productRows.map(([sku, name, name_th, category, price, stock, rating]) => ({
  sku,
  name,
  name_th,
  category,
  price,
  stock,
  rating,
  description: `${name} — practice product for ShopLab. Category: ${category}.`,
  image: `/img/${category}.svg`,
  active: 1,
}));

const coupons = [
  { code: 'SAVE10', type: 'percent', value: 10, max_discount: 500, min_subtotal: 0, expires_at: '2099-12-31T23:59:59Z', active: 1 },
  { code: 'BIG500', type: 'fixed', value: 500, max_discount: null, min_subtotal: 3000, expires_at: '2099-12-31T23:59:59Z', active: 1 },
  { code: 'FREESHIP', type: 'freeship', value: 0, max_discount: null, min_subtotal: 0, expires_at: '2099-12-31T23:59:59Z', active: 1 },
  { code: 'EXPIRED20', type: 'percent', value: 20, max_discount: null, min_subtotal: 0, expires_at: '2020-01-01T00:00:00Z', active: 1 },
  { code: 'DISABLED', type: 'percent', value: 50, max_discount: null, min_subtotal: 0, expires_at: '2099-12-31T23:59:59Z', active: 0 },
];

// Existing orders for jane (user index 1). product refs by SKU.
const orders = [
  { user: 'jane', status: 'DELIVERED', created_at: '2026-01-15T09:30:00Z', payment_method: 'card', items: [['BOOK-002', 1], ['FASH-001', 2]], coupon: null, shipping_method: 'standard' },
  { user: 'jane', status: 'SHIPPED', created_at: '2026-03-02T14:05:00Z', payment_method: 'card', items: [['ELEC-002', 1]], coupon: 'SAVE10', shipping_method: 'express' },
  { user: 'jane', status: 'PENDING', created_at: '2026-04-20T08:00:00Z', payment_method: 'cod', items: [['SPRT-003', 3]], coupon: null, shipping_method: 'standard' },
];

const reviews = [
  { sku: 'ELEC-002', user: 'jane', rating: 5, comment: 'Great typing feel!', created_at: '2026-03-10T10:00:00Z' },
  { sku: 'ELEC-002', user: 'customer', rating: 4, comment: 'A bit loud but solid.', created_at: '2026-03-12T11:00:00Z' },
  { sku: 'BOOK-002', user: 'jane', rating: 5, comment: 'A classic for every tester.', created_at: '2026-02-01T12:00:00Z' },
];

const address = {
  fullName: 'Jane Doe', phone: '0898765432', line1: '99 Sukhumvit Rd', district: 'Watthana', province: 'Bangkok', postcode: '10110',
};

module.exports = { users, products, coupons, orders, reviews, address };
