import { NextResponse, type NextRequest } from "next/server";

// ส่วนนี้ในอนาคตจะเชื่อมกับ better-auth
// ตอนนี้ทำแบบ Simple check ก่อนเพื่อให้โครงสร้างสมบูรณ์
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ป้องกันหน้า Dashboard
  if (pathname.startsWith("/dashboard")) {
    // สมมติว่าเช็ค cookie หรือ session
    // const session = request.cookies.get("better-auth.session-token");
    // if (!session) return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};