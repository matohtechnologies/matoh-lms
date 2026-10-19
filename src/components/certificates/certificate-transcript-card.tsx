"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Award, ShieldCheck, QrCode, Maximize2, X, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CertificateBackDesignConfig } from "@/lib/certificate-templates";
import { useAppLocale } from "@/components/providers/locale-provider";

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
  signatoryName1?: string;
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
    signatoryName1,
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

  const effectiveInstructorName = instructorName || signatoryName1 || "Dr. G. Prabantoro, SE., MM., CBec.";
  const effectiveSignatoryRole1 = signatoryRole1 || "Lead Instructor & RnD Director";
  const effectiveSignatoryName2 = signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.";
  const effectiveSignatoryRole2 = signatoryRole2 || "Head of Academic Board";

  const { locale } = useAppLocale();
  const isEn = locale === "en";

  const showWorkload = backConfig?.showWorkloadColumn ?? true;
  const showCategory = backConfig?.showCategoryColumn ?? true;
  const showGrade = backConfig?.showGradeColumn ?? true;
  const showStatus = backConfig?.showStatusBadge ?? true;
  const showScore = backConfig?.showScoreSummary ?? true;
  const showPredicateBadge = backConfig?.showPredicate ?? true;
  const showScale = backConfig?.showScaleLegend ?? true;
  const showQr = backConfig?.showQrCode ?? true;

  const defaultHeaderTitle = isEn
    ? "Academic Transcript & Competency Achievements"
    : "Transkrip Nilai & Capaian Kompetensi";
  const headerTitle = backConfig?.headerTitle || defaultHeaderTitle;
  const headerSubtitle =
    backConfig?.headerSubtitle || "Official Academic Transcript & Competency Assessment";

  const displayPredicate = (() => {
    if (!isEn) return predicate;
    if (predicate.includes("DISTINCTION")) return "WITH DISTINCTION";
    if (predicate.includes("HIGH MERIT")) return "HIGH MERIT";
    if (predicate.includes("MERIT")) return "MERIT";
    if (predicate.includes("PASS")) return "PASS";
    return predicate;
  })();

  return (
    <div
      className={cn(
        "certificate-transcript-card w-full max-w-4xl mx-auto rounded-2xl p-6 sm:p-10 border border-stone-200/80 bg-white relative overflow-hidden print:w-full print:max-w-none print:rounded-none print:p-6 print:shadow-none print:m-0 print:border-none print:break-inside-avoid print:page-break-inside-avoid transition-all",
        className
      )}
      style={{
        backgroundColor: "#ffffff",
      }}
    >
      {/* Custom Template Background Image if uploaded */}
      {backConfig?.backgroundUrl && (
        <img
          src={backConfig.backgroundUrl}
          alt="Back Template Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        />
      )}

      {/* Inner Container */}
      <div className="w-full bg-white relative z-10">
        {/* Header Document */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200/80 gap-4 print:pb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white flex items-center justify-center p-1 shrink-0 print:w-8 print:h-8">
              <Image
                src="/images/matoh-logo.png"
                alt={issuerName}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-stone-400">
                {issuerName}
              </p>
              <h2
                className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {headerTitle}
              </h2>
              <p className="text-[11px] text-stone-400">{headerSubtitle}</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-500 space-y-0.5 print:text-[10px]">
            <p>
              {isEn ? "Credential ID:" : "ID Kredensial:"}{" "}
              <span className="font-mono font-bold text-stone-900">
                {certificateCode.toUpperCase()}
              </span>
            </p>
            <p>
              {isEn ? "Graduation Date:" : "Tanggal Lulus:"}{" "}
              <span className="text-stone-800 font-medium">{issueDisplay}</span>
            </p>
          </div>
        </div>

        {/* Student & Course Info (Clean, Borderless sentences on White Background) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-4 py-3 border-b border-stone-100 print:grid-cols-3 print:gap-2 print:my-2">
          <div className="min-w-0 bg-white">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              {isEn ? "Student Name" : "Nama Peserta"}
            </p>
            <p className="text-sm font-bold text-stone-900 truncate mt-0.5">{studentName}</p>
          </div>
          <div className="min-w-0 bg-white">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              {isEn ? "Course Program" : "Program Kursus"}
            </p>
            <p className="text-sm font-bold text-stone-900 truncate mt-0.5">{courseTitle}</p>
            {categoryName && (
              <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">{categoryName}</p>
            )}
          </div>
          <div className="min-w-0 bg-white">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              {isEn ? "Learning Workload" : "Beban Belajar"}
            </p>
            <p className="text-sm font-bold text-stone-900 mt-0.5 truncate">
              {isEn ? `${totalHours} Hours (JP)` : `${totalHours} Jam Pembelajaran (JP)`}
            </p>
          </div>
        </div>

        {/* Assessment Items Table (Pure White, No Border Badges) */}
        <div className="my-5 overflow-hidden border-b border-stone-200 print:my-3">
          <table className="w-full text-left text-xs border-collapse bg-white">
            <thead>
              <tr className="bg-white text-stone-800 text-[10px] uppercase tracking-wider border-b-2 border-stone-300">
                <th className="py-2.5 px-3 font-bold text-center w-10">No</th>
                <th className="py-2.5 px-4 font-bold">
                  {isEn ? "Competency Unit / Assessment Aspect" : "Unit Kompetensi / Aspek Evaluasi"}
                </th>
                {showCategory && (
                  <th className="py-2.5 px-3 font-bold text-center w-28">
                    {isEn ? "Category" : "Kategori"}
                  </th>
                )}
                {showWorkload && (
                  <th className="py-2.5 px-3 font-bold text-center w-24">
                    {isEn ? "Workload (Hours)" : "Beban (JP)"}
                  </th>
                )}
                <th className="py-2.5 px-3 font-bold text-center w-20">
                  {isEn ? "Score" : "Skor"}
                </th>
                {showGrade && (
                  <th className="py-2.5 px-3 font-bold text-center w-16">Grade</th>
                )}
                {showStatus && (
                  <th className="py-2.5 px-3 font-bold text-center w-24">Status</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {items.map((item, index) => (
                <tr key={item.id} className="bg-white hover:bg-stone-50/30">
                  <td className="py-2.5 px-3 text-center text-stone-400 font-mono text-[11px]">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-4 text-stone-800 font-medium">
                    <span className="truncate max-w-sm sm:max-w-md block">{item.title}</span>
                  </td>
                  {showCategory && (
                    <td className="py-2.5 px-3 text-center text-[11px] font-medium text-stone-600">
                      {item.type === "quiz"
                        ? (isEn ? "Evaluasi Kuis" : "Evaluasi Kuis")
                        : item.type === "assignment"
                          ? (isEn ? "Tugas Proyek" : "Tugas Proyek")
                          : (isEn ? "Modul Teori" : "Modul Teori")}
                    </td>
                  )}
                  {showWorkload && (
                    <td className="py-2.5 px-3 text-center text-stone-600 font-mono text-[11px]">
                      {item.workload}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-center font-bold text-stone-900 font-mono text-[11px]">
                    {item.score}
                    <span className="text-stone-400 font-normal text-[10px]">/100</span>
                  </td>
                  {showGrade && (
                    <td className="py-2.5 px-3 text-center font-bold text-stone-900 font-mono text-[11px]">
                      {item.grade}
                    </td>
                  )}
                  {showStatus && (
                    <td className="py-2.5 px-3 text-center text-[11px] font-bold text-stone-800">
                      {item.status === "KOMPETEN"
                        ? (isEn ? "KOMPETEN" : "KOMPETEN")
                        : item.status === "LULUS"
                          ? (isEn ? "LULUS" : "LULUS")
                          : item.status === "DISETUJUI"
                            ? (isEn ? "DISETUJUI" : "DISETUJUI")
                            : item.status}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grade Summary Section (Pure White, No Border Boxes around text) */}
        {(showScore || showPredicateBadge || showScale) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-5 py-4 border-t border-b border-stone-200 bg-white print:grid-cols-3 print:gap-2 print:my-3 print:py-2">
            {showScore && (
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  {isEn ? "Average Score" : "Nilai Rata-rata"}
                </p>
                <p className="text-base font-bold text-stone-900 mt-1">
                  {overallScore.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-stone-400">/ 100</span>
                </p>
              </div>
            )}

            {showPredicateBadge && (
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  {isEn ? "Graduation Predicate" : "Predikat Kelulusan"}
                </p>
                <p className="text-sm font-bold text-stone-900 mt-1">
                  Grade {finalGrade} • {displayPredicate}
                </p>
              </div>
            )}

            {showScale && (
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  {isEn ? "Grade Scale:" : "Keterangan Skala:"}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  {isEn
                    ? "85–100 (A) : With Distinction | 75–84 (B) : Merit"
                    : "85–100 (A) : Dengan Pujian | 75–84 (B) : Memuaskan"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Validation QR & Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200 items-end print:grid-cols-3 print:gap-2 print:pt-2 bg-white">
          {/* QR Validation */}
          <div className="flex items-center gap-3.5 min-w-0 bg-white">
            {showQr && (
              <>
                {qrCodeUrl ? (
                  <Link
                    href={`/verify/${certificateCode}`}
                    target="_blank"
                    className="shrink-0 group/qr block p-1 bg-white"
                    title="Klik untuk membuka panel informasi verifikasi resmi"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="QR Code Verifikasi"
                      className="w-16 h-16 sm:w-20 sm:h-20 block shrink-0 object-contain print:w-14 print:h-14"
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/verify/${certificateCode}`}
                    target="_blank"
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-white flex items-center justify-center text-stone-400 hover:text-stone-700 transition-all shrink-0 print:w-14 print:h-14"
                    title="Klik untuk membuka panel informasi verifikasi resmi"
                  >
                    <QrCode size={26} />
                  </Link>
                )}
                <div className="text-[10px] text-stone-500 min-w-0">
                  <Link
                    href={`/verify/${certificateCode}`}
                    target="_blank"
                    className="font-bold text-stone-800 hover:text-stone-900 flex items-center gap-1 transition-colors"
                  >
                    <ShieldCheck size={13} className="text-stone-600 shrink-0" />
                    <span className="truncate">{isEn ? "Officially Verified" : "Terverifikasi Resmi"}</span>
                  </Link>
                  <p className="mt-0.5 leading-tight text-[9px] text-stone-400 break-words">
                    {isEn
                      ? "Scan barcode to open the online verification panel."
                      : "Pindai barcode untuk membuka panel verifikasi online."}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Instructor Signature */}
          <div className="text-center sm:text-right print:text-right min-w-0 bg-white">
            <p className="font-serif italic text-base text-stone-800 mb-0.5 print:text-xs truncate" title={effectiveInstructorName}>
              {effectiveInstructorName}
            </p>
            <div className="w-24 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 mb-1" />
            <p className="text-[10px] font-semibold text-stone-700 truncate" title={effectiveSignatoryRole1}>{effectiveSignatoryRole1}</p>
            <p className="text-[9px] text-stone-400 truncate" title={issuerName}>{issuerName}</p>
          </div>

          {/* Academic Director Signature */}
          <div className="text-center sm:text-right print:text-right min-w-0 bg-white">
            <p className="font-serif italic text-base text-stone-800 mb-0.5 print:text-xs truncate" title={effectiveSignatoryName2}>
              {effectiveSignatoryName2}
            </p>
            <div className="w-24 h-px bg-stone-300 mx-auto sm:ml-auto sm:mr-0 mb-1" />
            <p className="text-[10px] font-semibold text-stone-700 truncate" title={effectiveSignatoryRole2}>{effectiveSignatoryRole2}</p>
            <p className="text-[9px] text-stone-400 truncate">Direktorat Akademik</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CertificateTranscriptMiniatureProps {
  data: CertificateTranscriptData;
  backConfig?: CertificateBackDesignConfig | null;
  className?: string;
  onOpenStudio?: () => void;
}

export function CertificateTranscriptMiniature({
  data,
  backConfig,
  className,
  onOpenStudio,
}: CertificateTranscriptMiniatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.38);
  const [cardHeight, setCardHeight] = useState(680);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal preview is open
  useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isModalOpen]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const targetWidth = 1000;
        const s = Math.max(0.1, cw / targetWidth);
        setScale(s);

        if (cardRef.current) {
          const naturalHeight = cardRef.current.offsetHeight || 680;
          setCardHeight(naturalHeight);
        }
      }
    };

    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Miniature Landscape Frame (A4 Landscape 297/210 ratio) */}
      <div
        ref={containerRef}
        onClick={() => setIsModalOpen(true)}
        className="group relative w-full rounded-2xl shadow-warm overflow-hidden bg-stone-100 border border-stone-200 select-none cursor-pointer transition-all hover:border-blue-300 hover:shadow-md"
        style={{
          height: Math.max(160, Math.round(cardHeight * scale)),
        }}
        title="Klik untuk melihat pratinjau ukuran penuh (A4)"
      >
        <div
          ref={cardRef}
          style={{
            width: 1000,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          className="pointer-events-none"
        >
          <CertificateTranscriptCard
            backConfig={backConfig}
            data={data}
            className="shadow-none rounded-none border-none max-w-none w-[1000px]"
          />
        </div>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <Maximize2 size={12} className="text-blue-600" />
            Klik untuk Pratinjau Penuh (A4)
          </span>
        </div>
      </div>

      {/* Action Button: Open in Studio */}
      {onOpenStudio && (
        <button
          type="button"
          onClick={onOpenStudio}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 shadow-xs transition-colors cursor-pointer"
        >
          <FileText size={14} />
          Buka &amp; Edit di Studio Sisi Belakang (Transkrip)
        </button>
      )}

      {/* Fullscreen A4 Modal Preview */}
      {mounted && isModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-950/80 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl p-4 sm:p-6 space-y-4 pointer-events-auto my-auto animate-in zoom-in-95 duration-150"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Pratinjau Sisi Belakang (Transkrip Nilai)</h3>
                    <p className="text-[11px] text-stone-400 font-mono">Format A4 Landscape (297 × 210 mm)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        onOpenStudio();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Buka di Studio
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                    aria-label="Tutup"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Real A4 Landscape Preview Card */}
              <div className="w-full overflow-x-auto py-2 flex justify-center">
                <div className="w-full max-w-[1000px] shadow-2xl">
                  <CertificateTranscriptCard
                    backConfig={backConfig}
                    data={data}
                    className="shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
