"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Copy, Check, ExternalLink, Building2, FileCheck2 } from "lucide-react";

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
    <div className="bg-gradient-to-br from-slate-900 via-stone-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 shadow-sm">
            <Image
              src="/images/matoh-logo.png"
              alt="PT. Matoh Technologies Indonesia"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              {isEn ? "Official Legal Entity Status" : "Status Badan Hukum Resmi"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              PT. Matoh Technologies Indonesia
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-emerald-300 text-xs font-bold tracking-wide w-fit">
          <span>{isEn ? "Officially Registered & Verified" : "Terdaftar Resmi Kemenkumham RI"}</span>
        </span>
      </div>

      {/* Legal Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SK Menkumham Box */}
        <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isEn ? "Decree of MinLaw & Human Rights" : "SK Menkumham RI"}
            </span>
            <button
              type="button"
              onClick={handleCopyAhu}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              title={isEn ? "Copy AHU code" : "Salin nomor SK AHU"}
            >
              {copiedAhu ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">{isEn ? "Copied" : "Tersalin"}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{isEn ? "Copy" : "Salin"}</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
            {ahuCode}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isEn
              ? "Certified digital certificates and educational credentials are legally valid under Indonesian national law."
              : "Sertifikat digital dan transkrip kelulusan memiliki dasar keabsahan legalitas resmi di Indonesia."}
          </p>
        </div>

        {/* Operating Scope Box */}
        <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isEn ? "Business Entity Classification" : "Klasifikasi Bidang Usaha"}
          </span>
          <p className="text-sm font-bold text-white">
            {isEn ? "Digital Technology Education & Applied Consultancy" : "Pendidikan Teknologi Digital & Konsultasi Terapan"}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isEn
              ? "Focusing on Decision Modeling (AHP/ISM), MSME Digitalization, and Institutional Learning Management Systems."
              : "Fokus pada Pemodelan Keputusan (MCDM/AHP/ISM), Digitalisasi UMKM, dan Sistem Manajemen Pembelajaran Kampus."}
          </p>
        </div>
      </div>
    </div>
  );
}
