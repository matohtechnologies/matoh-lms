"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  Eye,
  AlertTriangle,
  Loader2,
  Filter,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { PublicationFormModal, type PublicationFormData } from "./publication-form-modal";
import { dynamicAlert } from "@/components/ui/dynamic-alert-provider";

export interface PublicationItemAdmin {
  id: string;
  slug: string;
  type: "PUBLICATION" | "RESEARCH";
  titleId: string;
  titleEn?: string | null;
  excerptId: string;
  excerptEn?: string | null;
  contentId: string;
  contentEn?: string | null;
  abstractId?: string | null;
  abstractEn?: string | null;
  categoryId: string;
  categoryEn?: string | null;
  author: string;
  authorRole?: string | null;
  authorBioId?: string | null;
  authorBioEn?: string | null;
  authors?: Array<{ id?: string; name: string; role?: string; bio?: string }>;
  coverImage?: string | null;
  publishedAt: string | Date;
  dateId?: string | null;
  dateEn?: string | null;
  readTimeId?: string | null;
  readTimeEn?: string | null;
  tags: string[];
  references?: Array<{ id: string; citation: string; link?: string }> | any;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface PublicationManagerProps {
  initialPublications: PublicationItemAdmin[];
  initialCategories: Array<{ id: string; name: string; nameEn?: string }>;
}

export function PublicationManager({
  initialPublications,
  initialCategories,
}: PublicationManagerProps) {
  const [publications, setPublications] = useState<PublicationItemAdmin[]>(initialPublications);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "PUBLICATION" | "RESEARCH">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PublicationFormData | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<PublicationItemAdmin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle Loading tracker (by id)
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Computed Stats
  const stats = useMemo(() => {
    const total = publications.length;
    const pubCount = publications.filter((p) => p.type === "PUBLICATION").length;
    const resCount = publications.filter((p) => p.type === "RESEARCH").length;
    const publishedCount = publications.filter((p) => p.published).length;
    const draftCount = publications.filter((p) => !p.published).length;
    const totalViews = publications.reduce((acc, p) => acc + (p.views || 0), 0);

    return { total, pubCount, resCount, publishedCount, draftCount, totalViews };
  }, [publications]);

  // Filtered List
  const filteredList = useMemo(() => {
    return publications.filter((item) => {
      // Type filter
      if (selectedType !== "ALL" && item.type !== selectedType) return false;

      // Status filter
      if (selectedStatus === "PUBLISHED" && !item.published) return false;
      if (selectedStatus === "DRAFT" && item.published) return false;

      // Category filter
      if (selectedCategory !== "ALL" && item.categoryId !== selectedCategory) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = item.titleId.toLowerCase().includes(query) || (item.titleEn?.toLowerCase().includes(query) ?? false);
        const matchAuthor = item.author.toLowerCase().includes(query);
        const matchCategory = item.categoryId.toLowerCase().includes(query);
        const matchSlug = item.slug.toLowerCase().includes(query);
        const matchTags = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(query));

        if (!matchTitle && !matchAuthor && !matchCategory && !matchSlug && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [publications, search, selectedType, selectedStatus, selectedCategory]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PublicationItemAdmin) => {
    setEditingItem({
      id: item.id,
      slug: item.slug,
      type: item.type,
      titleId: item.titleId,
      titleEn: item.titleEn || "",
      excerptId: item.excerptId,
      excerptEn: item.excerptEn || "",
      contentId: item.contentId,
      contentEn: item.contentEn || "",
      abstractId: item.abstractId || "",
      abstractEn: item.abstractEn || "",
      categoryId: item.categoryId,
      categoryEn: item.categoryEn || item.categoryId,
      author: item.author,
      authorRole: item.authorRole || "",
      authorBioId: item.authorBioId || "",
      authorBioEn: item.authorBioEn || "",
      authors: Array.isArray(item.authors) ? item.authors : [],
      coverImage: item.coverImage || null,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split("T")[0] : "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      references: Array.isArray(item.references) ? item.references : [],
      published: item.published,
      featured: item.featured,
    });
    setIsModalOpen(true);
  };

  // Handle saved callback (create or edit)
  const handleSaved = (savedItem: PublicationItemAdmin) => {
    setPublications((prev) => {
      const idx = prev.findIndex((p) => p.id === savedItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedItem;
        return copy;
      }
      return [savedItem, ...prev];
    });
  };

  // Toggle publish status (1 click)
  const handleTogglePublish = async (item: PublicationItemAdmin) => {
    try {
      setTogglingId(item.id);
      const newStatus = !item.published;
      const res = await fetch(`/api/admin/publications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status publikasi");

      setPublications((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, published: newStatus } : p))
      );

      dynamicAlert({
        title: newStatus ? "Artikel Dipublikasikan" : "Artikel Dijadikan Draf",
        message: `Status artikel "${item.titleId}" berhasil diubah menjadi ${newStatus ? "Terbit" : "Draf"}.`,
        variant: "success",
      });
    } catch (err: any) {
      dynamicAlert({
        title: "Gagal Mengubah Status",
        message: err.message || "Terjadi kesalahan sistem.",
        variant: "danger",
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Toggle featured status (1 click)
  const handleToggleFeatured = async (item: PublicationItemAdmin) => {
    try {
      setTogglingId(item.id);
      const newFeatured = !item.featured;
      const res = await fetch(`/api/admin/publications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status unggulan");

      setPublications((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, featured: newFeatured } : p))
      );

      dynamicAlert({
        title: newFeatured ? "Ditandai Unggulan" : "Unggulan Dibatalkan",
        message: `Artikel "${item.titleId}" ${newFeatured ? "kini tampil di beranda unggulan" : "tidak lagi berstatus unggulan"}.`,
        variant: "success",
      });
    } catch (err: any) {
      dynamicAlert({
        title: "Gagal Mengubah Status",
        message: err.message || "Terjadi kesalahan sistem.",
        variant: "danger",
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Execute delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/publications/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus konten");

      setPublications((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      dynamicAlert({
        title: "Konten Dihapus",
        message: `Konten "${deleteTarget.titleId}" telah berhasil dihapus.`,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (err: any) {
      dynamicAlert({
        title: "Hapus Gagal",
        message: err.message || "Terjadi kesalahan saat menghapus konten.",
        variant: "danger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen size={18} />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Riset &amp; Publikasi
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Kelola metodologi riset terapan (AHP, ISM, sains keputusan), studi kasus industri, dan artikel publikasi resmi PT. Matoh Technologies Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs hover:shadow-sm"
            >
              <Plus size={16} />
              <span>Buat Konten Baru</span>
            </button>
          </div>
        </div>

        {/* Crisp Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Konten
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {stats.pubCount} Publikasi • {stats.resCount} Riset
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/70">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
              Riset (AHP &amp; ISM)
            </span>
            <span className="text-2xl font-extrabold text-blue-900 mt-1 block">
              {stats.resCount}
            </span>
            <span className="text-[11px] text-blue-600 mt-0.5 block">
              Sains keputusan terapan
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/70">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Dipublikasikan
            </span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">
              {stats.publishedCount}
            </span>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">
              Aktif di website publik
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100/70">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Draf Tersimpan
            </span>
            <span className="text-2xl font-extrabold text-amber-900 mt-1 block">
              {stats.draftCount}
            </span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">
              Belum tayang ke publik
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 w-fit">
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("PUBLICATION")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedType === "PUBLICATION"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={13} />
              <span>Publikasi ({stats.pubCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("RESEARCH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedType === "RESEARCH"
                  ? "bg-white text-blue-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen size={13} />
              <span>Riset ({stats.resCount})</span>
            </button>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Status:</span>
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === "ALL"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("PUBLISHED")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === "PUBLISHED"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Terbit ({stats.publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("DRAFT")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === "DRAFT"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Draf ({stats.draftCount})
            </button>
          </div>
        </div>

        {/* Search input & category filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan judul, nama penulis, kata kunci tag, atau slug..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-hidden focus:border-blue-600 text-slate-700 bg-white"
            >
              <option value="ALL">Semua Kategori</option>
              {initialCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: No Redundant Buttons, Transparent Actions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Tidak ada konten yang sesuai
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || selectedType !== "ALL" || selectedStatus !== "ALL" || selectedCategory !== "ALL"
                ? "Coba ubah kata kunci pencarian atau bersihkan filter yang aktif."
                : "Belum ada konten riset dan publikasi. Buat konten pertama Anda sekarang."}
            </p>
            {(search || selectedType !== "ALL" || selectedStatus !== "ALL" || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedType("ALL");
                  setSelectedStatus("ALL");
                  setSelectedCategory("ALL");
                }}
                className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Konten &amp; Penulis</th>
                  <th className="py-3.5 px-4">Tipe &amp; Kategori</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Unggulan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const isToggling = togglingId === item.id;
                  const displayDate = item.dateId || (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("id-ID") : "-");

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Column 1: Content details */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-start gap-3.5 max-w-xl">
                          {item.coverImage ? (
                            <div className="w-16 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-2xs mt-0.5">
                              <img
                                src={item.coverImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-12 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                              {item.type === "RESEARCH" ? (
                                <BookOpen size={16} className="text-blue-500" />
                              ) : (
                                <FileText size={16} className="text-slate-400" />
                              )}
                            </div>
                          )}

                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                              {item.titleId}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                              {item.excerptId}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                /{item.slug}
                              </span>
                              <span>•</span>
                              <span className="font-medium text-slate-600 truncate max-w-[150px]">
                                {item.author}
                              </span>
                              <span>•</span>
                              <span>{displayDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Type & Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div>
                            {item.type === "RESEARCH" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                <BookOpen size={12} />
                                <span>Riset Ilmiah</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <FileText size={12} />
                                <span>Publikasi</span>
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                              {item.categoryId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Status (Clickable Toggle) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          disabled={isToggling}
                          title="Klik untuk mengubah status Terbit / Draf"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs hover:opacity-85 ${
                            item.published
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.published ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          <span>{item.published ? "Terbit" : "Draf"}</span>
                        </button>
                      </td>

                      {/* Column 4: Featured (Clickable Star) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          disabled={isToggling}
                          title={item.featured ? "Klik untuk membatalkan unggulan" : "Klik untuk menandai unggulan di beranda"}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                            item.featured
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "text-slate-300 hover:text-amber-500 hover:bg-slate-50"
                          }`}
                        >
                          <Star
                            size={16}
                            className={item.featured ? "fill-amber-500 text-amber-500" : ""}
                          />
                        </button>
                      </td>

                      {/* Column 5: UNIFIED, NON-REDUNDANT ACTIONS */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Lihat di Tab Baru */}
                          <Link
                            href={`/publikasi/${item.slug}`}
                            target="_blank"
                            title="Buka halaman artikel publik"
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                          >
                            <ExternalLink size={15} />
                          </Link>

                          {/* 2. Edit Modal */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit konten ini"
                            className="p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* 3. Hapus */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Hapus konten ini"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Publication Form Modal (Create / Edit) */}
      <PublicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialData={editingItem}
        availableCategories={initialCategories}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Hapus Riset / Publikasi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus artikel:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 line-clamp-2">
                &ldquo;{deleteTarget.titleId}&rdquo;
              </div>
              <p className="text-[11px] text-red-600 pt-1">
                Tindakan ini tidak dapat dibatalkan. Tautan artikel ini tidak akan dapat diakses lagi oleh pengunjung.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Hapus Konten</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
