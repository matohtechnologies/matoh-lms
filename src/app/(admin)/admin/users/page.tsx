import { redirect } from "next/navigation";
import { Users, Search, Shield, GraduationCap, Mail } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { UserActions } from "./user-actions";

export const metadata: Metadata = { title: "Manajemen Pengguna — Admin" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");
  const currentUserId = session.user.id;

  const t = await getTranslations("admin");
  const locale = await getLocale();

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
        return <Badge variant="warning">{t("role_admin")}</Badge>;
      case "INSTRUCTOR":
        return <Badge variant="info">{t("role_instructor")}</Badge>;
      default:
        return <Badge variant="default">{t("role_student")}</Badge>;
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("users_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {t("users_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200/60 px-3 py-1.5 rounded-full font-bold shadow-2xs">
            {t("total_registered", { count: users.length })}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-80 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200/60">
            <Search size={15} className="text-stone-400 shrink-0" />
            <input
              id="admin-users-search"
              name="search"
              autoComplete="off"
              aria-label={t("search_users")}
              placeholder={t("search_users")}
              className="w-full text-xs bg-transparent text-stone-700 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-stone-400 mr-1 text-[11px]">{t("filter_role")}:</span>
            <button className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-950 font-bold border border-blue-200/60 text-[11px]">{t("filter_all")}</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors border border-transparent hover:border-stone-200/60 text-[11px]">{t("filter_student")}</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors border border-transparent hover:border-stone-200/60 text-[11px]">{t("filter_instructor")}</button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors border border-transparent hover:border-stone-200/60 text-[11px]">{t("filter_admin")}</button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">{t("col_user")}</th>
                <th className="px-5 py-3.5">{t("col_role")}</th>
                <th className="px-5 py-3.5">{t("col_enrolled")}</th>
                <th className="px-5 py-3.5">{t("col_joined")}</th>
                <th className="px-5 py-3.5">{t("col_active")}</th>
                <th className="px-5 py-3.5 text-right">{t("col_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{user.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4 text-stone-600 font-semibold">
                    {user.enrolledCount > 0 ? (
                      <span>{t("enrolled_count", { count: user.enrolledCount })}</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-stone-500 font-medium">
                    {user.createdAt.toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t("status_active")}
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
