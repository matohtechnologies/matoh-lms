"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Camera, User, KeyRound, CheckCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const t = useTranslations("dashboard");
  const { locale } = useAppLocale();
  const isEn = locale === "en";

  const profileSchema = z.object({
    name: z.string().min(2, isEn ? "Name must be at least 2 characters" : "Nama minimal 2 karakter").max(50),
    bio: z.string().max(300, isEn ? "Bio must be at most 300 characters" : "Bio maksimal 300 karakter").optional(),
  });

  const passwordSchema = z
    .object({
      oldPassword: z.string().min(1, isEn ? "Current password is required" : "Password lama diperlukan"),
      newPassword: z.string().min(6, isEn ? "New password must be at least 6 characters" : "Password baru minimal 6 karakter"),
      confirmPassword: z.string().min(1, isEn ? "Confirm password is required" : "Konfirmasi password diperlukan"),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: isEn ? "Passwords do not match" : "Konfirmasi password tidak cocok",
      path: ["confirmPassword"],
    });

  type ProfileForm = z.infer<typeof profileSchema>;
  type PasswordForm = z.infer<typeof passwordSchema>;

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [memberSince, setMemberSince] = useState<string>("");

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(session?.user?.image ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password form state
  const [isPwdPending, setIsPwdPending] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    formState: { errors: pwdErrors },
    reset: resetPwd,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // Sync avatarUrl when session loads
  useEffect(() => {
    if (session?.user?.image && !avatarUrl) {
      setAvatarUrl(session.user.image);
    }
  }, [session?.user?.image, avatarUrl]);

  // Load profile data (including bio and image) from API
  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            reset({
              name: data.user.name ?? session.user?.name ?? "",
              bio: data.user.bio ?? "",
            });
            if (data.user.image) {
              setAvatarUrl(data.user.image);
            }
            if (data.user.createdAt) {
              const d = new Date(data.user.createdAt);
              setMemberSince(
                d.toLocaleDateString(isEn ? "en-US" : "id-ID", { month: "long", year: "numeric" })
              );
            }
          }
        })
        .catch(() => {
          reset({ name: session.user?.name ?? "", bio: "" });
        });
    }
  }, [session, reset, isEn]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({
        text: isEn ? "File size must be under 5MB" : "Ukuran foto maksimal 5MB",
        type: "error",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarMessage({
        text: isEn ? "Only image files are allowed" : "Hanya file gambar yang diperbolehkan",
        type: "error",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      // Upload and store directly into PostgreSQL database (via /api/user/avatar)
      const uploadRes = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.url) {
        throw new Error(uploadJson.error || (isEn ? "Upload failed" : "Gagal mengunggah foto"));
      }

      const uploadedUrl = uploadJson.url as string;
      const avatarEndpoint = (uploadJson.avatarUrl as string) || uploadedUrl;

      // Synchronize session immediately
      await update({ image: avatarEndpoint });
      setAvatarUrl(uploadedUrl);
      setAvatarMessage({
        text: isEn ? "Profile photo saved to database!" : "Foto profil berhasil disimpan ke database!",
        type: "success",
      });
      setTimeout(() => setAvatarMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isEn ? "Failed to upload photo" : "Gagal mengunggah foto");
      setAvatarMessage({ text: msg, type: "error" });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      setAvatarMessage(null);

      // Remove directly from PostgreSQL database
      const deleteRes = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (!deleteRes.ok) {
        throw new Error(isEn ? "Failed to remove photo" : "Gagal menghapus foto");
      }

      await update({ image: null });
      setAvatarUrl(null);
      setAvatarMessage({
        text: isEn ? "Profile photo removed from database" : "Foto profil berhasil dihapus dari database",
        type: "success",
      });
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isEn ? "Failed to remove photo" : "Gagal menghapus foto");
      setAvatarMessage({ text: msg, type: "error" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = (data: ProfileForm) => {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await update({ name: data.name });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const d = await res.json();
        setError(d.error ?? t("profile_update_failed"));
      }
    });
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPwdError("");
    setPwdSuccess(false);
    setIsPwdPending(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setPwdSuccess(true);
        resetPwd();
        setTimeout(() => setPwdSuccess(false), 4000);
      } else {
        setPwdError(json.error ?? t("password_update_failed"));
      }
    } catch {
      setPwdError(t("error_generic"));
    } finally {
      setIsPwdPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {isEn ? "Account Settings" : "Pengaturan Akun"}
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("profile_title")}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {t("profile_subtitle")}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Avatar & Summary Card */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 text-center relative overflow-hidden">
            {/* Ambient Top Decorative Banner */}
            <div className="h-20 bg-gradient-to-r from-blue-100 via-sky-50 to-blue-50 -mt-6 -mx-6 mb-5 border-b border-blue-100/60" />

            <div className="relative inline-block -mt-14 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center text-white text-3xl font-bold mx-auto ring-4 ring-white shadow-md overflow-hidden relative">
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={session?.user?.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{session?.user?.name?.[0]?.toUpperCase() ?? <User size={32} />}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-50 ring-2 ring-white"
                title={isEn ? "Change photo" : "Ganti foto"}
              >
                {isUploadingAvatar ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
            </div>

            {/* Quick Actions under Avatar: Change / Remove */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {avatarUrl ? (isEn ? "Change photo" : "Ganti foto") : (isEn ? "Upload photo" : "Unggah foto")}
              </button>
              {avatarUrl && (
                <>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className="text-xs font-medium text-stone-400 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>{isEn ? "Remove" : "Hapus"}</span>
                  </button>
                </>
              )}
            </div>

            {avatarMessage && (
              <div
                className={`text-xs px-2.5 py-1.5 rounded-lg mb-3 inline-flex items-center gap-1.5 animate-in fade-in duration-150 ${
                  avatarMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {avatarMessage.type === "success" ? <CheckCircle size={13} className="shrink-0 text-emerald-600" /> : <AlertCircle size={13} className="shrink-0 text-red-600" />}
                <span>{avatarMessage.text}</span>
              </div>
            )}

            <h3
              className="font-bold text-lg text-stone-900"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {session?.user?.name || "Pengguna"}
            </h3>
            <p className="text-sm text-stone-500 mt-0.5 truncate max-w-full">{session?.user?.email}</p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isEn ? "Active Student" : "Siswa Aktif"}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{isEn ? "Joined" : "Bergabung"}</span>
                <span className="font-semibold text-stone-700">
                  {memberSince ? memberSince : (isEn ? "Active Member" : "Anggota Aktif")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Email Status</span>
                <span className="font-semibold text-emerald-600">
                  {isEn ? "Verified" : "Terverifikasi"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-stone-50/80 rounded-2xl border border-stone-200/70 p-4 text-xs text-stone-600 space-y-1.5">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <span>💡</span>
              <span>{isEn ? "Profile Tip" : "Tips Profil"}</span>
            </div>
            <p className="text-stone-500 leading-relaxed">
              {isEn
                ? "Your full name is used on your certificates of completion. Make sure it matches your official identification."
                : "Nama lengkap Anda digunakan pada sertifikat kelulusan kelas. Pastikan nama sesuai dengan identitas resmi Anda."}
            </p>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
                <User size={18} />
              </div>
              <div>
                <h3
                  className="font-bold text-stone-900 text-base"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                >
                  {t("edit_profile_section")}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn ? "Update your personal details and public bio" : "Perbarui data diri dan bio publik Anda"}
                </p>
              </div>
            </div>

            {success && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">{t("profile_updated")}</span>
              </div>
            )}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  label={t("full_name")}
                  placeholder={t("name_placeholder")}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  {isEn ? "This name will appear on all your certificates" : "Nama ini akan tertera di sertifikat kelulusan kursus Anda"}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Email</label>
                <div className="h-10 px-3.5 rounded-xl border border-stone-200 bg-stone-50/80 flex items-center text-sm text-stone-600 justify-between">
                  <span className="font-mono text-xs text-stone-700">{session?.user?.email}</span>
                  <span className="text-[10px] font-semibold bg-stone-200/70 text-stone-600 px-2 py-0.5 rounded-md">
                    {t("email_readonly")}
                  </span>
                </div>
              </div>

              <Textarea
                label="Bio"
                placeholder={t("bio_placeholder")}
                error={errors.bio?.message}
                hint={t("bio_hint")}
                rows={4}
                {...register("bio")}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  loading={isPending}
                  leftIcon={<Save size={15} />}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs px-6"
                >
                  {t("save_changes")}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 sm:p-7">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                <KeyRound size={18} />
              </div>
              <div>
                <h3
                  className="font-bold text-stone-900 text-base"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                >
                  {t("change_password")}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn ? "Ensure your account is using a strong password" : "Pastikan akun Anda menggunakan kata sandi yang aman dan kuat"}
                </p>
              </div>
            </div>

            {pwdSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">{t("password_updated")}</span>
              </div>
            )}
            {pwdError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span className="font-medium">{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPwd(onPasswordSubmit)} className="space-y-4">
              <Input
                label={t("old_password")}
                type="password"
                placeholder="••••••••"
                error={pwdErrors.oldPassword?.message}
                {...registerPwd("oldPassword")}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label={t("new_password")}
                  type="password"
                  placeholder="••••••••"
                  error={pwdErrors.newPassword?.message}
                  hint={t("new_password_hint")}
                  {...registerPwd("newPassword")}
                />
                <Input
                  label={t("confirm_password")}
                  type="password"
                  placeholder="••••••••"
                  error={pwdErrors.confirmPassword?.message}
                  {...registerPwd("confirmPassword")}
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  loading={isPwdPending}
                  className="border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold"
                >
                  {t("change_password")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
