"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon?: string | null;
  _count: {
    courses: number;
  };
  courses?: {
    id: string;
    title: string;
    slug: string;
    published?: boolean;
  }[];
}

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "WITH_COURSES" | "EMPTY">("ALL");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "courses_desc">("name_asc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalNameEn, setModalNameEn] = useState("");
  const [modalSlug, setModalSlug] = useState("");
  const [modalIcon, setModalIcon] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(`/courses?category=${encodeURIComponent(slug)}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalName("");
    setModalNameEn("");
    setModalSlug("");
    setModalIcon("");
    setAutoSlug(true);
    setModalError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setModalName(cat.name);
    setModalNameEn(cat.nameEn || "");
    setModalSlug(cat.slug);
    setModalIcon(cat.icon || "");
    setAutoSlug(false);
    setModalError("");
    setIsModalOpen(true);
  };

  // Name change handler with live auto-slug
  const handleNameChange = (val: string) => {
    setModalName(val);
    if (autoSlug) {
      setModalSlug(slugify(val));
    }
  };

  // Submit Add or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) {
      setModalError("Nama kategori wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const payload = {
        name: modalName.trim(),
        nameEn: modalNameEn.trim() || modalName.trim(),
        slug: modalSlug.trim() ? slugify(modalSlug.trim()) : slugify(modalName.trim()),
        icon: modalIcon.trim() || null,
      };

      if (editingCategory) {
        // Edit existing
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal memperbarui kategori");
        }

        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data.category } : c))
        );
        showToast(`Kategori "${data.category.name}" berhasil diperbarui!`);
      } else {
        // Add new
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal membuat kategori baru");
        }

        setCategories((prev) => [...prev, data.category]);
        showToast(`Kategori "${data.category.name}" berhasil ditambahkan!`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setModalError(error.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget._count.courses > 0) {
      setDeleteError(
        `Kategori "${deleteTarget.name}" tidak dapat dihapus karena masih digunakan oleh ${deleteTarget._count.courses} kelas.`
      );
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus kategori");
      }

      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast(`Kategori "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const error = err as Error;
      setDeleteError(error.message || "Gagal menghapus kategori");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort calculation
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const query = search.toLowerCase().trim();
        const matchesQuery =
          !query ||
          cat.name.toLowerCase().includes(query) ||
          cat.nameEn.toLowerCase().includes(query) ||
          cat.slug.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        if (filterType === "WITH_COURSES") {
          return cat._count.courses > 0;
        }
        if (filterType === "EMPTY") {
          return cat._count.courses === 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name_desc") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "courses_desc") {
          return b._count.courses - a._count.courses;
        }
        return a.name.localeCompare(b.name);
      });
  }, [categories, search, filterType, sortBy]);

  // Statistics
  const totalCategories = categories.length;
  const categoriesWithCourses = categories.filter((c) => c._count.courses > 0).length;
  const totalCourses = categories.reduce((acc, c) => acc + c._count.courses, 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-warm-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-stone-800">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Manajemen Kategori Kelas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              CRUD Dinamis
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Kelola kategori secara dinamis untuk mega-dropdown navbar, filter katalog program, dan relasi kelas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Kategori</span>
          <p className="text-2xl font-black text-stone-900 mt-2">{totalCategories}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Disediakan di navbar dan pencarian</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Kategori Aktif</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">{categoriesWithCourses}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Memiliki minimal 1 kelas aktif</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Kelas Terkait</span>
          <p className="text-2xl font-black text-purple-700 mt-2">{totalCourses}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Terdistribusi di semua kategori</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200/60 flex-1 max-w-md">
          <Search size={15} className="text-stone-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, nama Inggris, atau slug..."
            className="flex-1 text-xs bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "ALL" | "WITH_COURSES" | "EMPTY")}
            className="text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200/70 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Kategori ({totalCategories})</option>
            <option value="WITH_COURSES">Ada Kelas ({categoriesWithCourses})</option>
            <option value="EMPTY">Belum Ada Kelas ({totalCategories - categoriesWithCourses})</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name_asc" | "name_desc" | "courses_desc")}
            className="text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200/70 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="name_asc">Urut: Nama (A-Z)</option>
            <option value="name_desc">Urut: Nama (Z-A)</option>
            <option value="courses_desc">Urut: Kelas Terbanyak</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <FolderTree size={24} />
            </div>
            <h3 className="text-sm font-bold text-stone-800">Tidak ada kategori ditemukan</h3>
            <p className="text-xs text-stone-500 mt-1">
              {search
                ? `Tidak ada kategori yang cocok dengan pencarian "${search}".`
                : "Belum ada kategori yang dibuat. Klik tombol di bawah untuk menambahkan."}
            </p>
            {search ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch("")}
                className="mt-4 text-xs font-semibold"
              >
                Reset Pencarian
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="mt-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={14} className="mr-1.5" />
                Tambah Kategori Sekarang
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/70 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Kategori (ID / EN)</th>
                  <th className="py-3 px-4">Slug URL</th>
                  <th className="py-3 px-4">Jumlah Kelas</th>
                  <th className="py-3 px-4">Pratinjau Navigasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Category Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                            {cat.name}
                          </span>
                          {cat.icon && (
                            <span className="text-xs" title={`Emoji: ${cat.icon}`}>
                              {cat.icon}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                          <span className="font-medium text-stone-400">EN:</span>
                          <span>{cat.nameEn || cat.name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200/60">
                          {cat.slug}
                        </span>
                        <button
                          onClick={() => handleCopySlug(cat.name)}
                          title="Salin parameter link kategori"
                          className="text-stone-400 hover:text-blue-600 p-1 rounded-md transition-colors"
                        >
                          {copiedSlug === cat.name ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Courses Count */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses?category=${encodeURIComponent(cat.name)}`}
                          target="_blank"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            cat._count.courses > 0
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
                              : "bg-stone-100 text-stone-500 border border-stone-200/50"
                          }`}
                        >
                          <BookOpen size={12} />
                          <span>{cat._count.courses} Kelas</span>
                        </Link>
                      </div>
                    </td>

                    {/* Link Preview */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/courses?category=${encodeURIComponent(cat.name)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-blue-600 transition-colors group-hover:underline"
                      >
                        <span>Lihat di Katalog</span>
                        <ExternalLink size={11} />
                      </Link>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(cat);
                            setDeleteError("");
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            cat._count.courses > 0
                              ? "text-stone-300 hover:text-amber-600 hover:bg-amber-50"
                              : "text-stone-500 hover:text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            cat._count.courses > 0
                              ? "Kategori ini masih digunakan oleh kelas"
                              : "Hapus Kategori"
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL TAMBAH / EDIT KATEGORI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-warm-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                  <FolderTree size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {editingCategory ? "Edit Kategori Kelas" : "Tambah Kategori Baru"}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {editingCategory
                      ? `Perbarui informasi kategori "${editingCategory.name}"`
                      : "Kategori baru akan langsung tampil di navbar dan filter katalog."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Nama Kategori (ID) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nama Kategori (Bahasa Indonesia) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Kecerdasan Buatan & Robotika"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-stone-900"
                />
              </div>

              {/* Nama Kategori (EN) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Nama Kategori (English)
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalNameEn(modalName)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Samakan dengan ID
                  </button>
                </div>
                <input
                  type="text"
                  value={modalNameEn}
                  onChange={(e) => setModalNameEn(e.target.value)}
                  placeholder="Contoh: Artificial Intelligence & Robotics"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-stone-900"
                />
              </div>

              {/* Slug URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Slug URL <span className="text-stone-400 font-normal">(identifier unik)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-stone-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => {
                        setAutoSlug(e.target.checked);
                        if (e.target.checked && modalName) {
                          setModalSlug(slugify(modalName));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Otomatis dari nama</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={modalSlug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setModalSlug(slugify(e.target.value));
                    }}
                    placeholder="contoh-kategori"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-stone-800"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Preview URL: <span className="font-mono text-stone-600">/courses?category={encodeURIComponent(modalName || "...")}</span>
                </p>
              </div>

              {/* Optional Icon / Emoji */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Icon Emoji <span className="text-stone-400 font-normal">(opsional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={modalIcon}
                    onChange={(e) => setModalIcon(e.target.value)}
                    placeholder="💡"
                    maxLength={4}
                    className="w-16 text-center text-base px-2 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-stone-500">
                    Emoji simbol pengenal (contoh: 💻, 📊, 🤖, 🎨, 📱)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin mr-1.5" />
                      Menyimpan...
                    </>
                  ) : editingCategory ? (
                    "Simpan Perubahan"
                  ) : (
                    "Buat Kategori"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-warm-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 p-6">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={22} />
            </div>

            <h3 className="text-base font-bold text-stone-900">
              Hapus Kategori &ldquo;{deleteTarget.name}&rdquo;?
            </h3>

            {deleteTarget._count.courses > 0 ? (
              <div className="mt-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>Tidak Dapat Dihapus Langsung</span>
                </div>
                <p>
                  Kategori ini masih menampung <strong>{deleteTarget._count.courses} kelas aktif</strong>. Silakan buka Manajemen Kelas dan ubah kategori kelas terkait terlebih dahulu sebelum menghapus kategori ini.
                </p>
              </div>
            ) : (
              <p className="text-xs text-stone-500 mt-2">
                Tindakan ini tidak dapat dibatalkan. Kategori ini akan dihapus secara permanen dari sistem dan tidak lagi muncul di navbar atau katalog.
              </p>
            )}

            {deleteError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="text-xs font-semibold"
              >
                {deleteTarget._count.courses > 0 ? "Tutup" : "Batal"}
              </Button>

              {deleteTarget._count.courses === 0 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin mr-1.5" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus Kategori"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
