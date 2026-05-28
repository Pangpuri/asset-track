import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === "88888888") {
    const cookieStore = await cookies();
    
    // เซต Cookie สำหรับเซสชัน MIS (หมดอายุใน 7 วัน)
    cookieStore.set("mis_session", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("mis_session");
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mis_session");
  return NextResponse.json({ authenticated: !!session });
}
