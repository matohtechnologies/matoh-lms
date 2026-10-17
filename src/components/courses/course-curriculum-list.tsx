"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Lock, ChevronDown, X, Sparkles, CheckCircle2, Video } from "lucide-react";
import {
  extractYouTubeVideoId,
  getEmbedUrl,
  isVideoUrl,
  isYouTubeVideoUrl,
  isPlayableVideo,
} from "@/lib/youtube";

interface LessonItem {
  id: string;
  title: string;
  duration?: number | null;
  isFree?: boolean;
  videoUrl?: string | null;
}

interface SectionItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface CourseCurriculumListProps {
  sections: SectionItem[];
  courseId: string;
  isEnrolled: boolean;
  isEn: boolean;
  finalPrice: number;
  isFreeCourse: boolean;
  userId?: string;
}

export function CourseCurriculumList({
  sections,
  courseId,
  isEnrolled,
  isEn,
  finalPrice,
  isFreeCourse,
  userId,
}: CourseCurriculumListProps) {
  const [activePreviewLesson, setActivePreviewLesson] = useState<LessonItem | null>(null);

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  const handleOpenPreview = (lesson: LessonItem) => {
    if (lesson.isFree && lesson.videoUrl) {
      setActivePreviewLesson(lesson);
    }
  };

  const closePreview = () => {
    setActivePreviewLesson(null);
  };

  return (
    <>
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <details
            key={section.id}
            className="group rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all open:ring-1 open:ring-blue-500/20"
            open={idx === 0}
          >
            <summary className="flex items-center justify-between p-4 bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition-colors list-none select-none">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 text-sm">{section.title}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    ({section.lessons.length} {isEn ? "lessons" : "materi"})
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-slate-400 group-open:rotate-180 transition-transform duration-200"
              />
            </summary>

            <div className="divide-y divide-slate-100 bg-white">
              {section.lessons.map((lesson) => {
                const canPreview = Boolean(lesson.isFree && lesson.videoUrl);

                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                      canPreview ? "hover:bg-emerald-50/40" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          lesson.isFree
                            ? "bg-emerald-100/80 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {lesson.isFree ? (
                          <Play size={12} className="ml-0.5" />
                        ) : (
                          <Lock size={12} />
                        )}
                      </div>
                      <span className="text-sm text-slate-700 truncate">{lesson.title}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {lesson.duration && (
                        <span className="text-xs text-slate-400 font-mono">
                          {lesson.duration}m
                        </span>
                      )}

                      {canPreview && (
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(lesson)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:scale-102 transition-all cursor-pointer"
                        >
                          <Play size={10} fill="currentColor" />
                          <span>{isEn ? "Watch Preview" : "Tonton Gratis"}</span>
                        </button>
                      )}

                      {!lesson.isFree && !isEnrolled && (
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          {isEn ? "Locked" : "Terkunci"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {/* Interactive Free Lesson Video Preview Modal */}
      {activePreviewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold shrink-0">
                  {isEn ? "Free Sample Lesson" : "Pratinjau Materi Gratis"}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {activePreviewLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePreview}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title={isEn ? "Close" : "Tutup"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black w-full">
              {(() => {
                const url = activePreviewLesson.videoUrl || "";
                const isYouTube = isYouTubeVideoUrl(url);
                const isDirect = isVideoUrl(url);
                const ytEmbed = isYouTube ? getEmbedUrl(url, true) : null;

                if (isYouTube && ytEmbed) {
                  return (
                    <iframe
                      src={ytEmbed}
                      title={activePreviewLesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                if (isDirect) {
                  return (
                    <video
                      src={url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }

                return (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <Video size={48} className="text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400">
                      {isEn
                        ? "Video format is ready for playback."
                        : "Video pratinjau dapat diputar langsung."}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom CTA Bar */}
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 space-y-1 text-center sm:text-left">
                <p className="font-semibold text-white">
                  {isEn
                    ? "Unlock the full curriculum & earn an accredited certificate."
                    : "Buka seluruh kurikulum & raih sertifikat kelulusan resmi."}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isEn
                    ? "Includes all quizzes, practical case studies, and lifetime community access."
                    : "Termasuk seluruh kuis evaluasi, studi kasus terapan, dan akses materi selamanya."}
                </p>
              </div>

              {!isEnrolled && (
                <Link
                  href={
                    isFreeCourse
                      ? (userId ? `/checkout/${courseId}` : `/login?callbackUrl=/checkout/${courseId}`)
                      : (userId ? `/checkout/${courseId}` : `/login?callbackUrl=/checkout/${courseId}`)
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/30 transition-all hover:scale-102"
                >
                  <Sparkles size={15} />
                  <span>
                    {isFreeCourse
                      ? (isEn ? "Enroll for Free" : "Daftar Gratis Sekarang")
                      : (isEn ? "Enroll in Full Course" : "Daftar Kelas Lengkap")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
