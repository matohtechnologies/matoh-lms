import { redirect } from "next/navigation";
import { ShoppingBag, Search, CheckCircle2, Clock, XCircle, ArrowUpRight, Filter, Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Semua Transaksi — Admin" };

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

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
            Berhasil
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            <Clock size={12} className="text-amber-600" />
            Menunggu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-700 font-medium bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60">
            <XCircle size={12} className="text-red-600" />
            Gagal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            Semua Transaksi
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Riwayat pembayaran kursus dari seluruh gateway Midtrans & simulasi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs font-medium hover:bg-stone-50 shadow-sm transition-colors">
            <Download size={14} />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-warm">
          <p className="text-xs font-medium text-stone-500">Total Pemasukan (Berhasil)</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-green-600 mt-1">✓ Berhasil diselesaikan</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-warm">
          <p className="text-xs font-medium text-stone-500">Jumlah Transaksi Berhasil</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">
            {orders.filter((o) => o.status === "PAID").length} Pesanan
          </p>
          <p className="text-xs text-stone-400 mt-1">Dari {orders.length} total pesanan dibuat</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-warm">
          <p className="text-xs font-medium text-stone-500">Menunggu Pembayaran</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {orders.filter((o) => o.status === "PENDING").length} Pesanan
          </p>
          <p className="text-xs text-stone-400 mt-1">Perlu konfirmasi payment gateway</p>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-warm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-80">
            <Search size={16} className="text-stone-400 shrink-0" />
            <input
              placeholder="Cari ID pesanan, siswa, atau kelas..."
              className="w-full text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-stone-400">Status:</span>
            <button className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 font-medium">Semua</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">Berhasil</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">Menunggu</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">Gagal</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100">
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">ID Pesanan</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Pelajar</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Kelas</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Metode</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Nominal</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-medium text-stone-700 bg-stone-100 px-2 py-1 rounded-md">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{order.user.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-stone-700 max-w-[200px] truncate" title={order.course.title}>
                      {order.course.title}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-stone-600 uppercase">
                    {order.paymentType.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-stone-900">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-5 py-4">{statusBadge(order.status)}</td>
                  <td className="px-5 py-4 text-xs text-stone-500">
                    {order.createdAt.toLocaleDateString("id-ID", {
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
