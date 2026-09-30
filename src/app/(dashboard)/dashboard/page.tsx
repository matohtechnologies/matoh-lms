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
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Earthy Academy" };

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

  const completedCount = enrollments.filter((e) => e.completedAt).length;
  const inProgressCount = enrollments.filter((e) => !e.completedAt && e.progressPct > 0).length;

  const stats = [
    {
      label: "Kelas Diikuti",
      value: enrollments.length,
      icon: BookOpen,
      color: "orange",
      href: "/dashboard/my-courses",
    },
    {
      label: "Kelas Selesai",
      value: completedCount,
      icon: CheckCircle2,
      color: "green",
      href: "/dashboard/certificates",
    },
    {
      label: "Sertifikat",
      value: certificates,
      icon: Award,
      color: "amber",
      href: "/dashboard/certificates",
    },
    {
      label: "Pembelian",
      value: paidOrders,
      icon: ShoppingBag,
      color: "blue",
      href: "/dashboard/orders",
    },
  ];

  // Find the most recently accessed course (last activity's course)
  const lastCourse = recentActivity[0]?.lesson?.section?.course;
  const lastEnrollment = lastCourse
    ? enrollments.find((e) => e.course.title === lastCourse.title)
    : enrollments[0];

  const firstName = session.user?.name?.split(" ")[0] ?? "Pengguna";

  return (
    <div className="space-y-6">
      {session.user?.role === "ADMIN" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 text-white shadow-warm border border-stone-800">
          <div className="flex items-center gap-3">
            <span className="text-xl">👑</span>
            <div>
              <p className="text-sm font-semibold text-orange-400">Mode Pratinjau Siswa (Akun Admin)</p>
              <p className="text-xs text-stone-400">Kamu sedang melihat tampilan dashboard siswa.</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors shadow-sm shrink-0"
          >
            Kembali ke Panel Admin
          </Link>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">
            {new Date().getHours() < 12
              ? "Selamat pagi"
              : new Date().getHours() < 17
              ? "Selamat siang"
              : "Selamat malam"}
            , {firstName}! 👋
          </p>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {inProgressCount > 0
              ? `Kamu sedang belajar ${inProgressCount} kelas`
              : enrollments.length > 0
              ? "Terus semangat belajar!"
              : "Mulai perjalanan belajarmu!"}
          </h1>
          {lastEnrollment ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-orange-100 text-xs mb-1">Lanjutkan belajar:</p>
                <p className="text-white font-medium text-sm truncate max-w-xs">
                  {lastEnrollment.course.title}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 max-w-xs h-1.5 rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${lastEnrollment.progressPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-orange-100 font-medium shrink-0">
                    {lastEnrollment.progressPct}%
                  </span>
                </div>
              </div>
              <Link
                href={`/learn/${lastEnrollment.courseId}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors shrink-0 shadow-sm"
              >
                <PlayCircle size={16} />
                Lanjutkan
              </Link>
            </div>
          ) : (
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors shadow-sm"
            >
              <GraduationCap size={16} />
              Jelajahi Kelas
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-150 group"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                color === "orange"
                  ? "bg-orange-50"
                  : color === "green"
                  ? "bg-green-50"
                  : color === "amber"
                  ? "bg-amber-50"
                  : "bg-blue-50"
              }`}
            >
              <Icon
                size={18}
                className={
                  color === "orange"
                    ? "text-orange-600"
                    : color === "green"
                    ? "text-green-600"
                    : color === "amber"
                    ? "text-amber-600"
                    : "text-blue-600"
                }
              />
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Kelas yang Diikuti</h2>
              <Link
                href="/dashboard/my-courses"
                className="text-xs text-orange-600 hover:underline flex items-center gap-1"
              >
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>

            {enrollments.length > 0 ? (
              <div className="divide-y divide-stone-50">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/60 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
                      <BookOpen size={20} className="text-orange-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {enrollment.course.title}
                        </p>
                        {enrollment.completedAt && (
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {enrollment.course.category.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={enrollment.progressPct} size="sm" />
                        <span className="text-[11px] text-stone-500 shrink-0">
                          {enrollment.progressPct}%
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/learn/${enrollment.courseId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium hover:bg-orange-100 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <PlayCircle size={13} />
                      {enrollment.progressPct === 0
                        ? "Mulai"
                        : enrollment.completedAt
                        ? "Tonton"
                        : "Lanjut"}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-orange-300" />
                </div>
                <p className="text-stone-700 font-medium mb-1">Belum ada kelas</p>
                <p className="text-sm text-stone-400 mb-5">
                  Mulai perjalanan belajarmu dengan mendaftar kelas
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  <Zap size={15} />
                  Jelajahi Kelas
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">Aktivitas Terakhir</h2>
            </div>
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-stone-50">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp size={13} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-stone-700 leading-snug">
                        Menyelesaikan pelajaran
                      </p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {activity.lesson.title}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(activity.completedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock size={28} className="text-stone-200 mx-auto mb-2" />
                <p className="text-xs text-stone-400">Belum ada aktivitas belajar</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-900 mb-3">Menu Cepat</h2>
            <div className="space-y-2">
              {[
                { href: "/courses", label: "Jelajahi Kelas Baru", icon: GraduationCap, color: "orange" },
                { href: "/dashboard/certificates", label: "Lihat Sertifikat", icon: Award, color: "amber" },
                { href: "/dashboard/orders", label: "Riwayat Pembelian", icon: ShoppingBag, color: "blue" },
                { href: "/dashboard/profile", label: "Edit Profil", icon: TrendingUp, color: "green" },
              ].map(({ href, label, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      color === "orange"
                        ? "bg-orange-50"
                        : color === "amber"
                        ? "bg-amber-50"
                        : color === "blue"
                        ? "bg-blue-50"
                        : "bg-green-50"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={
                        color === "orange"
                          ? "text-orange-600"
                          : color === "amber"
                          ? "text-amber-600"
                          : color === "blue"
                          ? "text-blue-600"
                          : "text-green-600"
                      }
                    />
                  </div>
                  <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">
                    {label}
                  </span>
                  <ArrowRight
                    size={14}
                    className="ml-auto text-stone-300 group-hover:text-orange-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
