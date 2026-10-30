"use client";

import Image from "next/image";
import { ExternalLink, CheckCircle2, Sparkles } from "lucide-react";
import { AddToLinkedInButton } from "./add-to-linkedin-button";

interface LinkedInCredentialPreviewProps {
  courseTitle: string;
  certificateCode: string;
  issuerName: string;
  issuedAtFormatted: string;
  issuedAt?: string | Date;
  locale?: string;
}

export function LinkedInCredentialPreview({
  courseTitle,
  certificateCode,
  issuerName,
  issuedAtFormatted,
  issuedAt,
  locale = "id",
}: LinkedInCredentialPreviewProps) {
  const isEn = locale === "en";

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-warm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          {/* LinkedIn Icon */}
          <div className="w-7 h-7 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            in
          </div>
          <span className="text-xs font-bold text-stone-800">
            {isEn ? "LinkedIn Profile Card Simulation" : "Simulasi Tampilan di Profil LinkedIn"}
          </span>
        </div>
      </div>

      {/* Simulated LinkedIn "Licenses & Certifications" Card */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
        <div className="flex items-start gap-3.5">
          {/* Company Logo in LinkedIn style */}
          <div className="w-12 h-12 rounded-xl bg-white border border-stone-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
            <Image
              src="/images/matoh-logo-v2.png"
              alt="PT. Matoh Technologies Indonesia"
              width={32}
              height={32}
              priority
              style={{ aspectRatio: "1 / 1" }}
              className="object-contain aspect-square"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2">
              {courseTitle}
            </h4>
            <p className="text-xs text-stone-700 font-medium mt-0.5">
              {issuerName}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              {isEn ? `Issued ${issuedAtFormatted}` : `Diterbitkan ${issuedAtFormatted}`} • {isEn ? "No Expiration Date" : "Tidak Ada Tanggal Kedaluwarsa"}
            </p>
            <p className="text-[11px] font-mono text-stone-500 mt-0.5">
              {isEn ? "Credential ID" : "ID Kredensial"}: <span className="font-bold text-stone-800">{certificateCode}</span>
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-200/60 transition-colors">
                <span>{isEn ? "Show credential" : "Lihat kredensial"}</span>
                <ExternalLink size={12} className="text-stone-500" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
        <p className="text-stone-500 text-[11px] text-center sm:text-left leading-relaxed">
          {isEn
            ? "Add this official credential directly to your LinkedIn 'Licenses & Certifications' with one click."
            : "Sematkan sertifikat resmi ini ke bagian 'Lisensi & Sertifikasi' di profil LinkedIn Anda hanya dengan 1 kali klik."}
        </p>
        <div className="shrink-0">
          <AddToLinkedInButton
            courseTitle={courseTitle}
            certificateCode={certificateCode}
            issuedAt={issuedAt || new Date()}
            issuerName={issuerName}
            size="sm"
            variant="brand"
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
