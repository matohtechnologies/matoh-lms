"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Video,
  FileText,
  Clock,
  Unlock,
  Lock,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  PlayCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useTranslations } from "next-intl";
import { dynamicConfirm } from "@/components/ui/dynamic-alert-provider";

export interface LessonData {
  id: string;
  title: string;
  slug: string;
  videoUrl?: string | null;
  duration?: number | null;
  isFree: boolean;
  order: number;
  content?: string | null;
  sectionId: string;
}

export interface SectionData {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: LessonData[];
}

interface CurriculumManagerProps {
  courseId: string;
  sections: SectionData[];
  onRefresh: () => Promise<void>;
}

export function CurriculumManager({
  courseId,
  sections: initialSections,
  onRefresh,
}: CurriculumManagerProps) {
  const t = useTranslations("admin");
  const [sections, setSections] = useState<SectionData[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    initialSections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  // Loading states
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Section modal state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionData | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");

  // Lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("10");
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [lessonContent, setLessonContent] = useState("");

  // Keep local sections synced with prop updates
  if (JSON.stringify(sections) !== JSON.stringify(initialSections)) {
    setSections(initialSections);
  }

  const showNotification = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Section Handlers
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionTitle("");
    setSectionModalOpen(true);
  };

  const handleOpenEditSection = (section: SectionData) => {
    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    setIsPending(true);
    try {
      if (editingSection) {
        // Update section
        const res = await fetch(`/api/admin/courses/${courseId}/sections/${editingSection.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: sectionTitle }),
        });
        if (!res.ok) throw new Error("Gagal memperbarui bab/seksi");
        showNotification("success", t("section_saved"));
      } else {
        // Create section
        const res = await fetch(`/api/admin/courses/${courseId}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: sectionTitle }),
        });
        if (!res.ok) throw new Error("Gagal membuat bab/seksi baru");
        showNotification("success", t("section_created"));
      }
      setSectionModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionTitle: string) => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Seksi Kurikulum?",
      message: `Hapus seksi "${sectionTitle}" beserta seluruh materi pelajaran di dalamnya? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Seksi",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    setIsPending(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus seksi materi");
      showNotification("success", t("section_deleted"));
      await onRefresh();
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan");
    } finally {
      setIsPending(false);
    }
  };

  // Lesson Handlers
  const handleOpenAddLesson = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingLesson(null);
    setLessonTitle("");
    setLessonVideoUrl("");
    setLessonDuration("10");
    setLessonIsFree(false);
    setLessonContent("");
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (sectionId: string, lesson: LessonData) => {
    setActiveSectionId(sectionId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonVideoUrl(lesson.videoUrl ?? "");
    setLessonDuration(String(lesson.duration ?? 10));
    setLessonIsFree(lesson.isFree);
    setLessonContent(lesson.content ?? "");
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    setIsPending(true);
    try {
      if (editingLesson) {
        // Update lesson
        const res = await fetch(`/api/admin/courses/${courseId}/lessons/${editingLesson.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: lessonTitle,
            videoUrl: lessonVideoUrl.trim() || null,
            duration: Number(lessonDuration) || 5,
            isFree: lessonIsFree,
            content: lessonContent.trim() || null,
          }),
        });
        if (!res.ok) throw new Error("Gagal menyimpan perubahan materi");
        showNotification("success", t("lesson_saved"));
      } else {
        // Create lesson under section
        const res = await fetch(
          `/api/admin/courses/${courseId}/sections/${activeSectionId}/lessons`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: lessonTitle,
              videoUrl: lessonVideoUrl.trim() || null,
              duration: Number(lessonDuration) || 5,
              isFree: lessonIsFree,
              content: lessonContent.trim() || null,
            }),
          }
        );
        if (!res.ok) throw new Error("Gagal menambahkan materi baru");
        showNotification("success", t("lesson_created"));
      }
      setLessonModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Materi Pelajaran?",
      message: `Hapus materi "${lessonTitle}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus Materi",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    setIsPending(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus materi");
      showNotification("success", t("lesson_deleted"));
      await onRefresh();
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan");
    } finally {
      setIsPending(false);
    }
  };

  const totalLessonsCount = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalMinutes = sections.reduce(
    (acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + (l.duration ?? 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200 shadow-warm">
        <div>
          <h2 className="text-lg font-bold text-stone-900">{t("curriculum_title")}</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {t("curriculum_summary", { sections: sections.length, lessons: totalLessonsCount, minutes: totalMinutes })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/learn/${courseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
          >
            <PlayCircle size={14} className="text-blue-600" />
            {t("student_preview")}
            <ExternalLink size={12} className="text-stone-400" />
          </a>
          <Button
            type="button"
            onClick={handleOpenAddSection}
            leftIcon={<FolderPlus size={16} />}
            className="text-xs"
          >
            {t("add_section")}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Section List */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <FolderPlus size={24} className="text-blue-500" />
          </div>
          <h3 className="font-semibold text-stone-900 mb-1">{t("no_lessons_title")}</h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-4">
            {t("no_lessons_desc")}
          </p>
          <Button type="button" onClick={handleOpenAddSection} leftIcon={<Plus size={16} />}>
            {t("create_first_section")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const isExpanded = expandedSections[section.id] ?? true;
            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-warm overflow-hidden transition-all"
              >
                {/* Section Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-stone-50/70 border-b border-stone-200/80">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                    onClick={() => toggleSection(section.id)}
                  >
                    <button
                      type="button"
                      className="p-1 rounded-lg hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900 text-sm sm:text-base truncate">
                        {section.title}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t("lessons_count_badge", { count: section.lessons.length })}
                      </p>
                    </div>
                  </div>

                  {/* Actions on Section */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAddLesson(section.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">{t("add_lesson")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSection(section)}
                      className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                      title={t("edit_section_title")}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      className="p-2 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                      title={t("delete_section")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Lessons in Section */}
                {isExpanded && (
                  <div className="divide-y divide-stone-100">
                    {section.lessons.length === 0 ? (
                      <div className="p-6 text-center text-xs text-stone-400">
                        {t("empty_section")}
                      </div>
                    ) : (
                      section.lessons.map((lesson, lIndex) => (
                        <div
                          key={lesson.id}
                          className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="text-xs text-stone-400 font-mono w-4 text-right shrink-0">
                              {lIndex + 1}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                              {lesson.videoUrl ? (
                                <Video size={15} className="text-blue-600" />
                              ) : (
                                <FileText size={15} className="text-stone-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-stone-800 truncate">
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                                {lesson.duration ? (
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} /> {t("minutes_suffix", { count: lesson.duration })}
                                  </span>
                                ) : null}
                                {lesson.isFree ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-md">
                                    <Unlock size={11} /> {t("free_preview")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                                    <Lock size={11} /> {t("locked")}
                                  </span>
                                )}
                                {lesson.content ? (
                                  <span className="text-stone-400 text-[11px]">{t("has_text")}</span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLesson(section.id, lesson)}
                              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                              title={t("edit_lesson")}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                              title={t("delete_lesson")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Tambah / Edit Seksi ────────────────────────── */}
      {sectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-warm-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {editingSection ? t("modal_edit_section") : t("modal_add_section")}
            </h3>
            <form onSubmit={handleSaveSection} className="space-y-4">
              <Input
                label={t("section_title_label")}
                placeholder={t("section_title_placeholder")}
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                autoFocus
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSectionModalOpen(false)}
                  disabled={isPending}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" loading={isPending}>
                  {t("save_section")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Tambah / Edit Materi (Lesson) ────────────────────────── */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-4xl w-full p-6 sm:p-7 space-y-5 my-auto">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {editingLesson ? t("modal_edit_lesson") : t("modal_add_lesson")}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t("lesson_modal_subtitle")}
                </p>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-4">
                <Input
                  label={t("lesson_title_label")}
                  placeholder={t("lesson_title_placeholder")}
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  autoFocus
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("duration_minutes_label")}
                    type="number"
                    placeholder="10"
                    min="1"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                  />

                  <div className="space-y-1.5 flex flex-col justify-end pb-2">
                    <label htmlFor="lesson-isfree" className="flex items-center gap-2 cursor-pointer select-none">
                      <input id="lesson-isfree" name="isFree" type="checkbox" checked={lessonIsFree}
                        onChange={(e) => setLessonIsFree(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="text-sm font-medium text-stone-800">
                        {t("free_preview_label")}
                      </span>
                    </label>
                    <p className="text-[11px] text-stone-400">
                      {t("free_preview_desc")}
                    </p>
                  </div>
                </div>

                <Input
                  label={t("video_url_label")}
                  placeholder={t("lesson_video_placeholder")}
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  hint={t("video_url_hint")}
                />

                {/* Rich Markdown Editor with formatting toolbar */}
                <div className="space-y-1.5">
                  <MarkdownEditor
                    label={t("lesson_content_label")}
                    placeholder="Tuliskan isi materi pembelajaran di sini. Gunakan tombol toolbar untuk mengubah sifat kalimat (tebal, miring, judul, daftar, blok kode, tabel, tips, dll)..."
                    value={lessonContent}
                    onChange={setLessonContent}
                    hint="Format Markdown didukung penuh. Siswa akan melihat teks materi dalam format visual yang rapi dan interaktif."
                    minHeight="280px"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLessonModalOpen(false)}
                    disabled={isPending}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" loading={isPending}>
                    {editingLesson ? t("save_lesson") : t("add_lesson_submit")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
