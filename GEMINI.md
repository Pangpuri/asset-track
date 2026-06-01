# AssetTrack Project Standards

## Project Map

```text
asset-track/
├── 📁 app/ (Routing & API)
│   ├── 📁 api/ (Backend Logic)
│   │   ├── 📁 assets/       -> จัดการข้อมูลอุปกรณ์ (GET: ทั้งหมด, POST: เพิ่มใหม่)
│   │   │   ├── 📁 [id]/     -> จัดการรายตัว (GET: ดูข้อมูล, PATCH: แก้ไข, DELETE: จำหน่ายออก)
│   │   │   ├── 📁 bulk/     -> สร้างเลข Asset และบันทึกทีละหลายรายการ
│   │   │   └── 📁 replace/  -> Logic การเปลี่ยนเครื่อง (ปลดเครื่องเก่า-เข้าเครื่องใหม่)
│   │   ├── 📁 auth/         -> ระบบ Login แบบ Simple
│   │   └── 📁 logs/         -> บันทึกประวัติการขยับเขยื้อนอุปกรณ์
│   ├── 📁 (admin)/          -> หน้าจอสำหรับเจ้าหน้าที่ MIS (ต้อง Login)
│   │   └── 📁 dashboard/    -> หน้าคลัง, รายงาน, และหน้าจัดการหลัก
│   ├── 📁 (public)/         -> หน้าจอสำหรับผู้ใช้ทั่วไป (ไม่ต้อง Login)
│   │   └── 📁 track/[id]/   -> หน้าสแกน QR เพื่อดูสเปค/แจ้งซ่อม
│   └── 📁 login/            -> หน้าเข้าสู่ระบบ
│
├── 📁 components/ (UI Components)
│   ├── 📁 ui/               -> ส่วนประกอบพื้นฐาน (ปุ่ม, ช่องกรอก, ตาราง) - ใช้ Shadcn UI
│   ├── 📄 qr-sticker.tsx    -> **[สำคัญ]** แม่แบบสติกเกอร์ 48x28mm (แก้ดีไซน์ที่นี่)
│   ├── 📄 qr-print-wrapper.tsx -> ปุ่มกดสั่งพิมพ์สติกเกอร์รายตัว
│   └── 📄 navbar.tsx        -> แถบเมนูหลักด้านบน
│
├── 📁 db/ (Database & Schema)
│   ├── 📄 index.ts          -> ตัวเชื่อมต่อฐานข้อมูล (Database Connection)
│   └── 📁 schema/           -> **[สำคัญ]** นิยามตารางข้อมูล (เพิ่มฟิลด์ Database ที่นี่)
│       ├── 📄 assets.ts     -> ตารางอุปกรณ์หลัก
│       └── 📄 logs.ts       -> ตารางประวัติการจัดการ
│
├── 📁 lib/ (Shared Logic)
│   ├── 📄 asset-helpers.ts  -> **[สำคัญ]** Logic จัดการข้อมูล (สเปคคอม, Soft Delete)
│   ├── 📄 qr.ts             -> ตัวสร้างรูปภาพ QR Code จาก ID
│   └── 📄 utils.ts          -> ฟังก์ชันเสริมทั่วไป (เช่น จัดรูปแบบ CSS)
│
└── 📁 scripts/ (Maintenance)
    └── 📄 seed.ts           -> สคริปต์สำหรับเติมข้อมูลตัวอย่าง
```

## Maintenance Guide

| งานที่ต้องการทำ | ไฟล์ที่ต้องจัดการ | วิธีการเบื้องต้น |
| :--- | :--- | :--- |
| เพิ่มฟิลด์ข้อมูลใหม่ (เช่น RAM) | `db/schema/assets.ts` | เพิ่มฟิลด์ใน pgTable และรัน Migration |
| ปรับ Logic การบันทึก | `lib/asset-helpers.ts` | แก้ไขใน formatSpecifications หรือ prepareAssetData |
| เปลี่ยนดีไซน์สติกเกอร์ | `components/qr-sticker.tsx` | ปรับ CSS/Layout ในไฟล์นี้ (มีผลทั้งพิมพ์เดี่ยวและกลุ่ม) |
| แก้ไขหน้าตา Dashboard | `app/(admin)/dashboard/page.tsx` | แก้ไขส่วนการแสดงผลและกราฟสรุป |
| ปรับขนาด QR Code | `lib/qr.ts` | ปรับค่า width หรือ margin ในฟังก์ชันสร้าง QR |
| เปลี่ยนรหัสผ่าน Login | `app/api/auth/simple/route.ts` | แก้ไขที่ตัวแปร password |

## Data Flow
1. Frontend (UI) ส่งข้อมูลผ่าน fetch() ไปยัง API Route
2. API Route เรียกใช้ Asset Helpers เพื่อจัดรูปแบบข้อมูลให้ถูกต้อง
3. Asset Helpers ส่งข้อมูลที่สะอาดแล้วให้ Drizzle ORM
4. Drizzle ORM ทำการบันทึกลง PostgreSQL Database
