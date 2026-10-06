import Link from "next/link";
import { BookOpen, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Number */}
        <div className="relative mb-8">
          <p className="text-[120px] font-extrabold leading-none text-slate-100 select-none" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-warm-lg">
              <Search size={28} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan. Coba periksa URL atau kembali ke halaman utama.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Home size={16} />
            Kembali ke Beranda
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:border-blue-400 hover:text-blue-700 transition-colors bg-white"
          >
            <BookOpen size={16} />
            Jelajahi Kelas
          </Link>
        </div>
      </div>
    </div>
  );
}
