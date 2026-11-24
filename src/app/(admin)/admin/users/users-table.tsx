"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, X, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";
import { useTranslations } from "next-intl";
import { dynamicAlert } from "@/components/ui/dynamic-alert-provider";

export interface UserRowData {
  id: string;
  name: string;
  email: string;
  role: string;
  headline?: string | null;
  bio?: string | null;
  image?: string | null;
  showInAbout?: boolean;
  aboutRole?: string | null;
  aboutRoleEn?: string | null;
  aboutBadge?: string | null;
  aboutOrder?: number;
  createdAtFormatted: string;
  enrolledCount: number;
  status: string;
}

interface UsersTableProps {
  initialUsers: UserRowData[];
  currentUserId: string;
}

function UserAvatar({
  name,
  image,
  role,
}: {
  name: string;
  image?: string | null;
  role: string;
}) {
  const [error, setError] = useState(false);

  const bgGradient =
    role === "INSTRUCTOR"
      ? "bg-gradient-to-br from-teal-600 to-emerald-600"
      : role === "ADMIN"
      ? "bg-gradient-to-br from-amber-600 to-orange-600"
      : "bg-gradient-to-br from-blue-600 to-sky-600";

  return (
    <div
      className={`w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden ring-1 ring-stone-200/60 ${bgGradient}`}
    >
      {image && !error ? (
        <img
          src={image}
          alt=""
          width={36}
          height={36}
          onError={() => setError(true)}
          style={{ aspectRatio: "1 / 1" }}
          className="w-full h-full object-cover aspect-square"
        />
      ) : (
        <span>{name[0]?.toUpperCase() || "U"}</span>
      )}
    </div>
  );
}

export function UsersTable({ initialUsers, currentUserId }: UsersTableProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [users, setUsers] = useState<UserRowData[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "INSTRUCTOR" | "ADMIN" | "ABOUT">("ALL");
  const [togglingAboutId, setTogglingAboutId] = useState<string | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleToggleAbout = async (userId: string, currentShow: boolean) => {
    if (togglingAboutId) return;
    setTogglingAboutId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInAbout: !currentShow }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, showInAbout: !currentShow } : u))
        );
        router.refresh();
      } else {
        const data = await res.json();
        await dynamicAlert({
          title: "Gagal Mengubah Pengaturan",
          message: data.error || "Gagal mengubah status tampilan Tentang Kami.",
          variant: "danger",
        });
      }
    } catch {
      await dynamicAlert({
        title: "Koneksi Terputus",
        message: "Terjadi kesalahan jaringan.",
        variant: "danger",
      });
    } finally {
      setTogglingAboutId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole =
        roleFilter === "ALL"
          ? true
          : roleFilter === "ABOUT"
          ? Boolean(u.showInAbout)
          : u.role === roleFilter;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.headline && u.headline.toLowerCase().includes(q)) ||
        (u.aboutRole && u.aboutRole.toLowerCase().includes(q));
      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(() => {
    return {
      all: users.length,
      student: users.filter((u) => u.role === "USER").length,
      instructor: users.filter((u) => u.role === "INSTRUCTOR").length,
      admin: users.filter((u) => u.role === "ADMIN").length,
      about: users.filter((u) => u.showInAbout).length,
    };
  }, [users]);

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
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2.5 w-full sm:w-80 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200/60 focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/15 transition-all">
          <Search size={15} className="text-stone-400 shrink-0" />
          <input
            id="admin-users-search"
            name="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("search_users")}
            placeholder={t("search_users")}
            className="w-full text-xs bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
              title="Hapus pencarian"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-stone-400 mr-1 text-[11px] shrink-0">{t("filter_role")}:</span>
          
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
              roleFilter === "ALL"
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t("filter_all")} <span className="opacity-70 ml-0.5">({counts.all})</span>
          </button>

          <button
            onClick={() => setRoleFilter("INSTRUCTOR")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
              roleFilter === "INSTRUCTOR"
                ? "bg-teal-600 text-white shadow-2xs"
                : "text-teal-700 bg-teal-50/60 hover:bg-teal-100/70 border border-teal-200/40"
            }`}
          >
            {t("filter_instructor")} <span className="opacity-70 ml-0.5">({counts.instructor})</span>
          </button>

          <button
            onClick={() => setRoleFilter("USER")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
              roleFilter === "USER"
                ? "bg-stone-800 text-white shadow-2xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t("filter_student")} <span className="opacity-70 ml-0.5">({counts.student})</span>
          </button>

          <button
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
              roleFilter === "ADMIN"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-amber-800 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/40"
            }`}
          >
            {t("filter_admin")} <span className="opacity-70 ml-0.5">({counts.admin})</span>
          </button>

          <button
            onClick={() => setRoleFilter("ABOUT")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              roleFilter === "ABOUT"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60"
            }`}
          >
            <Star size={12} className={roleFilter === "ABOUT" ? "fill-white text-white" : "fill-amber-500 text-amber-500"} />
            <span>Tentang Kami</span>
            <span className="opacity-80">({counts.about})</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <th className="px-5 py-3.5">{t("col_user")}</th>
              <th className="px-5 py-3.5">{t("col_role")}</th>
              <th className="px-5 py-3.5">Tentang Kami</th>
              <th className="px-5 py-3.5">{t("col_enrolled")}</th>
              <th className="px-5 py-3.5">{t("col_joined")}</th>
              <th className="px-5 py-3.5">{t("col_active")}</th>
              <th className="px-5 py-3.5 text-right">{t("col_action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-stone-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users size={28} className="text-stone-300 stroke-[1.5]" />
                    <p className="text-xs font-medium text-stone-500">
                      Tidak ada pengguna yang sesuai dengan kriteria filter.
                    </p>
                    {(search || roleFilter !== "ALL") && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setRoleFilter("ALL");
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-semibold hover:underline mt-1 cursor-pointer"
                      >
                        Reset Filter & Pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user.name}
                        image={user.image}
                        role={user.role}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-900">{user.name}</p>
                          {user.id === currentUserId && (
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5">{user.email}</p>
                        {user.headline && (
                          <p className="text-[10px] text-teal-700 font-medium mt-0.5 line-clamp-1">
                            {user.headline}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleAbout(user.id, Boolean(user.showInAbout))}
                      disabled={togglingAboutId === user.id}
                      title={
                        user.showInAbout
                          ? "Klik untuk sembunyikan dari Halaman Tentang Kami"
                          : "Klik untuk tampilkan di Halaman Tentang Kami"
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        user.showInAbout
                          ? "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-2xs"
                          : "bg-stone-50 text-stone-500 border border-stone-200/70 hover:bg-stone-100 hover:text-stone-700"
                      }`}
                    >
                      {togglingAboutId === user.id ? (
                        <Loader2 size={12} className="animate-spin text-amber-600" />
                      ) : (
                        <Star
                          size={12}
                          className={user.showInAbout ? "text-amber-500 fill-amber-500" : "text-stone-400"}
                        />
                      )}
                      <span>
                        {user.showInAbout
                          ? `${user.aboutBadge || "Founder"} (#${user.aboutOrder || 1})`
                          : "Sembunyi"}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-stone-600 font-semibold">
                    {user.enrolledCount > 0 ? (
                      <span>{t("enrolled_count", { count: user.enrolledCount })}</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-stone-500 font-medium">
                    {user.createdAtFormatted}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t("status_active")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <UserActions
                      user={user}
                      userId={user.id}
                      userName={user.name}
                      userEmail={user.email}
                      currentRole={user.role}
                      headline={user.headline}
                      bio={user.bio}
                      image={user.image}
                      isSelf={user.id === currentUserId}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

