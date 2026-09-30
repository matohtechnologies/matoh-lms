import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, CheckCircle, Clock, XCircle, AlertCircle, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Riwayat Pembelian — Earthy Academy" };

const statusConfig = {
  PAID: {
    label: "Berhasil",
    icon: CheckCircle,
    color: "text-green-700 bg-green-50 border-green-200",
  },
  PENDING: {
    label: "Menunggu",
    icon: Clock,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  FAILED: {
    label: "Gagal",
    icon: XCircle,
    color: "text-red-700 bg-red-50 border-red-200",
  },
  REFUNDED: {
    label: "Dikembalikan",
    icon: AlertCircle,
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
};

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
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-stone-900"
          style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
        >
          Riwayat Pembelian
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {orders.length} transaksi
        </p>
      </div>

      {/* Summary Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Dibayar",
              value: formatCurrency(paidTotal),
              color: "green",
            },
            {
              label: "Transaksi Berhasil",
              value: `${orders.filter((o) => o.status === "PAID").length}×`,
              color: "green",
            },
            {
              label: "Menunggu",
              value: `${orders.filter((o) => o.status === "PENDING").length}×`,
              color: "amber",
            },
            {
              label: "Gagal",
              value: `${orders.filter((o) => o.status === "FAILED" || o.status === "REFUNDED").length}×`,
              color: "red",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-stone-200 p-4 shadow-warm"
            >
              <p className="text-xs text-stone-500 mb-1">{label}</p>
              <p
                className={`text-lg font-bold ${
                  color === "green"
                    ? "text-green-700"
                    : color === "amber"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} className="text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            Belum Ada Transaksi
          </h3>
          <p className="text-stone-500 text-sm mb-6">
            Riwayat pembelian kelas akan muncul di sini
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            <GraduationCap size={16} />
            Jelajahi Kelas
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-warm">
          {/* Mobile: Card list */}
          <div className="sm:hidden divide-y divide-stone-100">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {order.course.title}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {order.course.category.name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
                    >
                      <StatusIcon size={11} />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {format(new Date(order.createdAt), "d MMM yyyy", {
                        locale: idLocale,
                      })}
                    </span>
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(order.amount)}
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    Order ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    Kelas
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    Tanggal
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs font-mono text-stone-500">
                        {order.midtransOrderId?.slice(-12) ?? order.id.slice(-8)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-stone-900 truncate max-w-[180px]">
                          {order.course.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {order.course.category.name}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-500">
                        {format(new Date(order.createdAt), "d MMM yyyy", {
                          locale: idLocale,
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-stone-900">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
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
