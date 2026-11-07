"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MoreVertical,
  Shield,
  GraduationCap,
  User,
  Trash2,
  Pencil,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { dynamicConfirm, dynamicAlert } from "@/components/ui/dynamic-alert-provider";
import { EditInstructorModal } from "./edit-instructor-modal";
import type { UserRowData } from "./users-table";

interface UserActionsProps {
  user?: UserRowData;
  userId: string;
  userName: string;
  userEmail?: string;
  currentRole: string;
  headline?: string | null;
  bio?: string | null;
  image?: string | null;
  isSelf: boolean;
}

export function UserActions({
  user,
  userId,
  userName,
  userEmail = "",
  currentRole,
  headline = null,
  bio = null,
  image = null,
  isSelf,
}: UserActionsProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("admin");

  const rowUser: UserRowData = user || {
    id: userId,
    name: userName,
    email: userEmail,
    role: currentRole,
    headline,
    bio,
    image,
    createdAtFormatted: "",
    enrolledCount: 0,
    status: "ACTIVE",
  };

  const changeRole = async (role: string) => {
    if (loading) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        await dynamicAlert({
          title: "Gagal Mengubah Role",
          message: d.error ?? "Terjadi kesalahan saat mengubah role pengguna.",
          variant: "danger",
        });
      }
    } catch {
      await dynamicAlert({
        title: "Koneksi Terputus",
        message: "Terjadi kesalahan koneksi.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Pengguna?",
      message: `Hapus pengguna "${userName}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data terkait pengguna ini.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        await dynamicAlert({
          title: "Gagal Menghapus Pengguna",
          message: d.error ?? "Terjadi kesalahan saat menghapus pengguna.",
          variant: "danger",
        });
      }
    } catch {
      await dynamicAlert({
        title: "Koneksi Terputus",
        message: "Terjadi kesalahan koneksi.",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5 relative">
        {loading && <Loader2 size={14} className="animate-spin text-stone-400" />}

        {/* Kebab Action Menu */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={loading}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer"
          title={t("user_options")}
        >
          <MoreVertical size={15} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-8 w-48 bg-white rounded-xl border border-stone-200 shadow-warm-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100 text-left">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setEditOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Pencil size={13} className="text-teal-600" />
                <span>Edit Data</span>
              </button>

              {!isSelf ? (
                <>
                  <div className="border-t border-stone-100 my-1" />

                  <p className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    {t("change_role")}
                  </p>
                  {currentRole !== "USER" && (
                    <button
                      type="button"
                      onClick={() => changeRole("USER")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <User size={13} className="text-stone-400" />
                      {t("make_student")}
                    </button>
                  )}
                  {currentRole !== "INSTRUCTOR" && (
                    <button
                      type="button"
                      onClick={() => changeRole("INSTRUCTOR")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <GraduationCap size={13} className="text-blue-500" />
                      {t("make_instructor")}
                    </button>
                  )}
                  {currentRole !== "ADMIN" && (
                    <button
                      type="button"
                      onClick={() => changeRole("ADMIN")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <Shield size={13} className="text-blue-500" />
                      {t("make_admin")}
                    </button>
                  )}
                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={deleteUser}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      {t("delete_account")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-stone-100 mt-1 pt-1 px-3 py-1">
                  <span className="text-[10px] text-stone-400 italic">Akun Anda Sendiri</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Instructor / User Modal */}
      <EditInstructorModal
        user={rowUser}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        isSelf={isSelf}
      />
    </>
  );
}
