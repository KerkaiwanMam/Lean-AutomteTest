# Change Log

> รูปแบบต่อรายการ: **หัวข้อ/จุดที่แก้** · **เดิม → ใหม่** · **เหตุผล** · **อ้างอิง (REF-xxx)**
> ล่าสุดอยู่บนสุด

---

## 2026-11-10 — CL-005 · สร้างไฟล์โจทย์ที่แล็บอ้างถึง (Backlog P1 #5)

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `tests/playwright/tests/exercises/flaky.spec.ts` + `flaky.solution.spec.ts` | ไม่มี (M17 Lab 17.2 บอกว่า "instructor ให้ไฟล์") | โจทย์ 6 tests + เฉลย; project `exercises` แบบ opt-in (`EXERCISES=1`) | ผู้เรียนทำแล็บไม่ได้ถ้าไม่มีไฟล์ | REF-086 |
| 2 | `tests/playwright/tests/exercises/bad-checkout.spec.ts` | ไม่มี (M15 Lab 15.4) | test เขียว 3 ตัวที่มี smell ครบ 8 แบบ | โจทย์ refactor ต้องเริ่มจากของที่ผ่านอยู่ | – |
| 3 | `tests/robot/data/pricing.csv` + `tests/robot/solutions/06_pricing_datadriver.robot` | ไม่มี (M12 Lab 12.2) | CSV 11 แถว + เฉลย; `requirements.txt` เพิ่มบรรทัด optional | แล็บ DataDriver ต้องมีข้อมูลและเฉลยที่ยืนยันแล้ว | REF-087 |
| 4 | `docs/instructor/exercise-keys.md` | ไม่มี | เฉลย + ผลวัดจริงของทั้ง 3 แล็บ | ผู้สอนต้องมี answer key | – |
| 5 | M12 Lab 12.2, M15 Lab 15.4, M17 Lab 17.2 | ประโยคเดียว "instructor ให้…" | ระบุไฟล์ คำสั่งรัน เป้าหมาย เกณฑ์ผ่าน | ให้ผู้เรียนเริ่มได้เอง | REF-086, REF-087 |
| 6 | `playwright.config.ts`, `package.json` | – | project `exercises` (opt-in) + scripts `test:exercises:*` | ไม่ให้โจทย์ที่ตั้งใจพังปนกับชุดทดสอบปกติ — ยืนยันแล้ว `--list` ยังเป็น 110 tests | – |

**ผลที่ยืนยันด้วยการรันจริง:**
- `flaky.spec.ts` ×20 (8 workers): test 1 = 14/20, 2 = 15/20, 3 = 1/20, 4 = 0/20, 5 = 0/20, 6 = 10/20 · `flaky.solution.spec.ts` ×20 = **120/120 ผ่าน**
- `bad-checkout.spec.ts`: เขียว 3/3 (รัน 4 ครั้ง ~28–29 วินาที) · `tsc --noEmit` ผ่าน
- `06_pricing_datadriver.robot`: ปกติ 11/11 ผ่าน · Bug Mode fail 5/11 (R2, R4, R5, R6, R9)

**ข้อผิดพลาดของตัวเองที่แก้ระหว่างทาง:** (1) test 5 เดิม (hover menu overlay) ผ่าน 20/20 เพราะแอปถูกแก้ไปแล้ว ไม่ใช่โจทย์จริง → เปลี่ยนเป็น modal ที่เปิดค้าง; ลองอีกแบบ (context menu บังปุ่มข้างๆ) ก็ผ่านเช่นกัน จึงไม่ใช้ (2) สร้างไฟล์ log หลุดนอกโฟลเดอร์โปรเจกต์ครั้งหนึ่ง ลบแล้ว

**ข้อจำกัด:** test 4–5 fail ทุกรอบ (ไม่ได้ intermittent จริง) — ระบุไว้ใน exercise-keys แล้ว

---

## 2026-11-10 — CL-004 · ตรวจ Dockerfile ของ ShopLab (ไม่มีเนื้อหาหลักสูตรเปลี่ยน)

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `practice-app/.dockerignore` | ไม่มี | ตัด `node_modules`, `data`, `test`, Dockerfile ออกจาก build context | ไม่มีไฟล์นี้ `docker build` จะส่ง node_modules และฐานข้อมูล SQLite ทั้งก้อนเข้า context | – |
| 2 | `practice-app/Dockerfile` | ไม่มี comment เรื่อง test hooks | เพิ่ม comment: hooks เปิดโดยตั้งใจ ตั้ง `NODE_ENV=production` เพื่อปิด | ผู้ใช้ image ควรรู้ว่า `/api/test/*` เปิดอยู่ (REQ-SEC-05) | – |

