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
}

export function CourseInstructorPicker({
  instructors,
  selectedInstructorId,
  onInstructorChange,
  instructorHeadline,
  onHeadlineChange,
  instructorBio,
  onBioChange,
}: CourseInstructorPickerProps) {
  const [syncingMaster, setSyncingMaster] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState("");

  const currentInstructor =
    instructors.find((ins) => ins.id === selectedInstructorId) ||
    instructors[0] ||
    null;

  const handleInstructorSelect = (id: string) => {
    onInstructorChange(id);
    const chosen = instructors.find((i) => i.id === id);
    if (chosen) {
      // If the course doesn't have custom headline/bio yet, prefill from instructor
      if (!instructorHeadline && chosen.headline) {
        onHeadlineChange(chosen.headline);
      }
      if (!instructorBio && chosen.bio) {
        onBioChange(chosen.bio);
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
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
      <div className="border-b border-stone-100 pb-3">
        <h2 className="font-semibold text-stone-900 text-base">
          Instruktur &amp; Narasi &ldquo;Tentang Instruktur&rdquo;
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Tentukan instruktur pengampu kelas ini serta sesuaikan gelar/jabatan dan biografi yang tampil di halaman publik kelas
        </p>
      </div>

      {/* 1. Select Instructor */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700 flex items-center justify-between">
          <span>Pilih Instruktur Pengampu</span>
          <span className="text-xs text-blue-600 font-normal">
            {instructors.length} Instruktur Terdaftar
          </span>
        </label>
        <select
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

      {/* 2. Selected Instructor Info Card */}
      {currentInstructor && (
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white text-base font-bold shrink-0 shadow-xs overflow-hidden ring-2 ring-white">
              {currentInstructor.image ? (
                <img
                  src={currentInstructor.image}
                  alt={currentInstructor.name || "Instructor"}
                  className="w-full h-full object-cover"
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

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {currentInstructor.bio && (
              <button
                type="button"
                onClick={handleCopyBaseBio}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-xs font-semibold shadow-2xs transition-colors"
                title="Salin headline & bio dari akun master instruktur"
              >
                <Sparkles size={12} />
                <span>Gunakan Data Profil</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Headline / Title Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700">
            Jabatan / Gelar / Headline Instruktur
          </label>
          <span className="text-[11px] text-stone-400">
            Tampil di bawah nama instruktur (berwarna biru)
          </span>
        </div>
        <input
          type="text"
          value={instructorHeadline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          placeholder="Contoh: Lead Instructor & RnD Director / Pakar MCDM & Analisis Keputusan"
          className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* 4. Bio / About Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700">
            Biografi / Tentang Instruktur (Khusus Kelas Ini)
          </label>
          <span className="text-[11px] text-stone-400">
            Mendukung teks multi-baris
          </span>
        </div>
        <textarea
          rows={4}
          value={instructorBio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Tuliskan pengalaman industri, sertifikasi internasional, atau capaian instruktur yang relevan dengan topik kelas ini..."
          className="w-full p-3.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
        />
      </div>

      {/* Optional: Save to Master Profile */}
      {currentInstructor && (
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-stone-500 flex items-center gap-1.5">
            <HelpCircle size={13} className="text-stone-400" />
            <span>
              Ingin headline dan biografi di atas berlaku permanen untuk semua kelas instruktur ini?
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
