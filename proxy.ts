import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow GET requests to /api/assets/[id] for public tracking
    // But protect POST/PATCH/DELETE
    if (pathname.startsWith("/api/assets/") && request.method === "GET") {
        // We only allow /api/assets/[uuid] but not /api/assets (list)
        // Usually /api/assets/[uuid] GET is public
        // Let's check if it's the list or single
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length === 3 && parts[2] !== "bulk" && parts[2] !== "replace") {
             return NextResponse.next();
        }
    }

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
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
