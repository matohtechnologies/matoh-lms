"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BookOpen, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Metadata } from "next";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Masukkan alamat email yang valid");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        // Always show success for security (don't reveal if email exists)
        setSuccess(true);
      } catch {
        // Still show success for security
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-8 sm:p-10">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1
              className="text-2xl font-bold text-stone-900 mb-2"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Email Terkirim!
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Jika email <strong className="text-stone-700">{email}</strong> terdaftar di sistem kami,
              kamu akan menerima tautan untuk mereset password dalam beberapa menit.
            </p>
            <p className="text-xs text-stone-400 mb-6">
              Cek folder spam jika email tidak masuk ke kotak masuk utama.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-sm">
              <BookOpen size={20} className="text-white" />
            </div>
            <span
              className="font-bold text-stone-900 text-xl"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Matoh<span className="text-blue-600">Technologies</span>
            </span>
          </Link>
          <h1
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            Lupa Password?
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Masukkan emailmu dan kami akan kirim tautan reset
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-6 sm:p-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 mx-auto mb-6">
            <Mail size={24} className="text-blue-600" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Terdaftar"
              type="email"
              placeholder="email@kamu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
              leftIcon={<Mail size={16} />}
            >
              Kirim Tautan Reset Password
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
