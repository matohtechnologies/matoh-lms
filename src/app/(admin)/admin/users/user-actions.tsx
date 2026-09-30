"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreVertical, Shield, GraduationCap, User, Trash2 } from "lucide-react";

interface UserActionsProps {
  userId: string;
  userName: string;
  currentRole: string;
  isSelf: boolean;
}

export function UserActions({ userId, userName, currentRole, isSelf }: UserActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        alert(d.error ?? "Gagal mengubah role");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm(`Hapus akun "${userName}"?\n\nSemua data pengguna ini akan dihapus secara permanen.`)) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error ?? "Gagal menghapus pengguna");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (isSelf) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-xs text-stone-400 italic">Akun Anda</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 relative">
      {loading && <Loader2 size={14} className="animate-spin text-stone-400" />}
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
        title="Opsi Pengguna"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-48 bg-white rounded-xl border border-stone-200 shadow-warm-lg py-1.5 z-20">
            <p className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              Ubah Role
            </p>
            {currentRole !== "USER" && (
              <button
                onClick={() => changeRole("USER")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <User size={13} className="text-stone-400" />
                Jadikan Siswa
              </button>
            )}
            {currentRole !== "INSTRUCTOR" && (
              <button
                onClick={() => changeRole("INSTRUCTOR")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <GraduationCap size={13} className="text-blue-500" />
                Jadikan Instruktur
              </button>
            )}
            {currentRole !== "ADMIN" && (
              <button
                onClick={() => changeRole("ADMIN")}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Shield size={13} className="text-orange-500" />
                Jadikan Admin
              </button>
            )}
            <div className="border-t border-stone-100 mt-1 pt-1">
              <button
                onClick={deleteUser}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
                Hapus Akun
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
