"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Upload,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  FileText,
  Clock,
  Eye,
  Edit3,
  Plus,
  AlertCircle,
  Check,
  Loader2,
  ExternalLink,
  Users,
  UserPlus,
} from "lucide-react";
import { slugify } from "@/lib/utils";
import { dynamicAlert } from "@/components/ui/dynamic-alert-provider";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

export interface PublicationFormData {
  id?: string;
  slug: string;
  type: "PUBLICATION" | "RESEARCH";
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  contentId: string;
  contentEn: string;
  abstractId: string;
  abstractEn: string;
  categoryId: string;
  categoryEn: string;
  author: string;
  authorRole: string;
  authorBioId: string;
  authorBioEn: string;
  authors?: Array<{ id?: string; name: string; role?: string; bio?: string }>;
  coverImage: string | null;
  publishedAt: string;
  tags: string[];
  references: Array<{ id: string; citation: string; link?: string }>;
  published: boolean;
  featured: boolean;
}

interface PublicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (item: any) => void;
  initialData?: PublicationFormData | null;
  availableCategories: Array<{ id: string; name: string; nameEn?: string }>;
}

const DEFAULT_CATEGORIES = [
  "Decision Science",
  "Digital Transformation",
  "Web Engineering",
  "Certification",
  "Manajemen Strategis",
  "Inovasi & Design Thinking",
  "Keamanan Siber & API",
  "Ekonomi & UMKM",
];

