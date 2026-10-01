import { redirect } from "next/navigation";
import { ShoppingBag, Search, CheckCircle2, Clock, XCircle, ArrowUpRight, Filter, Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Semua Transaksi — Admin" };

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  const t = await getTranslations("admin");
  const locale = await getLocale();

  let orders: {
    id: string;
    amount: number;
    status: string;
    paymentType: string;
    createdAt: Date;
    user: { name: string; email: string };
    course: { title: string; slug: string };
  }[] = [];

  try {
    const dbOrders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    orders = dbOrders.map((o) => ({
      id: o.id,
      amount: o.amount,
      status: o.status,
      paymentType: o.paymentMethod ?? "midtrans",
      createdAt: o.createdAt,
      user: { name: o.user.name ?? "Pengguna", email: o.user.email ?? "-" },
      course: { title: o.course.title, slug: o.course.slug },
    }));
  } catch {
    orders = [];
  }

  const totalAmount = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

  const statusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200/60">
            <CheckCircle2 size={12} className="text-green-600" />
            {t("status_success")}
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            <Clock size={12} className="text-amber-600" />
            {t("status_pending")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-700 font-medium bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60">
            <XCircle size={12} className="text-red-600" />
            {t("status_failed")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {t("orders_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {t("orders_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200/80 bg-white text-stone-700 hover:text-stone-900 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors">
            <Download size={14} />
            {t("export_csv")}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm transition-all duration-200">
          <p className="text-xs font-medium text-stone-500">{t("total_income")}</p>
          <p
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("income_note")}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm transition-all duration-200">
          <p className="text-xs font-medium text-stone-500">{t("successful_orders")}</p>
          <p
            className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {orders.filter((o) => o.status === "PAID").length}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">{t("from_total", { total: orders.length })}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-warm transition-all duration-200">
          <p className="text-xs font-medium text-stone-500">{t("pending_payment")}</p>
          <p
            className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {orders.filter((o) => o.status === "PENDING").length}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">{t("pending_note")}</p>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-80 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200/60">
            <Search size={15} className="text-stone-400 shrink-0" />
            <input
              placeholder={t("search_orders")}
              className="w-full text-xs bg-transparent text-stone-700 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-stone-400 mr-1 text-[11px]">{t("filter_status")}:</span>
            <button className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-950 font-bold border border-orange-200/60 text-[11px]">{t("status_all")}</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors border border-transparent hover:border-stone-200/60 text-[11px]">{t("status_success")}</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors border border-transparent hover:border-stone-200/60 text-[11px]">{t("status_pending")}</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors border border-transparent hover:border-stone-200/60 text-[11px]">{t("status_failed")}</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">{t("col_order_id")}</th>
                <th className="px-5 py-3.5">{t("col_learner")}</th>
                <th className="px-5 py-3.5">{t("course_col")}</th>
                <th className="px-5 py-3.5">{t("col_method")}</th>
                <th className="px-5 py-3.5">{t("col_nominal")}</th>
                <th className="px-5 py-3.5">{t("col_status")}</th>
                <th className="px-5 py-3.5">{t("col_time")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md border border-stone-200/60">
                      {order.id.slice(0, 16)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {order.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{order.user.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{order.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-700 max-w-[200px] truncate" title={order.course.title}>
                      {order.course.title}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-stone-600 font-bold uppercase text-[11px]">
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
                      {order.paymentType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-stone-900 text-sm">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-5 py-4">{statusBadge(order.status)}</td>
                  <td className="px-5 py-4 text-[11px] text-stone-500 font-medium">
                    {order.createdAt.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
