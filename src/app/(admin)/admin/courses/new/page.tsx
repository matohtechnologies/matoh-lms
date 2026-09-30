"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, isYouTubeUrl, resolveThumbnailUrl } from "@/lib/youtube";
import { CourseMediaPicker } from "@/components/admin/course-media-picker";

interface Category {
  id: string;
  name: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [price, setPrice] = useState("499000");
  const [isFree, setIsFree] = useState(false);
  const [duration, setDuration] = useState("12");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"
  );
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories?.length) {
          setCategories(d.categories);
          setCategoryId(d.categories[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Judul kelas wajib diisi"); return; }
    if (!description.trim()) { setError("Deskripsi kelas wajib diisi"); return; }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
          description,
          categoryId: categoryId || undefined,
          level,
          price: isFree ? 0 : Number(price),
          duration: Number(duration),
          thumbnail: thumbnail || undefined,
          published: isPublished,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/courses"), 1500);
      } else {
        setError(data.error ?? "Gagal membuat kelas");
      }
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1
              className="text-2xl font-bold text-stone-900"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              Tambah Kelas Baru
            </h1>
            <p className="text-stone-500 text-xs mt-0.5">
              Isi data detail kurikulum, harga, dan materi kelas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/courses")}
            className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            leftIcon={<Save size={16} />}
          >
            Publikasikan Kelas
          </Button>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <p className="text-sm font-medium">
            Kelas baru berhasil dibuat! Mengalihkan ke daftar kelas...
          </p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Form Cards */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
          <h2 className="font-semibold text-stone-900 text-base border-b border-stone-100 pb-3">
            Informasi Utama Kelas
          </h2>

          <div className="space-y-4">
            <Input
              label="Judul Kelas"
              placeholder="Contoh: Fullstack Web Developer Modern: Next.js 16 & TypeScript"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-700">URL Slug</label>
              <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
                <span className="text-stone-400 select-none mr-1">/courses/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent flex-1 focus:outline-none text-stone-800 font-mono text-xs"
                  placeholder="judul-kelas-otomatis"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="ui-ux-design">UI/UX Design</option>
                      <option value="cloud-devops">Cloud & DevOps</option>
                      <option value="data-science">Data Science</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">Tingkat Kesulitan</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="BEGINNER">Pemula (Beginner)</option>
                  <option value="INTERMEDIATE">Menengah (Intermediate)</option>
                  <option value="ADVANCED">Mahir (Advanced)</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Ringkasan & Deskripsi Lengkap"
              placeholder="Jelaskan secara komprehensif apa yang dipelajari dan keunggulan dari kelas ini..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Pricing & Duration Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
          <h2 className="font-semibold text-stone-900 text-base border-b border-stone-100 pb-3">
            Harga & Durasi Pembelajaran
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Harga Kelas (IDR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-medium text-stone-400">Rp</span>
                <input
                  type="number"
                  disabled={isFree}
                  value={isFree ? 0 : price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 disabled:bg-stone-50 disabled:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  placeholder="0"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs text-stone-600">Jadikan kelas ini Gratis untuk semua siswa</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Estimasi Durasi (Jam)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="10"
              />
              <p className="text-xs text-stone-400">Total estimasi waktu belajar hingga selesai</p>
            </div>
          </div>
        </div>

        {/* Thumbnail & Media Picker */}
        <CourseMediaPicker
          value={thumbnail}
          onChange={setThumbnail}
        />

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-stone-700">
              Langsung Publikasikan (Tampil di Katalog)
            </span>
          </label>

          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={<Save size={16} />}
          >
            Simpan Kelas
          </Button>
        </div>
      </form>
    </div>
  );
}
