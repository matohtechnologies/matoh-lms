"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  BookOpen,
  Settings,
  PlayCircle,
  ExternalLink,
  HelpCircle,
  FileCode2,
  MessageSquare,
  Award,
  Video,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { CurriculumManager, type SectionData } from "./curriculum-manager";
import { QuizManager } from "./quiz-manager";
import { AssignmentManager } from "./assignment-manager";
import { DiscussionManager } from "./discussion-manager";
import { CertificateManager } from "./certificate-manager";
import { useTranslations } from "next-intl";
import { resolveThumbnailUrl } from "@/lib/youtube";
import { CourseMediaPicker } from "@/components/admin/course-media-picker";
import {
  CourseInstructorPicker,
  type InstructorOption,
} from "@/components/admin/course-instructor-picker";
import { CourseLearningOutcomesEditor } from "@/components/admin/course-learning-outcomes-editor";

interface Category {
  id: string;
  name: string;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price: number;
  discountPrice?: number | null;
  duration?: number | null;
  thumbnail?: string | null;
  published: boolean;
  featured: boolean;
  categoryId: string;
  instructorId?: string;
  instructorHeadline?: string | null;
  instructorBio?: string | null;
  whatYouLearn?: string | null;
  instructor: {
    id?: string;
    name: string;
    email?: string;
    image?: string | null;
    headline?: string | null;
    bio?: string | null;
    role?: string;
  };
  sections: SectionData[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = params.courseId;
  const t = useTranslations("admin");

  const VALID_TABS = ["curriculum", "quizzes", "assignments", "discussions", "certificates", "settings"] as const;
  type AdminTab = typeof VALID_TABS[number];
  const tabParam = searchParams.get("tab");
  const initialTab: AdminTab = VALID_TABS.includes(tabParam as AdminTab) ? (tabParam as AdminTab) : "curriculum";
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [price, setPrice] = useState("0");
  const [discountPrice, setDiscountPrice] = useState("");
  const [duration, setDuration] = useState("0");
  const [thumbnail, setThumbnail] = useState("");
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [instructorHeadline, setInstructorHeadline] = useState("");
  const [instructorBio, setInstructorBio] = useState("");
  const [whatYouLearnItems, setWhatYouLearnItems] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        fetch(`/api/admin/courses/${courseId}`),
        fetch("/api/admin/courses"),
      ]);

      if (!courseRes.ok) {
        setError("Kelas tidak ditemukan");
        setLoading(false);
        return;
      }

      const { course }: { course: CourseData } = await courseRes.json();
      const { categories: cats, instructors: insList }: { categories: Category[]; instructors: InstructorOption[] } =
        await catRes.json();

      setTitle(course.title);
      setSlug(course.slug);
      setDescription(course.description);
      setLevel(course.level);
      setPrice(String(course.price));
      setDiscountPrice(course.discountPrice ? String(course.discountPrice) : "");
      setDuration(course.duration ? String(course.duration) : "0");
      setThumbnail(course.thumbnail ? resolveThumbnailUrl(course.thumbnail) : "");
      setPublished(course.published);
      setFeatured(course.featured);
      setCategoryId(course.categoryId);
      setCategories(cats || []);
      setInstructors(insList || []);
      setSections(course.sections || []);

      // Instructor states
      setInstructorId(course.instructorId || course.instructor?.id || (insList?.[0]?.id ?? ""));
      setInstructorHeadline(course.instructorHeadline || course.instructor?.headline || "");
      setInstructorBio(course.instructorBio || course.instructor?.bio || "");

      // What You Learn states
      if (course.whatYouLearn) {
        try {
          const parsed = JSON.parse(course.whatYouLearn);
          if (Array.isArray(parsed)) {
            setWhatYouLearnItems(parsed);
          } else {
            setWhatYouLearnItems(course.whatYouLearn.split("\n").map((s) => s.trim()).filter(Boolean));
          }
        } catch {
          setWhatYouLearnItems(course.whatYouLearn.split("\n").map((s) => s.trim()).filter(Boolean));
        }
      } else {
        setWhatYouLearnItems([]);
      }
    } catch {
      setError("Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          level,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : null,
          duration: Number(duration),
          thumbnail: thumbnail || null,
          published,
          featured,
          categoryId: categoryId || undefined,
          instructorId: instructorId || undefined,
          instructorHeadline: instructorHeadline || null,
          instructorBio: instructorBio || null,
          whatYouLearn: whatYouLearnItems,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const d = await res.json();
        setError(d.error ?? "Gagal menyimpan perubahan");
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("delete_course_confirm", { title }))) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/courses");
      } else {
        const d = await res.json();
        setError(d.error ?? "Gagal menghapus kelas");
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="w-10 h-10 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-2xl font-bold text-stone-900"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {t("manage_course")}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  published
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-stone-100 text-stone-600 border border-stone-200"
                }`}
              >
                {published ? t("status_published") : t("status_draft")}
              </span>
            </div>
            <p className="text-stone-500 text-xs mt-0.5 truncate max-w-sm sm:max-w-md">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/learn/${courseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
          >
            <PlayCircle size={14} className="text-blue-600" />
            <span className="hidden sm:inline">{t("student_preview")}</span>
            <ExternalLink size={12} className="text-stone-400" />
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {t("delete_course")}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-1.5 border-b border-stone-200 pb-px overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("curriculum")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
            activeTab === "curriculum"
              ? "border-blue-600 text-blue-600 bg-white shadow-xs"
              : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
          }`}
        >
          <BookOpen size={15} />
          <span>{t("tab_curriculum")}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
            {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quizzes")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
            activeTab === "quizzes"
              ? "border-blue-600 text-blue-600 bg-white shadow-xs"
              : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
          }`}
        >
          <HelpCircle size={15} />
          <span>{t("tab_quizzes")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
            activeTab === "assignments"
              ? "border-blue-600 text-blue-600 bg-white shadow-xs"
              : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
          }`}
        >
          <FileCode2 size={15} />
          <span>{t("tab_assignments")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("discussions")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
            activeTab === "discussions"
              ? "border-blue-600 text-blue-600 bg-white shadow-xs"
              : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
          }`}
        >
          <MessageSquare size={15} />
          <span>{t("tab_discussions")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
            activeTab === "certificates"
              ? "border-blue-600 text-blue-600 bg-white shadow-xs"
              : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
          }`}
        >
          <Award size={15} />
          <span>{t("tab_certificates")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
            activeTab === "settings"
              ? "border-blue-600 text-blue-600 bg-white shadow-xs"
              : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
          }`}
        >
          <Settings size={15} />
          <span>{t("tab_settings")}</span>
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <p className="text-sm font-medium">Perubahan berhasil disimpan!</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tab 1: Curriculum & Materials Manager */}
      {activeTab === "curriculum" && (
        <CurriculumManager
          courseId={courseId}
          sections={sections}
          onRefresh={loadData}
        />
      )}

      {/* Tab 2: Quiz Manager */}
      {activeTab === "quizzes" && (
        <QuizManager courseId={courseId} />
      )}

      {/* Tab 3: Assignment & Submission Manager */}
      {activeTab === "assignments" && (
        <AssignmentManager courseId={courseId} />
      )}

      {/* Tab 4: Discussion Manager */}
      {activeTab === "discussions" && (
        <DiscussionManager courseId={courseId} />
      )}

      {/* Tab 5: Certificate Manager */}
      {activeTab === "certificates" && (
        <CertificateManager courseId={courseId} />
      )}

      {/* Tab 2: Settings & Metadata Form */}
      {activeTab === "settings" && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
            <h2 className="font-semibold text-stone-900 text-base border-b border-stone-100 pb-3">
              Informasi Utama Kelas
            </h2>

            <Input
              label="Judul Kelas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700">Tingkat Kesulitan</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="BEGINNER">Pemula (Beginner)</option>
                  <option value="INTERMEDIATE">Menengah (Intermediate)</option>
                  <option value="ADVANCED">Mahir (Advanced)</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Deskripsi Kelas"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Instructor Selection & About Instructor Customization */}
          <CourseInstructorPicker
            instructors={instructors}
            selectedInstructorId={instructorId}
            onInstructorChange={setInstructorId}
            instructorHeadline={instructorHeadline}
            onHeadlineChange={setInstructorHeadline}
            instructorBio={instructorBio}
            onBioChange={setInstructorBio}
          />

          {/* What You Will Learn (Learning Outcomes) Editor */}
          <CourseLearningOutcomesEditor
            value={whatYouLearnItems}
            onChange={setWhatYouLearnItems}
          />

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
            <h2 className="font-semibold text-stone-900 text-base border-b border-stone-100 pb-3">
              Harga & Durasi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Harga Normal (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-medium text-stone-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Harga Diskon (opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-medium text-stone-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Kosongkan jika tidak ada"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Durasi (Jam)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Thumbnail & Media Picker */}
          <CourseMediaPicker
            value={thumbnail}
            onChange={setThumbnail}
            label="Thumbnail & Media Banner Kelas"
          />

          {/* Visibility */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm">
            <h2 className="font-semibold text-stone-900 text-base border-b border-stone-100 pb-3 mb-4">
              Visibilitas
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-stone-700">Publikasikan Kelas</span>
                  <p className="text-xs text-stone-400">Kelas akan tampil di katalog publik</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-stone-700">
                    Tampilkan di Halaman Utama
                  </span>
                  <p className="text-xs text-stone-400">
                    Kelas muncul di seksi Rekomendasi/Featured di beranda
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
              Simpan Informasi Kelas
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
