"use client";

import { useAppLocale } from "@/components/providers/locale-provider";

export function LanguageSwitcher() {
  const { locale, switchLocale, isPending } = useAppLocale();

  return (
    <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-stone-200/60 shadow-xs">
      <button
        id="lang-id"
        type="button"
        onClick={() => switchLocale("id")}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
          locale === "id"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-stone-500 hover:text-stone-800"
        } ${isPending ? "opacity-70 cursor-wait" : ""}`}
        title="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        id="lang-en"
        type="button"
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
          locale === "en"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-stone-500 hover:text-stone-800"
        } ${isPending ? "opacity-70 cursor-wait" : ""}`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
