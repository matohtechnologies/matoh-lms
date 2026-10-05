"use client";

import React from "react";
import { Award, ShieldCheck, CheckCircle2, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CertificateBackDesignConfig } from "@/lib/certificate-templates";

export interface TranscriptAssessmentItem {
  id: string;
  title: string;
  type: "module" | "quiz" | "assignment";
  workload: string;
  score: number;
  maxScore: number;
  grade: string;
  status: "KOMPETEN" | "LULUS" | "DISETUJUI";
}

export interface CertificateTranscriptData {
  studentName: string;
  studentEmail?: string | null;
  courseTitle: string;
  categoryName?: string;
  certificateCode: string;
  issueDisplay: string;
  issuerName: string;
  instructorName: string;
  signatoryRole1: string;
  signatoryName2: string;
  signatoryRole2: string;
  qrCodeUrl?: string;
  totalLessons: number;
  totalHours: number;
  overallScore: number;
  finalGrade: string;
  predicate: string;
  items: TranscriptAssessmentItem[];
}

interface CertificateTranscriptCardProps {
  data: CertificateTranscriptData;
  backConfig?: CertificateBackDesignConfig | null;
  className?: string;
}

export function CertificateTranscriptCard({
  data,
  backConfig,
  className,
}: CertificateTranscriptCardProps) {
  const {
    studentName,
    courseTitle,
    categoryName,
    certificateCode,
    issueDisplay,
    issuerName,
    instructorName,
    signatoryRole1,
    signatoryName2,
    signatoryRole2,
    qrCodeUrl,
    totalHours,
    overallScore,
    finalGrade,
    predicate,
    items,
  } = data;

  const showWorkload = backConfig?.showWorkloadColumn ?? true;
  const showCategory = backConfig?.showCategoryColumn ?? true;
  const showGrade = backConfig?.showGradeColumn ?? true;
  const showStatus = backConfig?.showStatusBadge ?? true;
  const showScore = backConfig?.showScoreSummary ?? true;
  const showPredicateBadge = backConfig?.showPredicate ?? true;
  const showScale = backConfig?.showScaleLegend ?? true;
  const showQr = backConfig?.showQrCode ?? true;

  const headerTitle = backConfig?.headerTitle || "Transkrip Nilai & Capaian Kompetensi";
  const headerSubtitle =
    backConfig?.headerSubtitle || "Official Academic Transcript & Competency Assessment";

  const getTableHeaderClass = () => {
    switch (backConfig?.tableTheme) {
      case "amber":
        return "bg-amber-900 text-amber-100";
      case "blue":
        return "bg-sky-950 text-sky-100";
      case "emerald":
        return "bg-emerald-950 text-emerald-100";
      case "minimal":
        return "bg-stone-100 text-stone-900 border-b border-stone-200";
      case "dark":
      default:
        return "bg-stone-900 text-stone-100 print:bg-stone-800";
    }
  };

  const getBorderClasses = () => {
    switch (backConfig?.borderStyle) {
      case "none":
        return "border-none";
      case "double":
        return "border-8 border-double border-stone-800/20";
      case "dashed":
        return "border-4 border-dashed border-stone-400";
      case "gold-frame":
        return "border-8 border-amber-900/15";
      case "solid":
      default:
        return "border-8 border-stone-800/10 print:border-2 print:border-stone-800/30";
    }
  };

  return (
    <div
      className={cn(
        "certificate-transcript-card w-full max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 shadow-warm-lg relative overflow-hidden print:w-full print:max-w-none print:rounded-none print:p-6 print:shadow-none print:m-0 print:break-inside-avoid print:page-break-inside-avoid transition-all",
        getBorderClasses(),
        className
      )}
      style={{
        backgroundColor: backConfig?.backgroundColor || "#ffffff",
      }}
    >
      {/* Custom Template Background Image */}
      {backConfig?.backgroundUrl && (
        <img
          src={backConfig.backgroundUrl}
          alt="Back Template Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        />
      )}

      {/* Gold Frame Ornaments */}
      {backConfig?.borderStyle === "gold-frame" && (
        <div className="absolute inset-2 border-2 border-dashed border-amber-600/30 rounded-2xl pointer-events-none z-1" />
      )}

      {/* Inner Container */}
      <div
        className={cn(
          "rounded-2xl p-6 sm:p-8 relative z-10 border border-stone-200 shadow-2xs print:p-4 print:border-stone-300 transition-all",
          backConfig?.backgroundUrl ? "bg-white/92 backdrop-blur-xs shadow-sm" : "bg-white"
        )}
      >
        {/* Header Document */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/80 gap-4 print:pb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 flex items-center justify-center text-amber-400 shadow-xs print:w-9 print:h-9">
              <Award size={24} className="print:w-5 print:h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-extrabold tracking-widest text-stone-500">
                {issuerName}
              </p>
              <h2
                className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {headerTitle}
              </h2>
              <p className="text-[11px] text-stone-400">{headerSubtitle}</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-500 space-y-0.5 print:text-[10px]">
            <p>
              ID Kredensial:{" "}
              <span className="font-mono font-bold text-stone-900">
                {certificateCode.toUpperCase()}
              </span>
            </p>
            <p>
              Tanggal Lulus: <span className="text-stone-800 font-medium">{issueDisplay}</span>
            </p>
          </div>
        </div>

        {/* Student & Course Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 print:grid-cols-3 print:gap-2 print:my-3">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Nama Peserta
            </p>
            <p className="text-sm font-bold text-stone-900 truncate mt-0.5">{studentName}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Program Kursus
            </p>
            <p className="text-sm font-bold text-stone-900 truncate mt-0.5">{courseTitle}</p>
            {categoryName && (
              <p className="text-[10px] text-blue-600 font-medium truncate">{categoryName}</p>
            )}
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Beban Belajar
            </p>
            <p className="text-sm font-bold text-stone-900 mt-0.5">
              {totalHours} Jam Pembelajaran (JP)
            </p>
          </div>
        </div>

        {/* Assessment Items Table */}
        <div className="my-5 overflow-hidden rounded-xl border border-stone-200 shadow-2xs print:my-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={cn("text-[10px] uppercase tracking-wider", getTableHeaderClass())}>
                <th className="py-2.5 px-3 font-semibold text-center w-10">No</th>
                <th className="py-2.5 px-4 font-semibold">Unit Kompetensi / Aspek Evaluasi</th>
                {showCategory && (
                  <th className="py-2.5 px-3 font-semibold text-center w-28">Kategori</th>
                )}
                {showWorkload && (
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Beban (JP)</th>
                )}
                <th className="py-2.5 px-3 font-semibold text-center w-20">Skor</th>
                {showGrade && (
                  <th className="py-2.5 px-3 font-semibold text-center w-16">Grade</th>
                )}
                {showStatus && (
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Status</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={cn(index % 2 === 1 ? "bg-stone-50/40" : "bg-white")}
                >
                  <td className="py-2 px-3 text-center text-stone-400 font-mono text-[11px]">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 text-stone-800 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate max-w-sm sm:max-w-md">{item.title}</span>
                    </div>
                  </td>
                  {showCategory && (
                    <td className="py-2 px-3 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide",
                          item.type === "quiz"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.type === "assignment"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-stone-100 text-stone-700"
                        )}
                      >
                        {item.type === "quiz"
                          ? "Evaluasi Kuis"
                          : item.type === "assignment"
                          ? "Tugas Proyek"
                          : "Modul Teori"}
                      </span>
                    </td>
                  )}
                  {showWorkload && (
                    <td className="py-2 px-3 text-center text-stone-600 font-mono text-[11px]">
                      {item.workload}
                    </td>
                  )}
                  <td className="py-2 px-3 text-center font-bold text-stone-900 font-mono text-[11px]">
                    {item.score}
                    <span className="text-stone-400 font-normal text-[10px]">/100</span>
                  </td>
                  {showGrade && (
                    <td className="py-2 px-3 text-center font-bold text-amber-700 font-mono text-[11px]">
                      {item.grade}
                    </td>
                  )}
                  {showStatus && (
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        {item.status}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grade Summary Box */}
        {(showScore || showPredicateBadge || showScale) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 print:grid-cols-3 print:gap-2 print:my-3 print:p-3">
            {showScore && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex flex-col items-center justify-center font-bold font-mono">
                  <span className="text-base leading-none">{Math.round(overallScore)}</span>
                  <span className="text-[8px] opacity-70 leading-none">/ 100</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Nilai Rata-rata</p>
                  <p className="text-xs font-bold text-stone-900">
                    {overallScore.toFixed(1)} / 100
                  </p>
                </div>
              </div>
            )}

            {showPredicateBadge && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-lg font-mono">
                  {finalGrade}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">
                    Predikat Kelulusan
                  </p>
                  <p className="text-xs font-bold text-amber-900">{predicate}</p>
                </div>
              </div>
            )}

            {showScale && (
              <div className="text-[10px] text-stone-500 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-amber-200/60 pt-2 sm:pt-0 sm:pl-3">
                <p className="font-bold text-stone-700 uppercase mb-0.5">Keterangan Skala:</p>
                <p>85–100 (A) : Dengan Pujian | 75–84 (B) : Memuaskan</p>
              </div>
            )}
          </div>
        )}

        {/* Validation QR & Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200 items-end print:grid-cols-3 print:gap-2 print:pt-2">
          {/* QR Validation */}
          <div className="flex items-center gap-3">
            {showQr && (
              <>
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Verifikasi"
                    className="w-14 h-14 rounded-lg border border-stone-200 p-0.5 bg-white shrink-0 print:w-11 print:h-11"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                    <QrCode size={24} />
                  </div>
                )}
                <div className="text-[10px] text-stone-500">
                  <p className="font-bold text-stone-800 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    Terverifikasi Resmi
                  </p>
                  <p className="mt-0.5 leading-tight">
                    Pindai QR untuk memvalidasi keaslian dokumen secara online.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Instructor Signature */}
          <div className="text-center sm:text-right print:text-right">
            <p className="font-serif italic text-base text-stone-800 mb-0.5 print:text-xs">
              {instructorName}
            </p>
            <div className="w-24 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 mb-1" />
            <p className="text-[10px] font-semibold text-stone-700">{signatoryRole1}</p>
            <p className="text-[9px] text-stone-400">{issuerName}</p>
          </div>

          {/* Academic Director Signature */}
          <div className="text-center sm:text-right print:text-right">
            <p className="font-serif italic text-base text-stone-800 mb-0.5 print:text-xs">
              {signatoryName2}
            </p>
            <div className="w-24 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 mb-1" />
            <p className="text-[10px] font-semibold text-stone-700">{signatoryRole2}</p>
            <p className="text-[9px] text-stone-400">Direktorat Akademik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
