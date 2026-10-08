"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AddToLinkedInButtonProps {
  courseTitle: string;
  certificateCode: string;
  issuedAt?: string | Date;
  issuerName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "outline";
  className?: string;
  locale?: string;
}

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.94 0-1.7.76-1.7 1.7s.76 1.7 1.7 1.7 1.7-.76 1.7-1.7-.76-1.7-1.7-1.7Z" />
    </svg>
  );
}

export function AddToLinkedInButton({
  courseTitle,
  certificateCode,
  issuedAt,
  issuerName = "PT. Matoh Technologies Indonesia",
  size = "sm",
  variant = "brand",
  className,
  locale = "id",
}: AddToLinkedInButtonProps) {
  const isEn = locale === "en";

  const date = issuedAt ? new Date(issuedAt) : new Date();
  const year = isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear();
  const month = isNaN(date.getMonth()) ? new Date().getMonth() + 1 : date.getMonth() + 1;

  // Resolve base URL safely on client or fallback to domain
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.matohtechnologies.com";

  const certVerificationUrl = `${origin}/certificates/${encodeURIComponent(certificateCode)}`;

  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: courseTitle,
    organizationName: issuerName,
    issueYear: String(year),
    issueMonth: String(month),
    certUrl: certVerificationUrl,
    certId: certificateCode.toUpperCase(),
  });

  const linkedInUrl = `https://www.linkedin.com/profile/add?${params.toString()}`;

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-4 py-2 text-xs font-semibold gap-2 rounded-xl",
    lg: "px-5 py-2.5 text-sm font-bold gap-2.5 rounded-xl",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4.5 h-4.5",
  }[size];

  const variantStyles =
    variant === "brand"
      ? "bg-[#0A66C2] hover:bg-[#004182] text-white shadow-2xs hover:shadow-xs active:scale-[0.98]"
      : "bg-white border border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/5 active:scale-[0.98]";

  return (
    <a
      href={linkedInUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all select-none",
        sizeStyles,
        variantStyles,
        className
      )}
      title={isEn ? "Add this certificate to your LinkedIn profile" : "Tambahkan sertifikat ini ke profil LinkedIn Anda"}
    >
      <LinkedInIcon className={iconSizes} />
      <span>{isEn ? "Add to LinkedIn" : "Tambah ke LinkedIn"}</span>
    </a>
  );
}
