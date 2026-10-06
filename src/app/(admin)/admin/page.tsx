import { redirect } from "next/navigation";
import { BookOpen, Users, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getAdminStats() {
  try {
    const [totalUsers, totalCourses, totalOrders, revenue, recentOrders] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.course.count({ where: { published: true } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        where: { status: "PAID" },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalOrders,
      revenue: revenue._sum.amount ?? 0,
      recentOrders,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalOrders: 0,
      revenue: 0,
      recentOrders: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  const t = await getTranslations("admin");
  const stats = await getAdminStats();

  const statCards = [
    {
      label: t("total_users"),
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "blue",
      change: "+12%",
    },
    {
      label: t("active_courses"),
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: "sky",
      change: t("this_month", { n: 3 }),
    },
    {
      label: t("total_orders"),
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "green",
      change: "+18%",
    },
    {
      label: t("total_revenue"),
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: "amber",
      change: "+24%",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("overview")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">{t("platform_summary")}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <BookOpen size={14} />
            {t("add_course")}
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, change }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                  color === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : color === "sky"
                    ? "bg-sky-50 text-sky-600"
                    : color === "green"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {change}
              </span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {value}
            </p>
            <p className="text-xs font-medium text-stone-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Transactions & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2
                className="text-base font-bold text-stone-900"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {t("recent_transactions")}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">5 transaksi pembayaran kelas terbaru</p>
            </div>
            <a
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200/60"
            >
              {t("view_all")}
            </a>
          </div>

          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5 font-bold">{t("user_col")}</th>
                    <th className="pb-2.5 font-bold">{t("course_col")}</th>
                    <th className="pb-2.5 font-bold text-right">{t("amount_col")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {order.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">{order.user.name}</p>
                            <p className="text-[10px] text-stone-400 truncate max-w-[140px]">
                              {order.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-stone-700 truncate max-w-[200px]">
                          {order.course.title}
                        </p>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-stone-900 bg-stone-100 px-2 py-1 rounded-md">
                          {formatCurrency(order.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
              <ShoppingBag size={32} className="text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-500">{t("no_transactions")}</p>
            </div>
          )}
        </div>

        {/* Quick Actions & Navigation */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
            <h2
              className="text-sm font-bold text-stone-900"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("quick_actions")}
            </h2>
            <div className="space-y-2">
              <a
                href="/admin/courses/new"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-950 text-xs font-bold border border-blue-200/80 transition-all shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <BookOpen size={13} />
                </div>
                <span>{t("add_course")}</span>
              </a>

              <a
                href="/admin/courses"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200/60 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                  <BookOpen size={13} />
                </div>
                <span>{t("manage_courses")}</span>
              </a>

              <a
                href="/admin/users"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200/60 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                  <Users size={13} />
                </div>
                <span>{t("manage_users")}</span>
              </a>

              <a
                href="/admin/orders"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200/60 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                  <ShoppingBag size={13} />
                </div>
                <span>{t("all_transactions")}</span>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-sky-50/60 to-blue-50/40 rounded-2xl border border-blue-200/60 p-4.5 text-xs space-y-1.5">
            <p className="font-bold text-blue-950 flex items-center gap-1.5">
              <span>💡</span> Tips Pengelolaan
            </p>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Gunakan Studio Sertifikat di dalam masing-masing halaman kelas untuk merancang tata letak dan syarat kelulusan otomatis bagi peserta didik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
