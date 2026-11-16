# Quality Engineering & Test Automation


**เป้าหมายหลัก:** พัฒนาทักษะจากการทดสอบซอฟต์แวร์และเขียน Test Script ไปสู่การออกแบบระบบทดสอบที่มีประสิทธิภาพ ดูแลรักษาได้ เชื่อถือได้ และทำงานร่วมกับกระบวนการพัฒนาซอฟต์แวร์จริง

**ภาษาโปรแกรมหลัก:** TypeScript และ Python  
**เครื่องมือหลัก:** Playwright และ Robot Framework  
**ผลลัพธ์สุดท้าย:** Banking Automation Framework สำหรับใช้เป็น Portfolio สมัคร QA Automation Engineer, Test Engineer หรือ SDET

---

## 1. Learning Outcomes

เมื่อจบหลักสูตร ควรทำสิ่งต่อไปนี้ได้:

- ออกแบบ Test Strategy และวางแผนการทดสอบตามความเสี่ยงทางธุรกิจได้
- วิเคราะห์ Requirement และออกแบบ Test Scenario / Test Case ด้วยเทคนิคที่เหมาะสมได้
- เข้าใจพื้นฐานการเขียนโปรแกรมที่จำเป็นสำหรับ Automation ด้วย TypeScript และ Python
- สร้าง UI Automation และ API Automation ด้วย Playwright ได้
- สร้าง Keyword-driven Automation ด้วย Robot Framework ได้
- ออกแบบ Test Framework ให้แยกส่วน ใช้ซ้ำได้ และบำรุงรักษาง่าย
- เชื่อม Automated Tests เข้ากับ CI/CD Pipeline ได้
- วิเคราะห์ Flaky Tests, Test Failures และประสิทธิภาพของ Test Suite ได้
- ใช้ AI ช่วยวิเคราะห์ Requirement, ออกแบบ Test และตรวจสอบโค้ดได้อย่างมีวิจารณญาณ
- เข้าใจความเสี่ยงและแนวทางทดสอบระบบที่มี AI เป็นองค์ประกอบ

## 2. Learning Philosophy

หลักสูตรนี้ไม่ใช่เพียงการสอน Syntax หรือคำสั่งของเครื่องมือ แต่ใช้แนวทางการเรียนแบบตำราวิศวกรรม โดยแบ่งแต่ละหัวข้อเป็น 4 ส่วน:

1. **Theory:** เข้าใจหลักการและเหตุผลทางวิศวกรรม
2. **Design Patterns:** เรียนรู้รูปแบบการออกแบบที่ช่วยให้ระบบทดสอบมีคุณภาพ
3. **Anti-patterns:** รู้จักข้อผิดพลาดที่ทำให้ Test เปราะบางหรือดูแลรักษายาก
4. **Practice:** ลงมือสร้างระบบจริง วิเคราะห์ผล และปรับปรุงงาน

### หลักคิดสำคัญของ Quality Engineering

- **Automate the Right Things:** ไม่จำเป็นต้อง Automate ทุก Test Case ให้เลือกตามความเสี่ยง ความถี่ ความเสถียร และต้นทุนการดูแล
- **Test Code is Production Code:** Test Code ต้องอ่านง่าย มีโครงสร้าง ตรวจสอบได้ และบำรุงรักษาได้
- **Isolation Before Parallelization:** ต้องออกแบบ Test Isolation และ Test Data ให้ดี ก่อนเพิ่มการรันแบบ Parallel
- **API First, UI Where Necessary:** ใช้ API สำหรับตรวจสอบ Business Logic และเตรียมข้อมูล ส่วน UI ใช้ทดสอบพฤติกรรมที่ผู้ใช้มองเห็น
- **Fast Feedback Over Test Quantity:** ให้ความสำคัญกับ Feedback ที่รวดเร็วและเชื่อถือได้ มากกว่าจำนวน Test Case
- **AI Assists, Engineers Validate:** AI ช่วยลดงานซ้ำ ๆ ได้ แต่ Engineer ต้องรับผิดชอบความถูกต้องของ Test Design และ Expected Results

---

# Part I — Foundations of Software Quality

**สัปดาห์ที่ 1–3: สร้างพื้นฐานความคิดของ Quality Engineer**

## Chapter 1: Software Testing Principles & Quality Engineering

### ทฤษฎีที่ต้องเรียน

