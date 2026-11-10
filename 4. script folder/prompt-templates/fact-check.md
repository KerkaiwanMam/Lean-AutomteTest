# Prompt template — Fact-check a section

```
บทบาท: ผู้ตรวจสอบเนื้อหาวิชาการด้าน Software Testing / Test Automation
เนื้อหาที่ต้องตรวจ: <วาง section หรือระบุไฟล์ + บรรทัด>
claim ที่ต้องตรวจ (จาก fact-check-queue.csv): <id, claim>

ขั้นตอน:
1. หาแหล่งอ้างอิงลำดับความน่าเชื่อถือ: (a) เอกสารทางการ/มาตรฐาน (ISTQB syllabus, W3C, OWASP, docs ของเครื่องมือ)
   (b) หนังสือ/ตำราที่ได้รับการยอมรับ (c) งานวิชาการ peer-reviewed (d) บทความจากผู้เชี่ยวชาญที่ระบุตัวตน
2. อ่านแหล่งจริง — อ้างได้เฉพาะสิ่งที่เห็นในแหล่งนั้น
3. ตัดสิน: verified / corrected / outdated / unverifiable
4. ถ้าต้องแก้: เสนอข้อความใหม่ (ภาษาไทย + ศัพท์อังกฤษ) สั้นเท่าเดิม
5. บันทึกแหล่งใหม่ใน 2. reference folder/references.md (REF-xxx) และอัปเดต status/ref_ids ใน fact-check-queue.csv

ผลลัพธ์: ตาราง | claim id | ผล | ข้อความเดิม | ข้อความใหม่ | REF | หมายเหตุ |
```

# Prompt template — Review a module for narrative flow

```
อ่าน <docs/modules/Mxx-...md> ในบทบาทผู้เรียนระดับ <Level>
ตรวจ: (1) objectives ทุกข้อถูกสอนในทฤษฎีและวัดใน lab/quiz (2) ลำดับเนื้อหาต่อเนื่อง ไม่อ้างสิ่งที่ยังไม่สอน
(3) ตัวอย่างอ้างไฟล์/บรรทัดที่มีจริงใน repo (4) ศัพท์ตรงกับ 3. asset folder/glossary.md
ผลลัพธ์: รายการปัญหาเรียงตามผลกระทบ + ข้อเสนอแก้
```
