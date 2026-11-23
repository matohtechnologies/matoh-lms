"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

function ForgotPasswordContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";

  // Mode 1: Request Reset Link Form
  const [requestEmail, setRequestEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState("");

  // Mode 2: Reset Password Form (when token exists)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  // Handler for requesting reset link
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail || !requestEmail.includes("@")) {
      setRequestError(t("email_not_valid"));
      return;
    }

    setRequestError("");
    startTransition(async () => {
      try {
        await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: requestEmail }),
        });
        // Always show success for security
        setRequestSuccess(true);
      } catch {
        setRequestSuccess(true);
      }
    });
  };

  // Handler for resetting password with token
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!newPassword || newPassword.length < 8) {
      setResetError(t("password_min_length"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError(t("password_mismatch"));
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            email: emailParam,
            password: newPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setResetError(data.error || "Gagal mengatur ulang kata sandi. Silakan coba lagi.");
          return;
        }

        setResetSuccess(true);
      } catch {
        setResetError("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.");
      }
    });
  };

  // --- RENDER 1: Token Present - Success State ---
  if (token && resetSuccess) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-8 sm:p-10">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("password_updated_title")}
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              {t("password_updated_desc")}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              {t("login_to_account")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 2: Token Present - Reset Password Form ---
  if (token) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center p-2 group-hover:border-blue-400 group-hover:shadow-xs transition-all">
                <Image
                  src="/images/matoh-logo-v2.png"
                  alt="Matoh Technologies"
                  width={26}
                  height={26}
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className="font-bold text-slate-900 text-xl"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                MatohTechnologies
              </span>
            </Link>
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("reset_password_title")}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {emailParam ? (
                <>
                  {t("reset_password_subtitle")} (<strong className="text-stone-700">{emailParam}</strong>)
                </>
              ) : (
                t("reset_password_subtitle")
              )}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-6 sm:p-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 mx-auto mb-6">
              <KeyRound size={24} className="text-blue-600" />
            </div>

            {resetError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{resetError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <Input
                  id="new-password"
                  name="new-password"
                  label={t("new_password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                />
                <p className="mt-1 text-xs text-stone-400">{t("password_min_length")}</p>
              </div>

              <div>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  label={t("confirm_new_password")}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                loading={isPending}
                leftIcon={<KeyRound size={16} />}
              >
                {isPending ? t("saving_password") : t("save_new_password")}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                <ArrowLeft size={14} />
                {t("back_to_login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 3: No Token - Request Email Sent State ---
  if (requestSuccess) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-8 sm:p-10">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h1
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("reset_link_sent_title")}
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              {t("reset_link_sent_desc")}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              {t("back_to_login")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 4: No Token - Request Reset Link Form ---
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center p-2 group-hover:border-blue-400 group-hover:shadow-xs transition-all">
              <Image
                src="/images/matoh-logo-v2.png"
                alt="Matoh Technologies"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <span
              className="font-bold text-slate-900 text-xl"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              MatohTechnologies
            </span>
          </Link>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("forgot_password_title")}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {t("forgot_password_subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-6 sm:p-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 mx-auto mb-6">
            <Mail size={24} className="text-blue-600" />
          </div>

          {requestError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{requestError}</span>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <Input
              id="forgot-email"
              name="email"
              label={t("email")}
              type="email"
              autoComplete="email"
              placeholder="email@kamu.com"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
              leftIcon={<Mail size={16} />}
            >
              {isPending ? t("sending_reset_link") : t("send_reset_link")}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              <ArrowLeft size={14} />
              {t("back_to_login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Memuat...</p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
