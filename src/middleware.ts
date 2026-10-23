import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Validate and sanitize callbackUrl to prevent Open Redirect attacks.
 * Only safe relative paths originating within the application are permitted.
 */
function sanitizeCallbackUrl(url: string | null | undefined, defaultUrl = "/dashboard"): string {
  if (!url) return defaultUrl;
  const trimmed = url.trim();
  // Must start with single slash; block protocol-relative (//) or backslash evasion (/\\)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    try {
      const parsed = new URL(trimmed, "http://localhost");
      if (parsed.origin === "http://localhost") {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      return defaultUrl;
    }
  }
  return defaultUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Defend against Cross-Site Tracing (XST) and disallowed HTTP methods
  const method = request.method.toUpperCase();
  if (method === "TRACE" || method === "TRACK") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // 2. Enforce HTTPS in production behind reverse proxies
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 3. Defend against path traversal, null byte injection, and malformed encoding
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return new NextResponse("Bad Request: Malformed URI encoding", { status: 400 });
  }

  if (
    decodedPath.includes("..") ||
    decodedPath.includes("\0") ||
    pathname.includes("%00") ||
    pathname.includes("%2e%2e")
  ) {
    return new NextResponse("Bad Request: Path traversal or invalid sequence detected", { status: 400 });
  }

  // 4. Optional Maintenance Mode Switch (activated via MAINTENANCE_MODE=true in .env)
  if (process.env.MAINTENANCE_MODE === "true") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && !pathname.startsWith("/api/auth")) {
      return new NextResponse(
        JSON.stringify({
          error: "Service Temporarily Unavailable",
          message: "Platform sedang dalam pemeliharaan berkala. Silakan coba beberapa saat lagi.",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "300",
          },
        }
      );
    }
  }

  // 5. Identify route categories for conditional session resolution (Performance Boost)
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLearnRoute = pathname.startsWith("/learn");
  const isAdminRoute = pathname.startsWith("/admin");

  const requiresAuth = isAuthRoute || isApiAdminRoute || isDashboardRoute || isLearnRoute || isAdminRoute;

  // Fast path: bypass session check on public routes & webhooks (avoids unnecessary DB/JWT overhead)
  const session = requiresAuth ? await auth() : null;

  // Helper for retaining safe relative query params on login callback
  const fullUrl = sanitizeCallbackUrl(search ? `${pathname}${search}` : pathname, pathname);

  // 6. Defense in Depth: Protect /api/admin/* endpoints
  if (isApiAdminRoute) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses admin diperlukan" }, { status: 403 });
    }
  }

  // 7. Redirect authenticated users away from auth pages (with smart callback navigation)
  if (isAuthRoute && session) {
    const rawCallback = request.nextUrl.searchParams.get("callbackUrl");
    const target = session.user?.role === "ADMIN"
      ? "/admin"
      : sanitizeCallbackUrl(rawCallback, "/dashboard");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 8. Protect dashboard routes
  if (isDashboardRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", fullUrl);
      return NextResponse.redirect(loginUrl);
    }
    // Redirect admin to /admin unless explicit student preview mode is active
    if (session.user?.role === "ADMIN" && request.nextUrl.searchParams.get("view") !== "student") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 9. Protect learn routes
  if (isLearnRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", fullUrl);
    return NextResponse.redirect(loginUrl);
  }

  // 10. Protect admin frontend routes
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", fullUrl);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const response = NextResponse.next();

  // Prevent caching of private authenticated surfaces
  if (isDashboardRoute || isLearnRoute || isAdminRoute || isApiAdminRoute) {
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (user uploads)
     * - images (static public images)
     * - static file extensions (svg, png, jpg, webp, css, js, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?|eot|ttf|otf)$).*)",
  ],
};
