# M17 — Reliability: Flaky Tests, Waits & Debugging

> **Level 4 · Engineering** · ⏱ 5 ชม. · Prerequisite: M10/M12, M16

## 🎯 Learning Objectives
1. นิยามและ **วัด flaky rate** ของ suite
2. วินิจฉัย **root cause** ของ flaky test ตามหมวด (timing, data, environment, test design, product)
3. ใช้ **wait strategy** ที่ถูกต้อง และเลิกใช้ fixed sleep
4. ใช้เครื่องมือ debug: trace viewer, video, HAR, logs, `--repeat-each`, Robot log
5. ออกแบบ **quarantine process** และนโยบาย retry ที่ไม่ซ่อนปัญหา

---

## 📖 1. Flaky test คืออะไร และทำไมอันตราย
Test ที่ผลไม่คงที่โดยที่โค้ด/ข้อมูลไม่เปลี่ยน → ทีม **เลิกเชื่อ** ผล automation → "rerun จนเขียว" → บั๊กจริงหลุด
**Flaky rate** = test ที่ทั้ง pass และ fail ใน N รอบ / ทั้งหมด → เป้าหมาย < 1%

## 📖 2. หมวดของสาเหตุ
| หมวด | ตัวอย่าง | ShopLab ฝึกได้ที่ |
|---|---|---|
| **Timing / async** | อ่านค่าก่อน API ตอบ, animation, debounce | chaos `latencyMs`, `/lab` dynamic loading |
| **Test data** | ใช้ข้อมูลร่วมกัน, สมมติลำดับ | ใช้ `customer` ร่วมกันใน parallel |
| **Test order dependency** | test B พึ่ง state จาก test A | ลองรัน test เดี่ยวๆ |
| **Environment** | network, CPU ช้าใน CI, timezone, ขนาดจอ | `--workers=16` บนเครื่องช้า |
| **Locator** | match หลาย element, ข้อความเปลี่ยน | ปุ่ม "Start" vs "Start progress" |
| **UI overlay** | toast/menu/modal บัง | hover menu ค้าง (`/lab` card 6) |
| **External dependency** | third party ช้า/ล่ม | `/api/lab/flaky`, chaos `failureRate` |
| **Product bug จริง** | race condition ในระบบ | สั่งซื้อพร้อมกัน |

> 💡 บางครั้ง "flaky" คือ **บั๊กจริงของระบบ** (race condition) — อย่ารีบโทษ test

## 📖 3. Wait strategy
| ❌ ไม่ควร | ✅ ควร |
|---|---|
| `sleep(5)` / `waitForTimeout` / `Sleep 5s` | web-first assertion (`toHaveText`, `Get Text ==`) |
| `isVisible()` แล้ว `if` | `expect(locator).toBeVisible()` |
| เพิ่ม timeout ทั้ง suite | เพิ่มเฉพาะจุดที่ช้าโดยธรรมชาติ (`{ timeout: 10_000 }`) |
| poll เองด้วย loop | `expect.poll`, `Wait For Condition`, `Wait Until Keyword Succeeds` |
| รอ "network idle" ทั่วไป | รอ **response ที่เจาะจง** (`waitForResponse('**/api/cart/quote')`) |
| อ่านค่าครั้งเดียว | assertion ที่ retry |

## 📖 4. Debugging toolkit
**Playwright**
- `trace.zip` → `npx playwright show-trace` (DOM ทุก step, network, console, source)
- `--headed --workers=1 --debug`, `page.pause()`, UI mode
- `--repeat-each=20 -g "<test>"` ทำให้ flaky โผล่
- `--workers=1` ผ่าน แต่ parallel fail → **ปัญหาข้อมูล/isolation**
- รันเฉพาะ test เดียวผ่าน แต่ทั้งไฟล์ fail → **order dependency**

**Robot**
- `log.html` + screenshot อัตโนมัติ (`run_on_failure`) · `--loglevel DEBUG/TRACE` · `Set Browser Timeout` · tracing ของ Browser library (`tracing=retain-on-failure` ใน `New Context`)

**ทั่วไป**: HAR, server log (เช่น ShopLab console), timestamp ของ request เทียบกับ action

## 📖 5. กระบวนการจัดการ flaky (Quarantine)
```
พบ flaky ─▶ สร้าง ticket (owner, หลักฐาน trace) ─▶ tag @flaky / [Tags] flaky
   ─▶ ย้ายออกจาก gate (ยังรันแยก รายงานผล) ─▶ แก้ root cause ภายใน SLA (เช่น 5 วันทำการ)
   ─▶ ผ่าน --repeat-each=50 ─▶ นำกลับเข้า suite หลัก
```
- **Retry policy:** `retries: 1` ใน CI ได้ — แต่ต้อง **รายงาน test ที่ "flaky" (ผ่านหลัง retry)** ใน report และติดตามแนวโน้ม ไม่ใช่ซ่อน
- Robot: `--rerunfailed` + `rebot --merge` / `--skiponfailure flaky`

