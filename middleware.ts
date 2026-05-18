import { NextResponse, type NextRequest } from "next/server";

// ส่วนนี้ในอนาคตจะเชื่อมกับ better-auth
// ตอนนี้ทำแบบ Simple check ก่อนเพื่อให้โครงสร้างสมบูรณ์
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ปล่อยผ่านทั้งหมดชั่วคราวเพื่อทดสอบ
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};