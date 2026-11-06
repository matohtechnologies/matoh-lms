"use client";

import React, { useState } from "react";
import { Share2, Check, Copy, Printer, Bookmark } from "lucide-react";

interface ArticleActionsProps {
  title: string;
  url?: string;
  isEn?: boolean;
}

export function ArticleActions({ title, url, isEn = false }: ArticleActionsProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopyLink = async () => {
    try {
      const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = targetUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback silent
    }
  };

  const handleShare = async () => {
    const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: targetUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported, fallback to copy link
      }
    }
    handleCopyLink();
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Share / Copy Link Button */}
      <button
        type="button"
        onClick={handleShare}
        aria-label={isEn ? "Share article" : "Bagikan artikel"}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[44px]"
        title={isEn ? "Share or copy article link" : "Bagikan atau salin tautan artikel"}
      >
        {copied ? (
          <>
            <Check size={15} className="text-emerald-600" />
            <span className="text-emerald-700 font-semibold">{isEn ? "Link Copied!" : "Tautan Disalin!"}</span>
          </>
        ) : (
          <>
            <Share2 size={15} className="text-slate-500" />
            <span>{isEn ? "Share" : "Bagikan"}</span>
          </>
        )}
      </button>

      {/* Direct Copy URL Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={isEn ? "Copy URL" : "Salin tautan"}
        className="p-2.5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
        title={isEn ? "Copy link" : "Salin tautan"}
      >
        {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-slate-500" />}
      </button>

      {/* Print Button */}
      <button
        type="button"
        onClick={handlePrint}
        aria-label={isEn ? "Print article" : "Cetak dokumen"}
        className="p-2.5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
        title={isEn ? "Print or save as PDF" : "Cetak atau simpan sebagai PDF"}
      >
        <Printer size={16} className="text-slate-500" />
      </button>

      {/* Bookmark Toggle (Client visual feedback) */}
      <button
        type="button"
        onClick={handleBookmark}
        aria-label={bookmarked ? (isEn ? "Saved" : "Tersimpan") : (isEn ? "Save for later" : "Simpan artikel")}
        className={`p-2.5 rounded-xl border transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center ${
          bookmarked
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600"
        }`}
        title={bookmarked ? (isEn ? "Article saved" : "Artikel disimpan") : (isEn ? "Save reading list" : "Tandai untuk dibaca nanti")}
      >
        <Bookmark size={16} className={bookmarked ? "fill-blue-600 text-blue-600" : ""} />
      </button>
    </div>
  );
}

export function CopyCitationButton({ citation, isEn = false }: { citation: string; isEn?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(citation);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = citation;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 shrink-0 min-h-[36px]"
      title={isEn ? "Copy citation in APA format" : "Salin sitasi format APA"}
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-600" />
          <span className="text-emerald-700">{isEn ? "Copied" : "Disalin"}</span>
        </>
      ) : (
        <>
          <Copy size={13} className="text-slate-500" />
          <span>{isEn ? "Copy Citation" : "Salin Sitasi"}</span>
        </>
      )}
    </button>
  );
}

