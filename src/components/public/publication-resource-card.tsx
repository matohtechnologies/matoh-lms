"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle,
  ShieldCheck,
  Loader2,
  FileSpreadsheet,
  FileArchive,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface PublicationResourceCardProps {
  publication: {
    id?: string;
    slug: string;
    title: string;
    type?: string;
    isPaid?: boolean;
    price?: number;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: string | null;
    externalUrl?: string | null;
  };
  initialHasAccess: boolean;
  isLoggedIn: boolean;
  isEn?: boolean;
}

export function PublicationResourceCard({
  publication,
  initialHasAccess,
  isLoggedIn,
  isEn = false,
}: PublicationResourceCardProps) {
  const [hasAccess, setHasAccess] = useState(initialHasAccess);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPaid = Boolean(publication.isPaid && (publication.price ?? 0) > 0);
  const price = publication.price ?? 0;
  const hasFile = Boolean(publication.fileUrl);
  const hasExternal = Boolean(publication.externalUrl);

  // If there's neither a file nor external link, don't show the card
  if (!hasFile && !hasExternal) {
    return null;
  }

  // Determine file icon based on file extension
  const getFileIcon = () => {
    const ext = (publication.fileName || publication.fileUrl || "").split(".").pop()?.toLowerCase();
    if (ext === "zip" || ext === "rar") return <FileArchive className="text-amber-600" size={24} />;
    if (ext === "xls" || ext === "xlsx" || ext === "csv") return <FileSpreadsheet className="text-emerald-600" size={24} />;
    if (publication.type === "RESEARCH") return <Database className="text-blue-600" size={24} />;
    return <FileText className="text-blue-600" size={24} />;
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

  // Initiate purchase / payment with Midtrans Snap
  const handleBuyAccess = async () => {
    if (!isLoggedIn) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicationId: publication.id || publication.slug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Failed to process order" : "Gagal memproses transaksi"));
      }

      // If free grant
      if (data.type === "free") {
        setHasAccess(true);
        setIsProcessing(false);
        return;
      }

      const snapToken = data.token;
      const orderId = data.orderId;

      // Handle demo fallback
      if (snapToken && snapToken.startsWith("demo-snap-token")) {
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }).catch(() => null);

        setHasAccess(true);
        setIsProcessing(false);
        return;
      }

      // Load Midtrans Snap client dynamically if not yet on window
      const openSnapModal = () => {
        const snap = (window as unknown as { snap?: { pay: (token: string, options: Record<string, unknown>) => void } }).snap;
        if (!snap) {
          setIsProcessing(false);
          setErrorMessage(isEn ? "Failed to load payment gateway" : "Gagal memuat sistem pembayaran");
          return;
        }

        snap.pay(snapToken, {
          onSuccess: async () => {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            }).catch(() => null);
            setHasAccess(true);
            setIsProcessing(false);
          },
          onPending: async () => {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            }).catch(() => null);
            setHasAccess(true);
            setIsProcessing(false);
          },
          onError: () => {
            setErrorMessage(isEn ? "Payment unconfirmed or cancelled" : "Pembayaran belum diselesaikan atau dibatalkan");
            setIsProcessing(false);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      };

      const existingScript = document.getElementById("midtrans-snap-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "midtrans-snap-script";
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        script.onload = openSnapModal;
        script.onerror = () => {
          setIsProcessing(false);
          setErrorMessage(isEn ? "Could not reach Midtrans server" : "Gagal terhubung ke gerbang pembayaran Midtrans");
        };
        document.head.appendChild(script);
      } else {
        openSnapModal();
      }
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMessage((err as Error).message || (isEn ? "An error occurred" : "Terjadi kesalahan saat memproses pesanan"));
    }
  };

  return (
    <section
      aria-labelledby="resource-card-heading"
      className="my-10 rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
    >
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 px-5 sm:px-7 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isPaid && !hasAccess ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
              <Lock size={12} className="text-amber-600" />
              {isEn ? "Premium Gated Resource" : "Berkas Riset & Publikasi Berbayar"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              <CheckCircle size={12} className="text-emerald-600" />
              {isPaid
                ? (isEn ? "Access Unlocked — Owned by You" : "Akses Terverifikasi — Milik Anda")
                : (isEn ? "Open Access Document" : "Dokumen Akses Terbuka (Gratis)")}
            </span>
          )}
        </div>

        {isPaid && (
          <div className="text-xs font-bold text-slate-700">
            {hasAccess ? (
              <span className="text-emerald-700 font-semibold text-[11px]">
                {isEn ? "Full Access Granted" : "Akses Lengkap Aktif"}
              </span>
            ) : (
              <span className="text-slate-900 font-extrabold text-sm sm:text-base">
                {formattedPrice}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0">
            {getFileIcon()}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3
              id="resource-card-heading"
              className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
            >
              {publication.fileName || (publication.type === "RESEARCH" ? "Naskah Riset Lengkap & Lampiran Dataset" : "Dokumen Lengkap & Materi Pendukung")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {isPaid && !hasAccess
                ? (isEn
                    ? "Get immediate access to the full unredacted document, methodology data, and supplementary files upon completing payment."
                    : "Dapatkan akses langsung ke naskah lengkap tanpa sensor, tabel data metodologi, dan berkas lampiran resmi setelah menyelesaikan transaksi.")
                : (isEn
                    ? "Official verified release from PT. Matoh Technologies Indonesia. Ready for direct download and research reference."
                    : "Rilisan resmi terverifikasi dari PT. Matoh Technologies Indonesia. Siap diunduh langsung untuk referensi akademis dan implementasi industri.")}
            </p>

            {/* Metadata pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              {publication.fileSize && (
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                  {publication.fileSize}
                </span>
              )}
              {publication.fileName && (
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 truncate max-w-[220px]">
                  {publication.fileName}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                {publication.type === "RESEARCH" ? "Sains Keputusan" : "Publikasi Terapan"}
              </span>
            </div>
          </div>
        </div>

        {/* Benefits Checklist (When locked) */}
        {isPaid && !hasAccess && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              {isEn ? "What You Will Receive:" : "Yang Akan Anda Dapatkan:"}
            </span>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-600 shrink-0" />
                <span>{isEn ? "Full unabridged PDF manuscript" : "Naskah dokumen lengkap (PDF)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-600 shrink-0" />
                <span>{isEn ? "Complete raw methodology datasets" : "Lampiran kalkulasi & data pendukung"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-600 shrink-0" />
                <span>{isEn ? "Instant permanent access" : "Akses instan permanen di dashboard"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-600 shrink-0" />
                <span>{isEn ? "Commercial & academic usage right" : "Lisensi sitasi resmi Matoh Technologies"}</span>
              </li>
            </ul>
          </div>
        )}

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Case 1: Unlocked (Free OR Purchased) */}
          {hasAccess ? (
            <div className="flex flex-wrap items-center gap-2.5 w-full">
              {hasFile && (
                <a
                  href={`/api/publications/${publication.id || publication.slug}/download`}
                  download
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs hover:shadow-xs cursor-pointer min-h-[44px]"
                >
                  <Download size={16} />
                  <span>{isEn ? "Download Full Document" : "Unduh Dokumen Lengkap"}</span>
                </a>
              )}

              {hasExternal && publication.externalUrl && (
                <a
                  href={publication.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
                >
                  <ExternalLink size={15} />
                  <span>{isEn ? "Open External Repository" : "Buka Tautan Lampiran"}</span>
                </a>
              )}

              <span className="text-[11px] text-emerald-700 font-medium ml-auto flex items-center gap-1">
                <ShieldCheck size={14} />
                {isEn ? "Verified Download Link" : "Tautan Resmi & Terverifikasi"}
              </span>
            </div>
          ) : (
            /* Case 2: Locked (Paid, Not yet purchased) */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
              <div className="text-xs text-slate-500">
                <span>{isEn ? "Payment processed securely via" : "Pembayaran aman instan via"} </span>
                <span className="font-semibold text-slate-700">QRIS, BCA, Mandiri, BNI, GoPay</span>
              </div>

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleBuyAccess}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs hover:shadow-sm cursor-pointer min-h-[44px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{isEn ? "Preparing Payment..." : "Menyiapkan Pembayaran..."}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>{isEn ? `Buy Access for ${formattedPrice}` : `Beli Akses Riset (${formattedPrice})`}</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={`/login?callbackUrl=/publikasi/${publication.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs hover:shadow-sm min-h-[44px]"
                >
                  <span>{isEn ? "Login to Purchase Access" : "Masuk untuk Membeli Akses"}</span>
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

