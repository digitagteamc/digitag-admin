import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const backendUrl = `${BACKEND}/${path.join("/")}${req.nextUrl.search ?? ""}`;

    // Forward the incoming cookie header so protected routes work
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const headers: HeadersInit = {
        "Content-Type": req.headers.get("content-type") ?? "application/json",
    };
    if (cookieHeader) {
        headers["Cookie"] = cookieHeader;
    }

    const init: RequestInit = {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    };

    const backendRes = await fetch(backendUrl, init);

    const resHeaders = new Headers();

    // Forward all Set-Cookie headers from backend → browser
    backendRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
            resHeaders.append("Set-Cookie", value);
        }
    });

    resHeaders.set(
        "Content-Type",
        backendRes.headers.get("content-type") ?? "application/json"
    );

    const body = await backendRes.text();

    return new NextResponse(body, {
        status: backendRes.status,
        headers: resHeaders,
    });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
