"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  CheckSquare,
  Users,
  ExternalLink,
  Loader2,
  Eye,
  Sliders,
  Sparkles,
  Printer,
  Copy,
  Check,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Palette,
  FileText,
  Hash,
  Maximize2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CertificateDesigner } from "@/components/certificates/certificate-designer";
import { CertificateBackDesigner } from "@/components/certificates/certificate-back-designer";
import { CertificateCanvasRenderer } from "@/components/certificates/certificate-canvas-renderer";
import {
  CertificateTranscriptCard,
  CertificateTranscriptMiniature,
} from "@/components/certificates/certificate-transcript-card";
import {
  CertificateDesignConfig,
  CertificateBackDesignConfig,
  CertificateDataValues,
} from "@/lib/certificate-templates";
import {
  formatCertificateSerialNumber,
  SERIAL_TAG_DESCRIPTIONS,
} from "@/lib/certificate-serial";

interface CertificateSetting {
  isEnabled: boolean;
  title: string;
  subtitle: string;
  issuerName: string;
  signatoryName1: string;
  signatoryRole1: string;
  signatoryName2: string;
  signatoryRole2: string;
  templateUrl?: string | null;
  templateConfig?: CertificateDesignConfig | null;
  minProgress: number;
  requireQuizPassed: boolean;
  requireAssignmentApproved: boolean;
  serialPattern?: string | null;
  courseCode?: string | null;
  counterPadding?: number;
  nextCounter?: number;
}

