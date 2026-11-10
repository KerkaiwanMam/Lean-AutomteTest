# M21 — AI-Assisted Testing

> **Level 5 · Expert** · ⏱ 4 ชม. · Prerequisite: Level 4

## 🎯 Learning Objectives
1. ใช้ AI assistant (Claude, Copilot ฯลฯ) ช่วย **วิเคราะห์ requirement, ออกแบบ test, เขียน/refactor test code, debug**
2. ใช้ **AI agents + browser tools** (เช่น Playwright MCP) สำรวจและสร้าง test อย่างมีการควบคุม
3. ประเมิน **self-healing locators / AI visual testing** อย่างมีวิจารณญาณ
4. ทดสอบ **ระบบที่มี AI/LLM อยู่ข้างใน** เบื้องต้น
5. รู้ **ความเสี่ยง** (hallucination, ข้อมูลรั่ว, test ที่ assert ผิด) และวางกติกาการใช้ในทีม

---

## 📖 1. AI ช่วยตรงไหนได้บ้าง
| งาน | ตัวอย่าง prompt/การใช้ | ต้องตรวจอะไร |
|---|---|---|
| วิเคราะห์ requirement | "อ่าน REQ-PRC แล้วหาความกำกวม/กรณีที่ไม่ระบุ 10 ข้อ" | ความถูกต้องของคำถาม |
| ออกแบบ test | "สร้าง decision table ของคูปอง + ค่าส่ง ตาม REQ-PRC" | ค่าคาดหวังทุกช่อง (คำนวณเอง!) |
| เขียนโค้ด | "เขียน Playwright test ใช้ fixtures ใน src/fixtures/test.ts สำหรับ REQ-ORD-04" | locator, assertion, isolation |
| Refactor | "แยก locator ในไฟล์นี้ไปเป็น page object" | พฤติกรรมไม่เปลี่ยน (รันผ่าน) |
| Debug | แนบ error + trace "ทำไม click timeout" | root cause จริง ไม่ใช่เพิ่ม timeout |
| Test data | "สร้างที่อยู่ไทย 20 ชุดที่รหัสไปรษณีย์ถูกต้อง" | ไม่มีข้อมูลจริงของบุคคล |
| Review | "review test นี้ตาม checklist M20" | ใช้เป็นความเห็นที่สอง |

## 📖 2. Prompt ที่ดีสำหรับงานทดสอบ
```
บทบาท: Senior SDET
บริบท: ShopLab (Node/Express), Playwright TS, โครงสร้างตาม tests/playwright/src (fixtures, pages, api)
งาน: เขียน test สำหรับ REQ-ORD-04 (COD ≤ 5,000 บาท) ที่ชั้น API
ข้อกำหนด: ใช้ fixture userApi, ห้าม hard-code user, ใช้ buildCheckout(), BVA ที่ 5000.00/5000.01
ผลลัพธ์: โค้ด + คำอธิบายว่าเลือกข้อมูลสินค้าอย่างไรให้ได้ total ตามขอบ
```
หลัก: ให้บริบท (โค้ดจริง/spec) · ระบุมาตรฐานของทีม · ขอเหตุผล · **รันและตรวจเสมอ**

## 📖 3. AI agents & browser automation
- **Playwright MCP / browser agents**: AI ควบคุม browser ผ่าน accessibility tree → สำรวจหน้าเว็บ, สร้างร่าง test, ตอบคำถามเกี่ยวกับ UI
- **Playwright test agents** (planner / generator / healer) — สร้างแผนทดสอบจากการสำรวจ, generate test, เสนอแก้ test ที่พัง
- **การใช้อย่างปลอดภัย:** ใช้กับ **test environment** เท่านั้น · ไม่ให้ agent ใช้ credential จริง/production · review ทุก test ที่ generate · อย่าให้ "healer" แก้ assertion ให้ผ่านโดยไม่มีคนตรวจ (อาจซ่อนบั๊กจริง!)

> ⚠️ **กับดักใหญ่:** AI ที่ "แก้ test ให้ผ่าน" อาจเปลี่ยนค่าคาดหวังให้ตรงกับพฤติกรรมที่มีบั๊ก — ลองให้ AI แก้ test ที่ fail ใน Bug Mode แล้วดูว่ามันเสนอแก้ test หรือรายงานบั๊ก