export function PublicationFormModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
  availableCategories,
}: PublicationFormModalProps) {
  const isEditing = Boolean(initialData?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active form tab: "id" (Indonesian) or "en" (English)
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [showPreview, setShowPreview] = useState(false);

  // Form Fields
  const [type, setType] = useState<"PUBLICATION" | "RESEARCH">("PUBLICATION");
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustom, setIsSlugCustom] = useState(false);

  const [excerptId, setExcerptId] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [abstractId, setAbstractId] = useState("");
  const [abstractEn, setAbstractEn] = useState("");
  const [contentId, setContentId] = useState("");
  const [contentEn, setContentEn] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [author, setAuthor] = useState("Dr. G. Prabantoro, SE., MM., CBec.");
  const [authorRole, setAuthorRole] = useState("RnD Director PT. Matoh Technologies Indonesia");
  const [authorBioId, setAuthorBioId] = useState("");
  const [authorBioEn, setAuthorBioEn] = useState("");

  // Multi-authors (Co-Authors)
  const [coAuthors, setCoAuthors] = useState<Array<{ id: string; name: string; role: string; bio?: string }>>([]);

  const compositeAuthorPreview = useMemo(() => {
    const names = [author.trim(), ...coAuthors.map((c) => c.name.trim())].filter(Boolean);
    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
  }, [author, coAuthors]);

  const handleAddCoAuthor = () => {
    setCoAuthors([
      ...coAuthors,
      {
        id: `coauthor-${Date.now()}`,
        name: "",
        role: "",
        bio: "",
      },
    ]);
  };

  const handleRemoveCoAuthor = (id: string) => {
    setCoAuthors(coAuthors.filter((c) => c.id !== id));
  };

  const handleUpdateCoAuthor = (id: string, field: "name" | "role" | "bio", val: string) => {
    setCoAuthors(coAuthors.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string>("");
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Dynamic tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // References
  const [references, setReferences] = useState<Array<{ id: string; citation: string; link?: string }>>([]);
  const [newCitation, setNewCitation] = useState("");
  const [newCitationLink, setNewCitationLink] = useState("");

  // Submission & loading state
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Populate data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || "PUBLICATION");
        setTitleId(initialData.titleId || "");
        setTitleEn(initialData.titleEn || "");
        setSlug(initialData.slug || "");
        setIsSlugCustom(true);
        setExcerptId(initialData.excerptId || "");
        setExcerptEn(initialData.excerptEn || "");
        setAbstractId(initialData.abstractId || "");
        setAbstractEn(initialData.abstractEn || "");
        setContentId(initialData.contentId || "");
        setContentEn(initialData.contentEn || "");

        const cat = initialData.categoryId || "";
        if (DEFAULT_CATEGORIES.includes(cat) || availableCategories.some((c) => c.name === cat)) {
          setCategoryId(cat);
          setCustomCategory("");
        } else {
          setCategoryId("__CUSTOM__");
          setCustomCategory(cat);
        }

        if (initialData.authors && Array.isArray(initialData.authors) && initialData.authors.length > 0) {
          const [first, ...rest] = initialData.authors;
          setAuthor(first.name || initialData.author || "Dr. G. Prabantoro, SE., MM., CBec.");
          setAuthorRole(first.role || initialData.authorRole || "RnD Director PT. Matoh Technologies Indonesia");
          setAuthorBioId(first.bio || initialData.authorBioId || "");
          setCoAuthors(
            rest.map((c, idx) => ({
              id: c.id || `coauthor-${idx}-${Date.now()}`,
              name: c.name || "",
              role: c.role || "",
              bio: c.bio || "",
            }))
          );
        } else {
          setAuthor(initialData.author || "Dr. G. Prabantoro, SE., MM., CBec.");
          setAuthorRole(initialData.authorRole || "RnD Director PT. Matoh Technologies Indonesia");
          setAuthorBioId(initialData.authorBioId || "");
          setAuthorBioEn(initialData.authorBioEn || "");
          setCoAuthors([]);
        }
        setCoverImage(initialData.coverImage || null);
        setPublishedAt(
          initialData.publishedAt ? new Date(initialData.publishedAt).toISOString().split("T")[0] : ""
        );
        setPublished(initialData.published ?? true);
        setFeatured(initialData.featured ?? false);
        setTags(Array.isArray(initialData.tags) ? initialData.tags : []);
        setReferences(Array.isArray(initialData.references) ? initialData.references : []);
      } else {
        // Reset to fresh defaults
        setType("PUBLICATION");
        setTitleId("");
        setTitleEn("");
        setSlug("");
        setIsSlugCustom(false);
        setExcerptId("");
        setExcerptEn("");
        setAbstractId("");
        setAbstractEn("");
        setContentId("");
        setContentEn("");
        setCategoryId(DEFAULT_CATEGORIES[0]);
        setCustomCategory("");
        setAuthor("Dr. G. Prabantoro, SE., MM., CBec.");
        setAuthorRole("RnD Director PT. Matoh Technologies Indonesia");
        setAuthorBioId("");
        setAuthorBioEn("");
        setCoAuthors([]);
        setCoverImage(null);
        setPublishedAt(new Date().toISOString().split("T")[0]);
        setPublished(true);
        setFeatured(false);
        setTags(["AHP", "ISM", "Decision Science"]);
        setReferences([]);
      }
      setActiveTab("id");
      setShowPreview(false);
      setErrorMessage("");
    }
  }, [isOpen, initialData, availableCategories]);

  // Auto generate slug from titleId if not customized
  useEffect(() => {
    if (!isSlugCustom && !isEditing && titleId) {
      setSlug(slugify(titleId));
    }
  }, [titleId, isSlugCustom, isEditing]);

  if (!isOpen) return null;

  // Add tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Add reference
  const handleAddReference = () => {
    if (!newCitation.trim()) return;
    const newRef = {
      id: `ref-${Date.now()}`,
      citation: newCitation.trim(),
      link: newCitationLink.trim() || undefined,
    };
    setReferences([...references, newRef]);
    setNewCitation("");
    setNewCitationLink("");
  };

  const handleRemoveReference = (refId: string) => {
    setReferences(references.filter((r) => r.id !== refId));
  };

  // Handle local cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dynamicAlert({
        title: "Format Tidak Didukung",
        message: "Silakan pilih file gambar (JPG, PNG, atau WebP).",
        variant: "danger",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      dynamicAlert({
        title: "File Terlalu Besar",
        message: "Ukuran gambar maksimal adalah 10MB.",
        variant: "danger",
      });
      return;
    }

    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "publications");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }

      setCoverImage(data.url);
      dynamicAlert({
        title: "Foto Berhasil Diunggah",
        message: "Cover artikel berhasil disimpan.",
        variant: "success",
      });
    } catch (err: any) {
      dynamicAlert({
        title: "Unggah Gagal",
        message: err.message || "Terjadi kesalahan saat mengunggah foto.",
        variant: "danger",
      });
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const resolvedCategory = categoryId === "__CUSTOM__" ? customCategory.trim() : categoryId.trim();

    if (!titleId.trim()) {
      setErrorMessage("Judul artikel (Bahasa Indonesia) wajib diisi.");
      setActiveTab("id");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug artikel wajib diisi.");
      return;
    }
    if (!excerptId.trim()) {
      setErrorMessage("Ringkasan artikel (Excerpt) wajib diisi.");
      setActiveTab("id");
      return;
    }
    if (!contentId.trim()) {
      setErrorMessage("Konten artikel (Bahasa Indonesia) wajib diisi.");
      setActiveTab("id");
      return;
    }
    if (!resolvedCategory) {
      setErrorMessage("Kategori artikel wajib dipilih atau diisi.");
      return;
    }
    if (!author.trim()) {
      setErrorMessage("Nama penulis wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);

      const allAuthors = [
        { name: author.trim(), role: authorRole.trim(), bio: authorBioId.trim() },
        ...coAuthors
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            role: c.role.trim() || undefined,
            bio: c.bio?.trim() || undefined,
          })),
      ];

      let compositeAuthor = author.trim();
      const allNames = allAuthors.map((a) => a.name);
      if (allNames.length === 2) {
        compositeAuthor = `${allNames[0]} & ${allNames[1]}`;
      } else if (allNames.length > 2) {
        compositeAuthor = `${allNames.slice(0, -1).join(", ")}, & ${allNames[allNames.length - 1]}`;
      }

      const payload = {
        type,
        titleId: titleId.trim(),
        titleEn: titleEn.trim() || null,
        slug: slug.trim(),
        excerptId: excerptId.trim(),
        excerptEn: excerptEn.trim() || null,
        abstractId: abstractId.trim() || null,
        abstractEn: abstractEn.trim() || null,
        contentId: contentId.trim(),
        contentEn: contentEn.trim() || null,
        categoryId: resolvedCategory,
        categoryEn: resolvedCategory,
        author: compositeAuthor,
        authorRole: authorRole.trim() || null,
        authorBioId: authorBioId.trim() || null,
        authorBioEn: authorBioEn.trim() || null,
        authors: allAuthors,
        coverImage: coverImage || null,
        publishedAt: publishedAt || new Date().toISOString(),
        tags,
        references,
        published,
        featured,
      };

      const url = isEditing
        ? `/api/admin/publications/${initialData?.id}`
        : "/api/admin/publications";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan konten");
      }

      dynamicAlert({
        title: isEditing ? "Perubahan Disimpan" : "Konten Berhasil Dibuat",
        message: `Konten "${payload.titleId}" telah berhasil ${isEditing ? "diperbarui" : "diterbitkan"}.`,
        variant: "success",
      });

      onSaved(data.publication);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan konten.");
    } finally {
      setSubmitting(false);
    }
  };

  // Word count estimate
  const currentWordCount = (contentId || "").trim().split(/\s+/).filter(Boolean).length;
  const currentReadTime = Math.max(1, Math.ceil(currentWordCount / 200));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Sticky Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              {type === "RESEARCH" ? <BookOpen size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {isEditing ? "Edit Riset & Publikasi" : "Buat Riset & Publikasi Baru"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {type === "RESEARCH"
                  ? "Metodologi riset terapan (AHP, ISM, sains keputusan)"
                  : "Artikel ilmiah, studi kasus, dan arsitektur teknologi"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs sm:text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Content Type & Basic Identifier */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Tipe Konten
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setType("PUBLICATION")}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    type === "PUBLICATION"
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={16} className={type === "PUBLICATION" ? "text-blue-600" : "text-slate-400"} />
                  <span>Publikasi Artikel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("RESEARCH")}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    type === "RESEARCH"
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <BookOpen size={16} className={type === "RESEARCH" ? "text-blue-600" : "text-slate-400"} />
                  <span>Riset &amp; Metodologi</span>
                </button>
              </div>
            </div>

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Utama (Bahasa Indonesia) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  placeholder="Contoh: Penerapan Metodologi AHP dan ISM dalam Digitalisasi..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Slug URL <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSlugCustom(!isSlugCustom)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Edit3 size={11} />
                    <span>{isSlugCustom ? "Auto-Generate" : "Kustomisasi"}</span>
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  <span className="px-3 py-2.5 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 font-mono select-none">
                    /publikasi/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsSlugCustom(true);
                    }}
                    placeholder="slug-publikasi-anda"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Language Tabs (ID vs EN) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 pt-2 bg-slate-100/70">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("id")}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === "id"
                      ? "border-blue-600 bg-white text-blue-900 shadow-2xs"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>🇮🇩 Bahasa Indonesia (Wajib)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === "en"
                      ? "border-blue-600 bg-white text-blue-900 shadow-2xs"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>🇬🇧 English Version (Opsional)</span>
                </button>
              </div>

              {/* Markdown Preview Button */}
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  showPreview
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Eye size={13} />
                <span>{showPreview ? "Kembali Edit" : "Pratinjau Markdown"}</span>
              </button>
            </div>

            <div className="p-4 space-y-4 bg-white">
              {activeTab === "id" ? (
                <>
                  {/* Excerpt ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ringkasan Singkat (Excerpt) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={excerptId}
                      onChange={(e) => setExcerptId(e.target.value)}
                      placeholder="Ringkasan 1-2 kalimat pengantar yang akan tampil pada kartu katalog..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
                    />
                  </div>

                  {/* Abstract ID (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Abstrak Ilmiah (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={abstractId}
                      onChange={(e) => setAbstractId(e.target.value)}
                      placeholder="Abstrak formal untuk riset terapan atau artikel ilmiah..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
                    />
                  </div>

                  {/* Content ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Isi Konten Artikel (Markdown) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={11} />
                        {currentWordCount} kata (~{currentReadTime} menit baca)
                      </span>
                    </div>

                    {showPreview ? (
                      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[300px] max-h-[450px] overflow-y-auto">
                        <MarkdownRenderer content={contentId || "*Belum ada konten untuk ditampilkan.*"} />
                      </div>
                    ) : (
                      <textarea
                        rows={12}
                        value={contentId}
                        onChange={(e) => setContentId(e.target.value)}
                        placeholder="Tulis artikel dengan format Markdown (Gunakan ## untuk subjudul, list, kode, atau kutipan)..."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 leading-relaxed"
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Title EN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Title in English
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g. Applying AHP and ISM Methodologies to Prioritize..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
                    />
                  </div>

                  {/* Excerpt EN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Excerpt (English)
                    </label>
                    <textarea
                      rows={2}
                      value={excerptEn}
                      onChange={(e) => setExcerptEn(e.target.value)}
                      placeholder="1-2 sentences introduction for cards..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
                    />
                  </div>

                  {/* Abstract EN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Scientific Abstract (English)
                    </label>
                    <textarea
                      rows={3}
                      value={abstractEn}
                      onChange={(e) => setAbstractEn(e.target.value)}
                      placeholder="Formal abstract for international audiences..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
                    />
                  </div>

                  {/* Content EN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Content Body (English Markdown)
                    </label>
                    {showPreview ? (
                      <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[300px] max-h-[450px] overflow-y-auto">
                        <MarkdownRenderer content={contentEn || "*No English content written yet.*"} />
                      </div>
                    ) : (
                      <textarea
                        rows={12}
                        value={contentEn}
                        onChange={(e) => setContentEn(e.target.value)}
                        placeholder="Write English translation or body here..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 leading-relaxed"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Metadata, Author, Categories, Cover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 bg-white"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {availableCategories
                  .filter((c) => !DEFAULT_CATEGORIES.includes(c.name))
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                <option value="__CUSTOM__">+ Kategori Kustom...</option>
              </select>

              {categoryId === "__CUSTOM__" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ketik kategori baru..."
                  className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-hidden text-slate-900"
                />
              )}
            </div>

            {/* Published At Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Section: Authors & Research Team (Multi-Author Support) */}
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Penulis &amp; Tim Peneliti
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mendukung penulis tunggal maupun tim kolaborasi riset (co-authors).
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                {1 + coAuthors.length} Penulis
              </span>
            </div>

            {/* Penulis Utama (Lead Author) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  Penulis Utama (Lead Author)
                </span>
                <span className="text-[10px] text-slate-400">Penulis korespondensi / pertama</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Contoh: Dr. G. Prabantoro, SE., MM., CBec."
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:border-blue-600 outline-hidden text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Peran / Afiliasi Institusi
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="Contoh: RnD Director PT. Matoh Technologies Indonesia"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:border-blue-600 outline-hidden text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Co-Authors List */}
            {coAuthors.length > 0 && (
              <div className="space-y-3 pt-1">
                {coAuthors.map((co, idx) => (
                  <div
                    key={co.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 transition-all animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        Rekan Penulis #{idx + 1} (Co-Author)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoAuthor(co.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title="Hapus Rekan Penulis ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={co.name}
                          onChange={(e) => handleUpdateCoAuthor(co.id, "name", e.target.value)}
                          placeholder="Contoh: Ir. Agung Prasetyo, M.Cs."
                          required
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:border-blue-600 outline-hidden text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Peran / Afiliasi
                        </label>
                        <input
                          type="text"
                          value={co.role}
                          onChange={(e) => handleUpdateCoAuthor(co.id, "role", e.target.value)}
                          placeholder="Contoh: Co-Researcher / Universitas Indonesia"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:border-blue-600 outline-hidden text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Button + Tambah Rekan Penulis */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddCoAuthor}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 text-blue-700 text-xs font-semibold transition-all shadow-2xs"
              >
                <UserPlus size={14} />
                <span>+ Tambah Rekan Penulis (Co-Author)</span>
              </button>

              {coAuthors.length > 0 && (
                <span className="text-[11px] text-slate-500 italic truncate max-w-md">
                  Format gabungan: <strong className="text-slate-700">{compositeAuthorPreview}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Cover Image Upload & Preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Gambar Sampul / Banner Cover (Opsional)
              </label>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                >
                  <Trash2 size={12} />
                  <span>Hapus Cover</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {coverImage ? (
                <div className="w-full sm:w-48 h-28 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 relative group shadow-2xs">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full sm:w-48 h-28 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-xs shrink-0 p-2 text-center">
                  <FileText size={22} className="mb-1 text-slate-300" />
                  <span>Belum ada cover</span>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    {uploadingCover ? (
                      <Loader2 size={13} className="animate-spin text-blue-600" />
                    ) : (
                      <Upload size={13} className="text-blue-600" />
                    )}
                    <span>{uploadingCover ? "Mengunggah..." : "Unggah dari Perangkat"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">atau Link URL:</span>
                  <input
                    type="url"
                    value={coverImage || ""}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tag / Kata Kunci
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-red-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ketik tag lalu tekan Enter..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-hidden focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl shrink-0"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* References & Citations */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Referensi Sitasi &amp; Daftar Pustaka (Opsional)
              </label>
              <span className="text-[11px] text-slate-400">{references.length} referensi terdaftar</span>
            </div>

            {references.length > 0 && (
              <div className="space-y-2">
                {references.map((ref, idx) => (
                  <div
                    key={ref.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="text-slate-800 font-medium leading-relaxed">
                        <span className="font-bold text-blue-700 mr-1.5">[{idx + 1}]</span>
                        {ref.citation}
                      </p>
                      {ref.link && (
                        <a
                          href={ref.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                        >
                          <ExternalLink size={10} />
                          <span className="truncate max-w-sm">{ref.link}</span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReference(ref.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <input
                type="text"
                value={newCitation}
                onChange={(e) => setNewCitation(e.target.value)}
                placeholder="Format sitasi (Contoh: Saaty, T. L. (2008). Decision making with the AHP...)"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-hidden text-slate-800 bg-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newCitationLink}
                  onChange={(e) => setNewCitationLink(e.target.value)}
                  placeholder="URL Tautan Referensi (opsional): https://doi.org/..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-hidden text-slate-800 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddReference}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 transition-colors"
                >
                  + Tambah Sitasi
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Publishing Toggles */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isPublished" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
                Terbitkan ke Publik Langsung
                <span className="block text-[11px] font-normal text-slate-500">
                  Jika tidak dicentang, konten akan tersimpan sebagai draf internal.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
                Tandai sebagai Unggulan (Featured)
                <span className="block text-[11px] font-normal text-slate-500">
                  Ditampilkan di halaman beranda.
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs sm:text-sm transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>{isEditing ? "Simpan Perubahan" : "Terbitkan Konten"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
