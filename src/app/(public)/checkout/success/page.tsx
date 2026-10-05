"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, PlayCircle, BookOpen, ArrowRight, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifiedCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<VerifiedCourse | null>(null);

  useEffect(() => {
    const verifyAndEnroll = async () => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderId || undefined }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.course) {
            setCourse(data.course);
          }
        }
      } catch {
        // Fallback: still show success message
      } finally {
        setLoading(false);
      }
    };

    verifyAndEnroll();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200/80 shadow-warm-lg p-6 sm:p-10 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 text-white shadow-md shadow-emerald-500/20">
          <CheckCircle2 size={44} strokeWidth={2.5} />
        </div>

        <h1
          className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2"
          style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
        >
          Pembayaran Berhasil! 🎉
        </h1>

        <p className="text-stone-500 text-sm sm:text-base mb-6 max-w-sm mx-auto">
          Selamat! Akses kelas sudah berhasil diaktifkan ke akun kamu.
        </p>

        {/* Course Card Preview */}
        {loading ? (
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center gap-3 text-stone-400 text-sm mb-6">
            <Loader2 size={18} className="animate-spin text-blue-500" />
            <span>Menyiapkan ruang belajarmu...</span>
          </div>
        ) : course ? (
          <div className="mb-8 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-100 overflow-hidden shrink-0 flex items-center justify-center">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={24} className="text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-1">
                Akses Aktif
              </span>
              <h3 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug">
                {course.title}
              </h3>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {course ? (
            <Link
              href={`/learn/${course.id}`}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
            >
              <PlayCircle size={18} />
              Mulai Belajar Sekarang
            </Link>
          ) : (
            <Link
              href="/dashboard/my-courses"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
            >
              <PlayCircle size={18} />
              Buka Kelas Saya
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href="/dashboard/my-courses"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
            >
              <BookOpen size={14} className="text-stone-400" />
              Kelas Saya
            </Link>
            <Link
              href="/courses"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
            >
              Cari Kelas Lain
              <ArrowRight size={14} className="text-stone-400" />
            </Link>
          </div>
        </div>

        {/* Feature badge */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-center gap-6 text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <Award size={14} className="text-amber-500" /> Sertifikat Resmi
          </span>
          <span>•</span>
          <span>Akses Seumur Hidup</span>
          <span>•</span>
          <span>Akses Materi 24/7</span>
        </div>
      </div>
    </div>
  );
}
