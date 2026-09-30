"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Camera, User, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useSession } from "next-auth/react";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
  bio: z.string().max(300, "Bio maksimal 300 karakter").optional(),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama diperlukan"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password diperlukan"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [memberSince, setMemberSince] = useState<string>("");

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

  // Load profile data (including bio) from API
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
            if (data.user.createdAt) {
              const d = new Date(data.user.createdAt);
              setMemberSince(
                d.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
              );
            }
          }
        })
        .catch(() => {
          reset({ name: session.user?.name ?? "", bio: "" });
        });
    }
  }, [session, reset]);

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
        setError(d.error ?? "Gagal memperbarui profil");
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
        setPwdError(json.error ?? "Gagal mengubah password");
      }
    } catch {
      setPwdError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsPwdPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-stone-900"
          style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
        >
          Profil Saya
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Kelola informasi profil akun kamu
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
              {session?.user?.name?.[0]?.toUpperCase() ?? <User size={32} />}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-colors shadow-sm">
              <Camera size={14} />
            </button>
          </div>
          <h3 className="font-semibold text-stone-900">{session?.user?.name}</h3>
          <p className="text-sm text-stone-500 mt-0.5">{session?.user?.email}</p>
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400">
              {memberSince ? `Member sejak ${memberSince}` : "Member aktif"}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Edit Profil</h3>

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={15} className="shrink-0" />
                Profil berhasil diperbarui
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nama Lengkap"
                placeholder="Nama kamu"
                error={errors.name?.message}
                {...register("name")}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">Email</label>
                <div className="h-10 px-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center text-sm text-stone-500">
                  {session?.user?.email}
                  <span className="ml-auto text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                    Tidak dapat diubah
                  </span>
                </div>
              </div>

              <Textarea
                label="Bio"
                placeholder="Ceritakan sedikit tentang dirimu..."
                error={errors.bio?.message}
                hint="Maks. 300 karakter"
                rows={4}
                {...register("bio")}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  loading={isPending}
                  leftIcon={<Save size={16} />}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={18} className="text-stone-400" />
              <h3 className="font-semibold text-stone-900">Ubah Password</h3>
            </div>

            {pwdSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={15} className="shrink-0" />
                Password berhasil diperbarui
              </div>
            )}
            {pwdError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                {pwdError}
              </div>
            )}

            <form onSubmit={handleSubmitPwd(onPasswordSubmit)} className="space-y-4">
              <Input
                label="Password Lama"
                type="password"
                placeholder="••••••••"
                error={pwdErrors.oldPassword?.message}
                {...registerPwd("oldPassword")}
              />
              <Input
                label="Password Baru"
                type="password"
                placeholder="••••••••"
                error={pwdErrors.newPassword?.message}
                hint="Minimal 6 karakter"
                {...registerPwd("newPassword")}
              />
              <Input
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="••••••••"
                error={pwdErrors.confirmPassword?.message}
                {...registerPwd("confirmPassword")}
              />
              <Button type="submit" variant="outline" loading={isPwdPending}>
                Ubah Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
