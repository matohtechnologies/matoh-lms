import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { getLocale } from "next-intl/server";
import LocaleProvider from "@/components/providers/locale-provider";
import SessionProvider from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <LocaleProvider initialLocale={locale}>
          <SessionProvider>
            {children}
          </SessionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
