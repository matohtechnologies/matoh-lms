"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  Lock,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function VerifyIndexClient() {
  const t = useTranslations("verify");
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    window.location.href = `/verify/${encodeURIComponent(code.trim().toUpperCase())}`;
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-dot-matrix relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        {/* Top Header with Switch Language */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold border border-emerald-200 shadow-2xs">
              <span>{t("portal_badge")}</span>
            </div>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("portal_title")}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            {t("portal_subtitle")}
          </p>
        </div>

        {/* Verification Search Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-warm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="verify-serial-code" className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              {t("portal_input_label")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  size={18}
                />
                <input
                  id="verify-serial-code"
                  name="code"
                  autoComplete="off"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder={t("search_placeholder")}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 placeholder:text-stone-400 text-sm font-mono uppercase focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {t("portal_verify_btn")}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-xs text-stone-400">
                {t("portal_input_hint")}
              </p>
            </div>
          </form>

          {/* Quick Features List */}
          <div className="pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="font-bold text-stone-800">{t("portal_feature1_title")}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{t("portal_feature1_desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <p className="font-bold text-stone-800">{t("portal_feature2_title")}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{t("portal_feature2_desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award size={16} />
              </div>
              <div>
                <p className="font-bold text-stone-800">{t("portal_feature3_title")}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{t("portal_feature3_desc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info for Employers */}
        <div className="p-6 rounded-3xl bg-stone-100/70 border border-stone-200/80 text-xs text-stone-600 space-y-2">
          <p className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <HelpCircle size={16} className="text-blue-600" />
            <span>{t("portal_employer_title")}</span>
          </p>
          <p className="leading-relaxed">
            {t("portal_employer_desc")}{" "}
            <Link href="/contact" className="text-blue-600 underline font-medium">
              {t("contact_page")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
