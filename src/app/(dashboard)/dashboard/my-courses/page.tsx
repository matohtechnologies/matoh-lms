import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Award, PlayCircle, Clock, CheckCircle2, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Courses — Earthy Academy" };

async function getMyCoursesData(userId: string) {
  try {
    // Self-healing: auto-enroll any course with PAID order status
    const paidOrders = await prisma.order.findMany({
      where: { userId, status: "PAID" },
      select: { courseId: true },
    }).catch(() => []);

    if (paidOrders.length > 0) {
      await Promise.all(
        paidOrders.map((o) =>
          prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId: o.courseId } },
            create: { userId, courseId: o.courseId },
            update: {},
          }).catch(() => null)
        )
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: { select: { name: true } },
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completed = await prisma.progress.count({
          where: {
            userId,
            lesson: { section: { courseId: enrollment.courseId } },
          },
        });
        const total = enrollment.course.totalLessons ?? 1;
        const progressPct = Math.min(100, Math.round((completed / total) * 100));
        return { ...enrollment, progressPct, completedLessons: completed };
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("Error fetching my courses:", error);
    return [];
  }
}

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const enrollments = await getMyCoursesData(session.user.id);
  const t = await getTranslations("dashboard");

  const completed = enrollments.filter((e) => e.completedAt).length;
  const inProgress = enrollments.filter((e) => !e.completedAt && e.progressPct > 0).length;
  const notStarted = enrollments.filter((e) => e.progressPct === 0).length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("my_courses_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {t("courses_enrolled", { count: enrollments.length })}
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200/80 bg-white text-stone-700 hover:text-blue-700 text-xs font-semibold hover:bg-blue-50/60 transition-colors shadow-2xs shrink-0"
        >
          <GraduationCap size={15} className="text-blue-600" />
          {t("find_new_course")}
        </Link>
      </div>

      {/* Summary Tabs */}
      {enrollments.length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {[
            { label: t("all"), value: enrollments.length, bg: "bg-stone-100 text-stone-800 border-stone-200" },
            { label: t("completed"), value: completed, bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            { label: t("in_progress"), value: inProgress, bg: "bg-blue-50 text-blue-800 border-blue-200" },
            { label: t("not_started"), value: notStarted, bg: "bg-amber-50 text-amber-800 border-amber-200" },
          ].map(({ label, value, bg }) => (
            <div
              key={label}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-2xs ${bg}`}
            >
              <span>{label}:</span>
              <span className="font-extrabold">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-200/60 shadow-2xs">
            <BookOpen size={28} />
          </div>
          <h3
            className="text-lg font-bold text-stone-900 mb-1.5"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("no_courses_empty_title")}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            {t("no_courses_empty_desc")}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {t("explore_courses")}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-warm hover:-translate-y-1 transition-all duration-200 group flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-stone-100 flex items-center justify-center overflow-hidden">
                {enrollment.course.thumbnail ? (
                  <img
                    src={enrollment.course.thumbnail}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center text-blue-400">
                    <BookOpen size={36} />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Progress bar on thumbnail */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progressPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-white font-extrabold shrink-0 shadow-xs">
                    {enrollment.progressPct}%
                  </span>
                </div>

                {/* Status Badge */}
                {enrollment.completedAt && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                      <CheckCircle2 size={11} />
                      {t("completed")}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {enrollment.course.category.name}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-stone-900 text-sm leading-snug line-clamp-2"
                    style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                  >
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Instruktur: {enrollment.course.instructor.name || "Ahmad Fadhil"}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-stone-100">
                  {/* Progress Text */}
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={12} className="text-stone-400" />
                      {t("lessons_done", {
                        done: enrollment.completedLessons,
                        total: enrollment.course.totalLessons ?? "?",
                      })}
                    </span>
                    {enrollment.completedAt && (
                      <Link
                        href={`/dashboard/certificates`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60"
                      >
                        <Award size={11} />
                        <span>Sertifikat</span>
                      </Link>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/learn/${enrollment.courseId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <PlayCircle size={14} />
                    {enrollment.progressPct === 0
                      ? t("start_learning")
                      : enrollment.completedAt
                      ? t("rewatch")
                      : t("continue_learning_btn")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
