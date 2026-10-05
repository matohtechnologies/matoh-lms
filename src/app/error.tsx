"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-10 shadow-warm-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <h1
          className="text-2xl font-bold text-stone-900 mb-2"
          style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
        >
          Terjadi Kendala Teknis
        </h1>

        <p className="text-sm text-stone-500 leading-relaxed mb-6">
          Aplikasi mengalami gangguan sementara saat memproses halaman ini.
          Silakan coba muat ulang atau kembali ke halaman utama.
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-6 p-3 rounded-xl bg-stone-100 text-left text-xs text-stone-600 font-mono overflow-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            <Home size={16} />
            Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
