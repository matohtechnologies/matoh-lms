"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Printer, Copy, Check, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface CertificateViewProps {
  code: string;
  isLocked: boolean;
  studentName?: string;
  courseTitle?: string;
  instructorName?: string;
  signatoryRole1?: string;
  signatoryName2?: string;
  signatoryRole2?: string;
  issuerName?: string;
  certificateTitle?: string;
  subtitle?: string;
  categoryName?: string;
  issuedAt?: string;
  certificateCode?: string;
  lockReason?: string;
}

export function CertificateView({
  code,
  isLocked,
  studentName = "Pelajar",
  courseTitle = "Kelas Earthy Academy",
  instructorName = "Ahmad Fadhil",
  signatoryRole1 = "Lead Instructor",
  signatoryName2 = "Dr. Santoso W.",
  signatoryRole2 = "Head of Curriculum",
  issuerName = "Earthy Academy",
  certificateTitle = "Certificate of Completion",
  subtitle = "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, kuis evaluasi, studi kasus komprehensif, dan pemenuhan seluruh kriteria kelulusan.",
  categoryName,
  issuedAt,
  certificateCode,
  lockReason,
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const displayCode = certificateCode ?? code;
  const issueDisplay = issuedAt
    ? format(new Date(issuedAt), "d MMMM yyyy", { locale: idLocale })
    : format(new Date(), "d MMMM yyyy", { locale: idLocale });

  if (isLocked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-warm-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Lock size={28} />
          </div>
          <h1
            className="text-2xl font-bold text-stone-900 mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            Sertifikat Belum Memenuhi Syarat
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            {lockReason ||
              "Sertifikat kelulusan resmi belum dapat diterbitkan atau dicetak karena Anda belum memenuhi seluruh kriteria kelulusan (materi, kuis evaluasi, atau persetujuan tugas) pada kelas ini."}
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/my-courses"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              Lanjutkan Belajar Sekarang
            </Link>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 flex flex-col items-center justify-center print:bg-white print:p-0">
      {/* Top Action Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={
              copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )
            }
          >
            {copied ? "Tautan Tersalin!" : "Salin Verifikasi"}
          </Button>
          <Button size="sm" onClick={handlePrint} leftIcon={<Printer size={14} />}>
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div className="w-full max-w-4xl bg-white border-8 border-amber-900/10 rounded-3xl p-8 sm:p-14 shadow-warm-lg relative overflow-hidden print:border-none print:shadow-none print:p-8">
        {/* Decorative backgrounds */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-orange-100/40 pointer-events-none blur-3xl print:hidden" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-100/40 pointer-events-none blur-3xl print:hidden" />

        {/* Inner Gold Border */}
        <div className="border-2 border-dashed border-amber-600/30 rounded-2xl p-6 sm:p-10 text-center relative z-10">
          {/* Header Brand */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md mb-3">
              <Award size={28} className="text-white" />
            </div>
            <h2
              className="text-lg font-bold tracking-widest uppercase text-stone-800"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {issuerName}
            </h2>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mt-0.5">
              {certificateTitle}
            </p>
          </div>

          <div className="my-6">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">
              Diberikan kepada:
            </p>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2 mb-1"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {studentName}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto my-3 rounded-full" />
          </div>

          <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed mb-6">
            {subtitle}
          </p>

          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl py-4 px-6 inline-block max-w-2xl mb-8">
            {categoryName && (
              <p className="text-xs text-orange-500 font-medium mb-1 uppercase tracking-wider">
                {categoryName}
              </p>
            )}
            <h3
              className="text-xl sm:text-2xl font-bold text-orange-950"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {courseTitle}
            </h3>
          </div>

          {/* Signatures & Verification Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-200 items-end">
            {/* Instructor Signature */}
            <div className="text-center sm:text-left">
              <p className="font-serif italic text-lg text-stone-800 mb-1">{instructorName}</p>
              <div className="w-32 h-px bg-stone-300 mx-auto sm:mx-0 mb-1" />
              <p className="text-xs font-semibold text-stone-700">{signatoryRole1}</p>
              <p className="text-[11px] text-stone-400">{issuerName}</p>
            </div>

            {/* Official Badge */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner mb-2">
                <ShieldCheck size={28} className="text-amber-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                VERIFIED CREDENTIAL
              </span>
            </div>

            {/* Academic Director */}
            <div className="text-center sm:text-right">
              <p className="font-serif italic text-lg text-stone-800 mb-1">{signatoryName2}</p>
              <div className="w-32 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 mb-1" />
              <p className="text-xs font-semibold text-stone-700">{signatoryRole2}</p>
              <p className="text-[11px] text-stone-400">{issuerName}</p>
            </div>
          </div>

          {/* Verification Code Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
            <span>
              ID Kredensial:{" "}
              <strong className="text-stone-700 font-mono">
                {displayCode.toUpperCase()}
              </strong>
            </span>
            <span>
              Diterbitkan Pada: <strong className="text-stone-700">{issueDisplay}</strong>
            </span>
            <span className="text-green-700 font-medium">Status: Terverifikasi Resmi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
