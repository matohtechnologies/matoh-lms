import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://images.unsplash.com https://ui-avatars.com https://lh3.googleusercontent.com https://img.youtube.com https://i.ytimg.com;
  font-src 'self' https://fonts.gstatic.com data:;
  frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com;
  connect-src 'self' https://app.sandbox.midtrans.com https://api.sandbox.midtrans.com https://app.midtrans.com https://api.midtrans.com;
  media-src 'self' data: blob: https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  // 1. Security: Hide server technology signature
  poweredByHeader: false,

  // 2. Performance: Enable automatic Brotli / Gzip compression
  compress: true,

  // 3. Performance: Image optimization pipeline
  images: {
    dangerouslyAllowLocalIP: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "*.ytimg.com",
      },
    ],
  },

  // 4. Performance & clean output in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // 5. Hardened HTTP Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