- Software Development Life Cycle (SDLC)
- Waterfall, Agile, Scrum และ DevOps
- Software Testing Principles
- Verification vs. Validation
- Static Testing vs. Dynamic Testing
- Test Levels และ Test Types
- Shift Left Testing และ Shift Right Testing
- Test Pyramid และ Testing Quadrants
- Risk-Based Testing
- Quality Engineering และบทบาท QA ในทีมพัฒนา

### แนวคิดที่ต้องอธิบายได้

| แนวคิด | สิ่งที่ต้องเข้าใจ |
|---|---|
| Test Pyramid | เหตุใด Unit Test จึงควรมีจำนวนมากกว่า End-to-End Test ในหลายระบบ |
| Shift Left | ทำอย่างไรให้พบข้อบกพร่องตั้งแต่ Requirement หรือ Design |
| Risk-Based Testing | เหตุใดบาง Test Case จึงสำคัญกว่ากรณีอื่น |
| Quality Engineering | QA ควรมีส่วนร่วมในวงจรพัฒนาซอฟต์แวร์ตั้งแต่เมื่อใด |
| Shift Right | ใช้ข้อมูลจากระบบจริง เช่น Monitoring และ Production Feedback เพื่อปรับปรุงคุณภาพอย่างไร |

### Workshop

จำลองระบบ Loan Payment แล้ววางแผนการทดสอบ:

- ระบุฟังก์ชันที่มีความเสี่ยงทางธุรกิจสูง
- เลือกฟังก์ชันที่ควรทดสอบระดับ API
- เลือกฟังก์ชันที่ต้องทดสอบระดับ UI
- พิจารณาว่ากรณีใดเหมาะกับ Manual หรือ Exploratory Testing
- วางแผนการทดสอบในแต่ละ Sprint

**Deliverable:** Test Strategy Document 1 ฉบับ

## Chapter 2: Test Analysis & Test Design Techniques

### เทคนิคการออกแบบ Test

| เทคนิค | แนวทางการใช้งาน |
|---|---|
| Equivalence Partitioning | แบ่งข้อมูลเป็นกลุ่มที่คาดว่าจะมีพฤติกรรมเหมือนกัน |
| Boundary Value Analysis | ทดสอบบริเวณขอบเขตของข้อมูล |
| Decision Table Testing | ทดสอบชุดเงื่อนไขที่มีหลายตัวแปร |
| State Transition Testing | ทดสอบการเปลี่ยนสถานะของระบบ |
| Pairwise Testing | ลดจำนวนชุดทดสอบสำหรับตัวแปรหลายตัว |
| Use Case Testing | ทดสอบตามเส้นทางการใช้งาน |
| Error Guessing | ใช้ประสบการณ์คาดการณ์ข้อผิดพลาด |
| Exploratory Testing | สำรวจระบบเพื่อค้นหาปัญหาที่อาจไม่อยู่ใน Test Case เดิม |

### หัวข้อเพิ่มเติม

- Requirement Review
- Acceptance Criteria
- Test Condition vs. Test Scenario vs. Test Case
- Traceability Matrix
- Defect Lifecycle
- Defect Severity vs. Priority
- Positive, Negative และ Edge Case

### Workshop: Loan Payment

สมมติว่าระบบชำระหนี้มีกฎดังนี้:

- ยอดหนี้คงเหลือ 10,000 บาท
- ยอดชำระขั้นต่ำ 500 บาท
- ไม่อนุญาตให้ชำระเกินยอดหนี้
- บัญชีต้องอยู่ในสถานะ Active
- การ Reverse ต้องอ้างอิง Transaction เดิม

ให้ออกแบบ Test Scenario โดยใช้ Decision Table และ State Transition แทนการเพิ่ม Test Case แบบไม่มีหลักการ

**Deliverable:** Test Design Document พร้อม Test Cases และ Requirement Traceability

## Chapter 3: Programming & Technical Foundations for Test Engineers

เป้าหมายไม่ใช่การเป็น Full-stack Developer แต่ต้องมีความรู้ด้าน Programming เพียงพอที่จะออกแบบและดูแล Automation Framework ได้โดยไม่ต้องพึ่ง AI ทุกขั้นตอน

### TypeScript / JavaScript

- Variables และ Data Types
- Functions
- Array และ Object
- Conditions และ Loops
- Classes และ Modules
- Async / Await
- Promise
- Error Handling
- TypeScript Interfaces และ Types
- npm และ package.json

### Python

- Variables และ Functions
- List, Dictionary, Tuple และ Set
- Classes และ OOP
- Exception Handling
- Modules และ Packages
- อ่านและเขียนไฟล์ JSON / CSV
- เขียน Python Functions เพื่อใช้ใน Test Automation

### Technical Skills

