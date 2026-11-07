"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  GraduationCap,
  X,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Mail,
  Lock,
  User,
  Briefcase,
  FileText,
  Shield,
  Upload,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { dynamicAlert } from "@/components/ui/dynamic-alert-provider";
import { useTranslations } from "next-intl";

export function AddInstructorModal() {
  const t = useTranslations("admin");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"INSTRUCTOR" | "ADMIN" | "USER">("INSTRUCTOR");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading]);

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789@#$";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("INSTRUCTOR");
    setHeadline("");
    setBio("");
    setImage("");
    setError("");
    setShowPassword(false);
    setUploadingImage(false);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar (JPEG, PNG, WebP) yang diperbolehkan.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah foto profil dari perangkat.");
      }

      setImage(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto profil.";
      setError(msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama lengkap instruktur wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Alamat email tidak valid.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          headline: headline.trim() || null,
          bio: bio.trim() || null,
          image: image.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menambahkan instruktur.");
        return;
      }

      setIsOpen(false);
      resetForm();
      router.refresh();

      await dynamicAlert({
        title: "Instruktur Berhasil Ditambahkan",
        message: `Akun instruktur untuk ${name} (${email}) berhasil dibuat dan dapat langsung ditugaskan mengajar kelas.`,
        variant: "success",
      });
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        type="button"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer"
        aria-label={t("btn_add_instructor")}
      >
        <UserPlus size={15} className="shrink-0" />
        <span>{t('btn_add_instructor')}</span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl border border-stone-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-instructor-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 bg-stone-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2
                    id="add-instructor-title"
                    className="text-base font-bold text-stone-900 tracking-tight"
                  >
                    {t("add_instructor_title")}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t("add_instructor_desc")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !loading && setIsOpen(false)}
                disabled={loading}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
                aria-label="Tutup Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Peran / Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Peran Akun
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("INSTRUCTOR")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${role === "INSTRUCTOR"
                        ? "bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-600/15"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                  >
                    <GraduationCap size={14} className={role === "INSTRUCTOR" ? "text-teal-600" : "text-stone-400"} />
                    <span>Instruktur</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${role === "ADMIN"
                        ? "bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-600/15"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                  >
                    <Shield size={14} className={role === "ADMIN" ? "text-blue-600" : "text-stone-400"} />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("USER")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${role === "USER"
                        ? "bg-stone-100 text-stone-900 border-stone-300 ring-2 ring-stone-400/20"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                  >
                    <User size={14} className={role === "USER" ? "text-stone-800" : "text-stone-400"} />
                    <span>Siswa</span>
                  </button>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label
                  htmlFor="instructor-name"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="instructor-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dr. Budi Santoso, M.Kom"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50/80 border border-stone-200/80 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="instructor-email"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="instructor-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="instruktur@matohtechnologies.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50/80 border border-stone-200/80 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="instructor-password"
                    className="block text-xs font-semibold text-stone-700"
                  >
                    Kata Sandi Awal <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Buat Acak</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="instructor-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-10 py-2 rounded-xl text-xs bg-stone-50/80 border border-stone-200/80 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Foto Profil / Avatar */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Foto Profil / Avatar <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>

                <div className="p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/70 flex items-center gap-3.5">
                  {/* Preview Thumbnail */}
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-2xs overflow-hidden ring-2 ring-white border border-stone-200/80">
                    {image ? (
                      <img
                        src={image}
                        alt={name || "Avatar"}
                        width={56}
                        height={56}
                        style={{ aspectRatio: "1 / 1" }}
                        className="w-full h-full object-cover aspect-square"
                      />
                    ) : (
                      <span>{(name || "U")[0]?.toUpperCase()}</span>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white">
                        <Loader2 size={18} className="animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage || loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50 hover:border-teal-500"
                      >
                        {uploadingImage ? (
                          <Loader2 size={13} className="animate-spin text-teal-600" />
                        ) : (
                          <Upload size={13} className="text-teal-600" />
                        )}
                        <span>{uploadingImage ? "Mengunggah..." : "Pilih dari Perangkat"}</span>
                      </button>

                      {image && (
                        <button
                          type="button"
                          onClick={() => setImage("")}
                          disabled={uploadingImage || loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus foto profil"
                        >
                          <Trash2 size={12} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-stone-400">
                      Mendukung JPG, PNG, atau WebP (Maks. 5MB)
                    </p>
                  </div>
                </div>

                {/* Optional URL input toggle */}
                <div className="mt-2">
                  <details className="text-[11px] text-stone-500 group">
                    <summary className="cursor-pointer hover:text-stone-700 font-medium select-none flex items-center gap-1">
                      <LinkIcon size={11} className="text-stone-400" />
                      <span>Atau masukkan tautan URL gambar...</span>
                    </summary>
                    <div className="relative mt-1.5">
                      <input
                        id="instructor-image"
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://... atau /uploads/avatars/..."
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 font-mono"
                      />
                    </div>
                  </details>
                </div>
              </div>

              {/* Headline / Bidang Keahlian */}
              <div>
                <label
                  htmlFor="instructor-headline"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Gelar / Bidang Keahlian <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    id="instructor-headline"
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Contoh: Peneliti AHP & Senior Data Analyst"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50/80 border border-stone-200/80 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Bio Singkat */}
              <div>
                <label
                  htmlFor="instructor-bio"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Biografi Singkat <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <FileText size={15} className="absolute left-3 top-2.5 text-stone-400 pointer-events-none" />
                  <textarea
                    id="instructor-bio"
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ringkasan rekam jejak akademik, riset, atau pengalaman industri..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50/80 border border-stone-200/80 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 active:bg-stone-100 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  <span>{loading ? "Menyimpan..." : "Simpan Instruktur"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