**ผลการตรวจ:** Docker/Podman/WSL ไม่ได้ติดตั้งในเครื่อง จึง **ยังไม่ได้ build image จริง** · replay ขั้นตอนใน Dockerfile แบบ native ผ่าน: `npm ci --omit=dev` จากไฟล์ที่ COPY เท่านั้น → รันด้วย env ของ image → `/api/health` 200, หน้า `/` และ `/lab` 200, `BUG_MODE=1` เปิด bug mode ได้ · `NODE_ENV=production` → `/api/test/reset` ตอบ 404 ตามที่ comment ระบุ

---

## 2026-11-10 — CL-003 · Fact-check รอบที่ 1 (คิว 103 claims → todo 0)

**ผลรวม:** verified 22 · corrected 10 จุดใน claim + 6 จุดที่ตรวจเพิ่มนอกคิว · internal 10 · skip 61 (ไม่ใช่ข้อเท็จจริง: การออกแบบหลักสูตร, roadmap, คำสั่งแล็บ, คำถาม quiz)
**เครื่องมือ:** `extract_claims.py` → `apply_verdicts.py` (ใหม่) → `compare_versions.py` → `run_all.py` · verdicts อยู่ใน `fact-check-verdicts.csv`

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | M01 หลักการข้อ 3 | "หาบั๊กตอน requirement ถูกกว่าตอน production หลายสิบเท่า" | "หาบั๊กยิ่งเร็ว ยิ่งแก้ง่ายและถูกกว่า (ISTQB ไม่ได้ให้ตัวเลข — ตัวเลข 10–100 เท่า ที่อ้างกันบ่อยมีหลักฐานอ่อน)" | หลักการใน syllabus ไม่มีตัวเลขคูณ; หลักฐานของ cost curve ถูกวิจารณ์ว่าอ่อน | REF-001, REF-066 |
| 2 | M02 §6 Pairwise | "งานวิจัยพบว่าบั๊กส่วนใหญ่เกิดจาก interaction ของ 2 ปัจจัย" | "NIST (Kuhn et al. 2004): failure ส่วนใหญ่เกิดจากปัจจัยเดียวหรือสองปัจจัย (> 70% ในข้อมูลอุปกรณ์การแพทย์) ไม่พบเกิน 6 … ขั้นต่ำ 3 × 4 = 12" | ข้อความเดิมคลาดเคลื่อน (ละ "ปัจจัยเดียว") และไม่ระบุแหล่ง | REF-060, REF-067 |
| 3 | M02 Real-world notes | "(เร็วกว่า 100 เท่า)" | "(เร็วกว่ามาก — ดูเวลาต่อ test ในตาราง pyramid ของ M04)" | ตัวเลขคูณไม่มีการวัดรองรับ | – |
| 4 | M04 §3 Test pyramid | (ไม่มีหมายเหตุ) | เพิ่มหมายเหตุ: สัดส่วน % เป็นแนวทางคร่าวๆ; Cohn/Fowler ไม่ได้กำหนดตัวเลข | ป้องกันผู้เรียนเข้าใจว่า 60–70% เป็นมาตรฐาน | REF-045, REF-063 |
| 5 | M04 §5 DORA | 4 metrics รวม "time to restore" | 5 metrics 2 กลุ่ม (Throughput / Instability) + ชื่อใหม่ failed deployment recovery time + rework rate | DORA ปรับโมเดลแล้ว | REF-068, REF-046 |
| 6 | M05 §5 gTAA | อธิบายเป็น 4 "ชั้น" | เพิ่มหมายเหตุ: CTAL-TAE v2.0 เรียก capabilities, Test Generation ไม่บังคับ, มี 4 interfaces | ให้ตรง syllabus ฉบับปัจจุบัน | REF-002 |
| 7 | M07 §3 + locator cheat sheet | "open root → เจาะเข้าได้อัตโนมัติ" | เพิ่ม "(ยกเว้น XPath)" | docs ระบุว่า XPath ไม่เจาะ shadow root | REF-071 |
| 8 | M09 §4 + เฉลยข้อ 2 | "attached · visible · stable · enabled · รับ event ได้" | "visible · stable · receives events · enabled · not inert" + ตัวอย่าง fill() | รายการทางการไม่มี "attached" แยก และมี "not inert"; แต่ละ action ตรวจต่างกัน | REF-070 |
| 9 | M13 §1 | "เร็วกว่า UI 10–100 เท่า" | "เร็วกว่า UI มาก (ไม่ต้องเปิด browser และ render หน้า)" | ตัวเลขไม่มีการวัด | – |
| 10 | M13 §7 ตาราง OWASP API | หมวดตามชื่อฉบับ 2019 (Excessive data exposure, Mass assignment, Injection แยกแถว) | หมวดตามฉบับ 2023: API1, API2, API3 (รวม 2 หมวดเดิม), API4, API5 + หมายเหตุว่า Injection ไม่อยู่ใน API 2023 | ใช้ชื่อหมวดฉบับปัจจุบัน | REF-006 |
| 11 | M16 §1 ตาราง | "เร็วกว่า UI 50 เท่า" | "เร็วกว่าคลิกผ่าน UI มาก" | ตัวเลขไม่มีการวัด | – |
| 12 | M19 §2 a11y | "อัตโนมัติ (จับได้ ~30–50%)" | "Deque 2021: ~57% ของจำนวนปัญหา (ข้อมูลผู้ผลิต); นับตาม success criteria ต่ำกว่า (20–30%)" + ปรับเฉลยข้อ 2 | ตัวเลขเดิมไม่มีแหล่ง | REF-069 |
| 13 | M19 §4 ตาราง OWASP Top 10 | รหัสฉบับ 2021 (A02 Crypto, A03 Injection, A04 Insecure Design, A05 Misconfig, A07 Identification & Auth) | รหัสฉบับ 2025 (A02 Misconfig, A04 Crypto, A05 Injection, A06 Insecure Design, A07 Authentication Failures) + เพิ่มแถว A10 Mishandling of Exceptional Conditions + ปรับเฉลยข้อ 4 | OWASP Top 10:2025 ออกแล้ว | REF-076 |
| 14 | 01-course-overview ตาราง certification | "ISTQB Agile Tester / Test Automation Strategy" แถวเดียว · "Playwright (ไม่มีใบรับรองทางการ)" | แยก CTFL-AT และ CT-TAS (Specialist ต้องมี CTFL) · RFCP ระบุผู้ออก · Playwright "ไม่พบใบรับรองทางการจาก Microsoft/ทีม Playwright (มีของรายอื่น)" | ชื่อและเงื่อนไขใบรับรองให้ถูกต้อง | REF-077, REF-079 |
| 15 | 00-project-plan ตาราง priority | "งานจริงในบริษัท > 50% เป็น API/Integration" | "งานจริงจำนวนมากเป็น API/Integration และ business rule ทดสอบที่ API ได้เร็วและเสถียรกว่า" | ตัวเลขไม่มีแหล่ง | – |
| 16 | M20 §5 Test maturity | "อ้างอิงโมเดล: TMMi, TPI NEXT" | ระบุว่าเป็นฉบับย่อของหลักสูตร ชื่อระดับตาม TMMi (staged) และ TPI NEXT เป็นแบบ continuous | ไม่ให้เข้าใจว่าเป็นนิยามทางการของ TMMi | REF-082, REF-083 |
| 17 | M21 §4 | "Applitools แยกการเปลี่ยนที่มีความหมายกับ noise ได้ดีกว่า pixel diff" | "ผู้ผลิตระบุว่า … ยังไม่พบ benchmark อิสระ ควรทดลองกับหน้าจริง" | เป็นคำกล่าวอ้างของผู้ผลิต | REF-084 |
| 18 | M22 บรรทัด 5 | "เทียบเท่า "Practical Skills Exam" ของ CCNA" | "เทียบได้กับการสอบภาคปฏิบัติ (skills exam) ในหลักสูตร CCNA" | ยังไม่ได้ยืนยันชื่อการสอบที่แน่นอน | – |