- Git และ GitHub
- Linux Command Line
- HTTP / HTTPS
- REST API
- JSON และ XML
- SQL และ Database Fundamentals
- Authentication: Session, Cookie, JWT และ OAuth เบื้องต้น
- Environment Variables

### Workshop

เขียน Script ที่สามารถ:

1. อ่าน Test Data จาก CSV หรือ JSON
2. เรียก API
3. ตรวจสอบ Response และ Business Conditions
4. จัดการ Error และแสดงผลลัพธ์อย่างเหมาะสม

**Deliverable:** ชุด Script สำหรับอ่าน Test Data, เรียก API และตรวจสอบผลลัพธ์

---

# Part II — Playwright Automation Engineering

**สัปดาห์ที่ 4–8**

แนะนำให้เรียน Playwright ด้วย TypeScript ก่อน Robot Framework เพื่อให้เข้าใจ Browser Automation และโครงสร้างโปรแกรมโดยตรง จากนั้นจึงนำแนวคิดไปประยุกต์กับ Keyword-driven Framework

## Chapter 4: Introduction to Playwright Architecture

### ทฤษฎี

- Browser Automation Architecture
- Browser, Browser Context และ Page
- Playwright Test Runner
- Test Configuration
- Test Discovery and Execution
- Assertions
- Locators
- Auto-waiting
- Test Isolation
- Projects และ Browser Configuration

### Workshop

สร้าง Automation สำหรับ:

- Login / Logout
- Search
- CRUD Operations
- Form Validation

**Deliverable:** Playwright Project พื้นฐานที่มีการจัดการ Configuration และ Assertions

## Chapter 5: Locator Strategy & Reliable Test Design

### เนื้อหาที่ต้องเรียน

- `getByRole()`
- `getByLabel()`
- `getByText()`
- `getByPlaceholder()`
- `getByTestId()`
- CSS Selector และ XPath
- Locator Chaining และ Filtering
- Assertions และ `expect`
- Auto-waiting และ Waiting Strategy
- Dropdown, Dialog, Table และ Dynamic Elements

### Design Principles

| ควรทำ | ควรหลีกเลี่ยง |
|---|---|
| เลือก Locator จากสิ่งที่ผู้ใช้มองเห็นหรือเข้าถึงได้ | ผูกกับ CSS Class ที่เปลี่ยนบ่อยโดยไม่จำเป็น |
| ใช้ Auto-waiting และ Web-first Assertions | ใช้ `waitForTimeout()` เป็นวิธีรอหลัก |
| ตรวจสอบ Expected Outcome | ตรวจสอบเพียงว่าคลิกได้หรือไม่ |
| ทดสอบพฤติกรรมของผู้ใช้ | ผูก Test กับรายละเอียด Implementation มากเกินไป |
| ใช้ Locator ที่มีความหมายชัดเจน | ใช้ XPath ที่ซับซ้อนและเปราะบางโดยไม่จำเป็น |

### Workshop: Banking Internet Banking

สร้าง UI Automation สำหรับ:

- Login
- Account Overview
- Transfer
- Payment History
- Transaction Detail
- Reverse Transaction

**Deliverable:** ชุด UI Tests ที่มี Locator Strategy ชัดเจนและมีความเสถียร

## Chapter 6: Test Architecture & Design Patterns

บทนี้เป็นหัวใจของการเปลี่ยนจากการเขียน Script ทั่วไปไปสู่การสร้าง Automation Framework

### Design Patterns ที่ควรเรียน

| Pattern | จุดประสงค์ |
|---|---|
| Page Object Model | แยก Logic ของหน้า UI ออกจาก Test Scenario |
| Fixture Pattern | จัดเตรียมและจัดการทรัพยากรสำหรับ Test |
| Factory Pattern | สร้าง Test Data ตามเงื่อนไข |
| Builder Pattern | สร้างข้อมูลทดสอบที่มีหลายคุณสมบัติ |
| Strategy Pattern | เปลี่ยนวิธีดำเนินการทดสอบตามเงื่อนไข |
| Dependency Injection | จัดการ Dependencies โดยลดการผูกติดกัน |
| Facade Pattern | ลดความซับซ้อนของการเรียกใช้ระบบย่อย |

### Anti-patterns ที่ต้องรู้จัก

- God Object
- Duplicate Test Logic
- Hard-coded Test Data
- Over-abstraction
- Shared State Between Tests
- Excessive Inheritance
- Unstable Locator
- Sleep-based Synchronization
- Test ที่ตรวจสอบหลายเรื่องจนระบุสาเหตุของ Failure ได้ยาก

