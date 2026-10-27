import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import LocaleProvider from "@/components/providers/locale-provider";
import SessionProvider from "@/components/providers/session-provider";
import { DynamicAlertProvider } from "@/components/ui/dynamic-alert-provider";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { FloatingActionDock } from "@/components/ui/floating-action-dock";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e7485" },
    { media: "(prefers-color-scheme: dark)", color: "#072830" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PT. Matoh Technologies Indonesia — Platform Pelatihan & Pembelajaran Digital",
    template: "%s | Matoh Technologies",
  },
  description:
    "Platform resmi PT. Matoh Technologies Indonesia (SK Kemenkumham: AHU-064920.AH.01.30.Tahun 2024). Pelatihan digital marketing, inovasi bisnis, dan analisis keputusan terstruktur bagi UMKM dan akademisi.",
  keywords: ["matoh technologies", "pelatihan digital marketing", "kursus umkm", "mcdm ahp ism", "design thinking", "riset bisnis", "literasi digital"],
  authors: [{ name: "PT. Matoh Technologies Indonesia" }],
  creator: "PT. Matoh Technologies Indonesia",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.matohtechnologies.com",
    title: "PT. Matoh Technologies Indonesia — Make You Ready Digital",
    description:
      "Pusat pembelajaran penerapan teknologi digital terbaik bagi pelaku usaha (UMKM), akademisi, dan peserta didik.",
    siteName: "Matoh Technologies",
  },
  twitter: {
    card: "summary_large_image",
    title: "PT. Matoh Technologies Indonesia",
    description: "Make You Ready Digital — Platform Pelatihan Digital Modern",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/matoh-logo.png",
    shortcut: "/images/matoh-logo.png",
    apple: "/images/matoh-logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="font-sans antialiased">
        <LocaleProvider initialLocale={locale}>
          <SessionProvider>
            <DynamicAlertProvider>
              {children}
              <FloatingActionDock />
            </DynamicAlertProvider>
          </SessionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
