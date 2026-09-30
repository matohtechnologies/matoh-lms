import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && session) {
    const target = session.user?.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Protect dashboard routes
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

  // Protect learn routes
  if (pathname.startsWith("/learn") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