### Workshop

ออกแบบ Playwright Project โดยแยกองค์ประกอบ:

- Tests
- Pages / Page Objects
- Fixtures
- API Clients
- Test Data
- Utilities
- Configuration

**Deliverable:** Playwright Framework ที่มีโครงสร้างแยกส่วนและนำกลับมาใช้ซ้ำได้

## Chapter 7: API Testing with Playwright

### เนื้อหา

- `APIRequestContext`
- GET, POST, PUT, PATCH และ DELETE
- Headers และ Authentication
- Request Body Validation
- Response Assertions
- Status Code Validation
- JSON Schema Validation
- API Test Data Management
- Database Validation
- UI + API Hybrid Testing
- Pre-condition และ Post-condition

### Workshop

1. เรียก API เพื่อสร้างหรือเตรียมข้อมูลทดสอบ
2. เปิดหน้า UI เพื่อทำรายการ Payment
3. ตรวจสอบผลลัพธ์ผ่าน UI
4. ใช้ API ตรวจสอบสถานะ Transaction หลังทำรายการ

**Deliverable:** API Test Suite และ UI/API Hybrid Test Flow

## Chapter 8: Debugging, Reporting & Test Maintenance

### เนื้อหา

- Playwright Trace Viewer
- Screenshot และ Video
- HTML Report
- Console Logs
- Network Errors
- Debugging Test Failure
- Test Retries
- Test Tags และ Annotations
- Browser Projects
- Cross-browser Testing
- การแยก Product Defect, Test Defect และ Environment Defect

### Workshop

สร้างสถานการณ์ Test Failure หลายรูปแบบ แล้ววิเคราะห์จาก Trace, Screenshot, Logs และ Network Activity ว่าสาเหตุเกิดจากส่วนใด

**Deliverable:** Playwright Framework ที่มี UI + API Tests, Test Data Management, Debugging และ Reporting

---

# Part III — Robot Framework Automation Engineering

**สัปดาห์ที่ 9–12**

Robot Framework มีแนวคิดหลักแบบ Keyword-driven ซึ่งแตกต่างจากการเขียน Test ด้วย TypeScript โดยตรง และสามารถขยายความสามารถด้วย Python Libraries ได้

## Chapter 9: Robot Framework Fundamentals

### ทฤษฎีและคำสั่ง

- Robot Framework Architecture
- Test Suite และ Test Case
- Keywords
- Variables
- Built-in Libraries
- Settings
- Setup และ Teardown
- Tags
- Assertions
- Control Structures
- Test Templates

### Workshop

เขียน Test Cases สำหรับ:

- Login
- Payment
- Transaction Validation
- Positive / Negative Scenarios

**Deliverable:** Robot Framework Test Suites ชุดแรก

## Chapter 10: Advanced Robot Framework Design

### เนื้อหาที่ต้องเรียน

- Resource Files
- Variable Files
- Reusable Keywords
- Data-driven Testing
- Test Templates
- Custom Python Libraries
- Environment Configuration
- Test Data Management
- Error Handling
- Listener API
- Custom Reporting

### แนวทางแบ่งหน้าที่ของไฟล์

| ส่วนประกอบ | หน้าที่ |
|---|---|
| `.robot` | เขียน Test Scenarios และ Test Cases |
| `.resource` | จัดเก็บ Reusable Keywords |
| Python Library | เขียน Logic ที่ซับซ้อนหรือเชื่อมต่อระบบภายนอก |
| Variable Files | จัดเก็บ Configuration และ Variables |
| Test Data | จัดเก็บข้อมูลที่ใช้ในการทดสอบ |

### Workshop

ปรับ Test Suite ที่สร้างใน Chapter 9 ให้แยก Test Scenario, Reusable Keywords, Test Data และ Configuration ออกจากกัน

**Deliverable:** Robot Framework Project ที่มีการแยกส่วนและ Reusable Keywords

## Chapter 11: Browser Automation with Robot Framework

เน้นการเรียน **Browser Library** ซึ่งใช้ Playwright เป็นกลไก Browser Automation

### เนื้อหา

- Browser Library Architecture
- Browser, Context และ Page
- Locator Strategy
- Browser Keywords
- Playwright Concepts in Robot Framework
- UI Assertions
- Browser Session Management
- Reusable UI Keywords
- Debugging และ Screenshots

### Workshop

สร้าง UI Automation ของ Banking Web Application โดยใช้ Browser Library และออกแบบ Keywords ให้สื่อความหมายทางธุรกิจ

