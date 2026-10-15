"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  ExternalLink,
  Share2,
  CheckCircle2,
  X,
  PartyPopper,
  Download,
} from "lucide-react";
import { triggerCelebrationConfetti } from "@/lib/confetti";
import { playFanfareSound, playPopSound } from "@/lib/sound-effects";
import Link from "next/link";

interface GraduationCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  studentName?: string;
  certificateCode?: string | null;
  certificateUrl?: string | null;
  score?: number | null;
  isQuizScore?: boolean;
}

export function GraduationCelebrationModal({
  isOpen,
  onClose,
  courseTitle,
  studentName = "Siswa Berprestasi",
  certificateCode,
  certificateUrl,
  score,
  isQuizScore = false,
}: GraduationCelebrationModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti & triumphant fanfare sound
      triggerCelebrationConfetti();
      playFanfareSound();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const shareUrl = certificateCode
      ? `${window.location.origin}/verify/${certificateCode}`
      : window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    playPopSound();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFireAgain = () => {
    triggerCelebrationConfetti();
    playPopSound();
  };

  const shareLinkedInUrl = certificateCode
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        typeof window !== "undefined"
          ? `${window.location.origin}/verify/${certificateCode}`
          : ""
      )}`
    : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        typeof window !== "undefined" ? window.location.href : ""
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Interactive Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-300 text-stone-900">
        {/* Glow Header Banner */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 pt-10 pb-12 px-6 text-center text-white overflow-hidden">
          {/* Subtle background stars/particles */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white flex items-center justify-center transition-all"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>

          {/* Floating Trophy Icon Badge */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-white/95 backdrop-blur-md p-4 text-amber-500 shadow-xl flex items-center justify-center ring-4 ring-white/30 transform hover:scale-105 transition-transform">
            {isQuizScore ? (
              <Sparkles size={42} className="text-amber-500" />
            ) : (
              <Trophy size={42} className="text-amber-500" />
            )}
          </div>

          <div className="mt-4 space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
              <PartyPopper size={13} />
              {isQuizScore ? "Nilai Sempurna! (100/100)" : "Kelulusan Resmi"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              {isQuizScore ? "Luar Biasa, Kamu Juara!" : "Selamat, Kamu Lulus!"}
            </h2>
            <p className="text-sm text-white/90 font-medium max-w-sm mx-auto">
              {isQuizScore
                ? "Pemahamanmu sempurna! Terus pertahankan semangat belajar ini."
                : "Kerja keras dan konsistensimu telah membuahkan hasil kelulusan yang membanggakan."}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Student & Course Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-center space-y-1">
            <p className="text-xs uppercase font-extrabold tracking-wider text-stone-400">
              Dianugerahkan Kepada
            </p>
            <h3 className="text-lg font-bold text-stone-900">{studentName}</h3>
            <p className="text-xs text-stone-500">atas penyelesaian kelas:</p>
            <p className="text-sm font-semibold text-blue-600 line-clamp-2">
              {courseTitle}
            </p>
          </div>

          {/* Certificate Credential Info (if available) */}
          {certificateCode && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    ID Sertifikat Terverifikasi
                  </p>
                  <p className="text-xs font-mono font-bold text-stone-800">
                    {certificateCode}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> Valid
              </span>
            </div>
          )}

          {/* Score Badge (if passed quiz) */}
          {score !== null && score !== undefined && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">Skor Evaluasi:</span>
              <span className="text-base font-black text-blue-600">{score}%</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {certificateUrl ? (
              <Link
                href={certificateUrl}
                target="_blank"
                onClick={() => playPopSound()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download size={16} />
                <span>Lihat & Unduh Sertifikat Resmi</span>
              </Link>
            ) : certificateCode ? (
              <Link
                href={`/verify/${certificateCode}`}
                target="_blank"
                onClick={() => playPopSound()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Award size={16} />
                <span>Buka Lembar Sertifikat</span>
              </Link>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              {/* Copy verification / link */}
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 size={14} />
                <span>{copied ? "Link Disalin! ✅" : "Salin Link"}</span>
              </button>

              {/* Share to LinkedIn */}
              <a
                href={shareLinkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playPopSound()}
                className="py-2.5 px-3 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-sky-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink size={14} />
                <span>Share LinkedIn</span>
              </a>
            </div>

            {/* Re-fire Confetti Button */}
            <button
              type="button"
              onClick={handleFireAgain}
              className="w-full py-2.5 px-3 text-center text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50/60 hover:bg-amber-100 active:scale-95 border border-amber-200/70 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <PartyPopper size={15} className="text-amber-600" />
              <span>Ledakkan Konfeti Lagi!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
