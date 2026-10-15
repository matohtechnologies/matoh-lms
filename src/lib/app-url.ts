import { headers } from "next/headers";
import os from "os";

function getLocalIpAddress(): string | null {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          if (
            iface.address.startsWith("192.168.") ||
            iface.address.startsWith("10.") ||
            iface.address.startsWith("172.")
          ) {
            return iface.address;
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
  return null;
}

/**
 * Returns the dynamic base URL of the application.
 * Automatically resolves the domain from the incoming request headers (x-forwarded-host / host),
 * ensuring URLs in QR codes, share links, and redirects work seamlessly across:
 * - Localhost / Local Wi-Fi (allowing mobile devices on same Wi-Fi to scan & open)
 * - Staging / Preview URLs (e.g. Vercel preview, Railway, Render)
 * - Custom production domains (e.g. https://matohtechnologies.com)
 */
export async function getAppBaseUrl(): Promise<string> {
  // 1. If explicit environment variable NEXT_PUBLIC_APP_URL is set and not localhost, prioritize it
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1")
  ) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 2. Check incoming request headers
  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto =
      headersList.get("x-forwarded-proto") ||
      (host && !host.includes("localhost") && !host.includes("127.0.0.1")
        ? "https"
        : "http");

    if (host) {
      // In production / hosted environment: use the active domain
      if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
        return `${proto}://${host}`;
      }

      // In local development: if host is localhost, resolve to the local Wi-Fi / LAN IP
      // so smartphone cameras scanning the QR code can open the page over local network!
      const localIp = getLocalIpAddress();
      if (localIp) {
        const port = host.split(":")[1] || "3000";
        return `http://${localIp}:${port}`;
      }

      return `${proto}://${host}`;
    }
  } catch {
    // Handled outside of request context
  }

  // 3. Fallback to NEXT_PUBLIC_APP_URL if defined
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 4. Vercel deployment URL fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 5. Development IP fallback or localhost
  const fallbackIp = getLocalIpAddress();
  if (fallbackIp) {
    return `http://${fallbackIp}:3000`;
  }

  return "http://localhost:3000";
}
