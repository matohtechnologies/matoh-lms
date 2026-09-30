import { redirect } from "next/navigation";
import { Users, Search, Shield, GraduationCap, Mail } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { UserActions } from "./user-actions";

export const metadata: Metadata = { title: "Manajemen Pengguna — Admin" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");
  const currentUserId = session.user.id;

  let users: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    enrolledCount: number;
    status: string;
  }[] = [];

  try {
    const dbUsers = await prisma.user.findMany({
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    users = dbUsers.map((u) => ({
      id: u.id,
      name: u.name ?? "Pengguna",
      email: u.email ?? "-",
      role: u.role,
      createdAt: u.createdAt,
      enrolledCount: u._count.enrollments,
      status: "ACTIVE",
    }));
  } catch {
    users = [];
  }

  const roleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="warning">Admin</Badge>;
      case "INSTRUCTOR":
        return <Badge variant="info">Instruktur</Badge>;
      default:
        return <Badge variant="default">Siswa</Badge>;
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
            Manajemen Pengguna
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Kelola akses, peran, dan riwayat aktivitas seluruh anggota platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full font-medium">
            Total {users.length} Terdaftar
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-warm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-80">
            <Search size={16} className="text-stone-400 shrink-0" />
            <input
              placeholder="Cari berdasarkan nama atau email..."
              className="w-full text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="text-stone-400">Filter Role:</span>
            <button className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 font-medium">Semua</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">Siswa</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">Instruktur</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors">Admin</button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100">
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Pengguna</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Kelas Diikuti</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Bergabung</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 text-stone-700 font-semibold text-sm flex items-center justify-center shrink-0">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900">{user.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4 text-sm text-stone-600">
                    {user.enrolledCount > 0 ? (
                      <span className="font-medium text-stone-900">{user.enrolledCount} Kelas</span>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-stone-500">
                    {user.createdAt.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Aktif
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <UserActions
                      userId={user.id}
                      userName={user.name}
                      currentRole={user.role}
                      isSelf={user.id === currentUserId}
                    />
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
