"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, Shield, Clock, BookOpen, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { resolveThumbnailUrl } from "@/lib/youtube";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";

interface CheckoutPageProps {
  params: Promise<{ courseId: string }>;
}

interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  instructor: { name?: string };
  category: { name: string };
  totalLessons?: number;
  duration?: number;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const { locale } = useAppLocale();
  const isEn = locale === "en";
  const t = useTranslations("checkout");
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

  useEffect(() => {
    params.then(async ({ courseId }) => {
      setCourseId(courseId);
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
          if (data.isEnrolled) {
            setIsAlreadyEnrolled(true);
          }
        } else {
          setCourse(null);
        }
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    });
  }, [params]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyEnrolled) {
        setIsAlreadyEnrolled(true);
        return;
      }

      if (!res.ok) {
        alert(data.error ?? "Terjadi kesalahan");
        return;
      }

      if (data.type === "free") {
        router.push(`/dashboard/my-courses?success=true`);
        return;
      }

      // Load Midtrans Snap
      const snapToken = data.token;
      const orderId = data.orderId;

      if (snapToken && snapToken.startsWith("demo-snap-token")) {
        // Simulated payment for development/demo environment: verify & enroll immediately
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }).catch(() => null);

        router.push(`/checkout/success?order_id=${orderId}`);
        return;
      }

      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!;

      // Load snap.js
      const script = document.createElement("script");
      script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", clientKey);
      script.onload = () => {
        (window as { snap?: { pay: (token: string, options: Record<string, unknown>) => void } }).snap?.pay(snapToken, {
          onSuccess: async () => {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            }).catch(() => null);
            router.push(`/checkout/success?order_id=${orderId}`);
          },
          onPending: async () => {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            }).catch(() => null);
            router.push(`/checkout/success?order_id=${orderId}`);
          },
          onError: () => {
            alert("Pembayaran gagal. Silakan coba lagi.");
            setPaying(false);
          },
          onClose: () => {
            setPaying(false);
          },
        });
      };
      document.head.appendChild(script);
    } catch {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm">{isEn ? "Loading..." : "Memuat..."}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-sm">
          <p className="text-stone-800 font-bold text-base mb-2">
            {isEn ? "Course Not Found" : "Kelas Tidak Ditemukan"}
          </p>
          <p className="text-stone-500 text-xs mb-4">
            {isEn ? "The course you are looking for is not listed or has not been published." : "Kelas yang ingin kamu beli tidak terdaftar atau belum dipublikasikan."}
          </p>
          <Link
            href="/courses"
            className="inline-block px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700 transition-colors"
          >
            {isEn ? "Back to Catalog" : "Kembali ke Katalog"}
          </Link>
        </div>
      </div>
    );
  }

  if (isAlreadyEnrolled) {
    return (
      <div className="min-h-screen bg-stone-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center p-8 sm:p-10 bg-white rounded-3xl border border-stone-200 shadow-warm-lg max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
            <CheckCircle size={32} />
          </div>
          <h2
            className="text-xl font-bold text-stone-900 mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("already_owned_title")}
          </h2>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            {isEn ? (
              <>You already have full lifetime access to <strong>{course.title}</strong>. You do not need to make another purchase.</>
            ) : (
              <>Anda sudah terdaftar dan memiliki akses penuh seumur hidup ke kelas <strong>{course.title}</strong>. Anda tidak perlu membayar atau mendaftar ulang.</>
            )}
          </p>
          <div className="space-y-3">
            <Link href={`/learn/${course.id || courseId}`} className="block w-full">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
                size="lg"
              >
                {t("enter_learning_room")}
              </Button>
            </Link>
            <Link href="/dashboard/my-courses" className="block w-full">
              <Button variant="outline" className="w-full">
                {isEn ? "View My Courses" : "Lihat Kelas Saya"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = course.discountPrice ?? course.price;
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price;

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
          <ArrowLeft size={16} />
          {t("back_to_course")}
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mb-6" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
          {t("title")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Course Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-900 mb-4">{t("order_summary")}</h2>
              <div className="flex gap-4">
                <div className="w-24 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                  {course.thumbnail ? (
                    <Image
                      src={resolveThumbnailUrl(course.thumbnail)}
                      alt={course.title}
                      width={96}
                      height={64}
                      unoptimized={
                        course.thumbnail.includes("youtube.com") ||
                        course.thumbnail.includes("ytimg.com")
                      }
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                      <BookOpen size={24} className="text-orange-300" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-stone-900 text-sm leading-snug">{course.title}</p>
                  <p className="text-xs text-stone-500 mt-1">{course.instructor.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                    {course.totalLessons && <span>{course.totalLessons} {isEn ? "lessons" : "materi"}</span>}
                    <span>{isEn ? "Lifetime access" : "Akses seumur hidup"}</span>
                    <span>{isEn ? "Certificate" : "Sertifikat"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-900 mb-4">{t("payment_method")}</h2>
              <p className="text-sm text-stone-500">
                {isEn
                  ? "Payments are securely processed via Midtrans. Multiple methods available:"
                  : "Pembayaran diproses secara aman melalui Midtrans. Tersedia berbagai metode pembayaran:"}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {(isEn
                  ? ["Bank Transfer", "GoPay", "OVO", "DANA", "QRIS", "Credit Card"]
                  : ["Transfer Bank", "GoPay", "OVO", "DANA", "QRIS", "Kartu Kredit"]
                ).map((method) => (
                  <span key={method} className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <Shield size={16} className="text-green-500 shrink-0" />
              <span>
                {isEn
                  ? "Transaction protected by 256-bit SSL encryption. Your data is safe with us."
                  : "Transaksi dilindungi enkripsi SSL 256-bit. Data kamu aman bersama kami."}
              </span>
            </div>
          </div>

          {/* Price Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-warm sticky top-24">
              <h2 className="font-semibold text-stone-900 mb-4">{t("total_payment")}</h2>

              <div className="space-y-3 border-b border-stone-100 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">{t("original_price")}</span>
                  <span className="text-stone-700">
                    {hasDiscount ? (
                      <span className="line-through">{formatCurrency(course.price, locale)}</span>
                    ) : (
                      formatCurrency(course.price, locale)
                    )}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">{t("discount")}</span>
                    <span className="text-green-600">
                      -{formatCurrency(course.price - finalPrice, locale)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="font-bold text-stone-900">Total</span>
                <span className="text-2xl font-extrabold text-orange-600">
                  {formatCurrency(finalPrice, locale)}
                </span>
              </div>

              <Button
                id="pay-btn"
                className="w-full"
                size="lg"
                onClick={handlePay}
                loading={paying}
                leftIcon={<CreditCard size={18} />}
              >
                {t("pay_now")}
              </Button>

              <div className="mt-4 space-y-2">
                {[
                  { icon: Clock, text: isEn ? "30-day money-back guarantee" : "Garansi uang kembali 30 hari" },
                  { icon: Award, text: isEn ? "Full lifetime access" : "Akses seumur hidup" },
                  { icon: Shield, text: t("secure_payment") },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-stone-500">
                    <Icon size={13} className="text-stone-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