**Deliverable:** Robot Framework Browser Automation Suite

## Chapter 12: API Automation & Parallel Execution

### เนื้อหา

- Robot Framework Requests Library
- REST API Testing
- JSON Validation
- Authentication
- Database Testing
- Data-driven API Testing
- Pabot
- Parallel Test Execution
- Execution Logs และ Reports
- Test Data Isolation

### Workshop

- สร้าง API Test Suite
- จัดการ Authentication และ Test Data
- ทดลองรันแบบ Sequential และ Parallel
- วิเคราะห์ปัญหา Shared State และข้อมูลชนกัน

**Deliverable:** Robot Framework Project ที่มี Browser Automation, API Testing, Reusable Keywords และ Parallel Execution

---

# Part IV — Test Operations, CI/CD & AI Quality Engineering

**สัปดาห์ที่ 13–16**

## Chapter 13: CI/CD & Test Automation Operations

### เนื้อหาที่ต้องเรียน

- Git Workflow
- GitHub Actions หรือ GitLab CI
- CI/CD Pipeline Architecture
- Docker Fundamentals
- Environment Management
- Secrets Management
- Test Execution Strategy
- Smoke Test และ Regression Test
- Parallel Execution
- Test Artifacts
- Automated Reporting

### ตัวอย่าง Pipeline

```text
Developer Push / Pull Request
              |
              v
     Build & Static Checks
     - Lint
     - Type Check
     - Build
              |
              v
        API Tests
        Smoke UI Tests
              |
              v
       Regression Tests
   - Playwright
   - Robot Framework
              |
              v
      Test Reports & Artifacts
   - Logs
   - Screenshots
   - Traces
   - Test Results
```

### Workshop

สร้าง Pipeline ให้เมื่อมีการ Push Code หรือเปิด Pull Request ระบบจะ:

1. ติดตั้ง Dependencies
2. ตรวจสอบและ Build Project
3. รัน API Tests และ Smoke Tests
4. รัน Regression Tests ตามเงื่อนไข
5. เก็บ Reports, Logs และ Artifacts เมื่อ Test Fail

**Deliverable:** CI/CD Pipeline สำหรับ Automated Tests

## Chapter 14: Reliability Engineering & Test Optimization

### ทฤษฎี

- Flaky Tests
- Test Reliability
- Test Isolation
- Test Environment Stability
- Test Execution Optimization
- Dependency Management
- Parallel Execution Conflicts
- Failure Analysis
- Regression Test Optimization
- Test Maintenance Strategy

### Metrics ที่ควรติดตาม

| Metric | ใช้วัดอะไร |
|---|---|
| First-run Pass Rate | สัดส่วน Test ที่ผ่านในการรันครั้งแรกโดยไม่อาศัย Retry |
| Flaky Test Rate | ความถี่ของผลทดสอบที่ไม่สม่ำเสมอ |
| Test Execution Time | เวลาที่ใช้ในการทดสอบ |
| Failure Rate | สัดส่วน Test ที่ Fail |
| Defect Detection | ความสามารถของชุดทดสอบในการค้นพบ Defect |
| Maintenance Effort | เวลาและแรงที่ใช้ดูแล Automation |

### Workshop

วิเคราะห์ Test Suite ที่มี Flaky Tests และใช้ข้อมูลการรันเพื่อค้นหาสาเหตุ เช่น:

- Locator ไม่เสถียร
- Test Data ใช้ร่วมกัน
- Dependency ระหว่าง Test Cases
- Environment ไม่พร้อม
- Timing และ Synchronization ไม่ถูกต้อง
- External Service ไม่เสถียร

**Deliverable:** Test Reliability และ Optimization Report

## Chapter 15: AI-Assisted Quality Engineering

ควรเรียน AI สองด้านควบคู่กัน คือการใช้ AI เพื่อเพิ่มประสิทธิภาพงาน QA และการทดสอบระบบที่มี AI เป็นองค์ประกอบ

### A. AI as a QA Engineering Assistant

| งาน | วิธีใช้ AI |
|---|---|
| Requirement Analysis | วิเคราะห์ Requirement และค้นหา Ambiguity |
| Test Design | เสนอ Test Scenarios, Edge Cases และ Negative Cases |
| Test Automation | สร้าง Script ตั้งต้นและอธิบายโค้ด |
| Code Review | วิเคราะห์โครงสร้างและความเสี่ยงของ Automation Code |
| Defect Analysis | ช่วยจัดกลุ่มและวิเคราะห์ Error Logs |
| Test Data | สร้าง Synthetic Test Data |
| Documentation | ช่วยร่าง Test Documentation |
| Maintenance | ช่วยค้นหาจุดที่ควร Refactor |