## 📖 4. Self-healing & AI visual testing
- **Self-healing locators** (Healenium, เครื่องมือเชิงพาณิชย์): เมื่อ locator พังจะเดา element ใหม่ — ช่วยลด maintenance แต่ **ซ่อนการเปลี่ยนแปลง UI** และอาจคลิกผิดตัว → ต้องมีรายงานการ heal และให้คนอนุมัติ
- **AI visual diff** (เช่น Applitools): ผู้ผลิตระบุว่าแยก "การเปลี่ยนที่มีความหมาย" ออกจาก noise ของการ render (anti-aliasing, ฟอนต์) ได้ดีกว่า pixel diff — ยังไม่พบ benchmark อิสระ ควรทดลองกับหน้าจริงของทีมก่อนตัดสินใจ
- หลักการ: AI ช่วย **ลดงานซ้ำ** แต่ **ความรับผิดชอบต่อ oracle (ค่าคาดหวัง) อยู่ที่คน**

## 📖 5. ทดสอบระบบที่มี LLM (AI features)
- Output ไม่ deterministic → ใช้ **property-based / rubric-based assertions** (มีคำตอบภาษาไทย? ไม่มีข้อมูลส่วนบุคคล? อ้างอิงสินค้าที่มีจริง?) แทน string equality
- **Eval sets**: ชุดคำถาม + เกณฑ์ ให้คะแนนอัตโนมัติ (LLM-as-judge + human spot check)
- **Safety/security**: prompt injection, data leakage, jailbreak, bias, hallucination
- Non-functional: latency, cost per request, rate limit

## 📖 6. นโยบายการใช้ AI ในทีม QA (ตัวอย่าง)
1. ห้ามใส่ข้อมูลลูกค้า/ความลับบริษัท/credential ใน AI ที่ไม่ได้รับอนุมัติ
2. โค้ดที่ AI สร้างต้องผ่าน review และ `--repeat-each` เหมือนโค้ดที่คนเขียน
3. ค่าคาดหวังทางธุรกิจต้องมาจาก requirement/oracle ไม่ใช่จาก AI หรือจากพฤติกรรมของระบบ
4. ระบุใน PR ว่าใช้ AI ช่วยส่วนไหน

---

## 🧪 Lab 21.1 — AI pair (60 นาที)
ใช้ AI assistant สร้าง test สำหรับ REQ-ADM-03 (import CSV) ทั้ง happy/negative → รัน → บันทึกว่าต้องแก้อะไรบ้างจากโค้ดที่ได้ (locator? isolation? assertion?)

## 🧪 Lab 21.2 — The healer trap (30 นาที)
เปิด Bug Mode ให้ AI "แก้ test ที่ fail" ใน `cart-pricing.spec.ts` R4 — วิเคราะห์ว่าคำแนะนำถูกหรือผิด และเขียน guideline 3 ข้อ

## 🧪 Lab 21.3 — Requirement critique (30 นาที)
ให้ AI วิเคราะห์ REQUIREMENTS.md หาช่องโหว่ → คัดเลือกข้อที่สมเหตุสมผล → เปรียบเทียบกับคำถามที่คุณหาเองใน Lab 04.1

---

## ✅ Check Your Understanding
1. ทำไม AI ไม่ควรเป็นคนกำหนดค่าคาดหวัง?
2. ความเสี่ยงของ self-healing locators คืออะไร?
3. ทดสอบ chatbot ที่ตอบไม่เหมือนเดิมทุกครั้งอย่างไร?

<details><summary>เฉลย</summary>

1. อาจ hallucinate หรือเลียนแบบพฤติกรรมที่มีบั๊ก — oracle ต้องมาจาก requirement/การคำนวณอิสระ
2. ซ่อนการเปลี่ยน UI, คลิก element ผิดแต่ test ผ่าน, ทำให้ทีมไม่รู้ว่า locator strategy มีปัญหา
3. ใช้ rubric/property assertions, eval set + คะแนน, LLM-as-judge ร่วมกับ human review, ตรวจ safety
</details>

## 📋 Skills Checklist
- [ ] ใช้ AI ช่วยวิเคราะห์ requirement และเขียน test โดยตรวจผลได้
- [ ] อธิบายความเสี่ยงของ self-healing/healer agents
- [ ] ร่างนโยบายการใช้ AI ในทีมได้