interface Recipient {
  id: string;
  certificateCode: string;
  issuedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface CertificateManagerProps {
  courseId: string;
}

export function CertificateManager({ courseId }: CertificateManagerProps) {
  const [activeView, setActiveView] = useState<"settings" | "studio" | "recipients">("settings");
  const [studioTab, setStudioTab] = useState<"front" | "back">("front");
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [courseInfo, setCourseInfo] = useState<{
    id: string;
    title: string;
    slug: string;
    instructorName: string;
  } | null>(null);

  const [form, setForm] = useState<CertificateSetting>({
    isEnabled: true,
    title: "Certificate of Completion",
    subtitle:
      "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, evaluasi kuis, dan pemenuhan seluruh kriteria kelulusan.",
    issuerName: "PT. Matoh Technologies Indonesia",
    signatoryName1: "",
    signatoryRole1: "Lead Instructor & RnD Director",
    signatoryName2: "Dr. E. Lovita, SE., Ak., M.Si., CA.",
    signatoryRole2: "Head of Academic Board",
    templateUrl: null,
    templateConfig: null,
    minProgress: 100,
    requireQuizPassed: true,
    requireAssignmentApproved: true,
    serialPattern: "MT/{COURSE_CODE}/{YEAR}/{COUNTER}",
    courseCode: "",
    counterPadding: 4,
    nextCounter: 1,
  });

  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const previewSerial = useMemo(() => {
    const defaultCode =
      courseInfo?.slug
        ?.split("-")
        .map((w) => w[0]?.toUpperCase())
        .join("")
        .slice(0, 6) || "COURSE";

    return formatCertificateSerialNumber({
      pattern: form.serialPattern || "MT/{COURSE_CODE}/{YEAR}/{COUNTER}",
      courseCode: form.courseCode || defaultCode,
      counter: form.nextCounter || 1,
      counterPadding: form.counterPadding ?? 4,
      issueDate: new Date(),
    });
  }, [form.serialPattern, form.courseCode, form.nextCounter, form.counterPadding, courseInfo]);

  const [frontModalOpen, setFrontModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (frontModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [frontModalOpen]);

  const frontSampleData = useMemo(() => ({
    student_name: "Nama Siswa Teladan",
    course_title: courseInfo?.title || "Judul Kursus",
    category_name: "Kategori Kursus",
    issue_date: format(new Date(), "d MMMM yyyy", { locale: idLocale }),
    certificate_code: previewSerial,
    issuer_name: form.issuerName || "PT. Matoh Technologies Indonesia",
    signatory_name1: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
    signatory_name_1: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
    signatoryName1: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
    signatory_role1: form.signatoryRole1 || "Lead Instructor & RnD Director",
    signatory_role_1: form.signatoryRole1 || "Lead Instructor & RnD Director",
    signatoryRole1: form.signatoryRole1 || "Lead Instructor & RnD Director",
    signatory_name2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
    signatory_name_2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
    signatoryName2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
    signatory_role2: form.signatoryRole2 || "Head of Academic Board",
    signatory_role_2: form.signatoryRole2 || "Head of Academic Board",
    signatoryRole2: form.signatoryRole2 || "Head of Academic Board",
    subtitle: form.subtitle,
  }), [courseInfo, previewSerial, form.issuerName, form.signatoryName1, form.signatoryRole1, form.signatoryName2, form.signatoryRole2, form.subtitle]);

  const handleUploadTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file template maksimal 5MB");
      return;
    }

    setUploadingTemplate(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "certificates");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah template");

      setForm((prev) => ({ ...prev, templateUrl: data.url }));
      setSuccessMsg("Template sertifikat berhasil diunggah! Klik 'Simpan Pengaturan' untuk menerapkan.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengunggah template");
    } finally {
      setUploadingTemplate(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveTemplate = () => {
    setForm((prev) => ({ ...prev, templateUrl: null }));
    setSuccessMsg("Template kustom dihapus. Sertifikat akan menggunakan desain standar bawaan.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${courseId}/certificate`);
      if (!res.ok) throw new Error("Gagal mengambil data pengaturan sertifikat");
      const data = await res.json();

      setCourseInfo(data.course);
      if (data.setting) {
        setForm({
          isEnabled: data.setting.isEnabled ?? true,
          title: data.setting.title || "Certificate of Completion",
          subtitle:
            data.setting.subtitle ||
            "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, evaluasi kuis, dan pemenuhan seluruh kriteria kelulusan.",
          issuerName: data.setting.issuerName || "PT. Matoh Technologies Indonesia",
          signatoryName1:
            data.setting.signatoryName1 || data.course?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
          signatoryRole1: data.setting.signatoryRole1 || "Lead Instructor & RnD Director",
          signatoryName2: data.setting.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
          signatoryRole2: data.setting.signatoryRole2 || "Head of Academic Board",
          templateUrl: data.setting.templateUrl || null,
          templateConfig: data.setting.templateConfig || null,
          minProgress: data.setting.minProgress ?? 100,
          requireQuizPassed: data.setting.requireQuizPassed ?? true,
          requireAssignmentApproved: data.setting.requireAssignmentApproved ?? true,
          serialPattern: data.setting.serialPattern || "MT/{COURSE_CODE}/{YEAR}/{COUNTER}",
          courseCode: data.setting.courseCode || "",
          counterPadding: data.setting.counterPadding ?? 4,
          nextCounter: data.setting.nextCounter ?? (data.recipients?.length ? data.recipients.length + 1 : 1),
        });
      }
      setRecipients(data.recipients || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/certificate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan");

      setSuccessMsg("Pengaturan sertifikat dan kriteria kelulusan berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDesigner = async (newConfig: CertificateDesignConfig, bgUrl?: string | null) => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const updatedConfig: CertificateDesignConfig = {
        ...newConfig,
        backConfig: form.templateConfig?.backConfig ?? newConfig.backConfig,
      };

      const updatedForm = {
        ...form,
        templateConfig: updatedConfig,
        templateUrl: bgUrl !== undefined ? bgUrl : form.templateUrl,
      };

      const res = await fetch(`/api/admin/courses/${courseId}/certificate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan desain sertifikat");

      setForm(updatedForm);
      setSuccessMsg("Desain sertifikat dinamis berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan desain sertifikat");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBackDesigner = async (newBackConfig: CertificateBackDesignConfig) => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const currentConfig: CertificateDesignConfig = form.templateConfig || {
        elements: [],
        backgroundType: "color",
        borderStyle: "solid",
      };

      const updatedConfig: CertificateDesignConfig = {
        ...currentConfig,
        backConfig: newBackConfig,
      };

      const updatedForm = {
        ...form,
        templateConfig: updatedConfig,
      };

      const res = await fetch(`/api/admin/courses/${courseId}/certificate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan desain transkrip belakang");

      setForm(updatedForm);
      setSuccessMsg("Desain transkrip nilai (sisi belakang) berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan desain sisi belakang");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-stone-500 text-sm font-medium">Memuat pengaturan sertifikat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-blue-500/5 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center text-white shadow-md">
            <Award size={24} />
          </div>
          <div>
            <h2
              className="text-lg font-bold text-stone-900"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Pengaturan Sertifikat &amp; Kriteria Kelulusan
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Atur tampilan sertifikat dan tentukan syarat kriteria yang harus dipenuhi siswa agar
              dapat mengklaim sertifikat.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Simpan Pengaturan
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveView("settings")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeView === "settings"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
          )}
        >
          <Sliders size={15} />
          Pengaturan &amp; Kriteria Kelulusan
        </button>

        <button
          type="button"
          onClick={() => setActiveView("studio")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeView === "studio"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
          )}
        >
          <Palette size={15} />
          Studio Desain Visual (Kustom Canvas)
        </button>

        <button
          type="button"
          onClick={() => setActiveView("recipients")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
            activeView === "recipients"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200"
          )}
        >
          <Users size={15} />
          Daftar Penerima
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              activeView === "recipients"
                ? "bg-white/20 text-white"
                : "bg-stone-100 text-stone-700"
            )}
          >
            {recipients.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Dynamic Visual Designer Studio */}
      {activeView === "studio" && (
        <div className="space-y-6">
          {/* Subtabs: Front vs Back Designer */}
          <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 w-fit">
            <button
              type="button"
              onClick={() => setStudioTab("front")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                studioTab === "front"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              <Award size={14} className={studioTab === "front" ? "text-blue-600" : "text-stone-400"} />
              <span>Editor Sisi Depan (Sertifikat)</span>
            </button>
            <button
              type="button"
              onClick={() => setStudioTab("back")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                studioTab === "back"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              <FileText size={14} className={studioTab === "back" ? "text-blue-600" : "text-stone-400"} />
              <span>Editor Sisi Belakang (Transkrip Nilai)</span>
            </button>
          </div>

          {studioTab === "front" ? (
            <CertificateDesigner
              initialConfig={form.templateConfig}
              initialTemplateUrl={form.templateUrl}
              courseTitle={courseInfo?.title || "Judul Kursus"}
              sampleData={{
                student_name: "Muhammad Rizky Pratama",
                course_title: courseInfo?.title || "Fullstack Web Development Mastery",
                category_name: "Teknologi & Pemrograman",
                issue_date: format(new Date(), "d MMMM yyyy", { locale: idLocale }),
                certificate_code: previewSerial,
                issuer_name: form.issuerName || "PT. Matoh Technologies Indonesia",
                signatory_name1: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
                signatory_name_1: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
                signatoryName1: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
                signatory_role1: form.signatoryRole1 || "Lead Instructor & RnD Director",
                signatory_role_1: form.signatoryRole1 || "Lead Instructor & RnD Director",
                signatoryRole1: form.signatoryRole1 || "Lead Instructor & RnD Director",
                signatory_name2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
                signatory_name_2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
                signatoryName2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
                signatory_role2: form.signatoryRole2 || "Head of Academic Board",
                signatory_role_2: form.signatoryRole2 || "Head of Academic Board",
                signatoryRole2: form.signatoryRole2 || "Head of Academic Board",
                subtitle: form.subtitle,
              }}
              onSave={handleSaveDesigner}
            />
          ) : (
            <CertificateBackDesigner
              initialConfig={form.templateConfig?.backConfig}
              courseTitle={courseInfo?.title || "Judul Kursus"}
              sampleData={{
                studentName: "Muhammad Rizky Pratama",
                courseTitle: courseInfo?.title || "Fullstack Web Development Mastery",
                categoryName: "Teknologi & Pemrograman",
                certificateCode: previewSerial,
                issueDisplay: format(new Date(), "d MMMM yyyy", { locale: idLocale }),
                issuerName: form.issuerName || "PT. Matoh Technologies Indonesia",
                instructorName: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
                signatoryRole1: form.signatoryRole1 || "Lead Instructor & RnD Director",
                signatoryName2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
                signatoryRole2: form.signatoryRole2 || "Head of Academic Board",
                totalLessons: 12,
                totalHours: 18,
                overallScore: 94.5,
                finalGrade: "A",
                predicate: "DENGAN PUJIAN (DISTINCTION)",
                items: [
                  {
                    id: "m1",
                    title: "Pemahaman Konsep & Fundamental Kurikulum",
                    type: "module",
                    workload: "6 JP",
                    score: 95,
                    maxScore: 100,
                    grade: "A",
                    status: "KOMPETEN",
                  },
                  {
                    id: "m2",
                    title: "Penerapan Praktik & Studi Lapangan",
                    type: "module",
                    workload: "8 JP",
                    score: 92,
                    maxScore: 100,
                    grade: "A",
                    status: "KOMPETEN",
                  },
                  {
                    id: "q1",
                    title: "Evaluasi Komprehensif Pemahaman Materi",
                    type: "quiz",
                    workload: "Evaluasi Kuis",
                    score: 96,
                    maxScore: 100,
                    grade: "A",
                    status: "LULUS",
                  },
                  {
                    id: "a1",
                    title: "Proyek Akhir & Portofolio Mandiri Teruji",
                    type: "assignment",
                    workload: "Proyek Praktik",
                    score: 95,
                    maxScore: 100,
                    grade: "A",
                    status: "DISETUJUI",
                  },
                ],
              }}
              onSave={handleSaveBackDesigner}
            />
          )}
        </div>
      )}

      {/* Tab 2: Settings & Criteria */}
      {activeView === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Settings & Criteria (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Status Penerbitan */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Status Penerbitan Sertifikat</h3>
                <p className="text-xs text-stone-500">
                  Aktifkan agar siswa yang memenuhi syarat dapat menerbitkan sertifikat.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isEnabled}
                  onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Card: Kriteria Kelulusan */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sliders size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Kriteria &amp; Syarat Kelulusan Siswa
              </h3>
            </div>

            {/* Min Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-stone-400" />
                  Minimal Progres Penyelesaian Materi
                </label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {form.minProgress}% Materi
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={form.minProgress}
                onChange={(e) => setForm({ ...form, minProgress: Number(e.target.value) })}
                className="w-full accent-blue-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-stone-400">
                Siswa harus menuntaskan minimal {form.minProgress}% dari seluruh pelajaran yang ada
                di silabus.
              </p>
            </div>

            {/* Require Quizzes */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-stone-800">Wajib Lulus Semua Kuis</p>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                    Jika diaktifkan dan kelas memiliki kuis evaluasi, siswa wajib mencapai nilai
                    kelulusan (passing score) pada setiap kuis.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.requireQuizPassed}
                    onChange={(e) => setForm({ ...form, requireQuizPassed: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Require Assignments */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-stone-800">
                    Wajib Semua Tugas Disetujui (Approved)
                  </p>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                    Jika diaktifkan dan kelas memiliki penugasan/submission, instruktur atau admin
                    harus memberikan status APPROVED sebelum sertifikat dapat diklaim.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.requireAssignmentApproved}
                    onChange={(e) =>
                      setForm({ ...form, requireAssignmentApproved: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Card: Template Format Nomor Seri (Serial Number) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Format Nomor Seri Sertifikat (Serial Number)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                Kustom Per Kelas
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Tentukan pola penomoran sertifikat resmi khusus untuk kelas ini. Sistem akan otomatis mengisi variabel dinamis seperti tahun, kode kelas, dan nomor urut saat sertifikat diterbitkan.
            </p>

            {/* Live Preview Display Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-sm border border-stone-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Live Preview Serial Number
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Contoh Terbitan #{form.nextCounter || 1}
                </span>
              </div>
              <div className="text-base sm:text-lg font-mono font-bold tracking-wide text-amber-300 break-all py-1 select-all">
                {previewSerial}
              </div>
              <p className="text-[11px] text-stone-400">
                Nomor ini akan tercetak otomatis pada sertifikat dan menjadi kode kredensial verifikasi keaslian publik.
              </p>
            </div>

            {/* Inputs: Pattern & Course Code */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>Template Pola Serial</span>
                  <span className="text-[10px] text-stone-400">Gunakan tag kurung kurawal</span>
                </label>
                <input
                  type="text"
                  value={form.serialPattern || ""}
                  onChange={(e) => setForm({ ...form, serialPattern: e.target.value })}
                  placeholder="MT/{COURSE_CODE}/{YEAR}/{COUNTER}"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                  <span>Kode Singkatan Kelas</span>
                </label>
                <input
                  type="text"
                  value={form.courseCode || ""}
                  onChange={(e) => setForm({ ...form, courseCode: e.target.value.toUpperCase() })}
                  placeholder={
                    courseInfo?.slug
                      ?.split("-")
                      .map((w) => w[0]?.toUpperCase())
                      .join("")
                      .slice(0, 6) || "FSW"
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold uppercase text-stone-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preset Patterns */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-stone-600 block">Pilihan Preset Pola Populer:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Standar MT", pattern: "MT/{COURSE_CODE}/{YEAR}/{COUNTER}" },
                  { label: "Akademik (Bulan Romawi)", pattern: "CERT/{COURSE_CODE}/{YEAR}/{MONTH_ROMAN}/{COUNTER}" },
                  { label: "Kredensial Acak", pattern: "MT-{COURSE_CODE}-{YEAR}-{COUNTER}-{RANDOM}" },
                  { label: "Minimalis", pattern: "{COURSE_CODE}-{YEAR}-{COUNTER}" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setForm({ ...form, serialPattern: preset.pattern })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                      form.serialPattern === preset.pattern
                        ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold"
                        : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clickable Tags */}
            <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-700">Tag Variabel yang Tersedia</span>
                <span className="text-[10px] text-stone-400">Klik tag untuk menyisipkan ke pola</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SERIAL_TAG_DESCRIPTIONS.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => {
                      const current = form.serialPattern || "";
                      setForm({
                        ...form,
                        serialPattern: current ? `${current}/${item.tag}` : item.tag,
                      });
                    }}
                    title={`${item.desc} (contoh: ${item.example})`}
                    className="group flex items-center gap-1 px-2 py-1 bg-white hover:bg-blue-50 border border-stone-200 hover:border-blue-300 rounded-lg text-[10px] font-mono text-stone-700 hover:text-blue-700 transition-colors"
                  >
                    <span className="font-bold">{item.tag}</span>
                    <span className="text-stone-400 group-hover:text-blue-500 font-sans text-[9px]">
                      ({item.example})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Counter & Padding Settings */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Jumlah Digit Nomor Urut (Padding)
                </label>
                <select
                  value={form.counterPadding ?? 4}
                  onChange={(e) => setForm({ ...form, counterPadding: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>3 Digit (contoh: 001, 042)</option>
                  <option value={4}>4 Digit (contoh: 0001, 0042)</option>
                  <option value={5}>5 Digit (contoh: 00001, 00042)</option>
                  <option value={6}>6 Digit (contoh: 000001, 000042)</option>
                </select>
                <p className="text-[11px] text-stone-400">
                  Menentukan banyaknya angka nol di depan nomor urut &#123;COUNTER&#125;.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700">
                  Nomor Urut Berikutnya (Next Counter)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.nextCounter ?? 1}
                  onChange={(e) =>
                    setForm({ ...form, nextCounter: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold text-stone-800 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-stone-400">
                  Akan bertambah 1 setiap kali ada siswa yang berhasil klaim sertifikat.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Template Desain Sertifikat (Background) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Template Desain Sertifikat (Background)
                </h3>
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border",
                  form.templateUrl
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-stone-100 text-stone-600 border-stone-200"
                )}
              >
                {form.templateUrl ? "Template Kustom Aktif" : "Desain Standar Sistem"}
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Unggah file desain template sertifikat Anda sendiri (Canva, Photoshop, Figma). Data
              siswa (nama, nama kelas, tanggal terbit, nomor kredensial, dan tanda tangan) akan
              otomatis dicetak tepat di atas template tersebut.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadTemplate}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />

            {form.templateUrl ? (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-24 h-16 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative shadow-xs">
                    <img
                      src={form.templateUrl}
                      alt="Template Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 truncate">
                      <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                      <span>Template Kustom Terpasang</span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5 font-mono">
                      {form.templateUrl}
                    </p>
                    <a
                      href={form.templateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold mt-1"
                    >
                      Buka Gambar Penuh <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-blue-200/60">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {uploadingTemplate ? (
                      <Loader2 size={12} className="animate-spin text-blue-600" />
                    ) : (
                      <UploadCloud size={12} className="text-blue-600" />
                    )}
                    Ganti Template
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveTemplate}
                    disabled={uploadingTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Hapus Template (Pakai Bawaan)
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-stone-200 hover:border-blue-400 bg-stone-50/60 hover:bg-blue-50/20 text-center cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform">
                  {uploadingTemplate ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <UploadCloud size={20} />
                  )}
                </div>
                <p className="text-xs font-bold text-stone-800">
                  {uploadingTemplate ? "Mengunggah template..." : "Klik untuk Unggah Template Desain"}
                </p>
                <p className="text-[11px] text-stone-400 mt-1 max-w-sm mx-auto">
                  Format: PNG, JPG, JPEG, atau WebP (Rasio landscape disarankan A4 / 16:9, maks 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Card: Desain & Teks Sertifikat */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Award size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-stone-900">Desain &amp; Teks Sertifikat</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Judul Sertifikat
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Certificate of Completion"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Institusi / Lembaga Penerbit
                </label>
                <input
                  type="text"
                  value={form.issuerName}
                  onChange={(e) => setForm({ ...form, issuerName: e.target.value })}
                  placeholder="Contoh: PT. Matoh Technologies Indonesia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Narasi / Keterangan Kelulusan
                </label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Keterangan pencapaian siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Signatures */}
              <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Signatory 1 */}
                <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                  <p className="text-[11px] font-bold uppercase text-stone-500">
                    Penandatangan 1 (Kiri)
                  </p>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.signatoryName1}
                      onChange={(e) => setForm({ ...form, signatoryName1: e.target.value })}
                      placeholder="Nama Instruktur"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Jabatan / Role</label>
                    <input
                      type="text"
                      value={form.signatoryRole1}
                      onChange={(e) => setForm({ ...form, signatoryRole1: e.target.value })}
                      placeholder="Lead Instructor"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Signatory 2 */}
                <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                  <p className="text-[11px] font-bold uppercase text-stone-500">
                    Penandatangan 2 (Kanan)
                  </p>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.signatoryName2}
                      onChange={(e) => setForm({ ...form, signatoryName2: e.target.value })}
                      placeholder="Nama Kepala Akademik"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">Jabatan / Role</label>
                    <input
                      type="text"
                      value={form.signatoryRole2}
                      onChange={(e) => setForm({ ...form, signatoryRole2: e.target.value })}
                      placeholder="Head of Curriculum"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Live Certificate Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setPreviewSide("front")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                  previewSide === "front"
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                <Award size={12} className={previewSide === "front" ? "text-blue-600" : "text-stone-400"} />
                <span>Sisi Depan</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewSide("back")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                  previewSide === "back"
                    ? "bg-white text-stone-900 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                <FileText size={12} className={previewSide === "back" ? "text-blue-600" : "text-stone-400"} />
                <span>Sisi Belakang (Transkrip)</span>
              </button>
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                form.templateUrl
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              )}
            >
              {form.templateUrl ? "Template Kustom" : "Desain Standar"}
            </span>
          </div>

          {/* Certificate Miniature Preview */}
          {previewSide === "back" ? (
            <CertificateTranscriptMiniature
              backConfig={form.templateConfig?.backConfig}
              data={{
                studentName: "Nama Siswa Teladan",
                courseTitle: courseInfo?.title || "Judul Kursus",
                categoryName: "Kategori Kursus",
                certificateCode: "MT-SAMPLE-2026",
                issueDisplay: format(new Date(), "d MMMM yyyy", { locale: idLocale }),
                issuerName: form.issuerName || "PT. Matoh Technologies Indonesia",
                instructorName: form.signatoryName1 || courseInfo?.instructorName || "Dr. G. Prabantoro, SE., MM., CBec.",
                signatoryRole1: form.signatoryRole1 || "Lead Instructor & RnD Director",
                signatoryName2: form.signatoryName2 || "Dr. E. Lovita, SE., Ak., M.Si., CA.",
                signatoryRole2: form.signatoryRole2 || "Head of Academic Board",
                totalLessons: 10,
                totalHours: 16,
                overallScore: 92.5,
                finalGrade: "A",
                predicate: "DENGAN PUJIAN (DISTINCTION)",
                items: [
                  {
                    id: "m1",
                    title: "Penguasaan Modul & Kurikulum Teori",
                    type: "module",
                    workload: "8 JP",
                    score: 95,
                    maxScore: 100,
                    grade: "A",
                    status: "KOMPETEN",
                  },
                  {
                    id: "q1",
                    title: "Evaluasi Pemahaman Materi (Kuis)",
                    type: "quiz",
                    workload: "Evaluasi Kuis",
                    score: 90,
                    maxScore: 100,
                    grade: "A",
                    status: "LULUS",
                  },
                  {
                    id: "a1",
                    title: "Studi Kasus & Portofolio Proyek Akhir",
                    type: "assignment",
                    workload: "Proyek Praktik",
                    score: 92,
                    maxScore: 100,
                    grade: "A",
                    status: "DISETUJUI",
                  },
                ],
              }}
              onOpenStudio={() => {
                setActiveView("studio");
                setStudioTab("back");
              }}
            />
          ) : form.templateConfig && form.templateConfig.elements?.length > 0 ? (
            <div className="space-y-3">
              <div
                onClick={() => setFrontModalOpen(true)}
                className="group relative w-full rounded-2xl shadow-warm overflow-hidden bg-white border border-stone-200 select-none cursor-pointer transition-all hover:border-blue-300 hover:shadow-md"
                title="Klik untuk melihat pratinjau ukuran penuh (A4)"
              >
                <CertificateCanvasRenderer
                  config={form.templateConfig}
                  data={frontSampleData}
                  isInteractive={false}
                />
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <Maximize2 size={12} className="text-blue-600" />
                    Klik untuk Pratinjau Penuh (A4)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveView("studio");
                  setStudioTab("front");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 shadow-xs transition-colors cursor-pointer"
              >
                <Palette size={14} />
                Buka &amp; Edit di Studio Desain Visual
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                onClick={() => setFrontModalOpen(true)}
                className={cn(
                  "group relative w-full rounded-2xl p-5 shadow-warm overflow-hidden text-center select-none transition-all cursor-pointer hover:border-blue-300 hover:shadow-md",
                  form.templateUrl
                    ? "bg-stone-900 border-2 border-stone-700/60"
                    : "bg-white border-4 border-amber-900/10"
                )}
                title="Klik untuk melihat pratinjau ukuran penuh (A4)"
              >
                {form.templateUrl ? (
                  <img
                    src={form.templateUrl}
                    alt="Template Background"
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
                  />
                ) : (
                  <>
                    <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-blue-100/30 pointer-events-none blur-2xl" />
                    <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-sky-100/30 pointer-events-none blur-2xl" />
                  </>
                )}

                <div
                  className={cn(
                    "rounded-xl p-4 relative z-10 transition-all",
                    form.templateUrl
                      ? "bg-white/85 backdrop-blur-xs border border-white/60 shadow-xs"
                      : "border border-dashed border-blue-600/30"
                  )}
                >
                  {/* Header */}
                  <div className="flex flex-col items-center justify-center mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-xs mb-1">
                      <Award size={16} className="text-white" />
                    </div>
                    <h4
                      className="text-xs font-bold tracking-widest uppercase text-stone-800"
                      style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                    >
                      {form.issuerName || "PT. Matoh Technologies Indonesia"}
                    </h4>
                    <p className="text-[8px] uppercase tracking-widest text-blue-700 font-semibold mt-0.5">
                      {form.title || "Certificate of Completion"}
                    </p>
                  </div>

                  {/* Recipient */}
                  <p className="text-[8px] uppercase tracking-wider text-stone-400 font-medium">
                    Diberikan kepada:
                  </p>
                  <h5
                    className="text-base font-extrabold text-stone-900 mt-0.5 mb-1"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    Nama Siswa Teladan
                  </h5>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-sky-500 mx-auto mb-2 rounded-full" />

                  <p className="text-[9px] text-stone-500 line-clamp-2 max-w-xs mx-auto leading-relaxed mb-2.5">
                    {form.subtitle}
                  </p>

                  <div className="bg-blue-50/80 border border-blue-200/80 rounded-lg py-1.5 px-3 inline-block max-w-full mb-3">
                    <p className="text-[10px] font-bold text-blue-950 truncate max-w-[200px]">
                      {courseInfo?.title || "Judul Kursus"}
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/80 items-end text-[8px]">
                    <div className="text-left">
                      <p className="font-serif italic text-stone-800 truncate">
                        {form.signatoryName1 || "Ahmad Fadhil"}
                      </p>
                      <div className="w-12 h-px bg-stone-300 mb-0.5" />
                      <p className="font-medium text-stone-600 truncate">{form.signatoryRole1}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-0.5">
                        <ShieldCheck size={12} />
                      </div>
                      <span className="text-[7px] font-bold text-amber-800 uppercase tracking-tighter">
                        VERIFIED
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-serif italic text-stone-800 truncate">
                        {form.signatoryName2 || "Dr. Santoso W."}
                      </p>
                      <div className="w-12 h-px bg-stone-300 ml-auto mb-0.5" />
                      <p className="font-medium text-stone-600 truncate">{form.signatoryRole2}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-dashed border-stone-200 flex items-center justify-between text-[7px] text-stone-400">
                    <span className="truncate max-w-[160px] font-mono">ID: {previewSerial}</span>
                    <span className="text-green-600 font-semibold shrink-0">Resmi &amp; Terverifikasi</span>
                  </div>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none z-20">
                  <span className="px-3 py-1.5 rounded-full bg-white/95 text-stone-900 text-[11px] font-bold shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <Maximize2 size={12} className="text-blue-600" />
                    Klik untuk Pratinjau Penuh (A4)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveView("studio");
                  setStudioTab("front");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 shadow-xs transition-colors cursor-pointer"
              >
                <Palette size={14} />
                Buka &amp; Edit di Studio Desain Visual
              </button>
            </div>
          )}

          {/* Fullscreen A4 Modal Preview for Front Side */}
          {mounted && frontModalOpen && createPortal(
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) setFrontModalOpen(false);
              }}
              className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-950/80 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150 cursor-pointer"
            >
              <div className="min-h-full flex items-center justify-center pointer-events-none">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl p-4 sm:p-6 space-y-4 pointer-events-auto my-auto animate-in zoom-in-95 duration-150 cursor-default"
                >
                  {/* Modal Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Award size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Pratinjau Sisi Depan (Sertifikat)</h3>
                        <p className="text-[11px] text-stone-400 font-mono">Format A4 Landscape (297 × 210 mm)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFrontModalOpen(false);
                          setActiveView("studio");
                          setStudioTab("front");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Buka di Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrontModalOpen(false)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                        aria-label="Tutup"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Real A4 Landscape Preview Card */}
                  <div className="w-full flex justify-center py-2">
                    <div className="w-full max-w-[1000px] shadow-2xl rounded-2xl overflow-hidden bg-white">
                      {form.templateConfig && form.templateConfig.elements?.length > 0 ? (
                        <CertificateCanvasRenderer
                          config={form.templateConfig}
                          data={frontSampleData}
                          isInteractive={false}
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-full rounded-2xl p-8 relative overflow-hidden text-center select-none",
                            form.templateUrl
                              ? "bg-stone-900 border-2 border-stone-700/60"
                              : "bg-white border-4 border-amber-900/10"
                          )}
                          style={{ aspectRatio: "297 / 210" }}
                        >
                          {form.templateUrl && (
                            <img
                              src={form.templateUrl}
                              alt="Template Background"
                              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
                            />
                          )}
                          <div
                            className={cn(
                              "rounded-2xl p-8 relative z-10 h-full flex flex-col justify-between",
                              form.templateUrl
                                ? "bg-white/85 backdrop-blur-xs border border-white/60 shadow-xs"
                                : "border-2 border-dashed border-blue-600/30"
                            )}
                          >
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-md mb-2">
                                <Award size={24} className="text-white" />
                              </div>
                              <h4
                                className="text-base font-bold tracking-widest uppercase text-stone-800"
                                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                              >
                                {form.issuerName || "PT. Matoh Technologies Indonesia"}
                              </h4>
                              <p className="text-xs uppercase tracking-widest text-blue-700 font-bold mt-1">
                                {form.title || "Certificate of Completion"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                                Diberikan kepada:
                              </p>
                              <h5
                                className="text-2xl font-extrabold text-stone-900 mt-1 mb-2"
                                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                              >
                                Nama Siswa Teladan
                              </h5>
                              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-sky-500 mx-auto mb-3 rounded-full" />
                              <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
                                {form.subtitle}
                              </p>
                              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl py-2 px-4 inline-block max-w-full mt-3">
                                <p className="text-sm font-bold text-blue-950">
                                  {courseInfo?.title || "Judul Kursus"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200/80 items-end text-xs">
                              <div className="text-left">
                                <p className="font-serif italic text-stone-800 text-sm">
                                  {form.signatoryName1 || "Ahmad Fadhil"}
                                </p>
                                <div className="w-24 h-px bg-stone-300 my-1" />
                                <p className="font-medium text-stone-600 text-[11px]">{form.signatoryRole1}</p>
                              </div>

                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-1">
                                  <ShieldCheck size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                                  VERIFIED OFFICIAL
                                </span>
                              </div>

                              <div className="text-right">
                                <p className="font-serif italic text-stone-800 text-sm">
                                  {form.signatoryName2 || "Dr. Santoso W."}
                                </p>
                                <div className="w-24 h-px bg-stone-300 ml-auto my-1" />
                                <p className="font-medium text-stone-600 text-[11px]">{form.signatoryRole2}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Fitur Sertifikat Digital:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
              <li>Mendukung 2 halaman (Halaman 1: Sertifikat, Halaman 2: Transkrip Nilai).</li>
              <li>Memiliki URL verifikasi unik yang dapat dibagikan publik.</li>
              <li>Dapat dicetak langsung atau disimpan sebagai file PDF berkualitas tinggi.</li>
            </ul>
          </div>
        </div>
      </div>
    )}

      {/* Tab 3: Recipients Table */}
      {activeView === "recipients" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-stone-900">Daftar Penerima Sertifikat</h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {recipients.length} Siswa
            </span>
          </div>
        </div>

        {recipients.length === 0 ? (
          <div className="p-8 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center">
            <Award size={32} className="text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-700">Belum Ada Penerima Sertifikat</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Siswa yang telah menyelesaikan seluruh kriteria kelulusan akan otomatis tercatat di
              sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-medium">
                  <th className="pb-3 pl-2">Siswa</th>
                  <th className="pb-3">Kode Kredensial</th>
                  <th className="pb-3">Tanggal Diterbitkan</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recipients.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {rec.user.name?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">{rec.user.name || "Siswa"}</p>
                          <p className="text-[10px] text-stone-400">{rec.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <span>{rec.certificateCode}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(rec.certificateCode)}
                          className="text-stone-400 hover:text-stone-600 p-1 rounded"
                          title="Salin Kode"
                        >
                          {copiedCode === rec.certificateCode ? (
                            <Check size={12} className="text-green-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-stone-500">
                      {format(new Date(rec.issuedAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <a
                        href={`/certificates/${rec.certificateCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Eye size={12} className="text-blue-600" />
                        Lihat Sertifikat
                        <ExternalLink size={10} className="text-stone-400" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
