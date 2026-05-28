import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("mis_session");

    // 1. Allow public GET requests to /api/assets/[uuid]
    if (pathname.startsWith("/api/assets/") && request.method === "GET") {
        const parts = pathname.split("/").filter(Boolean);
        // /api/assets/[id] has length 3
        if (parts.length === 3 && parts[2] !== "bulk" && parts[2] !== "replace") {
             return NextResponse.next();
        }
    }

    // 2. Protect Admin Routes and APIs
    const isProtectedRoute = 
        pathname.startsWith("/dashboard") || 
        pathname.startsWith("/api/assets") || 
        pathname.startsWith("/api/logs");

    if (isProtectedRoute && !session) {
        // If it's an API request, return 401
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Otherwise redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/assets/:path*",
        "/api/logs/:path*",
    ],
};
