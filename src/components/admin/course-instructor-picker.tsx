"use client";

import { useState } from "react";
import {
  UserCheck,
  Award,
  BookOpen,
  Mail,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InstructorOption {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  headline?: string | null;
  bio?: string | null;
  role: string;
}

interface CourseInstructorPickerProps {
  instructors: InstructorOption[];
  selectedInstructorId: string;
  onInstructorChange: (id: string) => void;
  instructorHeadline: string;
  onHeadlineChange: (val: string) => void;
  instructorBio: string;
  onBioChange: (val: string) => void;

  // Second Instructor (Optional)
  selectedInstructor2Id?: string;
  onInstructor2Change?: (id: string) => void;
  instructor2Headline?: string;
  onHeadline2Change?: (val: string) => void;
  instructor2Bio?: string;
  onBio2Change?: (val: string) => void;
}

export function CourseInstructorPicker({
  instructors,
  selectedInstructorId,
  onInstructorChange,
  instructorHeadline,
  onHeadlineChange,
  instructorBio,
  onBioChange,
  selectedInstructor2Id = "",
  onInstructor2Change,
  instructor2Headline = "",
  onHeadline2Change,
  instructor2Bio = "",
  onBio2Change,
}: CourseInstructorPickerProps) {
  const [syncingMaster, setSyncingMaster] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState("");

  const currentInstructor =
    instructors.find((ins) => ins.id === selectedInstructorId) ||
    instructors[0] ||
    null;

  const currentInstructor2 = selectedInstructor2Id
    ? instructors.find((ins) => ins.id === selectedInstructor2Id) || null
    : null;

  const handleInstructorSelect = (id: string) => {
    onInstructorChange(id);
    const chosen = instructors.find((i) => i.id === id);
    if (chosen) {
      if (!instructorHeadline && chosen.headline) {
        onHeadlineChange(chosen.headline);
      }
      if (!instructorBio && chosen.bio) {
        onBioChange(chosen.bio);
      }
    }
  };

  const handleInstructor2Select = (id: string) => {
    onInstructor2Change?.(id);
    const chosen = instructors.find((i) => i.id === id);
    if (chosen) {
      if (!instructor2Headline && chosen.headline) {
        onHeadline2Change?.(chosen.headline);
      }
      if (!instructor2Bio && chosen.bio) {
        onBio2Change?.(chosen.bio);
      }
    }
  };

  const handleCopyBaseBio = () => {
    if (currentInstructor?.bio) {
      onBioChange(currentInstructor.bio);
    }
    if (currentInstructor?.headline) {
      onHeadlineChange(currentInstructor.headline);
    }
  };

  const handleCopyBaseBio2 = () => {
    if (currentInstructor2?.bio) {
      onBio2Change?.(currentInstructor2.bio);
    }
    if (currentInstructor2?.headline) {
      onHeadline2Change?.(currentInstructor2.headline);
    }
  };

  const handleSaveToMasterProfile = async () => {
    if (!currentInstructor) return;
    setSyncingMaster(true);
    setSyncError("");
    setSyncSuccess(false);

    try {
      const res = await fetch("/api/admin/instructors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentInstructor.id,
          headline: instructorHeadline || null,
          bio: instructorBio || null,
        }),
      });

      if (res.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      } else {
        const d = await res.json();
        setSyncError(d.error || "Gagal memperbarui profil master instruktur");
      }
    } catch {
      setSyncError("Terjadi kesalahan jaringan");
    } finally {
      setSyncingMaster(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-7">
      <div className="border-b border-stone-100 pb-3">
        <h2 className="font-semibold text-stone-900 text-base">
          Instruktur &amp; Narasi &ldquo;Tentang Instruktur&rdquo;
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Tentukan instruktur pengampu kursus ini (bisa 1 atau 2 instruktur) serta sesuaikan gelar/jabatan dan biografi yang tampil di halaman publik kursus
        </p>
      </div>

      {/* ========================================================= */}
      {/* 1. INSTRUKTUR UTAMA */}
      {/* ========================================================= */}
      <div className="space-y-4 rounded-xl p-4 bg-slate-50/70 border border-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            1. Instruktur Utama (Lead Instructor)
          </span>
          <span className="text-xs text-stone-500 font-normal">
            Wajib dipilih
          </span>
        </div>

        {/* Select Instructor 1 */}
        <div className="space-y-1.5">
          <label htmlFor="course-instructor-select" className="text-sm font-medium text-stone-700 block">
            Pilih Instruktur Utama
          </label>
          <select
            id="course-instructor-select"
            name="instructorId"
            value={selectedInstructorId}
            onChange={(e) => handleInstructorSelect(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          >
            {instructors.length === 0 ? (
              <option value="">Tidak ada instruktur</option>
            ) : (
              instructors.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name || "Tanpa Nama"} — ({ins.email}) [{ins.role}]
                </option>
              ))
            )}
          </select>
        </div>

        {/* Selected Instructor 1 Info Card */}
        {currentInstructor && (
          <div className="p-3.5 rounded-xl border border-blue-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs overflow-hidden">
                {currentInstructor.image ? (
                  <img
                    src={currentInstructor.image}
                    alt={currentInstructor.name || "Instructor"}
                    width={44}
                    height={44}
                    style={{ aspectRatio: "1 / 1" }}
                    className="w-full h-full object-cover aspect-square"
                  />
                ) : (
                  <span>{(currentInstructor.name || "A")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {currentInstructor.name || "Tanpa Nama"}
                </h4>
                <p className="text-xs text-stone-500 flex items-center gap-1.5 truncate">
                  <Mail size={12} className="text-stone-400" />
                  <span>{currentInstructor.email}</span>
                </p>
              </div>
            </div>

            {currentInstructor.bio && (
              <button
                type="button"
                onClick={handleCopyBaseBio}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-2xs transition-colors shrink-0"
                title="Salin headline & bio dari akun master instruktur"
              >
                <Sparkles size={12} />
                <span>Gunakan Data Profil</span>
              </button>
            )}
          </div>
        )}

        {/* Headline / Title Input 1 */}
        <div className="space-y-1.5">
          <label htmlFor="course-instructor-headline" className="text-sm font-medium text-stone-700 block">
            Jabatan / Gelar / Headline Instruktur Utama
          </label>
          <input
            id="course-instructor-headline"
            name="instructorHeadline"
            type="text"
            value={instructorHeadline}
            onChange={(e) => onHeadlineChange(e.target.value)}
            placeholder="Contoh: Lead Instructor & RnD Director / Pakar MCDM & Analisis Keputusan"
            className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Bio / About Textarea 1 */}
        <div className="space-y-1.5">
          <label htmlFor="course-instructor-bio" className="text-sm font-medium text-stone-700 block">
            Biografi / Tentang Instruktur Utama
          </label>
          <textarea
            id="course-instructor-bio"
            name="instructorBio"
            rows={3}
            value={instructorBio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Tuliskan pengalaman industri, sertifikasi internasional, atau capaian instruktur utama..."
            className="w-full p-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. INSTRUKTUR KEDUA (CO-INSTRUCTOR) - OPSIONAL */}
      {/* ========================================================= */}
      <div className="space-y-4 rounded-xl p-4 bg-teal-50/40 border border-teal-200/70">
        <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md">
            2. Instruktur Kedua / Co-Instructor (Opsional)
          </span>
          <span className="text-xs text-stone-500 font-normal">
            Bisa dikosongkan jika kursus hanya diampu 1 orang
          </span>
        </div>

        {/* Select Instructor 2 */}
        <div className="space-y-1.5">
          <label htmlFor="course-instructor2-select" className="text-sm font-medium text-stone-700 block">
            Pilih Instruktur Kedua (Co-Instructor)
          </label>
          <select
            id="course-instructor2-select"
            name="instructor2Id"
            value={selectedInstructor2Id}
            onChange={(e) => handleInstructor2Select(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
          >
            <option value="">-- Tanpa Instruktur Kedua --</option>
            {instructors
              .filter((ins) => ins.id !== selectedInstructorId)
              .map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name || "Tanpa Nama"} — ({ins.email}) [{ins.role}]
                </option>
              ))}
          </select>
        </div>

        {/* If Instructor 2 is selected */}
        {currentInstructor2 && (
          <>
            {/* Selected Instructor 2 Info Card */}
            <div className="p-3.5 rounded-xl border border-teal-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs overflow-hidden">
                  {currentInstructor2.image ? (
                    <img
                      src={currentInstructor2.image}
                      alt={currentInstructor2.name || "Co-Instructor"}
                      width={44}
                      height={44}
                      style={{ aspectRatio: "1 / 1" }}
                      className="w-full h-full object-cover aspect-square"
                    />
                  ) : (
                    <span>{(currentInstructor2.name || "B")[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-stone-900 text-sm truncate">
                    {currentInstructor2.name || "Tanpa Nama"}
                  </h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 truncate">
                    <Mail size={12} className="text-stone-400" />
                    <span>{currentInstructor2.email}</span>
                  </p>
                </div>
              </div>

              {currentInstructor2.bio && (
                <button
                  type="button"
                  onClick={handleCopyBaseBio2}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold shadow-2xs transition-colors shrink-0"
                  title="Salin headline & bio dari akun master instruktur kedua"
                >
                  <Sparkles size={12} />
                  <span>Gunakan Data Profil</span>
                </button>
              )}
            </div>

            {/* Headline 2 */}
            <div className="space-y-1.5">
              <label htmlFor="course-instructor2-headline" className="text-sm font-medium text-stone-700 block">
                Jabatan / Gelar / Headline Instruktur Kedua
              </label>
              <input
                id="course-instructor2-headline"
                name="instructor2Headline"
                type="text"
                value={instructor2Headline}
                onChange={(e) => onHeadline2Change?.(e.target.value)}
                placeholder="Contoh: Co-Instructor & AI Research Specialist / Dosen Pembimbing Praktik"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Bio 2 */}
            <div className="space-y-1.5">
              <label htmlFor="course-instructor2-bio" className="text-sm font-medium text-stone-700 block">
                Biografi / Tentang Instruktur Kedua
              </label>
              <textarea
                id="course-instructor2-bio"
                name="instructor2Bio"
                rows={3}
                value={instructor2Bio}
                onChange={(e) => onBio2Change?.(e.target.value)}
                placeholder="Tuliskan pengalaman industri, bidang keahlian spesifik, atau latar belakang akademisi instruktur pendamping..."
                className="w-full p-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed font-sans"
              />
            </div>
          </>
        )}
      </div>

      {/* Optional: Save to Master Profile */}
      {currentInstructor && (
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-stone-100">
          <p className="text-stone-500 flex items-center gap-1.5">
            <HelpCircle size={13} className="text-stone-400 shrink-0" />
            <span>
              Ingin headline dan biografi di atas berlaku permanen untuk profil master instruktur utama?
            </span>
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={syncingMaster}
            onClick={handleSaveToMasterProfile}
            leftIcon={<Save size={13} />}
            className="rounded-xl text-xs font-semibold shrink-0"
          >
            Simpan ke Profil Master
          </Button>
        </div>
      )}

      {syncSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>Profil master instruktur berhasil diperbarui!</span>
        </div>
      )}

      {syncError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="text-red-600 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}
    </div>
  );
}
