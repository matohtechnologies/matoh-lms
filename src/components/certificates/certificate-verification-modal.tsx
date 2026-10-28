"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  X,
  ArrowRight,
  Award,
  CheckCircle2,
  Lock,
  QrCode,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export function CertificateVerificationModal({
  isOpen,
  onClose,
  isEn = false,
}: CertificateVerificationModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [serialCode, setSerialCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Autofocus input on open and lock background scroll
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSerialCode("");
      setIsLoading(false);
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = serialCode.trim();
    if (!trimmed) {
      setErrorMsg(
        isEn
          ? "Please enter a certificate serial number."
          : "Silakan masukkan nomor seri sertifikat terlebih dahulu."
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    // Navigate to the official verification page
    router.push(`/verify/${encodeURIComponent(trimmed.toUpperCase())}`);
    onClose();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-950/70 backdrop-blur-xs p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl border border-stone-200/90 shadow-2xl p-6 sm:p-8 space-y-6 text-stone-900 animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label={isEn ? "Close" : "Tutup"}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="space-y-1 pr-6">
            <h2
              className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Verify Certificate Authenticity" : "Verifikasi Keaslian Sertifikat"}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {isEn
                ? "Enter the certificate serial ID printed on the document or barcode to verify its accreditation and authenticity."
                : "Masukkan nomor ID Kredensial sertifikat yang tertera pada dokumen atau barcode untuk memeriksa keabsahan secara online."}
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              {isEn ? "Certificate Serial Number / ID" : "Nomor Seri / ID Kredensial Sertifikat"}
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                value={serialCode}
                onChange={(e) => {
                  setSerialCode(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder={isEn ? "e.g. CERT-IMDT-2026-X-0001" : "Contoh: CERT-IMDT-2026-X-0001"}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border text-sm font-mono uppercase text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white transition-all shadow-inner",
                  errorMsg
                    ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-stone-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                )}
              />
            </div>
            {errorMsg ? (
              <p className="text-xs text-rose-600 font-medium pl-1">{errorMsg}</p>
            ) : (
              <p className="text-[11px] text-stone-400 pl-1">
                {isEn
                  ? "*Serial numbers are case-insensitive and format-tolerant."
                  : "*Nomor seri dapat ditemukan di sudut kanan atas lembar sertifikat atau di bawah barcode."}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !serialCode.trim()}
              className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isEn ? "Checking Database..." : "Memeriksa Data..."}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>{isEn ? "Verify Now" : "Verifikasi Sekarang"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {isEn ? "Cancel" : "Batal"}
            </button>
          </div>
        </form>

        {/* Bottom Feature Badges & Portal Link */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
              <CheckCircle2 size={13} className="text-emerald-600" />
              {isEn ? "Real-time Verification" : "Verifikasi Real-time"}
            </span>
          </div>

          <Link
            href="/verify"
            onClick={onClose}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>{isEn ? "Full Verification Portal" : "Buka Portal Lengkap"}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
