"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  User,
  Copy,
  Check,
  Printer,
  Search,
  ExternalLink,
  BookOpen,
  FileCode2,
  HelpCircle,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";
import { AddToLinkedInButton } from "@/components/certificates/add-to-linkedin-button";
import { OfficialEmbossedSeal } from "@/components/certificates/official-embossed-seal";
import { LinkedInCredentialPreview } from "@/components/certificates/linkedin-credential-preview";
import type { TranscriptAssessmentItem } from "@/components/certificates/certificate-transcript-card";

interface VerifyClientProps {
  certificateCode: string;
  studentName: string;
  studentEmail?: string | null;
  courseTitle: string;
  courseSlug?: string;
  categoryName: string;
  issuerName: string;
  issuedAt?: string | Date;
  issuedAtFormatted: string;
  totalHours: number;
  overallScore: number;
  finalGrade: string;
  predicate: string;
  signatoryName1: string;
  signatoryRole1: string;
  signatoryName2: string;
  signatoryRole2: string;
  qrCodeUrl?: string;
  items: TranscriptAssessmentItem[];
  verifyUrl: string;
}

export function VerifyClient({
  certificateCode,
  studentName,
  courseTitle,
  categoryName,
  issuerName,
  issuedAt,
  issuedAtFormatted,
  totalHours,
  signatoryName1,
  signatoryRole1,
  signatoryName2,
  signatoryRole2,
  qrCodeUrl,
  items,
}: VerifyClientProps) {
  const [copied, setCopied] = useState(false);
  const [searchCode, setSearchCode] = useState("");

  const t = useTranslations("verify");
  const { locale } = useAppLocale();
  const isEn = locale === "en";
  const dateLocale = isEn ? enUS : idLocale;

  // Dynamically formatted date according to currently active locale
  const formattedDate = issuedAt
    ? format(new Date(issuedAt), "d MMMM yyyy", { locale: dateLocale })
    : issuedAtFormatted;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    window.location.href = `/verify/${encodeURIComponent(searchCode.trim().toUpperCase())}`;
  };

  const getLocalizedItemType = (type: string) => {
    if (type === "quiz") return t("type_quiz");
    if (type === "assignment") return t("type_assignment");
    return t("type_module");
  };

  const getLocalizedItemStatus = (status: string) => {
    if (status === "KOMPETEN") return t("status_competent");
    if (status === "LULUS") return t("status_passed");
    if (status === "DISETUJUI") return t("status_approved");
    return status;
  };

  return (
    <div className="space-y-8 print-page-wrapper">
      {/* Print Stylesheet for A4 Portrait Document Standard */}
      <style jsx global>{`
        @media print {
          header, nav, footer, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-only {
            display: block !important;
          }
          .print-page-wrapper {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Formal Print Letterhead (Kop Surat Resmi - Visible only when printed) */}
      <div className="print-only pb-6 mb-6 border-b-2 border-stone-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-stone-900">
              PT. MATOH TECHNOLOGIES INDONESIA
            </h1>
            <p className="text-[11px] text-stone-700 font-medium">
              SK Kemenkumham RI: AHU-064920.AH.01.30.Tahun 2024 • NIB Terdaftar Resmi
            </p>
            <p className="text-[10px] text-stone-500">
              Jl. RAMUSEL I/7A, Rawamangun, Jakarta Timur 13220 | Hotline: 0812-1010-6680 | info@matohtechnologies.com
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1 border border-stone-800 text-[11px] font-mono font-bold uppercase">
              {t("badge_status")}
            </span>
            <p className="text-[10px] text-stone-500 mt-1">
              Tanggal Cetak: {new Date().toLocaleDateString(isEn ? "en-US" : "id-ID", { dateStyle: "long" })}
            </p>
          </div>
        </div>
        <div className="text-center pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 underline underline-offset-4">
            SURAT KETERANGAN VERIFIKASI KEABSAHAN SERTIFIKAT KOMPETENSI RESMI
          </h2>
        </div>
      </div>

      {/* 1. Official Verified Hero Banner (Web Hero - Hidden in print) */}
      <div className="no-print relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-stone-900 to-slate-950 border border-emerald-500/30 shadow-2xl p-6 sm:p-10 text-white">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Verification Status Pill & Language Switcher on Hero */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <span>{t("badge_status")}</span>
              </div>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("panel_title")}
            </h1>

            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t("panel_description", { issuer: issuerName })}
            </p>
          </div>

          {/* Holographic Embossed Seal + QR & Serial Box on Hero */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0">
            <OfficialEmbossedSeal size="md" className="hidden sm:flex" />

            <div className="bg-stone-900/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
              {qrCodeUrl ? (
                <div className="w-20 h-20 rounded-xl bg-white p-1 border border-stone-700 shadow-sm shrink-0 flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="Barcode Verifikasi"
                    width={72}
                    height={72}
                    style={{ aspectRatio: "1 / 1" }}
                    className="w-full h-full object-contain block aspect-square"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-stone-800 flex items-center justify-center text-stone-400">
                  <ShieldCheck size={32} />
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {t("unique_credential_id")}
                </span>
                <p className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
                  {certificateCode}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-300">
                    {t("active_registered")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Penerima Kredensial */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-warm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                {t("recipient_label")}
              </p>
              <h3 className="text-base font-bold text-stone-900 line-clamp-1">{studentName}</h3>
            </div>
          </div>

          <div className="space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span className="text-stone-400">{t("certificate_id")}</span>
              <span className="font-mono font-bold text-stone-800">{certificateCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">{t("validation_status")}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> {t("valid_authenticated")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">{t("validity_period")}</span>
              <span className="font-semibold text-stone-800">{t("lifetime")}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Program Kursus */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-warm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                {t("training_program")}
              </p>
              <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full mt-0.5">
                {categoryName}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2">
              {courseTitle}
            </h4>
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span className="text-stone-400">{t("learning_workload")}</span>
                <span className="font-bold text-stone-800">
                  {t("jp_unit", { hours: totalHours })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">{t("graduation_date")}</span>
                <span className="font-semibold text-stone-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">{t("issuing_institution")}</span>
                <span className="font-semibold text-stone-800 truncate max-w-[200px]" title={issuerName}>
                  {issuerName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar with Switch Language */}
      <div className="no-print bg-white rounded-3xl p-5 border border-stone-200/90 shadow-warm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Official Full Certificate */}
          <Link
            href={`/certificates/${certificateCode}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Award size={16} />
            <span>{t("view_certificate_doc")}</span>
            <ExternalLink size={14} className="opacity-80" />
          </Link>

          {/* Add to LinkedIn Button */}
          <AddToLinkedInButton
            courseTitle={courseTitle}
            certificateCode={certificateCode}
            issuedAt={issuedAt || new Date()}
            issuerName={issuerName}
            size="md"
            variant="brand"
            locale={locale}
          />

          {/* Print/Download Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Printer size={15} />
            <span>{t("print_proof")}</span>
          </button>
        </div>

        {/* Right side: Copy Link */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check size={15} className="text-green-600" />
                <span className="text-green-700">{t("link_copied")}</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>{t("copy_link")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Official Academic Transcript & Competencies Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-warm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/80 gap-3">
          <div>
            <h2
              className="text-lg sm:text-xl font-bold text-stone-900"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("transcript_title")}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {t("transcript_subtitle")}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold shrink-0">
            <span>{t("total_workload")}</span>
            <strong className="text-stone-900">{totalHours} JP</strong>
          </div>
        </div>

        {/* Transcript Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-900 text-stone-100 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 rounded-l-xl w-12 text-center">{t("table_no")}</th>
                <th className="py-3 px-3.5">{t("table_unit")}</th>
                <th className="py-3 px-3.5">{t("table_category")}</th>
                <th className="py-3 px-3.5 text-center">{t("table_workload")}</th>
                <th className="py-3 px-3.5 text-center">{t("table_score")}</th>
                <th className="py-3 px-3.5 text-center">{t("table_grade")}</th>
                <th className="py-3 px-3.5 text-center rounded-r-xl">{t("table_status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3.5 text-center font-mono text-stone-400 text-xs">
                    {index + 1}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-stone-800">
                    <div className="flex items-center gap-2">
                      {item.type === "quiz" ? (
                        <HelpCircle size={15} className="text-amber-500 shrink-0" />
                      ) : item.type === "assignment" ? (
                        <FileCode2 size={15} className="text-sky-500 shrink-0" />
                      ) : (
                        <BookOpen size={15} className="text-blue-500 shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      {getLocalizedItemType(item.type)}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono text-xs text-stone-700">
                    {item.workload}
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono font-bold text-stone-900">
                    {item.score !== null ? `${item.score}/${item.maxScore}` : "—"}
                  </td>
                  <td className="py-3 px-3.5 text-center font-bold text-amber-700">
                    {item.grade}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {getLocalizedItemStatus(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures & Accreditation Footer */}
        <div className="pt-6 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center p-2 text-stone-700 border border-stone-200">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{issuerName}</p>
              <p className="text-[11px] text-stone-500">
                {t("accreditation_desc")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-6 text-xs text-stone-700">
            <div className="text-left sm:text-right">
              <p className="font-serif italic font-bold text-stone-900">{signatoryName1}</p>
              <p className="text-[10px] text-stone-500">{signatoryRole1}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-serif italic font-bold text-stone-900">{signatoryName2}</p>
              <p className="text-[10px] text-stone-500">{signatoryRole2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. LinkedIn Profile Card Simulation (Web Only) */}
      <div className="no-print">
        <LinkedInCredentialPreview
          courseTitle={courseTitle}
          certificateCode={certificateCode}
          issuerName={issuerName}
          issuedAtFormatted={formattedDate}
          issuedAt={issuedAt}
          locale={locale}
        />
      </div>

      {/* 6. Quick Lookup / Verify Another Certificate (Web Only) */}
      <div className="no-print bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200/80 space-y-4">
        <div className="max-w-xl">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Search size={18} className="text-blue-600" />
            <span>{t("search_other_title")}</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {t("search_other_desc")}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
          <label htmlFor="verify-search-code" className="sr-only">
            {t("search_placeholder")}
          </label>
          <input
            id="verify-search-code"
            name="code"
            autoComplete="off"
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-blue-500 font-mono uppercase"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            {t("check_validity_btn")}
          </button>
        </form>
      </div>
    </div>
  );
}
