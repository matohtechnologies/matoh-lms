"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Printer, Copy, Check, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { CertificateCanvasRenderer } from "@/components/certificates/certificate-canvas-renderer";
import { CertificateDesignConfig, CertificateDataValues } from "@/lib/certificate-templates";

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
  templateUrl,
  templateConfig,
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("certificate");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : idLocale;

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
    signatory_name_1: instructorName,
    signatory_role_1: signatoryRole1,
    signatory_name_2: signatoryName2,
    signatory_role_2: signatoryRole2,
    subtitle: subtitle,
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 text-center shadow-warm-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Lock size={28} />
          </div>
          <h1
            className="text-2xl font-bold text-stone-900 mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("not_eligible_title")}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            {lockReason || t("not_eligible_desc")}
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard/my-courses"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors shadow-xs"
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
    <div className="certificate-view-wrapper min-h-screen bg-[#faf8f5] py-12 px-4 sm:px-6 flex flex-col items-center justify-center print:bg-white print:p-0 print:m-0 print:min-h-0 print:h-auto print:block">
      {/* Top Action Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          {t("back_link")}
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
            {copied ? t("copied") : t("copy_link")}
          </Button>
          <Button size="sm" onClick={handlePrint} leftIcon={<Printer size={14} />}>
            {t("print")}
          </Button>
        </div>
      </div>

      {/* Certificate Frame */}
      {templateConfig && templateConfig.elements?.length > 0 ? (
        <div className="certificate-card w-full max-w-4xl rounded-2xl shadow-warm-lg overflow-hidden bg-white print:w-full print:max-w-none print:shadow-none print:rounded-none print:m-0 print:break-inside-avoid print:page-break-inside-avoid">
          <CertificateCanvasRenderer
            config={templateConfig}
            data={certData}
            isInteractive={false}
            className="w-full h-auto"
          />
        </div>
      ) : (
        <div
          className={cn(
            "certificate-card w-full max-w-4xl rounded-3xl p-8 sm:p-12 shadow-warm-lg relative overflow-hidden print:w-full print:max-w-none print:rounded-2xl print:p-6 print:shadow-none print:m-0 print:break-inside-avoid print:page-break-inside-avoid",
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
              {/* Decorative backgrounds */}
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-orange-100/40 pointer-events-none blur-3xl print:hidden" />
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md mb-3 print:mb-1.5 print:w-11 print:h-11">
                <Award size={28} className="text-white print:w-5 print:h-5" />
              </div>
              <h2
                className="text-lg font-bold tracking-widest uppercase text-stone-800 print:text-base"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {studentName}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto my-3 rounded-full print:my-1.5" />
            </div>

            <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed mb-6 print:text-xs print:mb-3 print:max-w-2xl">
              {subtitle}
            </p>

            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl py-4 px-6 inline-block max-w-2xl mb-8 print:py-2 print:px-5 print:mb-3">
              {categoryName && (
                <p className="text-xs text-orange-500 font-medium mb-1 uppercase tracking-wider print:text-[10px]">
                  {categoryName}
                </p>
              )}
              <h3
                className="text-xl sm:text-2xl font-bold text-orange-950 print:text-lg"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {courseTitle}
              </h3>
            </div>

            {/* Signatures & Verification Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-200 items-end print:grid-cols-3 print:gap-4 print:pt-3">
              {/* Instructor Signature */}
              <div className="text-center sm:text-left print:text-left">
                <p className="font-serif italic text-lg text-stone-800 mb-1 print:text-base">{instructorName}</p>
                <div className="w-32 h-px bg-stone-300 mx-auto sm:mx-0 print:mx-0 mb-1" />
                <p className="text-xs font-semibold text-stone-700 print:text-[11px]">{signatoryRole1}</p>
                <p className="text-[11px] text-stone-400 print:text-[10px]">{issuerName}</p>
              </div>

              {/* Official Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner mb-2 print:w-11 print:h-11 print:mb-1">
                  <ShieldCheck size={28} className="text-amber-600 print:w-5 print:h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full print:text-[9px]">
                  VERIFIED CREDENTIAL
                </span>
              </div>

              {/* Academic Director */}
              <div className="text-center sm:text-right print:text-right">
                <p className="font-serif italic text-lg text-stone-800 mb-1 print:text-base">{signatoryName2}</p>
                <div className="w-32 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 print:ml-auto print:mr-0 mb-1" />
                <p className="text-xs font-semibold text-stone-700 print:text-[11px]">{signatoryRole2}</p>
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
  );
}
