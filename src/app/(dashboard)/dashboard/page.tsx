import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Award, ShoppingBag, TrendingUp, PlayCircle,
  Clock, CheckCircle2, ArrowRight, GraduationCap, Zap
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — PT. Matoh Technologies Indonesia" };

async function getDashboardData(userId: string) {
  try {
    // Self-healing: ensure any paid order has an enrollment
    const paidOrderList = await prisma.order.findMany({
      where: { userId, status: "PAID" },
      select: { courseId: true },
    }).catch(() => []);

    if (paidOrderList.length > 0) {
      await Promise.all(
        paidOrderList.map((o) =>
          prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId: o.courseId } },
            create: { userId, courseId: o.courseId },
            update: {},
          }).catch(() => null)
        )
      );
    }

    const [enrollmentRaw, certificates, paidOrders, recentActivity] = await Promise.all([
      prisma.enrollment.findMany({
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
        take: 4,
      }),
      prisma.certificate.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: "PAID" } }),
      prisma.progress.findMany({
        where: { userId },
        include: {
          lesson: {
            select: {
              title: true,
              section: {
                select: {
                  course: { select: { title: true, slug: true, id: true } },
                },
              },
            },
          },
        },
        orderBy: { completedAt: "desc" },
        take: 4,
      }),
    ]);

    if (enrollmentRaw.length === 0) {
      return {
        enrollments: [],
        certificates,
        paidOrders,
        recentActivity,
      };
    }

    // Fetch progress for each enrollment
    const enrollments = await Promise.all(
      enrollmentRaw.map(async (e) => {
        const completed = await prisma.progress.count({
          where: {
            userId,
            lesson: { section: { courseId: e.courseId } },
          },
        });
        const total = e.course.totalLessons ?? 1;
        const progressPct = Math.min(100, Math.round((completed / total) * 100));
        return { ...e, progressPct, completedLessons: completed };
      })
    );

    return { enrollments, certificates, paidOrders, recentActivity };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      enrollments: [],
      certificates: 0,
      paidOrders: 0,
      recentActivity: [],
    };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = searchParams ? await searchParams : {};
  const isStudentView = resolvedParams.view === "student";

  // If user is ADMIN, default to /admin dashboard
  if (session.user.role === "ADMIN" && !isStudentView) {
    redirect("/admin");
  }

  const data = await getDashboardData(session.user.id);
  const enrollments = data.enrollments as Array<{
    id: string;
    courseId: string;
    completedAt: Date | null;
    progressPct: number;
    completedLessons: number;
    course: {
      title: string;
      thumbnail: string | null;
      totalLessons: number | null;
      category: { name: string };
      instructor: { name: string | null };
    };
  }>;
  const { certificates, paidOrders, recentActivity } = data as {
    certificates: number;
    paidOrders: number;
    recentActivity: Array<{
      id: string;
      completedAt: Date;
      lesson: {
        title: string;
        section: { course: { title: string; slug: string; id: string } };
      };
    }>;
  };

  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("dashboard");

  const completedCount = enrollments.filter((e) => e.completedAt).length;
  const inProgressCount = enrollments.filter((e) => !e.completedAt && e.progressPct > 0).length;

  const stats = [
    {
      label: t("enrolled_courses"),
      value: enrollments.length,
      icon: BookOpen,
      color: "blue",
      href: "/dashboard/my-courses",
    },
    {
      label: t("completed_courses_stat"),
      value: completedCount,
      icon: CheckCircle2,
      color: "green",
      href: "/dashboard/certificates",
    },
    {
      label: t("certificates_stat"),
      value: certificates,
      icon: Award,
      color: "amber",
      href: "/dashboard/certificates",
    },
    {
      label: t("orders_stat"),
      value: paidOrders,
      icon: ShoppingBag,
      color: "sky",
      href: "/dashboard/orders",
    },
  ];

  // Find the most recently accessed course (last activity's course)
  const lastCourse = recentActivity[0]?.lesson?.section?.course;
  const lastEnrollment = lastCourse
    ? enrollments.find((e) => e.course.title === lastCourse.title)
    : enrollments[0];

  const firstName = session.user?.name?.split(" ")[0] ?? (isEn ? "Learner" : "Pengguna");

  // Greeting based on time (use server-side hours — no client Date to avoid hydration issues)
  const serverHour = new Date().getUTCHours() + 7; // WIB offset, approximate
  const greeting = serverHour < 12
    ? t("greeting_morning")
    : serverHour < 17
    ? t("greeting_afternoon")
    : t("greeting_evening");

  const headlineText = inProgressCount > 0
    ? t("taking_courses", { count: inProgressCount })
    : enrollments.length > 0
    ? t("keep_learning")
    : t("start_journey");

  return (
    <div className="space-y-7">
      {/* Admin Preview Banner (if admin) */}
      {session.user?.role === "ADMIN" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50/70 border border-blue-200/80 text-stone-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              👑
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950">
                {t("admin_preview_mode")}
              </p>
              <p className="text-[11px] text-stone-600">
                {t("admin_preview_desc")}
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs shrink-0"
          >
            {t("return_admin")}
          </Link>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-warm">
        {/* Subtle Decorative Aura */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none blur-xl" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-sky-400/20 pointer-events-none blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-950 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-2xs">
              <span>👋</span> {greeting}, {firstName}!
            </span>
            <span className="text-[11px] text-blue-100/90 font-medium">
              Matoh Learning Hub
            </span>
          </div>

          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white max-w-xl leading-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {headlineText}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
              Tingkatkan keahlian Anda setiap hari melalui kurikulum terstruktur, proyek praktis, dan sertifikasi resmi.
            </p>
          </div>

          {/* Embedded Course Resume Card */}
          {lastEnrollment ? (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {lastEnrollment.course.thumbnail ? (
                  <div className="w-14 h-11 rounded-xl overflow-hidden bg-white/20 shrink-0 border border-white/30 shadow-2xs">
                    <img
                      src={lastEnrollment.course.thumbnail}
                      alt={lastEnrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-2xs">
                    <BookOpen size={20} className="text-white" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-200 block">
                    {t("continue_label")}
                  </span>
                  <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {lastEnrollment.course.title}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <div className="w-28 sm:w-44 h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${lastEnrollment.progressPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white">
                      {lastEnrollment.progressPct}%
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/learn/${lastEnrollment.courseId}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 hover:scale-102 transition-all shrink-0 shadow-xs"
              >
                <PlayCircle size={15} className="text-blue-600" />
                {t("continue_btn")}
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-all shadow-xs"
              >
                <GraduationCap size={15} />
                {t("explore_courses")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
                color === "blue"
                  ? "bg-blue-50 text-blue-600"
                  : color === "green"
                  ? "bg-emerald-50 text-emerald-600"
                  : color === "amber"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-sky-50 text-sky-600"
              }`}
            >
              <Icon size={20} />
            </div>
            <p
              className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {value}
            </p>
            <p className="text-xs font-medium text-stone-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Content Columns: My Courses (2 cols) & Recent Activity (1 col) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: My Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100">
              <div>
                <h2
                  className="font-bold text-stone-900 text-base"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {t("my_courses_section")}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">Daftar kelas yang sedang Anda pelajari</p>
              </div>
              <Link
                href="/dashboard/my-courses"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200/60"
              >
                {t("view_all")} <ArrowRight size={12} />
              </Link>
            </div>

            {enrollments.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-stone-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {enrollment.course.thumbnail ? (
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 shrink-0 relative">
                          <img
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
                          <BookOpen size={20} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-stone-900 truncate">
                            {enrollment.course.title}
                          </p>
                          {enrollment.completedAt && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                              <CheckCircle2 size={11} /> Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {enrollment.course.category.name} • {enrollment.course.instructor?.name || "Instruktur"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 max-w-sm">
                          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-stone-600 shrink-0">
                            {enrollment.progressPct}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/learn/${enrollment.courseId}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold border border-blue-200/80 hover:border-transparent transition-all shrink-0 shadow-2xs"
                    >
                      <PlayCircle size={14} />
                      {enrollment.progressPct === 0
                        ? t("start")
                        : enrollment.completedAt
                        ? t("watch")
                        : t("continue_short")}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3.5">
                  <BookOpen size={24} />
                </div>
                <p className="text-stone-900 font-bold text-sm mb-1">{t("no_courses_title")}</p>
                <p className="text-xs text-stone-500 mb-5 max-w-sm mx-auto leading-relaxed">
                  {t("no_courses_desc")}
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Zap size={14} />
                  {t("explore_courses")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Activity & Quick Links */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2
                className="font-bold text-stone-900 text-sm"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {t("recent_activity")}
              </h2>
            </div>
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-stone-50 p-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/60">
                      <TrendingUp size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-800 leading-snug">
                        {t("lesson_completed")}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {activity.lesson.title}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-medium">
                        {new Date(activity.completedAt).toLocaleDateString(
                          isEn ? "en-US" : "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Clock size={24} className="text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-400">{t("no_activity")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
