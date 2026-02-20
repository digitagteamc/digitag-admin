import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only protect dashboard routes
    if (!pathname.startsWith("/dashboard")) {
        return NextResponse.next();
    }

    // Call /api/auth/me through our own proxy (same origin, cookies forwarded automatically)
    const meUrl = new URL("/api/auth/me", req.url);

    try {
        const res = await fetch(meUrl.toString(), {
            headers: { cookie: req.headers.get("cookie") ?? "" },
        });

        if (!res.ok) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    } catch {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
