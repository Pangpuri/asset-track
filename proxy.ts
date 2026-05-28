import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("mis_session");

    // 1. ตรวจสอบการเข้าถึงข้อมูลอุปกรณ์แบบสาธารณะ (Public Track)
    // อนุญาตเฉพาะ GET /api/assets/[uuid] เท่านั้น (ไม่อนุญาต /api/assets ที่เป็น list หรือ bulk)
    if (pathname.startsWith("/api/assets/") && request.method === "GET") {
        const parts = pathname.split("/").filter(Boolean);
        // รูปแบบคือ api -> assets -> [id] (ความยาว 3 ส่วน)
        // และต้องไม่ใช่คำสั่งพิเศษอย่าง bulk หรือ replace
        if (parts.length === 3 && parts[2] !== "bulk" && parts[2] !== "replace") {
             return NextResponse.next();
        }
    }

    // 2. กำหนดเส้นทางที่ต้องมีการ Login (Protected Routes)
    const isProtectedRoute = 
        pathname.startsWith("/dashboard") || 
        pathname.startsWith("/api/assets") || 
        pathname.startsWith("/api/logs") ||
        pathname.startsWith("/scan"); // หน้าแสกนสำหรับไอทีก็ควรล็อกไว้หากต้องการความชัวร์

    if (isProtectedRoute && !session) {
        // กรณีเป็น API ให้ตอบกลับเป็น JSON Unauthorized
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized Access - Please Login" }, { status: 401 });
        }
        // กรณีเป็นหน้าเว็บปกติ ให้ดีดกลับไปหน้า Login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3. หาก Login แล้ว แต่พยายามเข้าหน้า Login อีก ให้ส่งไป Dashboard
    if (pathname === "/login" && session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/assets/:path*",
        "/api/logs/:path*",
        "/login",
        "/scan"
    ],
};
