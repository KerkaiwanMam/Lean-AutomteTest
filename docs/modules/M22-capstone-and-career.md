# M22 — Capstone Project, Final Assessment & Career
<!-- audit-exempt: lab, quiz, answers (capstone module: the project and final exam replace labs and the end-of-module quiz) -->

> **Level 5 · Expert** · ⏱ 16 ชม. · Prerequisite: ทุกโมดูล
> เทียบได้กับการสอบภาคปฏิบัติ (skills exam) ในหลักสูตร CCNA — พิสูจน์ว่าทำได้จริง

## 🎯 Objectives
1. สร้าง **automation framework ครบวงจร** สำหรับ ShopLab จากศูนย์
2. พิสูจน์คุณค่าด้วย **Bug Mode detection rate**
3. นำเสนอและ **defend design decisions** ต่อกรรมการ
4. สร้าง **portfolio** และเตรียมสัมภาษณ์งาน

---

## 📖 1. Capstone Brief
> คุณเพิ่งเข้าทำงานเป็น Automation Engineer คนแรกของ ShopLab Co. — CTO ต้องการ:
> "ภายใน 2 สัปดาห์ ขอ regression ที่รันใน CI ทุก PR, จับบั๊กสำคัญได้ก่อนขึ้น production, และทีม dev ช่วยดูแลต่อได้"

**ขอบเขตบังคับ (Must)**
1. Repo ของตัวเอง + README (รันได้ใน ≤ 15 นาทีสำหรับคนใหม่)
2. Framework **Playwright (TS)** หรือ **Robot Framework** (เลือก 1 เป็นหลัก) ตาม architecture M15
3. Test ครอบคลุม: AUTH, REG, CAT, CART, PRC (decision table), ORD (state machine), SEC (authz/IDOR), ADM
4. ชั้น API + UI (ตาม pyramid) + DB check อย่างน้อย 2
5. Isolation: รัน parallel ได้ ผ่าน `--repeat-each=3` (หรือ pabot 4 processes ×3 รอบ)
6. CI pipeline พร้อม artifacts และ JUnit
7. Test Strategy (≤ 5 หน้า) + RTM + ADR ≥ 2

**ส่วนเสริม (Should/Could)** — ทำได้เพิ่มคะแนน: เครื่องมือที่ 2 (อีกตัว) · a11y · visual · k6 · Allure · Docker compose · Screenplay · mutation testing ด้วย Stryker บน `practice-app/src`

## 📖 2. เกณฑ์ประเมิน (Rubric) — 100 คะแนน
| หมวด | คะแนน | ระดับดีเยี่ยม |
|---|---|---|
| **Bug detection** (Bug Mode) | 25 | จับได้ ≥ 12/13 ตัว และ 0 false failure ใน normal mode |
| Test design | 15 | ใช้ EP/BVA/decision table/state transition ชัดเจน ผูก REQ ID |
| Architecture & code quality | 20 | ชั้นชัด, ไม่มี smell, อ่านง่าย, config/secrets ถูกต้อง |
| Reliability | 10 | 0 flaky ใน 3 รอบ parallel, ไม่มี sleep |
| CI/CD & reporting | 10 | pipeline เขียว/แดงถูกต้อง, artifacts, report อ่านง่าย |
| Documentation | 10 | README, strategy, RTM, ADR |
| Presentation & defense | 10 | อธิบาย trade-off ได้, ตอบคำถามกรรมการได้ |

**เกณฑ์ผ่าน:** ≥ 70 และ bug detection ≥ 10/13

**วิธีวัด detection rate**
```bash
# normal mode — ต้องเขียวทั้งหมด
npx playwright test                      # หรือ robot / pabot
# bug mode — นับ test ที่แดงตาม BUG-ID (ผู้สอนใช้ docs/instructor/bug-catalogue.md เทียบ)
BUG_MODE=1 npx playwright test           # PowerShell: $env:BUG_MODE="1"; npx playwright test
```

