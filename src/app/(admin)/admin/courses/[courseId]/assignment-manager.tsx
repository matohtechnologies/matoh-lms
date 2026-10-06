"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileCode2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Check,
  User as UserIcon,
  Download,
  Paperclip,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserSubmission {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback?: string | null;
  score?: number | null;
  submittedAt: string;
  reviewedAt?: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface SectionOption {
  id: string;
  title: string;
  order: number;
}

interface Assignment {
  id: string;
  courseId: string;
  sectionId?: string | null;
  section?: {
    id: string;
    title: string;
    order: number;
  } | null;
  title: string;
  description: string;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: string;
  submissions?: UserSubmission[];
}

export function AssignmentManager({
  courseId,
  sections = [],
}: {
  courseId: string;
  sections?: SectionOption[];
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");

  // Create / Edit Assignment Modal
  const [isCreating, setIsCreating] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [attachedFileUrl, setAttachedFileUrl] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Review Submission Modal
  const [selectedSubmission, setSelectedSubmission] = useState<{
    assignmentId: string;
    submission: UserSubmission;
  } | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewFeedback, setReviewFeedback] = useState<string>("");
  const [savingReview, setSavingReview] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/courses/${courseId}/assignments`);
      if (!res.ok) throw new Error("Gagal mengambil data tugas");
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "assignments");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal mengunggah file");
      }

      const data = await res.json();
      setAttachedFileUrl(data.url);
      setAttachedFileName(data.fileName);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSavingAssignment(true);
      const res = await fetch(`/api/admin/courses/${courseId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          fileUrl: attachedFileUrl || undefined,
          fileName: attachedFileName || undefined,
          sectionId: sectionId || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal membuat tugas");
      }

      const { assignment } = await res.json();
      setAssignments((prev) => [...prev, { ...assignment, submissions: [] }]);
      setIsCreating(false);
      setTitle("");
      setDescription("");
      setSectionId("");
      setAttachedFileUrl("");
      setAttachedFileName("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal membuat tugas");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleOpenEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setSectionId(assignment.sectionId || "");
    setAttachedFileUrl(assignment.fileUrl || "");
    setAttachedFileName(assignment.fileName || "");
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !title.trim() || !description.trim()) return;

    try {
      setSavingAssignment(true);
      const res = await fetch(
        `/api/admin/courses/${courseId}/assignments/${editingAssignment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            fileUrl: attachedFileUrl || null,
            fileName: attachedFileName || null,
            sectionId: sectionId || null,
          }),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal memperbarui tugas");
      }

      const { assignment: updated } = await res.json();
      setAssignments((prev) =>
        prev.map((a) => (a.id === editingAssignment.id ? { ...a, ...updated } : a))
      );
      setEditingAssignment(null);
      setTitle("");
      setDescription("");
      setSectionId("");
      setAttachedFileUrl("");
      setAttachedFileName("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memperbarui tugas");
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string, assignmentTitle: string) => {
    if (!confirm(`Hapus tugas "${assignmentTitle}" beserta seluruh submission siswa?`)) return;

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/assignments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus tugas");
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus tugas");
    }
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setSavingReview(true);
      const res = await fetch(
        `/api/admin/courses/${courseId}/assignments/${selectedSubmission.assignmentId}/submissions/${selectedSubmission.submission.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: reviewStatus,
            score: Number(reviewScore),
            feedback: reviewFeedback.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Gagal menyimpan review");
      }

      const { submission: updated } = await res.json();

      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== selectedSubmission.assignmentId) return a;
          return {
            ...a,
            submissions: (a.submissions || []).map((s) =>
              s.id === updated.id ? { ...s, ...updated } : s
            ),
          };
        })
      );

      setSelectedSubmission(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan penilaian");
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-stone-200">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-stone-500 font-medium">Memuat data tugas submission...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FileCode2 size={18} className="text-blue-600" />
            Tugas Proyek & Submission Siswa
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Buat tugas praktek portofolio, lampirkan berkas panduan/starter pack, dan beri penilaian untuk hasil karya siswa.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setIsCreating(true);
            setTitle("");
            setDescription("");
            setAttachedFileUrl("");
            setAttachedFileName("");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          leftIcon={<Plus size={16} />}
        >
          Buat Tugas Baru
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Section Filter Bar */}
      {assignments.length > 0 && sections.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-500 font-semibold shrink-0">Filter Bab:</span>
          <button
            type="button"
            onClick={() => setSectionFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
              sectionFilter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            Semua ({assignments.length})
          </button>
          <button
            type="button"
            onClick={() => setSectionFilter("GLOBAL")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
              sectionFilter === "GLOBAL"
                ? "bg-blue-600 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            🌐 Tugas Umum ({assignments.filter((a) => !a.sectionId).length})
          </button>
          {sections.map((sec, idx) => {
            const count = assignments.filter((a) => a.sectionId === sec.id).length;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSectionFilter(sec.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                  sectionFilter === sec.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                📘 Bab {idx + 1} ({count})
              </button>
            );
          })}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileCode2 size={28} />
          </div>
          <h3 className="text-sm font-bold text-stone-900 mb-1">Belum Ada Tugas Proyek</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            Buat tugas praktek seperti repositori GitHub, tautan Figma, atau berkas file dokumen untuk siswa.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreating(true);
              setEditingAssignment(null);
              setTitle("");
              setDescription("");
              setSectionId("");
              setAttachedFileUrl("");
              setAttachedFileName("");
            }}
            leftIcon={<Plus size={14} />}
          >
            Tambah Tugas Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {assignments
            .filter((a) => {
              if (sectionFilter === "ALL") return true;
              if (sectionFilter === "GLOBAL") return !a.sectionId;
              return a.sectionId === sectionFilter;
            })
            .map((assignment, aIdx) => {
            const submissions = assignment.submissions || [];
            return (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
              >
                {/* Assignment Top Header */}
                <div className="p-5 border-b border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {aIdx + 1}
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-stone-900">{assignment.title}</h3>
                        {assignment.section ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <span>📘</span>
                            <span>Bab: {assignment.section.title}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                            🌐 Tugas Umum
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">
                        {assignment.description}
                      </p>

                      {/* Attached File by Admin */}
                      {assignment.fileUrl && (
                        <div className="pt-1">
                          <a
                            href={assignment.fileUrl}
                            download={assignment.fileName || "lampiran"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors"
                          >
                            <Download size={13} className="text-blue-600" />
                            <span>Berkas Tugas: {assignment.fileName || "Unduh Lampiran"}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      {submissions.length} Pengumpulan
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditAssignment(assignment)}
                      className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Tugas"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Submissions Section */}
                <div className="p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                    Daftar Pengumpulan Siswa
                  </h4>

                  {submissions.length === 0 ? (
                    <div className="py-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-400 text-xs">
                      Belum ada siswa yang mengumpulkan tugas ini.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                      {submissions.map((sub) => {
                        const statusBadge =
                          sub.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle2 size={11} />
                              Lulus ({sub.score ?? 100})
                            </span>
                          ) : sub.status === "REJECTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <XCircle size={11} />
                              Perlu Revisi ({sub.score ?? 0})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock size={11} />
                              Menunggu Review
                            </span>
                          );

                        return (
                          <div
                            key={sub.id}
                            className="p-4 bg-white hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold overflow-hidden">
                                    {sub.user?.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={sub.user.image}
                                        alt={sub.user?.name || "User"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <UserIcon size={12} />
                                    )}
                                  </div>
                                  <span className="text-xs font-bold text-stone-800">
                                    {sub.user?.name || "Siswa"}
                                  </span>
                                </div>
                                <span className="text-[11px] text-stone-400">
                                  ({sub.user?.email})
                                </span>
                                {statusBadge}
                              </div>

                              {/* Text / URL submission */}
                              {sub.content && sub.content !== sub.fileUrl && (
                                <div className="text-xs space-y-1">
                                  <span className="text-stone-500 font-medium">Tautan / Catatan:</span>
                                  {sub.content.startsWith("http") ? (
                                    <a
                                      href={sub.content}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 font-semibold underline flex items-center gap-1 break-all"
                                    >
                                      {sub.content}
                                      <ExternalLink size={12} className="shrink-0" />
                                    </a>
                                  ) : (
                                    <p className="text-stone-700 whitespace-pre-wrap bg-stone-50 p-2 rounded-lg border border-stone-200/60 font-mono text-[11px]">
                                      {sub.content}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Uploaded File by Student */}
                              {sub.fileUrl && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-stone-500 font-medium">File Siswa:</span>
                                  <a
                                    href={sub.fileUrl}
                                    download={sub.fileName || "submission"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors"
                                  >
                                    <Download size={13} className="text-stone-600" />
                                    <span>{sub.fileName || "Unduh Berkas Submission"}</span>
                                  </a>
                                </div>
                              )}

                              {sub.feedback && (
                                <p className="text-xs text-stone-700 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                                  <span className="font-semibold text-amber-800">Catatan Reviewer:</span>{" "}
                                  {sub.feedback}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 self-end md:self-center">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSubmission({
                                    assignmentId: assignment.id,
                                    submission: sub,
                                  });
                                  setReviewStatus(
                                    sub.status === "REJECTED" ? "REJECTED" : "APPROVED"
                                  );
                                  setReviewScore(sub.score ?? 85);
                                  setReviewFeedback(sub.feedback || "");
                                }}
                                className="text-xs"
                                leftIcon={<Check size={14} />}
                              >
                                {sub.status === "PENDING" ? "Beri Nilai & Review" : "Ubah Penilaian"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Buat / Edit Tugas */}
      {(isCreating || editingAssignment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              {editingAssignment ? "Edit Tugas Submission" : "Tambah Tugas Submission"}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {editingAssignment
                ? "Perbarui informasi tugas, bab target pembelajaran, atau berkas panduan."
                : "Instruksikan siswa untuk mengunggah proyek, melampirkan berkas referensi/starter code jika diperlukan."}
            </p>

            <form onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Tugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Submission Proyek Akhir: Landing Page Responsif"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Bab / Section Pembelajaran
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">🌐 Tugas Umum (Berlaku untuk Semua Bab / Kursus)</option>
                  {sections.map((sec, idx) => (
                    <option key={sec.id} value={sec.id}>
                      📘 Bab {idx + 1}: {sec.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  Jika diatur ke bab tertentu, tugas otomatis terkunci sampai siswa menyelesaikan semua materi di bab tersebut.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Instruksi & Kriteria Penilaian <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan kriteria tugas, apa saja yang harus dikerjakan, dan format pengumpulan (file ZIP/PDF atau link GitHub/Figma)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Lampirkan File / Starter Code */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Lampirkan Berkas Starter / Panduan (Opsional)
                </label>
                {attachedFileUrl ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={14} className="text-blue-600 shrink-0" />
                      <span className="font-semibold text-blue-950 truncate">
                        {attachedFileName || "File terlampir"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFileUrl("");
                        setAttachedFileName("");
                      }}
                      className="text-stone-400 hover:text-red-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-stone-300 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors">
                    {uploadingFile ? (
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                        <Loader2 size={16} className="animate-spin" />
                        Mengunggah berkas...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <Upload size={18} className="text-stone-400 mb-1" />
                        <span className="text-xs font-semibold text-stone-700">
                          Klik untuk mengunggah file panduan / starter pack
                        </span>
                        <span className="text-[11px] text-stone-400 mt-0.5">
                          Mendukung ZIP, PDF, DOCX, kode sumber, dll.
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      disabled={uploadingFile}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingAssignment(null);
                    setTitle("");
                    setDescription("");
                    setSectionId("");
                    setAttachedFileUrl("");
                    setAttachedFileName("");
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={savingAssignment || uploadingFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingAssignment ? "Simpan Perubahan" : "Simpan Tugas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review & Penilaian Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">Evaluasi Tugas Siswa</h3>
            <p className="text-xs text-stone-500 mb-3">
              Tentukan kelulusan tugas dan berikan feedback konstruktif untuk siswa.
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4 text-xs space-y-1.5">
              <div>
                <span className="font-semibold text-stone-700">Siswa: </span>
                <span className="text-stone-900 font-bold">
                  {selectedSubmission.submission.user?.name || "Siswa"}
                </span>{" "}
                ({selectedSubmission.submission.user?.email})
              </div>

              {selectedSubmission.submission.content && (
                <div>
                  <span className="font-semibold text-stone-700">Tautan/Catatan: </span>
                  {selectedSubmission.submission.content.startsWith("http") ? (
                    <a
                      href={selectedSubmission.submission.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Buka Tautan &rarr;
                    </a>
                  ) : (
                    <span className="text-stone-800 font-mono text-[11px] block mt-1 bg-white p-2 rounded border border-stone-200">
                      {selectedSubmission.submission.content}
                    </span>
                  )}
                </div>
              )}

              {selectedSubmission.submission.fileUrl && (
                <div>
                  <span className="font-semibold text-stone-700">File Unggahan Siswa: </span>
                  <a
                    href={selectedSubmission.submission.fileUrl}
                    download={selectedSubmission.submission.fileName || "submission"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold mt-1"
                  >
                    <Download size={12} />
                    <span>{selectedSubmission.submission.fileName || "Unduh Berkas"}</span>
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keputusan Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("APPROVED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      reviewStatus === "APPROVED"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    Lulus / Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("REJECTED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      reviewStatus === "REJECTED"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <XCircle size={14} />
                    Perlu Revisi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nilai Skor (0 - 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan / Feedback untuk Siswa
                </label>
                <textarea
                  rows={3}
                  placeholder="Misal: Bagus sekali! Desain responsif berjalan baik. Saran sedikit pada struktur semantic HTML..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={savingReview}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Nilai
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
