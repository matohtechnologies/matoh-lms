"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, CheckCircle2, Award, Code2, Sparkles, Volume2, ShieldCheck, X, ExternalLink } from "lucide-react";

interface HeroInteractiveShowcaseProps {
  isEn: boolean;
}

export function HeroInteractiveShowcase({ isEn }: HeroInteractiveShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"video" | "project" | "certificate">("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<"1x" | "1.25x" | "1.5x">("1.25x");

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Decorative ambient backlight - clean daylight warmth */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-400/20 via-amber-300/20 to-orange-500/20 blur-2xl opacity-70 pointer-events-none" />

      {/* Main Container */}
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Top Window Chrome */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-xs font-medium text-slate-400 tracking-wide">
              earthy-studio / classroom
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isEn ? "Live Sandbox" : "Ruang Belajar Aktif"}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-100 bg-white px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === "video"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {isEn ? "Video & Curriculum" : "Video & Materi"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("project");
              setIsPlaying(false);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === "project"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {isEn ? "Real-world Project" : "Proyek Portofolio"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("certificate");
              setIsPlaying(false);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === "certificate"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {isEn ? "Verified Certificate" : "Sertifikat Digital"}
          </button>
        </div>

        {/* Tab Content 1: Video Classroom */}
        {activeTab === "video" && (
          <div className="p-5 space-y-4">
            {/* Player Screen Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-inner group">
              {isPlaying ? (
                <div className="relative w-full h-full bg-black">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/843nec-IvW0?autoplay=1&rel=0&modestbranding=1"
                    title="Next.js 14 in 100 Seconds - Earthy Academy Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />

                  {/* Top overlay controls */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-105"
                      title={isEn ? "Stop & Return" : "Tutup Video"}
                    >
                      <X size={14} />
                      <span>{isEn ? "Close" : "Tutup"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => setIsPlaying(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setIsPlaying(true);
                    }
                  }}
                  aria-label={isEn ? "Play video preview" : "Putar video pratinjau"}
                >
                  {/* Background preview image */}
                  <Image
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80"
                    alt="Next.js Architecture Lesson"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-black/30 group-hover:via-black/10 transition-colors" />

                  {/* Play Button & Center Pulse */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-20 h-20 rounded-full bg-orange-500/30 animate-ping pointer-events-none" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying(true);
                        }}
                        className="relative w-16 h-16 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group-hover:bg-orange-600 group-hover:text-white"
                        aria-label={isEn ? "Play video preview" : "Putar video pratinjau"}
                      >
                        <Play size={24} className="ml-1 fill-currentColor" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Video Controls Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-[11px] bg-orange-600 px-2 py-0.5 rounded shrink-0">
                        Modul 04
                      </span>
                      <span className="text-slate-200 text-xs truncate max-w-[200px] sm:max-w-xs font-medium">
                        Server Components & Data Caching
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const speeds: Array<"1x" | "1.25x" | "1.5x"> = ["1x", "1.25x", "1.5x"];
                          const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                          setPlaybackSpeed(next);
                        }}
                        className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 backdrop-blur-md text-[11px] font-mono transition-colors"
                      >
                        {playbackSpeed}
                      </button>
                      <span className="text-[11px] text-slate-300 font-mono">14:20 / 18:45</span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                    <div className="h-full bg-orange-500 w-[74%] transition-all duration-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info & Instructor */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  AR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    Agung Pratama, S.Kom
                  </h4>
                  <p className="text-xs text-slate-500">
                    Lead Fullstack Engineer • Ex-Shopee
                  </p>
                </div>
              </div>

              <div className="text-right">
                {isPlaying ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    {isEn ? "Now Playing Preview" : "Sedang Memutar"}
                  </span>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">38 dari 45 Selesai</span>
                    <span className="text-[11px] text-emerald-600 font-medium">85% Kelulusan</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Real Project */}
        {activeTab === "project" && (
          <div className="p-5 space-y-4">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isEn ? "Industry-Standard Capstone" : "Tugas Akhir Berstandar Industri"}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-semibold">
                  Portfolio-Ready
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isEn
                  ? "Build a Production E-Learning SaaS with Next.js, Stripe & PostgreSQL"
                  : "Membangun Sistem SaaS E-Learning dengan Next.js, Stripe, & PostgreSQL"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Not just another to-do list tutorial. You will build payment webhooks, role-based authorization, SSRF security guards, and PostgreSQL query caches."
                  : "Bukan sekadar aplikasi to-do list. Anda akan mengimplementasikan webhook pembayaran, role-based authorization, optimasi SSRF/CSP, dan query cache PostgreSQL."}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Next.js 15", "TypeScript", "Prisma ORM", "PostgreSQL", "Tailwind CSS", "Midtrans"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                {isEn
                  ? "Instructors provide direct 1-on-1 code reviews on your GitHub pull requests."
                  : "Instruktur memberikan code review langsung pada pull request GitHub Anda."}
              </span>
            </div>
          </div>
        )}

        {/* Tab Content 3: Certificate */}
        {activeTab === "certificate" && (
          <div className="p-5 space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isEn
                    ? "Official Verifiable Certificate of Completion"
                    : "Sertifikat Kelulusan Resmi Terverifikasi"}
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  {isEn
                    ? "Share directly to LinkedIn & resumes with a permanent verification URL and tamper-proof verification code."
                    : "Dapat disematkan langsung ke profil LinkedIn & CV dengan URL verifikasi permanen dan QR code unik."}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 text-[11px] font-mono text-slate-700 font-semibold shadow-2xs">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>{isEn ? "CODE: EA-CERT-2026-X99" : "KODE: EA-CERT-2026-X99"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Social Proof Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500"].map((bg, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full border-2 border-white ${bg} text-white text-[9px] font-bold flex items-center justify-center shadow-2xs`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-600 font-medium">
              <strong className="text-slate-900 font-bold">
                {isEn ? "1,240+ students" : "1.240+ siswa"}
              </strong>{" "}
              {isEn ? "active learning today" : "aktif belajar hari ini"}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-orange-700 bg-orange-100/70 border border-orange-200/60 px-2.5 py-1 rounded-lg">
            {isEn ? "Accredited" : "Terakreditasi"}
          </span>
        </div>
      </div>
    </div>
  );
}
