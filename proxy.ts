import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("mis_session");

    // 1. ตรวจสอบเส้นทางที่เป็นสาธารณะ (Public Routes)
    // - หน้าแรก /
    // - หน้าสแกน /scan
    // - หน้าดูข้อมูลอุปกรณ์ /track/[id]
    // - API ดึงข้อมูลรายชิ้น GET /api/assets/[uuid]
    const isPublicRoute = 
        pathname === "/" || 
        pathname.startsWith("/scan") || 
        pathname.startsWith("/track/") ||
        pathname === "/login" ||
        pathname === "/api/auth/simple";

    // สำหรับ API Assets เฉพาะ GET รายชิ้นเท่านั้นที่เป็นสาธารณะ
    if (pathname.startsWith("/api/assets/") && request.method === "GET") {
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length === 3 && parts[2] !== "bulk" && parts[2] !== "replace") {
             return NextResponse.next();
        }
    }

    if (isPublicRoute) {
        // หาก Login แล้ว แต่พยายามเข้าหน้า Login อีก ให้ส่งไป Dashboard
        if (pathname === "/login" && session) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // 2. กำหนดเส้นทางที่ต้องมีการ Login (Protected Admin Routes)
    const isProtectedRoute = 
        pathname.startsWith("/dashboard") || 
        pathname.startsWith("/api/assets") || 
        pathname.startsWith("/api/logs");

    if (isProtectedRoute && !session) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/api/assets/:path*",
        "/api/logs/:path*",
        "/login",
        "/scan",
        "/track/:path*"
    ],
};
