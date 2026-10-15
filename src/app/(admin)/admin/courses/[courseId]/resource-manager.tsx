"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderDown,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
  FileCode2,
  FileArchive,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  Search,
  Filter,
  Layers,
  Globe,
  Download,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dynamicConfirm } from "@/components/ui/dynamic-alert-provider";

export interface CourseResourceItem {
  id: string;
  courseId: string;
  sectionId?: string | null;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  type: string;
  createdAt?: string;
  section?: {
    id: string;
    title: string;
    order: number;
  } | null;
}

export interface SectionOption {
  id: string;
  title: string;
  order?: number;
}

interface ResourceManagerProps {
  courseId: string;
  sections?: SectionOption[];
}

export function ResourceManager({ courseId, sections = [] }: ResourceManagerProps) {
  const [resources, setResources] = useState<CourseResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & search
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CourseResourceItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [type, setType] = useState<string>("FILE");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/courses/${courseId}/resources`);
      if (!res.ok) throw new Error("Gagal mengambil bahan belajar");
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Handle direct file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "resources");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal mengunggah file");
      }

      const data = await res.json();
      setFileUrl(data.url);
      setFileName(file.name);
      setFileSize(file.size);

      // Auto-detect type based on extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        setType("ZIP");
      } else if (ext === "pdf") {
        setType("PDF");
      } else if (["ppt", "pptx"].includes(ext)) {
        setType("SLIDE");
      } else if (["mp4", "webm", "mkv"].includes(ext)) {
        setType("VIDEO");
      } else if (["js", "ts", "py", "html", "css", "json", "sql"].includes(ext)) {
        setType("GITHUB");
      } else {
        setType("FILE");
      }

      showNotification("success", `File "${file.name}" berhasil diunggah`);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Open Add Modal
  const handleOpenAddModal = (presetSectionId?: string) => {
    setEditingResource(null);
    setTitle("");
    setSectionId(presetSectionId !== undefined ? presetSectionId : selectedSectionFilter !== "ALL" && selectedSectionFilter !== "GENERAL" ? selectedSectionFilter : "");
    setType("FILE");
    setFileUrl("");
    setFileName("");
    setFileSize(null);
    setDescription("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: CourseResourceItem) => {
    setEditingResource(item);
    setTitle(item.title);
    setSectionId(item.sectionId || "");
    setType(item.type || "FILE");
    setFileUrl(item.fileUrl || "");
    setFileName(item.fileName || "");
    setFileSize(item.fileSize ?? null);
    setDescription(item.description || "");
    setIsModalOpen(true);
  };

  // Save handler (Add / Edit)
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      showNotification("error", "Judul dan URL file wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        sectionId: sectionId.trim() || null,
        type: type.toUpperCase(),
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim() || null,
        fileSize: fileSize || null,
        description: description.trim() || null,
      };

      if (editingResource) {
        // Edit existing
        const res = await fetch(`/api/courses/${courseId}/resources/${editingResource.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Gagal memperbarui bahan ajar");
        }

        const { resource: updatedResource } = await res.json();
        setResources((prev) =>
          prev.map((r) => (r.id === editingResource.id ? updatedResource : r))
        );
        showNotification("success", "Bahan ajar berhasil diperbarui");
      } else {
        // Create new
        const res = await fetch(`/api/courses/${courseId}/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Gagal menambahkan bahan ajar");
        }

        const { resource: newResource } = await res.json();
        setResources((prev) => [newResource, ...prev]);
        showNotification("success", "Bahan ajar berhasil ditambahkan");
      }

      setIsModalOpen(false);
      setEditingResource(null);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menyimpan bahan ajar");
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const handleDeleteResource = async (id: string, itemTitle: string) => {
    const confirmed = await dynamicConfirm({
      title: "Hapus Bahan Ajar?",
      message: `Hapus bahan ajar "${itemTitle}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/resources/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus bahan ajar");
      setResources((prev) => prev.filter((r) => r.id !== id));
      showNotification("success", `Bahan ajar "${itemTitle}" berhasil dihapus`);
    } catch (err: unknown) {
      showNotification("error", err instanceof Error ? err.message : "Gagal menghapus bahan ajar");
    }
  };

  // Format bytes
  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return null;
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filtered list
  const filteredResources = resources.filter((item) => {
    // Section match
    if (selectedSectionFilter === "GENERAL") {
      if (item.sectionId) return false;
    } else if (selectedSectionFilter !== "ALL") {
      if (item.sectionId !== selectedSectionFilter) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchFile = item.fileName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchFile) return false;
    }

    return true;
  });

  const getTypeBadge = (resourceType: string) => {
    const t = resourceType.toUpperCase();
    switch (t) {
      case "PDF":
        return {
          label: "PDF E-Book",
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: <FileText size={13} className="text-red-500" />,
        };
      case "ZIP":
        return {
          label: "ZIP Starter Files",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <FileArchive size={13} className="text-amber-500" />,
        };
      case "GITHUB":
        return {
          label: "GitHub Repo",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <FileCode2 size={13} className="text-purple-500" />,
        };
      case "FIGMA":
        return {
          label: "Figma UI/UX",
          bg: "bg-pink-50 text-pink-700 border-pink-200",
          icon: <Layers size={13} className="text-pink-500" />,
        };
      case "SLIDE":
        return {
          label: "Slide Presentasi",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <FileText size={13} className="text-blue-500" />,
        };
      case "VIDEO":
        return {
          label: "Video Pendukung",
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: <FileText size={13} className="text-sky-500" />,
        };
      case "LINK":
        return {
          label: "Tautan Web",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <LinkIcon size={13} className="text-emerald-500" />,
        };
      default:
        return {
          label: "File Berkas",
          bg: "bg-stone-100 text-stone-700 border-stone-200",
          icon: <FolderDown size={13} className="text-stone-500" />,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-stone-200">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-stone-500 font-medium">Memuat bahan ajar kelas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FolderDown size={18} className="text-blue-600" />
            Manajemen Bahan Belajar & Sumber Daya
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Unggah file materi, source code, slide, atau template per-chapter maupun untuk keseluruhan kelas.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          leftIcon={<Plus size={16} />}
        >
          Tambah Bahan Belajar
        </Button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari judul bahan ajar atau nama file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Section / Chapter Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-stone-400 shrink-0" />
          <span className="text-xs font-semibold text-stone-600 shrink-0">Filter Chapter:</span>
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">Semua Bahan Ajar ({resources.length})</option>
            <option value="GENERAL">
              🌐 Umum / Semua Chapter ({resources.filter((r) => !r.sectionId).length})
            </option>
            {sections.map((s, idx) => {
              const count = resources.filter((r) => r.sectionId === s.id).length;
              return (
                <option key={s.id} value={s.id}>
                  📁 Bab {idx + 1}: {s.title} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FolderDown size={28} />
          </div>
          <h3 className="text-sm font-bold text-stone-900 mb-1">
            {resources.length === 0 ? "Belum Ada Bahan Belajar" : "Tidak Ada Bahan Belajar yang Sesuai Filter"}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            {resources.length === 0
              ? "Tambahkan file starter pack, modul PDF, repositori koding, atau slide materi untuk mempermudah siswa belajar."
              : "Coba ubah kata kunci pencarian atau ganti filter chapter di atas."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenAddModal()}
            leftIcon={<Plus size={14} />}
          >
            Tambah Bahan Belajar Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((item) => {
            const badge = getTypeBadge(item.type);
            const sectionTarget = item.sectionId
              ? sections.find((s) => s.id === item.sectionId) || item.section
              : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-warm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badge.bg}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>

                    {/* Chapter Scope Badge */}
                    {sectionTarget ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 max-w-[170px] truncate"
                        title={`Khusus Chapter: ${sectionTarget.title}`}
                      >
                        <Layers size={11} className="shrink-0" />
                        <span className="truncate">{sectionTarget.title}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Globe size={11} />
                        Semua Chapter
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* File Metadata */}
                  {(item.fileName || item.fileSize) && (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span className="truncate max-w-[180px]" title={item.fileName || ""}>
                        {item.fileName || "Tautan Terlampir"}
                      </span>
                      {item.fileSize && <span>{formatBytes(item.fileSize)}</span>}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors truncate"
                  >
                    <Download size={13} />
                    <span>Akses File</span>
                    <ExternalLink size={11} className="opacity-60" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Bahan Ajar"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResource(item.id, item.title)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Bahan Ajar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Dialog: Tambah / Edit Bahan Ajar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {editingResource ? "Edit Bahan Belajar" : "Tambah Bahan Belajar Baru"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Hubungkan materi pendukung ke chapter tertentu atau sediakan untuk seluruh kelas.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {editingResource ? "Mode Edit" : "Bahan Baru"}
              </span>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4">
              {/* Judul Bahan Belajar */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Bahan Ajar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Source Code Proyek Toko Online (v1.0)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Target Chapter / Bab */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Chapter / Bab Pembelajaran
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">🌐 Semua Chapter (Bahan Belajar Umum / Keseluruhan Kelas)</option>
                  {sections.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      📁 Bab {idx + 1}: {s.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Pilih &ldquo;Semua Chapter&rdquo; jika file ini berlaku umum untuk seluruh kelas (misal: template Figma atau software requirements).
                </p>
              </div>

              {/* Tipe Bahan Ajar */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tipe / Format Bahan Ajar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "FILE", label: "File Berkas" },
                    { id: "PDF", label: "E-Book / PDF" },
                    { id: "ZIP", label: "ZIP / Kode" },
                    { id: "SLIDE", label: "Slide PPT" },
                    { id: "GITHUB", label: "GitHub" },
                    { id: "FIGMA", label: "Figma UI" },
                    { id: "LINK", label: "Link Web" },
                    { id: "VIDEO", label: "Video" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`text-[11px] font-semibold py-2 px-2.5 rounded-xl border text-center transition-all ${
                        type === t.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload File atau Input URL */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    File Dokumen / Tautan Berkas <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resource-upload-input"
                    />
                    <label
                      htmlFor="resource-upload-input"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold cursor-pointer hover:bg-stone-100 hover:text-stone-900 shadow-xs transition-colors ${
                        uploadingFile ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {uploadingFile ? (
                        <Loader2 size={13} className="animate-spin text-blue-600" />
                      ) : (
                        <Upload size={13} className="text-blue-600" />
                      )}
                      <span>{uploadingFile ? "Mengunggah..." : "Unggah File Lokal"}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="https://... atau /uploads/..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Bisa berupa hasil unggahan file lokal di atas atau link eksternal (Google Drive, GitHub repo, Figma link).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-0.5">
                      Nama File (opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="contoh.pdf / starter.zip"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-0.5">
                      Ukuran File (bytes/opsional)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 1048576"
                      value={fileSize || ""}
                      onChange={(e) => setFileSize(Number(e.target.value) || null)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Deskripsi Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi / Petunjuk Penggunaan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk siswa mengenai cara membuka file atau menggunakan materi ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingResource(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingResource ? "Simpan Perubahan" : "Tambahkan Bahan Ajar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
