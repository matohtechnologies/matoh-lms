"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface CourseSearchInputProps {
  placeholder?: string;
  searchButtonLabel?: string;
  defaultValue?: string;
}

export function CourseSearchInput({
  placeholder = "Cari judul kelas, topik, atau kata kunci...",
  searchButtonLabel = "Cari Kelas",
  defaultValue = "",
}: CourseSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams?.get("q") ?? defaultValue;
  const [query, setQuery] = useState(currentQ);
  const [isPending, startTransition] = useTransition();

  // Sync internal state if URL param changes externally (e.g. back button)
  useEffect(() => {
    setQuery(searchParams?.get("q") ?? "");
  }, [searchParams]);

  const updateSearchParam = useCallback(
    (newQuery: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      const trimmed = newQuery.trim();

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      // Reset to page 1 on query change
      params.delete("page");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  // Debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams?.get("q") ?? "")) {
        updateSearchParam(query);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query, searchParams, updateSearchParam]);

  const handleClear = () => {
    setQuery("");
    updateSearchParam("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParam(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-2xl relative"
    >
      <div className="relative flex-1">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
          {isPending ? (
            <Loader2 size={18} className="animate-spin text-blue-600" />
          ) : (
            <Search size={18} />
          )}
        </div>

        <label htmlFor="courses-search-input" className="sr-only">
          {placeholder}
        </label>
        <input
          id="courses-search-input"
          name="q"
          autoComplete="off"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full h-12 pl-10 pr-10 rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            title="Hapus pencarian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="px-6 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{searchButtonLabel}</span>
      </button>
    </form>
  );
}