## 📖 6. Case studies จากการสร้าง reference framework
| อาการ | สาเหตุ | การแก้ |
|---|---|---|
| `toBeDisabled()` หา element ไม่เจอระหว่าง login ช้า | accessible name ของปุ่มเปลี่ยนเป็น "Signing in…" | ใช้ `getByTestId('login-button')` |
| right-click timeout "subtree intercepts pointer events" | เมนู hover เปิดค้างจาก `:focus-within` | แอป blur ตัวเลือกหลังคลิก + test ย้ายเมาส์ออก |
| catalog เห็น 29 แทน 28 แบบสุ่ม | admin test สร้างสินค้าพร้อมกัน | แยก project `ui-admin` รันหลัง |
| Robot Drag And Drop ไม่ทำงาน | keyword ใช้ mouse coordinate ไม่ auto-scroll | `Scroll To Element` ก่อน + `steps=10` |
| Newman 401 test ได้ 200 | cookie jar ส่ง cookie จาก login | `disableCookies` |
| pabot fail 44/44 | ไม่ได้ activate venv | activate ก่อนรัน |

---

## 🧪 Lab 17.1 — Flaky hunting (60 นาที)
1. ตั้ง chaos `{"latencyMs": 1500}` → รัน `npx playwright test --project=ui` · test ไหน fail? เพราะ timeout หรือ logic?
2. ตั้ง `{"failureRate": 0.3}` → รัน catalog tests `--repeat-each=5` · อธิบายผล · ควรแก้ที่ test หรือที่ระบบ?
3. รีเซ็ต config

## 🧪 Lab 17.2 — Fix the flaky (60 นาที)
ไฟล์โจทย์: [`tests/playwright/tests/exercises/flaky.spec.ts`](../../tests/playwright/tests/exercises/flaky.spec.ts) — 6 tests ซึ่งแต่ละตัวมีสาเหตุต่างกัน (sleep, อ่านค่าครั้งเดียว, ข้อมูลร่วม, locator กว้าง, overlay, dependency ภายนอก/order) **บั๊กอยู่ที่ตัว test ไม่ใช่ที่ ShopLab**
```bash
cd tests/playwright
# PowerShell: $env:EXERCISES="1"   (bash: export EXERCISES=1)
npx playwright test tests/exercises/flaky.spec.ts --project=exercises --repeat-each=20 --workers=8
```
Test 1–2 ถูกทำให้ช้าแบบ **ทำซ้ำได้** ตาม `testInfo.repeatEachIndex` (รอบที่ 0 = ไม่ช้า → "รันที่เครื่องฉันผ่าน") · **เป้าหมาย:** ทั้ง 6 ตัวผ่าน 20/20 โดย **ไม่เพิ่ม timeout และไม่ลบ assertion** · เฉลยสำหรับผู้สอน: `flaky.solution.spec.ts` + [instructor/exercise-keys.md](../instructor/exercise-keys.md)

## 🧪 Lab 17.3 — Quarantine policy (30 นาที)
เขียนนโยบาย flaky test 1 หน้าสำหรับทีม: นิยาม, การตรวจจับ, SLA, owner, metrics

---

## ✅ Check Your Understanding
1. test ผ่านเมื่อ `--workers=1` แต่ fail เมื่อ parallel — สงสัยอะไรก่อน?
2. ทำไม retry อย่างเดียวไม่ใช่การแก้ flaky?
3. ทางเลือกของ `waitForTimeout(3000)` หลังกด Apply coupon คืออะไร?
4. เมื่อไร flaky test เป็นสัญญาณของบั๊กในระบบ?

<details><summary>เฉลย</summary>

1. ข้อมูลร่วมกัน/isolation หรือทรัพยากรร่วม (port, ไฟล์, account)
2. ซ่อนปัญหา ทำให้ suite ช้าลง และอาจซ่อนบั๊กจริงที่เกิดเป็นครั้งคราว (race condition)
3. `waitForResponse('**/api/cart/quote')` พร้อมคลิก หรือ `expect(total).toHaveText(...)`
4. เมื่อ fail ตอน concurrency/timing ที่ผู้ใช้ทำได้จริง เช่น กดซ้ำเร็ว, สองแท็บ, ระบบช้า — ผู้ใช้จริงก็จะเจอ
</details>

## 📋 Skills Checklist
- [ ] วัด flaky rate และใช้ `--repeat-each` ได้
- [ ] จำแนกสาเหตุ flaky ได้ 6 หมวด
- [ ] ไม่มี fixed sleep ในโค้ดตัวเอง
- [ ] ใช้ trace viewer/log.html หา root cause ได้
