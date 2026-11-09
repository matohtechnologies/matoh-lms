import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ShoppingBag } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview — Matoh Technologies" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  const t = await getTranslations("admin");

  // Fetch real statistics from database
  let stats = {
    totalUsers: 0,
    totalCourses: 0,
    totalOrders: 0,
    revenue: 0,
    recentOrders: [] as {
      id: string;
      amount: number;
      createdAt: Date;
      user: { name: string | null; email: string };
      course: { title: string };
    }[],
  };

  try {
    const [userCount, courseCount, paidOrders] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.order.findMany({
        where: { status: "PAID" },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
          publication: { select: { titleId: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const totalRevenue = await prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });

    stats = {
      totalUsers: userCount,
      totalCourses: courseCount,
      totalOrders: paidOrders.length,
      revenue: totalRevenue._sum.amount ?? 0,
      recentOrders: paidOrders.map((o) => ({
        id: o.id,
        amount: o.amount,
        createdAt: o.createdAt,
        user: o.user,
        course: { title: o.course?.title || o.publication?.titleId || "Item Pembelian" },
      })),
    };
  } catch (err) {
    console.error("Failed to load admin overview stats:", err);
  }

  const statCards = [
    {
      label: t("total_users"),
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
    },
    {
      label: t("active_courses"),
      value: stats.totalCourses.toLocaleString(),
      change: t("this_month", { n: 3 }),
    },
    {
      label: t("total_orders"),
      value: stats.totalOrders.toLocaleString(),
      change: "+18%",
    },
    {
      label: t("total_revenue"),
      value: formatCurrency(stats.revenue),
      change: "+24%",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("system_online")}
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
          <Link href="/admin/courses/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors">
            <BookOpen size={14} />
            {t("add_course")}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, change }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <p
                className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {value}
              </p>
              <p className="text-xs font-medium text-stone-500 mt-1">{label}</p>
            </div>
            <div className="flex items-center justify-end mt-4">
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2
              className="text-base font-bold text-stone-900"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {t("recent_transactions")}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">{t("recent_transactions_desc")}</p>
          </div>
          <a
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-lg transition-colors border border-teal-200/60"
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
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
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

      {/* Tips Pengelolaan */}
      <div className="bg-gradient-to-br from-teal-50/80 via-sky-50/40 to-teal-50/50 rounded-2xl border border-teal-200/60 p-4.5 text-xs space-y-1.5">
        <p className="font-bold text-teal-950 flex items-center gap-1.5">
          <span>💡</span> {t("management_tips")}
        </p>
        <p className="text-stone-600 leading-relaxed text-[11px]">
          {t("management_tips_desc")}
        </p>
      </div>
    </div>
  );
}