### วิธีตรวจสอบผลลัพธ์จาก AI

- ตรวจสอบว่า Test ตรงกับ Business Requirement จริงหรือไม่
- ตรวจสอบ Expected Result จากแหล่งที่เชื่อถือได้ ไม่ให้ AI คิดขึ้นเอง
- ตรวจสอบว่า Test มี Assertion ที่มีความหมายหรือไม่
- ตรวจสอบว่า Test Data ไม่เปิดเผยข้อมูลจริงหรือข้อมูลลับ
- ตรวจสอบโค้ดที่ AI สร้างก่อนนำไปรันหรือ Merge
- ใช้ Human Review กับการตัดสินใจที่มีผลต่อระบบสำคัญ

### B. Testing AI-based Applications

หัวข้อที่ควรศึกษา:

- LLM Testing
- Prompt Testing
- Prompt Injection
- Hallucination Testing
- RAG Testing
- AI Output Validation
- Model Evaluation
- Golden Test Dataset
- Non-deterministic Testing
- Human-in-the-loop Testing
- AI Security Testing
- Privacy และ Data Governance

### ตัวอย่าง: Banking AI Assistant

ออกแบบ Test เพื่อให้มั่นใจว่า:

- ระบบไม่เปิดเผยข้อมูลของลูกค้าคนอื่น
- ระบบไม่ทำรายการโอนเงินโดยไม่มีสิทธิ์หรือการยืนยันที่จำเป็น
- ระบบไม่ทำตาม Prompt Injection ที่มากับเอกสารหรือข้อมูลภายนอก
- ระบบจัดการคำตอบที่ผิดหรือไม่แน่นอนได้อย่างเหมาะสม
- ระบบไม่ส่งข้อมูลสำคัญไปยังระบบภายนอกโดยไม่ได้รับอนุญาต

### C. AI Engineering Mindset

1. **Critical Thinking:** ตรวจสอบคำตอบของ AI ด้วยหลักฐาน
2. **System Thinking:** เข้าใจความสัมพันธ์ระหว่าง Application, API, Database และ Infrastructure
3. **Data Literacy:** เข้าใจคุณภาพของ Test Data และการวิเคราะห์ผล
4. **Security Awareness:** รู้ว่าข้อมูลใดไม่ควรนำเข้า AI
5. **Programming Literacy:** อ่าน Debug และปรับปรุงโค้ดที่ AI สร้างได้

**ข้อควรระวังสำหรับงาน Banking:** ใช้ข้อมูลสังเคราะห์หรือข้อมูลที่ได้รับอนุญาตเท่านั้น หลีกเลี่ยงการส่งข้อมูลลูกค้าจริง Credential, Token หรือข้อมูลภายในองค์กรเข้า AI ที่ไม่ได้รับอนุมัติ

**Deliverable:** AI-assisted Test Design Workflow และชุด AI Evaluation Tests เบื้องต้น

## Chapter 16: Final Capstone — Banking Automation Framework

โปรเจกต์สุดท้ายจะนำความรู้ทั้งหมดมารวมกัน โดยใช้ระบบจำลอง Retail Lending & Payment ซึ่งมีลักษณะใกล้เคียงกับระบบ Banking QA

### ขอบเขตระบบ

| Module | สิ่งที่ต้องทดสอบ |
|---|---|
| Account | Account Creation, Status และ Validation |
| Loan | Loan Account และ Outstanding Balance |
| Payment | Payment, Partial Payment และ Full Payment |
| Reversal | Reverse Transaction และ Duplicate Reversal |
| EOD | T+1 Processing และ Balance Reconciliation |
| Security | Authentication และ Authorization |
| Reporting | Transaction History และ Payment Status |

### สิ่งที่ต้องสร้าง

- Test Strategy
- Test Scenarios และ Test Cases
- Playwright UI Automation
- Playwright API Automation
- Robot Framework Acceptance Tests
- Reusable Test Framework
- Test Data Management
- CI/CD Pipeline
- Test Reports
- Automation Architecture Document
- AI-assisted Test Design Workflow

**Final Deliverable:** Banking Automation Framework ที่สามารถนำเสนอเป็น Portfolio สำหรับสมัคร QA Automation Engineer, Test Engineer หรือ SDET

---

# 3. Weekly Learning Roadmap

