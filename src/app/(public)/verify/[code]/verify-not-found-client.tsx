"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface VerifyNotFoundClientProps {
  code: string;
}

export function VerifyNotFoundClient({ code }: VerifyNotFoundClientProps) {
  const t = useTranslations("verify");

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 text-center shadow-warm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-xs">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            {t("not_found_status")}
          </span>
          <h1
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("not_found_title")}
          </h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            {t("not_found_desc", { code: decodeURIComponent(code) })}
          </p>
        </div>

        <form action="/verify" method="GET" className="space-y-3 pt-2">
          <label htmlFor="verify-not-found-code" className="sr-only">
            {t("search_placeholder")}
          </label>
          <input
            id="verify-not-found-code"
            type="text"
            name="code"
            autoComplete="off"
            placeholder={t("search_placeholder")}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 text-center font-mono uppercase focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            {t("search_again_btn")}
          </button>
        </form>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t("back_to_home")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
