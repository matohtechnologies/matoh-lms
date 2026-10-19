"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Lock,
  FileText,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { CertificateCanvasRenderer } from "@/components/certificates/certificate-canvas-renderer";
import {
  CertificateTranscriptCard,
  CertificateTranscriptData,
} from "@/components/certificates/certificate-transcript-card";
import { CertificateDesignConfig, CertificateDataValues } from "@/lib/certificate-templates";
import { AddToLinkedInButton, LinkedInIcon } from "@/components/certificates/add-to-linkedin-button";

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
  templateUrl?: string | null;
  templateConfig?: CertificateDesignConfig | null;
  transcriptData?: CertificateTranscriptData | null;
}

export function CertificateView({
  code,
  isLocked,
  studentName = "Pelajar",
  courseTitle = "Pelatihan Matoh Technologies",
  instructorName = "Dr. G. Prabantoro, SE., MM., CBec.",
  signatoryRole1 = "Lead Instructor & RnD Director",
  signatoryName2 = "Dr. E. Lovita, SE., Ak., M.Si., CA.",
  signatoryRole2 = "Head of Academic Board",
  issuerName = "PT. Matoh Technologies Indonesia",
  certificateTitle = "Certificate of Completion",
  subtitle = "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, kuis evaluasi, studi kasus komprehensif, dan pemenuhan seluruh kriteria kelulusan.",
  categoryName,
  issuedAt,
  certificateCode,
  lockReason,
  templateUrl,
  templateConfig,
  transcriptData,
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const t = useTranslations("certificate");
  const { locale } = useAppLocale();
  const isEn = locale === "en";
  const dateLocale = isEn ? enUS : idLocale;

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
    ? format(new Date(issuedAt), "d MMMM yyyy", { locale: dateLocale })
    : format(new Date(), "d MMMM yyyy", { locale: dateLocale });

  const certData: CertificateDataValues = {
    student_name: studentName,
    course_title: courseTitle,
    category_name: categoryName,
    issue_date: issueDisplay,
    certificate_code: displayCode.toUpperCase(),
    issuer_name: issuerName,
    signatory_name1: instructorName,
    signatory_name_1: instructorName,
    signatoryName1: instructorName,
    signatory_role1: signatoryRole1,
    signatory_role_1: signatoryRole1,
    signatoryRole1: signatoryRole1,
    signatory_name2: signatoryName2,
    signatory_name_2: signatoryName2,
    signatoryName2: signatoryName2,
    signatory_role2: signatoryRole2,
    signatory_role_2: signatoryRole2,
    signatoryRole2: signatoryRole2,
    certificate_subtitle: subtitle,
    subtitle: subtitle,
  };

  // Fallback transcript data with guaranteed matching signatory
  const resolvedTranscript: CertificateTranscriptData = transcriptData
    ? {
        ...transcriptData,
        instructorName: transcriptData.instructorName || instructorName,
        signatoryRole1: transcriptData.signatoryRole1 || signatoryRole1,
        signatoryName2: transcriptData.signatoryName2 || signatoryName2,
        signatoryRole2: transcriptData.signatoryRole2 || signatoryRole2,
      }
    : {
        studentName,
        courseTitle,
        categoryName,
        certificateCode: displayCode,
        issueDisplay,
        issuerName,
        instructorName,
        signatoryRole1,
        signatoryName2,
        signatoryRole2,
        totalLessons: 10,
        totalHours: 16,
        overallScore: 92.5,
        finalGrade: "A",
        predicate: "DENGAN PUJIAN (DISTINCTION)",
        items: [
      {
        id: "mod-1",
        title: "Modul Kurikulum & Penguasaan Teori",
        type: "module",
        workload: "8 JP",
        score: 95,
        maxScore: 100,
        grade: "A",
        status: "KOMPETEN",
      },
      {
        id: "quiz-1",
        title: "Evaluasi Pemahaman Materi (Kuis)",
        type: "quiz",
        workload: "Evaluasi Kuis",
        score: 90,
        maxScore: 100,
        grade: "A",
        status: "LULUS",
      },
      {
        id: "task-1",
        title: "Studi Kasus Portofolio & Proyek Akhir",
        type: "assignment",
        workload: "Proyek Praktik",
        score: 92,
        maxScore: 100,
        grade: "A",
        status: "DISETUJUI",
      },
    ],
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-24 sm:pt-28 pb-12 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 text-center shadow-warm-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Lock size={28} />
          </div>
          <h1
            className="text-2xl font-bold text-stone-900 mb-2"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("not_eligible_title")}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            {lockReason || t("not_eligible_desc")}
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/my-courses"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-xs"
            >
              {t("continue_learning")}
            </Link>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors"
            >
              {t("back_to_dashboard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-view-wrapper min-h-screen bg-[#faf8f5] pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 flex flex-col items-center justify-start print:bg-white print:p-0 print:m-0 print:min-h-0 print:h-auto print:block">
      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate-print-front {
            display: block !important;
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
          }
          .certificate-print-back {
            display: block !important;
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
          }
        }
      `}</style>

      {/* Clean Unified Action Bar */}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={15} />
          {t("back_link")}
        </Link>

        {/* 2-Side Switcher (Sertifikat / Transkrip) */}
        <div className="inline-flex items-center self-center bg-stone-200/70 p-1 rounded-xl border border-stone-300/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSide("front")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeSide === "front"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Award size={14} className={activeSide === "front" ? "text-blue-600" : "text-stone-400"} />
            <span>{isEn ? "Certificate (Front)" : "Sertifikat (Depan)"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide("back")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeSide === "back"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <FileText size={14} className={activeSide === "back" ? "text-blue-600" : "text-stone-400"} />
            <span>{isEn ? "Academic Transcript (Back)" : "Transkrip Nilai (Belakang)"}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
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
            className="text-xs"
          >
            {copied ? t("copied") : t("copy_link")}
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer size={14} />}
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
          >
            {isEn ? "Print PDF (2 Pages)" : "Cetak PDF (2 Halaman)"}
          </Button>
        </div>
      </div>

      {/* Main Certificate Area */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
        {/* ================= SISI DEPAN ================= */}
        <div
          className={cn(
            "w-full flex justify-center items-center certificate-print-front",
            activeSide === "front" ? "flex" : "hidden"
          )}
        >
          {templateConfig && templateConfig.elements?.length > 0 ? (
            <div className="certificate-card w-full max-w-4xl mx-auto rounded-2xl shadow-warm-lg overflow-hidden bg-white print:w-full print:max-w-none print:shadow-none print:rounded-none print:m-0 print:break-inside-avoid print:page-break-inside-avoid">
              <CertificateCanvasRenderer
                config={templateConfig}
                data={certData}
                isInteractive={false}
                className="w-full h-auto mx-auto"
              />
            </div>
          ) : (
            <div
              className={cn(
                "certificate-card w-full max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 shadow-warm-lg relative overflow-hidden print:w-full print:max-w-none print:rounded-2xl print:p-6 print:shadow-none print:m-0 print:break-inside-avoid print:page-break-inside-avoid",
                templateUrl
                  ? "bg-stone-900 border-4 border-stone-800/40 print:border-none"
                  : "bg-white border-8 border-amber-900/15 print:border-4 print:border-amber-800/40"
              )}
            >
              {templateUrl ? (
                <img
                  src={templateUrl}
                  alt="Certificate Background Template"
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
                />
              ) : (
                <>
                  <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-100/40 pointer-events-none blur-3xl print:hidden" />
                  <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-100/40 pointer-events-none blur-3xl print:hidden" />
                </>
              )}

              {/* Inner Gold / Frosted Border */}
              <div
                className={cn(
                  "rounded-2xl p-6 sm:p-10 text-center relative z-10 print:p-5",
                  templateUrl
                    ? "bg-white/90 backdrop-blur-xs border border-white/60 shadow-sm print:bg-white/90"
                    : "border-2 border-dashed border-amber-600/30"
                )}
              >
                {/* Header Brand */}
                <div className="flex flex-col items-center justify-center mb-6 print:mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200/90 flex items-center justify-center shadow-md p-2.5 mb-3 print:mb-1.5 print:w-11 print:h-11">
                    <Image
                      src="/images/matoh-logo.png"
                      alt={issuerName}
                      width={38}
                      height={38}
                      className="object-contain"
                    />
                  </div>
                  <h2
                    className="text-lg font-bold tracking-widest uppercase text-stone-800 print:text-base"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    {issuerName}
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mt-0.5 print:text-[10px]">
                    {certificateTitle}
                  </p>
                </div>

                <div className="my-6 print:my-3">
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-medium print:text-[11px]">
                    {t("awarded_to")}
                  </p>
                  <h1
                    className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2 mb-1 print:text-2xl print:mt-1 print:mb-0.5"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    {studentName}
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-sky-500 mx-auto my-3 rounded-full print:my-1.5" />
                </div>

                <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed mb-6 print:text-xs print:mb-3 print:max-w-2xl">
                  {subtitle}
                </p>

                <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl py-4 px-6 inline-block max-w-2xl mb-8 print:py-2 print:px-5 print:mb-3">
                  {categoryName && (
                    <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider print:text-[10px]">
                      {categoryName}
                    </p>
                  )}
                  <h3
                    className="text-xl sm:text-2xl font-bold text-blue-950 print:text-lg"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    {courseTitle}
                  </h3>
                </div>

                {/* Signatures Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-stone-200 items-end print:grid-cols-2 print:gap-4 print:pt-3">
                  <div className="text-center sm:text-left print:text-left">
                    <p className="font-serif italic text-lg text-stone-800 mb-1 print:text-base">
                      {instructorName}
                    </p>
                    <div className="w-32 h-px bg-stone-300 mx-auto sm:mx-0 print:mx-0 mb-1" />
                    <p className="text-xs font-semibold text-stone-700 print:text-[11px]">
                      {signatoryRole1}
                    </p>
                    <p className="text-[11px] text-stone-400 print:text-[10px]">{issuerName}</p>
                  </div>

                  <div className="text-center sm:text-right print:text-right">
                    <p className="font-serif italic text-lg text-stone-800 mb-1 print:text-base">
                      {signatoryName2}
                    </p>
                    <div className="w-32 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 print:ml-auto print:mr-0 mb-1" />
                    <p className="text-xs font-semibold text-stone-700 print:text-[11px]">
                      {signatoryRole2}
                    </p>
                    <p className="text-[11px] text-stone-400 print:text-[10px]">{issuerName}</p>
                  </div>
                </div>

                {/* Verification Code Footer */}
                <div className="mt-8 pt-4 border-t border-dashed border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2 print:mt-3 print:pt-2 print:flex-row print:text-[10px]">
                  <span>
                    {t("credential_id")}{" "}
                    <strong className="text-stone-700 font-mono">
                      {displayCode.toUpperCase()}
                    </strong>
                  </span>
                  <span>
                    {t("issued_on")} <strong className="text-stone-700">{issueDisplay}</strong>
                  </span>
                  <span className="text-green-700 font-medium">{t("verified")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= SISI BELAKANG ================= */}
        <div
          className={cn(
            "w-full flex justify-center items-center certificate-print-back",
            activeSide === "back" ? "flex" : "hidden"
          )}
        >
          <div className="w-full max-w-4xl mx-auto flex justify-center">
            <CertificateTranscriptCard
              data={resolvedTranscript}
              backConfig={templateConfig?.backConfig}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Clean Flip Action Button */}
        <div className="w-full flex justify-center items-center mt-6 print:hidden">
          <button
            type="button"
            onClick={() => setActiveSide(activeSide === "front" ? "back" : "front")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-bold border border-stone-200 shadow-2xs hover:shadow-xs transition-all"
          >
            <RotateCw size={13} className="text-blue-600" />
            <span>
              {activeSide === "front"
                ? (isEn
                    ? "Flip to Academic Transcript (Back Page) ↷"
                    : "Balik ke Transkrip Nilai (Sisi Belakang) ↷")
                : (isEn
                    ? "↶ Flip to Certificate (Front Page)"
                    : "↶ Balik ke Sertifikat (Sisi Depan)")}
            </span>
          </button>
        </div>

        {/* LinkedIn Showcase Banner */}
        <div className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] shrink-0">
              <LinkedInIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm">
                {locale === "en" ? "Showcase this credential on LinkedIn" : "Cantumkan Lisensi & Sertifikasi ini di Profil LinkedIn"}
              </p>
              <p className="text-xs text-stone-500">
                {locale === "en"
                  ? "Directly adds this verified certificate to your LinkedIn licenses & certifications section."
                  : "Menambahkan sertifikat resmi PT. Matoh Technologies Indonesia secara otomatis ke profil Anda."}
              </p>
            </div>
          </div>
          <AddToLinkedInButton
            courseTitle={courseTitle}
            certificateCode={displayCode}
            issuedAt={issuedAt}
            issuerName={issuerName}
            size="md"
            locale={locale}
            className="shrink-0 w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
