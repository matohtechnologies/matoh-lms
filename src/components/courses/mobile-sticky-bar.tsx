"use client";

import Link from "next/link";
import { Play, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MobileStickyBarProps {
  courseId: string;
  courseTitle: string;
  price: number;
  discountPrice?: number | null;
  isFree: boolean;
  isEnrolled: boolean;
  userId?: string;
  locale?: string;
}

export function MobileStickyBar({
  courseId,
  courseTitle,
  price,
  discountPrice,
  isFree,
  isEnrolled,
  userId,
  locale = "id",
}: MobileStickyBarProps) {
  const isEn = locale === "en";
  const finalPrice = discountPrice ?? price;
  const hasDiscount = discountPrice != null && discountPrice < price;

  const checkoutUrl = userId
    ? `/checkout/${courseId}`
    : `/login?callbackUrl=/checkout/${courseId}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left: Price or Status */}
        <div className="min-w-0">
          {isEnrolled ? (
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✓ {isEn ? "Enrolled" : "Terdaftar"}
              </span>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {isEn ? "Full Access Granted" : "Akses Penuh Aktif"}
              </p>
            </div>
          ) : isFree ? (
            <div>
              <p className="text-lg font-black text-emerald-600 leading-tight">
                {isEn ? "FREE" : "GRATIS"}
              </p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" />
                <span>{isEn ? "Includes Certificate" : "Termasuk Sertifikat"}</span>
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-slate-900 leading-tight">
                  {formatCurrency(finalPrice, locale)}
                </span>
                {hasDiscount && (
                  <span className="text-[11px] text-slate-400 line-through">
                    {formatCurrency(price, locale)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" />
                <span>{isEn ? "Lifetime Access" : "Akses Seumur Hidup"}</span>
              </p>
            </div>
          )}
        </div>

        {/* Right: CTA Button */}
        <div>
          {isEnrolled ? (
            <Link
              href={`/learn/${courseId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <Play size={14} />
              <span>{isEn ? "Enter Class" : "Masuk Kelas"}</span>
            </Link>
          ) : (
            <Link
              href={checkoutUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-900/20 active:scale-95 transition-all"
            >
              <Sparkles size={14} />
              <span>
                {isFree
                  ? (isEn ? "Enroll Free" : "Daftar Gratis")
                  : (isEn ? "Enroll Now" : "Daftar Sekarang")}
              </span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