| สัปดาห์ | หัวข้อ | ผลลัพธ์ที่ต้องส่ง |
|---:|---|---|
| 1 | Software Quality & Testing Principles | Test Strategy |
| 2 | Test Analysis & Design Techniques | Test Design Document |
| 3 | Programming & Technical Foundations | TypeScript / Python Scripts |
| 4 | Playwright Architecture | First Automation Project |
| 5 | Locators & UI Test Design | Reliable UI Tests |
| 6 | Fixtures & Test Architecture | Reusable Framework |
| 7 | API & Hybrid Testing | API/UI Integration |
| 8 | Debugging & Reporting | Playwright Framework |
| 9 | Robot Framework Fundamentals | Robot Test Suites |
| 10 | Advanced Robot Architecture | Reusable Keywords |
| 11 | Robot Browser Library | Browser Automation |
| 12 | Robot API & Parallel Execution | Robot Framework Project |
| 13 | CI/CD & Test Operations | Automated Pipeline |
| 14 | Reliability Engineering | Test Optimization Report |
| 15 | AI-assisted QA & AI Testing | AI QA Evaluation |
| 16 | Final Capstone | Complete QA Portfolio |

## 4. Suggested Weekly Study Routine


| กิจกรรม | เวลาโดยประมาณ |
|---|---:|
| อ่านทฤษฎีและเอกสาร | 1.5 ชั่วโมง |
| ศึกษาตัวอย่างและ Architecture | 1 ชั่วโมง |
| ลงมือ Workshop | 2.5–3 ชั่วโมง |
| Code Review และ Debugging | 1 ชั่วโมง |
| สรุปบทเรียนและจัดทำ Documentation | 0.5–1 ชั่วโมง |

ควรให้ความสำคัญกับการลงมือทำและการอธิบายเหตุผลในการออกแบบ มากกว่าการดูวิดีโอหรือจำ Syntax เพียงอย่างเดียว

---

# 3. Recommended Books & References

## หนังสือหลัก

### 1. Agile Testing: A Practical Guide for Testers and Agile Teams

**ผู้เขียน:** Lisa Crispin และ Janet Gregory  
**เหมาะสำหรับ:** Agile Testing, การทำงานร่วมกับ Developer, การวางแผนคุณภาพ และบทบาท Tester ใน Agile Team  
**ช่วงที่ควรอ่าน:** Part I

### 2. Software Test Automation

**ผู้เขียน:** Dorothy Graham และ Mark Fewster  
**เหมาะสำหรับ:** Automation Strategy, การเลือกสิ่งที่จะ Automate และการสร้างระบบ Automation ที่ดูแลได้ในระยะยาว  
**ช่วงที่ควรอ่าน:** Part II–IV

### 3. Agile Testing Condensed

**ผู้เขียน:** Lisa Crispin และ Janet Gregory  
**เหมาะสำหรับ:** ทบทวนแนวคิด Agile Testing และการสร้าง Quality Mindset ในทีม

### 4. The DevOps Handbook

**ผู้เขียน:** Gene Kim และผู้เขียนร่วม  
**เหมาะสำหรับ:** CI/CD, Feedback Loops, Deployment และการปรับปรุงกระบวนการทำงาน

### 5. Fundamentals of Software Architecture

**ผู้เขียน:** Mark Richards และ Neal Ford  
**เหมาะสำหรับ:** Architecture, Trade-offs, Coupling, Cohesion และ Design Decisions  
**ช่วงที่ควรอ่าน:** Part II–IV

## เอกสารและแหล่งเรียนรู้อย่างเป็นทางการ

