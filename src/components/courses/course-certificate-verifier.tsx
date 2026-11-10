"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, CheckCircle2, Award, ArrowRight } from "lucide-react";

interface CourseCertificateVerifierProps {
  isEn?: boolean;
}

export function CourseCertificateVerifier({ isEn = false }: CourseCertificateVerifierProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    window.location.href = `/verify/${encodeURIComponent(code.trim().toUpperCase())}`;
  };

  return (
    <section id="verifikasi" className="scroll-mt-24 mb-10">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>{isEn ? "Official Verification Registry" : "Layanan Verifikasi Sertifikat Resmi"}</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Verify Certificate Authenticity" : "Cek Keaslian Sertifikat Kelulusan"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            {isEn
              ? "Verify student graduation credentials, authentic grades, and legal SK Kemenkumham status by entering the certificate serial number."
              : "Validasi keabsahan sertifikat portofolio kelulusan siswa PT. Matoh Technologies Indonesia secara langsung melalui nomor seri resmi."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                id="verify-code-input"
                name="code"
                autoComplete="off"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder={isEn ? "Enter Serial (e.g. MTH-2026-XXXX)" : "Masukkan Nomor Seri (contoh: MTH-2026-XXXX)"}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{isEn ? "Verify Now" : "Verifikasi Sekarang"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            {isEn
              ? "Tamper-proof digital credentials verified permanently under SK Kemenkumham AHU-064920.AH.01.30.Tahun 2024"
              : "Kredensial digital anti-pemalsuan terdaftar permanen di bawah SK Kemenkumham AHU-064920.AH.01.30.Tahun 2024"}
          </p>
        </form>

        <div className="pt-6 mt-6 border-t border-slate-100 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
            <span>{isEn ? "Cryptographic QR Validation" : "Validasi Kode QR Kriptografis"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
            <span>{isEn ? "Permanent Institutional Registry" : "Registri Resmi Seumur Hidup"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
            <span>{isEn ? "Industry & Corporate Recognized" : "Diakui Industri & Rekruter"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