**ยืนยันแล้ว ไม่ต้องแก้:** CTFL บทที่ 1/4/5 (M01–M03), CTAL-TAE บทที่ 1–2 และ 3 (M05, M15), 7 principles, Testing Trophy, ที่มาของ quadrants, Node ≥ 22.13, RF 7 VAR, RF 4 `--skiponfailure`, ZAP baseline, WebDriver W3C, Playwright test agents, RFCP

**Verification (ขั้นที่ 3):** `compare_versions.py` กับ backup ทั้ง 15 ไฟล์ — similarity 92–99.9%, ไม่มีหัวข้อหาย, ลำดับ section ไม่เปลี่ยน (เปลี่ยนชื่อหัวข้อ M13 §7 โดยตั้งใจ) · `run_all.py` ผ่านทั้ง 4 ตรวจ

**ข้อจำกัด:** `extract_claims.py` จับเฉพาะประโยคที่มีตัวเลข/ชื่อมาตรฐาน/ชื่อเครื่องมือ — ข้อเท็จจริงที่เขียนเป็นข้อความธรรมดาอาจหลุดคิว (เช่น ตาราง 7 principles ถูกตรวจเพิ่มด้วยมือ) · แหล่งที่ระบุ "via search summary" ยังไม่ได้เปิดอ่านต้นฉบับเต็ม

