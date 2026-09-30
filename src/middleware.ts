import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Defend against path traversal / null byte injection
  if (pathname.includes("..") || pathname.includes("%2e%2e") || pathname.includes("%00")) {
    return new NextResponse("Bad Request: Malformed URI", { status: 400 });
  }

  const session = await auth();

  // 2. Defense in Depth: Protect /api/admin/* endpoints
  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses admin diperlukan" }, { status: 403 });
    }
  }

  // 3. Redirect authenticated users away from auth pages
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && session) {
    const target = session.user?.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 4. Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Redirect admin to /admin unless explicit student preview mode is active
    if (session.user?.role === "ADMIN" && request.nextUrl.searchParams.get("view") !== "student") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 5. Protect learn routes
  if (pathname.startsWith("/learn") && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Protect admin frontend routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
