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

  // 2. Defend against path traversal, null byte injection, and malformed encoding
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

  // 4. Identify route categories for conditional session resolution (Performance Boost)
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLearnRoute = pathname.startsWith("/learn");
  const isAdminRoute = pathname.startsWith("/admin");
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  const requiresAuth =
    isMaintenanceMode ||
    isAuthRoute ||
    isApiAdminRoute ||
    isDashboardRoute ||
    isLearnRoute ||
    isAdminRoute;

  // Single-pass session resolution
  const session = requiresAuth ? await auth() : null;
  const isAdmin = session?.user?.role === "ADMIN";

  // Helper for retaining safe relative query params on login callback
  const fullUrl = sanitizeCallbackUrl(search ? `${pathname}${search}` : pathname, pathname);

  // 5. Maintenance Mode Switch (activated via MAINTENANCE_MODE=true in .env)
  if (isMaintenanceMode) {
    const isAdminLogin = pathname === "/login" && request.nextUrl.searchParams.get("admin") === "1";
    const isAuthApi = pathname.startsWith("/api/auth");
    const isWebhook = pathname.startsWith("/api/payment/notification") || pathname.startsWith("/api/webhooks");

    // Allow Admin, Auth API calls, Payment Webhooks, and Admin login bypass (?admin=1)
    if (!isAdmin && !isAdminLogin && !isAuthApi && !isWebhook) {
      const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

      if (isHtmlRequest) {
        const maintenanceHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Sedang Ditingkatkan - Matoh Technologies</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0B1120;
      color: #F8FAFC;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #111827;
      border: 1px solid #1E293B;
      border-radius: 1.25rem;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(234, 179, 8, 0.1);
      color: #FACC15;
      border: 1px solid rgba(234, 179, 8, 0.2);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
    }
    .pulse {
      width: 0.5rem;
      height: 0.5rem;
      background: #FACC15;
      border-radius: 50%;
      box-shadow: 0 0 8px #FACC15;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      color: #FFFFFF;
    }
    p {
      color: #94A3B8;
      font-size: 0.925rem;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .brand {
      color: #64748B;
      font-size: 0.8rem;
      border-top: 1px solid #1E293B;
      padding-top: 1.25rem;
    }
    .brand strong {
      color: #94A3B8;
    }
    .admin-link {
      display: inline-block;
      margin-top: 1rem;
      font-size: 0.75rem;
      color: #38BDF8;
      text-decoration: none;
    }
    .admin-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="pulse"></span>
      Pemeliharaan Terjadwal
    </div>
    <h1>Sistem Sedang Ditingkatkan</h1>
    <p>Kami sedang melakukan pemeliharaan berkala dan peningkatan performa sistem demi kenyamanan belajar Anda. Silakan kembali dalam beberapa saat.</p>
    <div class="brand">
      PT. Matoh Technologies Indonesia &bull; <strong>Make You Ready Digital</strong>
    </div>
    <a href="/login?admin=1" class="admin-link">Login Administrator &rarr;</a>
  </div>
</body>
</html>`;
        return new NextResponse(maintenanceHtml, {
          status: 503,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Retry-After": "300",
            "Cache-Control": "no-store, max-age=0",
          },
        });
      }

      return NextResponse.json(
        {
          error: "Service Temporarily Unavailable",
          message: "Platform sedang dalam pemeliharaan berkala. Silakan coba beberapa saat lagi.",
        },
        {
          status: 503,
          headers: {
            "Retry-After": "300",
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }
  }

  // 6. Defense in Depth: Protect /api/admin/* endpoints
  if (isApiAdminRoute) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Akses admin diperlukan" }, { status: 403 });
    }
  }

  // 7. Redirect authenticated users away from auth pages (with smart callback navigation)
  if (isAuthRoute && session) {
    const rawCallback = request.nextUrl.searchParams.get("callbackUrl");
    const target = isAdmin
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
    if (isAdmin && request.nextUrl.searchParams.get("view") !== "student") {
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
      if (isMaintenanceMode) {
        loginUrl.searchParams.set("admin", "1");
      }
      loginUrl.searchParams.set("callbackUrl", fullUrl);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
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
