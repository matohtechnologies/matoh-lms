"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada huruf besar")
    .regex(/[0-9]/, "Harus ada angka"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const isEn = locale === "en";
  const t = useTranslations("auth");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const passwordStrength = [
    { label: isEn ? "Min. 8 chars" : "Min. 8 karakter", valid: password.length >= 8 },
    { label: isEn ? "Uppercase" : "Huruf besar", valid: /[A-Z]/.test(password) },
    { label: isEn ? "Number" : "Angka", valid: /[0-9]/.test(password) },
  ];

  const onSubmit = (data: RegisterForm) => {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? (isEn ? "An error occurred. Please try again." : "Terjadi kesalahan. Silakan coba lagi."));
        return;
      }

      // Auto login after register
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Top bar */}
        <div className="flex items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center p-1.5 group-hover:border-blue-400 group-hover:shadow-xs transition-all">
              <Image
                src="/images/matoh-logo.png"
                alt="Matoh Technologies"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-stone-900 text-lg" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
              Matoh<span className="text-blue-600">Technologies</span>
            </span>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
            {t("register_title")}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {t("register_subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg p-6 sm:p-8">
          {/* Google Login */}
          <button
            id="google-register-btn"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("continue_google")}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium">{t("or")}</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="register-name"
              label={t("name")}
              autoComplete="name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              id="register-email"
              label={t("email")}
              type="email"
              autoComplete="email"
              placeholder="email@kamu.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div>
              <Input
                id="register-password"
                label={t("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-stone-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...register("password")}
              />
              {password && (
                <div className="flex items-center gap-3 mt-2">
                  {passwordStrength.map(({ label, valid }) => (
                    <div key={label} className={`flex items-center gap-1 text-[11px] ${valid ? "text-green-600" : "text-stone-400"}`}>
                      <CheckCircle size={10} className={valid ? "opacity-100" : "opacity-30"} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Input
              id="register-confirm-password"
              label={t("confirm_password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <p className="text-xs text-stone-500">
              {t("agree_terms")}{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">{t("terms")}</Link>
              {" "}{t("and")}{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">{t("privacy")}</Link>
            </p>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
            >
              {t("register")}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-5">
            {t("have_account")}{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
