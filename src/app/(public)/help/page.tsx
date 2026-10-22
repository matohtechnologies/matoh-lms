import type { Metadata } from "next";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { HelpCircle } from "lucide-react";
import { HelpClient } from "./help-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Help Center & Frequently Asked Questions | PT. Matoh Technologies Indonesia"
      : "Pusat Bantuan & FAQ | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Find quick answers regarding Midtrans payments, course access, certificates, verification, and accounts at PT. Matoh Technologies Indonesia."
      : "Temukan jawaban cepat seputar pembayaran otomatis Midtrans, masa akses materi kelas, klaim dan verifikasi sertifikat, serta panduan akun di PT. Matoh Technologies Indonesia.",
  };
}

export default async function HelpPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Banner - Matching About Page style */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc] bg-dot-matrix relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs font-bold mb-6 shadow-2xs">
            <Image
              src="/images/matoh-logo.png"
              alt="Matoh Technologies"
              width={16}
              height={16}
              className="object-contain"
            />
            {isEn ? "Help Center & Knowledge Base" : "Pusat Bantuan & Panduan Pengguna"}
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "How Can We Help You" : "Bagaimana Kami Dapat"} <br />
            <span className="text-gradient">
              {isEn ? "Learn & Succeed?" : "Membantu Anda Hari Ini?"}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Search our knowledge base for answers to common questions about courses, automated payments, and verifiable certificates."
              : "Temukan panduan lengkap dan solusi instan untuk pertanyaan seputar metode pembayaran, akses materi, dan verifikasi legalitas sertifikat."}
          </p>
        </div>
      </section>

      {/* Interactive FAQ & Helpdesk */}
      <HelpClient isEn={isEn} />
    </div>
  );
}