- [Robot Framework User Guide](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html) — Framework, Syntax และแนวทางการใช้งาน
- [Robot Framework Browser Library](https://robotframework-browser.org/) — Browser Automation ที่ใช้ Playwright
- [Playwright Documentation](https://playwright.dev/docs/intro) — เริ่มต้นใช้งาน Playwright
- [Playwright Best Practices](https://playwright.dev/docs/best-practices) — แนวทางออกแบบ UI Tests
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures) — Test Architecture และ Fixtures
- [Playwright API Testing](https://playwright.dev/docs/api-testing) — API Automation
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer) — Debugging และ Trace Analysis
- [ISTQB](https://www.istqb.org/) — Syllabus และ Certification ด้าน Software Testing
- [The Practical Test Pyramid — Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html) — แนวคิด Test Pyramid
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) — ความเสี่ยงด้านความปลอดภัยของ LLM Applications
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — กรอบการบริหารความเสี่ยง AI

---

# 4. Career Progression

```text
QA / Software Tester
        |
        | Test Design, Requirement Analysis,
        | Defect Management, API Testing
        v
QA Automation Engineer
        |
        | Playwright, Robot Framework,
        | API Automation, Test Framework
        v
SDET / Test Engineer
        |
        | Architecture, CI/CD, Test Infrastructure,
        | Reliability Engineering, Coding Standards
        v
Quality Engineering / AI Quality Engineer
          Quality Strategy, AI Evaluation,
          Security, Data Quality, Governance
```

เป้าหมายคือการพัฒนาจากผู้ที่เขียน Test Script ได้ ไปสู่ผู้ที่ออกแบบระบบทดสอบ วางกลยุทธ์คุณภาพ และรับผิดชอบความน่าเชื่อถือของกระบวนการทดสอบได้

## 5. แนวทางเลือกใช้ Playwright และ Robot Framework

ไม่ควรเรียน Playwright และ Robot Framework เป็นเครื่องมือสองตัวที่แยกขาดจากกัน

- **Playwright + TypeScript:** เหมาะสำหรับเรียนรู้ Code-based UI / API Automation, Fixtures, Assertions และการออกแบบ Test Framework โดยตรง
- **Robot Framework:** เหมาะสำหรับเรียนรู้ Keyword-driven Automation, การจัดการ Test Suites และการสร้าง Automation ที่อ่านง่ายในระดับ Acceptance Test
- **Robot Framework Browser Library:** ใช้ Playwright เป็นกลไก Browser Automation อยู่เบื้องหลัง จึงเชื่อมโยงความรู้จาก Playwright มาใช้ได้
- **Python:** ใช้เขียน Custom Libraries, Utilities และการเชื่อมต่อระบบที่ Robot Framework ต้องใช้งาน

แนวทางการเรียนจึงเป็น: เข้าใจ Playwright ผ่าน TypeScript ก่อน แล้วนำความเข้าใจ Browser Automation ไปใช้กับ Robot Framework Browser Library

---

# 6. Teaching Method — รูปแบบการเรียนในแต่ละบท

แต่ละ Chapter ควรใช้รูปแบบการเรียน 6 ขั้นตอน:

1. **Concept:** อธิบายทฤษฎีตั้งแต่พื้นฐานไปจนถึงระดับวิศวกรรม
2. **Architecture:** อธิบายองค์ประกอบและความสัมพันธ์ของระบบ
3. **Patterns & Anti-patterns:** เปรียบเทียบการออกแบบที่ดีและไม่ดี
4. **Hands-on Lab:** ให้โจทย์และลงมือเขียนจริง
5. **Code Review:** ตรวจโค้ด วิเคราะห์ข้อดี ข้อเสีย และเหตุผลของการออกแบบ
6. **Engineering Assignment:** มอบหมายงานที่จำลองปัญหาในบริษัทจริง

## เกณฑ์ประเมินงานแต่ละบท

- **Correctness:** Test ตรวจสอบ Requirement และ Expected Result ได้ถูกต้องหรือไม่
- **Coverage:** ครอบคลุมความเสี่ยงและกรณีสำคัญเพียงพอหรือไม่
- **Maintainability:** โค้ดอ่านง่าย แยกส่วนเหมาะสม และแก้ไขได้ง่ายหรือไม่
- **Reliability:** ผลการทดสอบสม่ำเสมอและไม่พึ่งพา Timing ที่เปราะบางหรือไม่
- **Efficiency:** ใช้เวลาและทรัพยากรเหมาะสมหรือไม่
- **Explainability:** ผู้เรียนอธิบายเหตุผลในการออกแบบและ Trade-offs ได้หรือไม่
- **Security:** จัดการข้อมูลทดสอบ Credential และ Secrets อย่างปลอดภัยหรือไม่

---

## บทสรุป

หลักสูตรนี้ควรทำให้ผู้เรียนเปลี่ยนจากคนที่เขียน Test Script ได้ ไปเป็นวิศวกรที่สามารถออกแบบระบบทดสอบ วางกลยุทธ์คุณภาพ วิเคราะห์ความเสี่ยง สร้าง Automation Framework และใช้ AI เป็นเครื่องมือเพิ่มประสิทธิภาพโดยยังตรวจสอบความถูกต้องได้

**หลักการสำคัญ:** อย่าเรียนเพียงว่าเครื่องมือมีคำสั่งอะไร แต่ต้องตอบให้ได้ว่าเหตุใดจึงเลือกใช้วิธีนี้ มีข้อแลกเปลี่ยนอะไร และจะปรับปรุงอย่างไรเมื่อระบบมีขนาดใหญ่ขึ้น
