"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Copy, Check, ExternalLink, Building2, FileCheck2, CheckCircle2 } from "lucide-react";

interface LegalTrustCardProps {
  locale?: string;
}

export function LegalTrustCard({ locale = "id" }: LegalTrustCardProps) {
  const [copiedAhu, setCopiedAhu] = useState(false);
  const isEn = locale === "en";

  const ahuCode = "AHU-064920.AH.01.30.Tahun 2024";

  const handleCopyAhu = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(ahuCode);
      setCopiedAhu(true);
      setTimeout(() => setCopiedAhu(false), 2500);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center shrink-0">
            <Image
              src="/images/matoh-logo-v2.png"
              alt="PT. Matoh Technologies Indonesia"
              width={28}
              height={28}
              priority
              style={{ aspectRatio: "1 / 1" }}
              className="object-contain aspect-square"
            />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isEn ? "Official Legal Entity Status" : "Status Badan Hukum Resmi"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              PT. Matoh Technologies Indonesia
            </h3>
          </div>
        </div>
      </div>

      {/* Legal Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SK Menkumham Box */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isEn ? "Decree of MinLaw & Human Rights" : "SK Menkumham RI"}
            </span>
            <button
              type="button"
              onClick={handleCopyAhu}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title={isEn ? "Copy AHU code" : "Salin nomor SK AHU"}
            >
              {copiedAhu ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{isEn ? "Copied" : "Tersalin"}</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-slate-400" />
                  <span>{isEn ? "Copy" : "Salin"}</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {ahuCode}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isEn
              ? "Certified digital certificates and educational credentials are legally valid under Indonesian national law."
              : "Sertifikat digital dan transkrip kelulusan memiliki dasar keabsahan legalitas resmi di Indonesia."}
          </p>
        </div>

        {/* Operating Scope Box */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {isEn ? "Business Entity Classification" : "Klasifikasi Bidang Usaha"}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {isEn ? "Digital Technology Education & Applied Consultancy" : "Pendidikan Teknologi Digital & Konsultasi Terapan"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isEn
              ? "Focusing on Decision Modeling (AHP/ISM), MSME Digitalization, and Institutional Learning Management Systems."
              : "Fokus pada Pemodelan Keputusan (MCDM/AHP/ISM), Digitalisasi UMKM, dan Sistem Manajemen Pembelajaran Kampus."}
          </p>
        </div>
      </div>
    </div>
  );
}
