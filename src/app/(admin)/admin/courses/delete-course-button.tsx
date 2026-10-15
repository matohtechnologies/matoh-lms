"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { dynamicConfirm, dynamicAlert } from "@/components/ui/dynamic-alert-provider";

export function DeleteCourseButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Kelas Permanen?",
      message: `Apakah Anda yakin ingin menghapus kelas "${courseTitle}"?\n\nSemua materi kurikulum, tugas, dan pengaturan terkait kelas ini akan dihapus permanen dari sistem.`,
      confirmText: "Ya, Hapus Kelas",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        await dynamicAlert({
          title: "Gagal Menghapus Kelas",
          message: data.error ?? "Terjadi kesalahan saat menghapus kelas.",
          variant: "danger",
        });
      }
    } catch {
      await dynamicAlert({
        title: "Koneksi Terputus",
        message: "Terjadi kesalahan koneksi ke server. Silakan coba beberapa saat lagi.",
        variant: "danger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Hapus Kelas"
    >
      {isDeleting ? (
        <Loader2 size={15} className="animate-spin text-red-600" />
      ) : (
        <Trash2 size={15} />
      )}
    </button>
  );
}