---

## 2026-11-10 — CL-002 · ตั้งระบบ workflow 4 ขั้นตอน + baseline audit

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | โครงสร้างโปรเจกต์ | ไม่มี | `1. memory folder`, `2. reference folder`, `3. asset folder`, `4. script folder` | ผู้ใช้กำหนดโครงสร้างการจัดเก็บและ workflow | – |
| 2 | `CLAUDE.md` (ใหม่) | ไม่มี | กติกา workflow 4 ขั้น + รูปแบบการตอบ + ห้ามใช้ sunline-eps-tests | ให้ทุก session ทำตามโดยอัตโนมัติ | – |
| 3 | `4. script folder/` | ไม่มี | `audit_structure.py`, `text_lint.py`, `extract_claims.py`, `check_links.py`, `compare_versions.py`, `run_all.py`, prompt templates | เครื่องมือสำหรับขั้นที่ 1–3 | – |
| 4 | `text_lint.py` | ตรวจคำไทยซ้ำแบบ regex ตรงๆ → false positive 3 จุด | เพิ่ม allowlist จาก `3. asset folder/lint-allowlist.txt` และตรวจขอบคำของ term ทั้งหน้าและหลัง | ภาษาไทยไม่มีเว้นวรรค ขอบคำที่ถูกต้องดูเหมือนคำซ้ำ: "ยกตัวอย่าง\|อย่างละ" (M03:115), "ทำไม\|ทำไม่ได้" (M07:123), "เป้าหมาย\|ตายตัว" (M20:37) — ตรวจด้วยตาแล้วถูกต้องทั้งหมด | – |
| 5 | `docs/modules/M22-capstone-and-career.md` บรรทัด 2 | (ไม่มีบรรทัดนี้) | `<!-- audit-exempt: lab, quiz, answers (capstone module …) -->` | M22 ตั้งใจไม่มี lab/quiz ท้ายบท เพราะ capstone + final exam แทน; ทำเครื่องหมายให้ audit รู้ แทนการแก้เนื้อหา | – |
| 6 | `2. reference folder/references.md` | ไม่มี | ดัชนีแหล่งอ้างอิง 31 รายการ (REF-001…065) สถานะ `candidate` | รวมแหล่งที่หลักสูตรอ้างแนวคิดมา เพื่อใช้ fact-check ต่อ — **ยังไม่ได้เปิดอ่านยืนยัน** | REF-001…065 |
| 7 | `3. asset folder/glossary.md`, `quotes.md` | ไม่มี | ศัพท์ 33 คำ (มีคอลัมน์ canonical spelling ให้ lint ใช้), quote 2 รายการ สถานะ candidate | คลังคำศัพท์และวัตถุดิบกลาง | REF-040 |
| 8 | `1. memory folder/fact-check-queue.csv` | ไม่มี | 105 claims จากเอกสารทั้งหมด สถานะ `todo` | คิวงาน fact-check ขั้นที่ 1 | – |

**ผล baseline (หลังแก้):** structure 22/22 OK · broken links 0 · text lint 0 · fact-check queue 105 todo
**เนื้อหาหลักสูตร:** ไม่มีการเปลี่ยนข้อความสอน (มีเพียง comment ใน M22)

---

## 2026-11-10 — CL-001 · สร้างหลักสูตร v1.0
สร้าง plan, overview, 22 modules, templates, cheat sheets, ShopLab, reference frameworks (Playwright/Robot), Postman, k6, CI, Dockerfile.
แก้ระหว่างทาง (จากผลการรันจริง): header ShopLab ลบ `aria-label` ที่ไม่ตรงข้อความ (axe `label-content-name-mismatch`), เมนู hover blur หลังคลิก, แยก project `ui-admin`, Robot `browser.resource`, Newman `disableCookies`, visual project แบบ opt-in, tsconfig สำหรับ TypeScript 7