## 📖 3. Final Exam (ทฤษฎี, 60 ข้อ, 90 นาที)
สุ่มจากคำถามท้ายบท + scenario-based เช่น
- "test X fail เฉพาะใน CI ช่วงกลางคืน" — สาเหตุที่เป็นไปได้ 3 ข้อ + วิธีพิสูจน์
- "ออกแบบ BVA ของ REQ-ORD-04" · "วาด state table ของบัญชีผู้ใช้"
- "review โค้ด test ต่อไปนี้ หา smell 5 จุด"
เกณฑ์ผ่าน 75%

## 📖 4. Presentation (15 นาที + Q&A 10 นาที)
1. Context & strategy (risk) — 2 นาที
2. Architecture walkthrough — 4 นาที
3. Live demo: normal ✅ → Bug Mode ❌ → เปิด report/trace ชี้บั๊ก — 5 นาที
4. Metrics & what's next — 2 นาที
5. Lessons learned — 2 นาที

**คำถามกรรมการที่พบบ่อย:** ทำไมเลือกเครื่องมือนี้? test ไหนแพงที่สุดในการดูแลและทำไม? ถ้ามี 1,000 tests จะ scale อย่างไร? บั๊กตัวไหนจับไม่ได้ และทำไม? ถ้า dev เปลี่ยน UI ทั้งหน้า ต้องแก้กี่ไฟล์?

---

## 📖 5. Career Path
```
Manual Tester ─▶ QA Automation Engineer ─▶ Senior / SDET ─▶ QA Lead / Test Architect ─▶ Head of Quality / QA Manager
                                                     └──▶ Specialist: Performance · Security · Mobile · DevOps/SRE
```

| ตำแหน่ง | ทักษะหลักที่ตลาดคาดหวัง (2026) |
|---|---|
| QA Automation Engineer | Playwright/Robot/Selenium, API testing, Git, CI พื้นฐาน, SQL |
| Senior / SDET | ออกแบบ framework, TS/Python/Java แข็ง, CI/CD, Docker, contract testing, mentoring |
| Test Architect / Lead | test strategy, metrics, NFR, tool selection, stakeholder management, AI-assisted testing |

## 📖 6. Portfolio
- Repo capstone (public, ไม่มี secret) + README มีรูป report/pipeline badge
- บทความ/LinkedIn post: "จับ 13 บั๊กด้วย test 100 ตัว — สิ่งที่ได้เรียนรู้"
- ใบรับรอง: ISTQB CTFL → CTAL-TAE, RFCP
- Contribution: issue/PR เล็กๆ ใน open source (Robot Framework libraries, Playwright docs)

## 📖 7. Interview Prep — คำถามที่พบบ่อย
**Technical**
1. อธิบาย test pyramid และยกตัวอย่างจากงานจริง
2. ต่างกันอย่างไร: `waitForTimeout` vs auto-wait vs explicit wait
3. ออกแบบ framework ใหม่ให้ทีม — จะเริ่มอย่างไร?
4. จัดการ flaky test อย่างไร (ยกตัวอย่างที่เคยแก้)
5. ทดสอบ API ที่ต้อง login แบบ OAuth อย่างไร
6. เขียน locator สำหรับแถวในตารางที่ไม่มี id
7. ทำ test ให้รัน parallel ได้อย่างไร
8. Page Object vs Screenplay
9. ถ้า test ผ่านหมดแต่ production มีบั๊ก — วิเคราะห์อย่างไร
10. Live coding: automate login + assert error message (เตรียมทั้ง Playwright และ Robot)

**Behavioral (STAR)**: ครั้งที่ไม่เห็นด้วยกับ dev เรื่องบั๊ก · ครั้งที่ต้องเลือกว่าจะไม่ทดสอบอะไร · ครั้งที่ automation ช่วยทีมได้ชัดเจน

## 📋 Final Checklist ก่อนจบหลักสูตร
- [ ] Capstone ผ่าน rubric ≥ 70 และจับบั๊ก ≥ 10/13
- [ ] Final exam ≥ 75%
- [ ] Portfolio พร้อม (repo + README + report screenshot)
- [ ] ประเมินตัวเองด้วย Competency Matrix ใน [01-course-overview.md](../01-course-overview.md#6-competency-matrix-ใช้ประเมินตนเอง--ใช้ในการสัมภาษณ์งาน) และวางแผนพัฒนา 6 เดือน
