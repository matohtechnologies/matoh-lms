import { redirect } from "next/navigation";
import { BookOpen, Users, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
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

  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Total Pengguna",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "blue",
      change: "+12%",
    },
    {
      label: "Kelas Aktif",
      value: stats.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: "orange",
      change: "+3 bulan ini",
    },
    {
      label: "Total Pembelian",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "green",
      change: "+18%",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: "amber",
      change: "+24%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
          Admin Dashboard
        </h1>
        <p className="text-stone-500 text-sm mt-1">Ringkasan performa platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-warm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === "blue" ? "bg-blue-50" :
                color === "orange" ? "bg-orange-50" :
                color === "green" ? "bg-green-50" : "bg-amber-50"
              }`}>
                <Icon size={18} className={
                  color === "blue" ? "text-blue-600" :
                  color === "orange" ? "text-orange-600" :
                  color === "green" ? "text-green-600" : "text-amber-600"
                } />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">Transaksi Terbaru</h2>
            <a href="/admin/orders" className="text-sm text-orange-600 hover:underline">Lihat semua</a>
          </div>
          {stats.recentOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left text-xs font-medium text-stone-400 pb-2">Pengguna</th>
                  <th className="text-left text-xs font-medium text-stone-400 pb-2">Kelas</th>
                  <th className="text-right text-xs font-medium text-stone-400 pb-2">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-50 last:border-0">
                    <td className="py-3 text-sm text-stone-700">{order.user.name}</td>
                    <td className="py-3 text-sm text-stone-500 truncate max-w-[150px]">{order.course.title}</td>
                    <td className="py-3 text-sm font-medium text-stone-900 text-right">{formatCurrency(order.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag size={32} className="text-stone-200 mx-auto mb-2" />
              <p className="text-sm text-stone-400">Belum ada transaksi</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-2">
              <a
                href="/admin/courses/new"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-medium transition-colors"
              >
                <BookOpen size={16} />
                Tambah Kelas Baru
              </a>
              <a
                href="/admin/courses"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-700 text-sm transition-colors"
              >
                <BookOpen size={16} className="text-stone-400" />
                Kelola Kelas
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-700 text-sm transition-colors"
              >
                <Users size={16} className="text-stone-400" />
                Kelola Pengguna
              </a>
              <a
                href="/admin/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-stone-700 text-sm transition-colors"
              >
                <ShoppingBag size={16} className="text-stone-400" />
                Semua Transaksi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
