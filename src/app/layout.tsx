import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { getLocale } from "next-intl/server";
import LocaleProvider from "@/components/providers/locale-provider";
import SessionProvider from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Earthy Academy — Platform Belajar Online",
    template: "%s | Earthy Academy",
  },
  description:
    "Platform belajar online terpercaya dengan kelas berkualitas tinggi dari instruktur berpengalaman. Kuasai skill baru dan raih karir impianmu.",
  keywords: ["online learning", "kelas online", "belajar", "programming", "desain", "bisnis"],
  authors: [{ name: "Earthy Academy" }],
  creator: "Earthy Academy",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://earthyacademy.com",
    title: "Earthy Academy — Platform Belajar Online",
    description:
      "Platform belajar online terpercaya dengan kelas berkualitas tinggi.",
    siteName: "Earthy Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earthy Academy",
    description: "Platform belajar online terpercaya",
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
    <html lang={locale} className={`${inter.variable} ${plusJakarta.variable}`}>
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
