import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, CheckCircle, Clock, XCircle, AlertCircle, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale, enUS as enLocale } from "date-fns/locale";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders — Earthy Academy" };

interface OrderItem {
  id: string;
  midtransOrderId: string | null;
  amount: number;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  createdAt: Date;
  course: {
    title: string;
    category: { name: string };
  };
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("dashboard");
  const dateLocale = isEn ? enLocale : idLocale;

  const statusConfig = {
    PAID: {
      label: t("status_paid"),
      icon: CheckCircle,
      color: "text-green-700 bg-green-50 border-green-200",
    },
    PENDING: {
      label: t("status_pending"),
      icon: Clock,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    FAILED: {
      label: t("status_failed"),
      icon: XCircle,
      color: "text-red-700 bg-red-50 border-red-200",
    },
    REFUNDED: {
      label: t("status_refunded"),
      icon: AlertCircle,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
  };

  let orders: OrderItem[] = [];
  try {
    const dbOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: { title: true, category: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    orders = dbOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    orders = [];
  }

  const paidTotal = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("orders_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {t("transactions_count", { count: orders.length })}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: t("total_paid"),
              value: formatCurrency(paidTotal, locale),
              color: "green",
            },
            {
              label: t("successful_transactions"),
              value: `${orders.filter((o) => o.status === "PAID").length}×`,
              color: "green",
            },
            {
              label: t("pending"),
              value: `${orders.filter((o) => o.status === "PENDING").length}×`,
              color: "amber",
            },
            {
              label: t("failed"),
              value: `${orders.filter((o) => o.status === "FAILED" || o.status === "REFUNDED").length}×`,
              color: "red",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm transition-all duration-200"
            >
              <p className="text-xs font-medium text-stone-500 mb-1">{label}</p>
              <p
                className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                  color === "green"
                    ? "text-emerald-700"
                    : color === "amber"
                    ? "text-amber-700"
                    : "text-red-600"
                }`}
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-200/60 shadow-2xs">
            <ShoppingBag size={28} />
          </div>
          <h3
            className="text-lg font-bold text-stone-900 mb-1.5"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("no_orders_title")}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            {t("no_orders_desc")}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <GraduationCap size={15} />
            {t("explore_courses")}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
          {/* Mobile: Card list */}
          <div className="sm:hidden divide-y divide-stone-100">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {order.course.title}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {order.course.category.name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}
                    >
                      <StatusIcon size={11} />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {format(new Date(order.createdAt), "d MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </span>
                    <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                      {formatCurrency(order.amount, locale)}
                    </span>
                  </div>
                  {order.midtransOrderId && (
                    <p className="text-[10px] font-mono text-stone-400">
                      ID: {order.midtransOrderId.slice(-12)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">{t("order_course_col")}</th>
                  <th className="px-5 py-3.5">{t("order_date_col")}</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-stone-600">
                        <span className="bg-stone-100 px-2 py-1 rounded-md">
                          {order.midtransOrderId?.slice(-12) ?? order.id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-stone-900 truncate max-w-[220px]">
                          {order.course.title}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {order.course.category.name}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-stone-500 font-medium">
                        {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", {
                          locale: dateLocale,
                        })}
                      </td>
                      <td className="px-5 py-4 font-bold text-stone-900 text-sm">
                        {formatCurrency(order.amount, locale)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.color}`}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
