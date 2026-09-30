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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("my_courses_title")}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {t("courses_enrolled", { count: enrollments.length })}
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm"
        >
          <GraduationCap size={16} className="text-orange-500" />
          {t("find_new_course")}
        </Link>
      </div>

      {/* Summary Tabs */}
      {enrollments.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: t("all"), value: enrollments.length, color: "stone" },
            { label: t("completed"), value: completed, color: "green" },
            { label: t("in_progress"), value: inProgress, color: "orange" },
            { label: t("not_started"), value: notStarted, color: "stone" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  color === "green"
                    ? "bg-green-500"
                    : color === "orange"
                    ? "bg-orange-500"
                    : "bg-stone-300"
                }`}
              />
              <span className="text-sm text-stone-600">
                {label}:{" "}
                <span className="font-semibold text-stone-900">{value}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            {t("no_courses_empty_title")}
          </h3>
          <p className="text-stone-500 text-sm mb-6">
            {t("no_courses_empty_desc")}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            {t("explore_courses")}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Thumbnail */}
              <div className="relative h-36 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {enrollment.course.thumbnail ? (
                  <img
                    src={enrollment.course.thumbnail}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen size={36} className="text-orange-300" />
                )}

                {/* Overlay progress on thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <Progress
                    value={enrollment.progressPct}
                    size="sm"
                    className="flex-1"
                  />
                  <span className="ml-2 text-xs text-white font-semibold shrink-0">
                    {enrollment.progressPct}%
                  </span>
                </div>

                {/* Status Badge */}
                {enrollment.completedAt && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500 text-white text-[11px] font-semibold">
                      <CheckCircle2 size={11} />
                      {t("completed")}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <Badge variant="orange" className="text-[11px] mb-1.5">
                    {enrollment.course.category.name}
                  </Badge>
                  <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {enrollment.course.instructor.name}
                  </p>
                </div>

                {/* Progress Text */}
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock size={12} />
                  <span>
                    {t("lessons_done", {
                      done: enrollment.completedLessons,
                      total: enrollment.course.totalLessons ?? "?",
                    })}
                  </span>
                  {enrollment.completedAt && (
                    <>
                      <span>·</span>
                      <Award size={12} className="text-amber-500" />
                      <span className="text-amber-600 font-medium">
                        {t("cert_available")}
                      </span>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={`/learn/${enrollment.courseId}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
                >
                  <PlayCircle size={15} />
                  {enrollment.progressPct === 0
                    ? t("start_learning")
                    : enrollment.completedAt
                    ? t("rewatch")
                    : t("continue_learning_btn")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
