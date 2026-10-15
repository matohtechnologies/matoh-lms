"use client";

import React, { useState, useRef } from "react";
import {
  CertificateBackDesignConfig,
  BACK_DESIGN_PRESETS,
  DEFAULT_BACK_DESIGN_PRESET,
} from "@/lib/certificate-templates";
import {
  CertificateTranscriptCard,
  CertificateTranscriptData,
} from "./certificate-transcript-card";
import { dynamicAlert } from "@/components/ui/dynamic-alert-provider";
import {
  Palette,
  Type,
  LayoutGrid,
  CheckCircle2,
  UploadCloud,
  Trash2,
  Sliders,
  Sparkles,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Award,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateBackDesignerProps {
  initialConfig?: CertificateBackDesignConfig | null;
  sampleData: CertificateTranscriptData;
  onSave: (config: CertificateBackDesignConfig) => Promise<void>;
  courseTitle: string;
}

export function CertificateBackDesigner({
  initialConfig,
  sampleData,
  onSave,
  courseTitle,
}: CertificateBackDesignerProps) {
  const [config, setConfig] = useState<CertificateBackDesignConfig>(
    initialConfig || DEFAULT_BACK_DESIGN_PRESET
  );
  const [activeTab, setActiveTab] = useState<"style" | "text" | "table" | "summary" | "presets">("style");
  const [zoomScale, setZoomScale] = useState<"fit" | "100">("100");
  const [isWideStudio, setIsWideStudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      await dynamicAlert({
        title: "Ukuran Terlalu Besar",
        message: "Ukuran file gambar maksimal adalah 5MB.",
        variant: "warning",
      });
      return;
    }

    setUploadingBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "certificates/back-templates");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah template");

      setConfig((prev) => ({
        ...prev,
        backgroundUrl: data.url,
      }));
    } catch (err: unknown) {
      await dynamicAlert({
        title: "Gagal Mengunggah",
        message: err instanceof Error ? err.message : "Gagal mengunggah gambar latar",
        variant: "danger",
      });
    } finally {
      setUploadingBg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveBg = () => {
    setConfig((prev) => ({
      ...prev,
      backgroundUrl: null,
    }));
  };

  const handleApplyPreset = (presetConfig: CertificateBackDesignConfig) => {
    setConfig({
      ...presetConfig,
      backgroundUrl: config.backgroundUrl, // retain uploaded background image if any
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      await dynamicAlert({
        title: "Gagal Menyimpan",
        message: "Gagal menyimpan desain sisi belakang sertifikat",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Studio Desain Sisi Belakang (Transkrip Nilai)
            </h3>
            <p className="text-xs text-stone-500">
              Kustomisasi tampilan tabel nilai, latar belakang, kolom penilaian, dan stempel kelulusan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-in fade-in">
              <CheckCircle2 size={14} className="text-green-600" />
              Tersimpan!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Simpan Desain Sisi Belakang
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Live Preview & Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Canvas Work Area (8 cols in split mode, 12 cols in wide studio mode) */}
        <div className={`${isWideStudio ? "lg:col-span-12" : "lg:col-span-8"} space-y-3 transition-all`}>
          <div className="bg-stone-900 rounded-3xl p-4 sm:p-5 shadow-warm-lg flex flex-col border border-stone-800">
            {/* Workbench Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-stone-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800/80 text-sky-300 font-mono text-[11px] border border-stone-700/60 shadow-2xs">
                  📐 A4 Landscape (297 × 210 mm) • 1050 × 742 px
                </span>
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  Pratinjau Transkrip Nilai
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-stone-800/90 rounded-lg p-0.5 border border-stone-700/60">
                  <button
                    type="button"
                    onClick={() => setZoomScale("fit")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      zoomScale === "fit" ? "bg-stone-700 text-white font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale("100")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      zoomScale === "100" ? "bg-blue-600 text-white shadow-xs" : "text-blue-400 hover:text-blue-300"
                    }`}
                  >
                    100% (Ukuran Sebenarnya)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWideStudio(!isWideStudio)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isWideStudio
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700"
                  }`}
                  title={isWideStudio ? "Kembalikan Tampilan Split" : "Perluas Studio Penuh"}
                >
                  {isWideStudio ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Scrollable Artboard Stage */}
            <div className="w-full overflow-auto p-2 sm:p-6 flex justify-center items-center rounded-2xl bg-stone-950/50 border border-stone-800/80 min-h-[440px]">
              <div
                style={{
                  width: zoomScale === "fit" ? "100%" : "1050px",
                  maxWidth: zoomScale === "fit" ? "1050px" : undefined,
                  minWidth: zoomScale === "100" ? "1050px" : undefined,
                }}
                className="transition-all duration-200 shrink-0"
              >
                <CertificateTranscriptCard
                  data={sampleData}
                  backConfig={config}
                  className="w-full h-auto shadow-2xl"
                />
              </div>
            </div>

            <p className="text-[11px] text-stone-400 mt-3 text-center">
              💡 <span className="font-semibold text-stone-300">Tips:</span> Desain transkrip di atas ditampilkan dalam{" "}
              <strong className="text-sky-300">Ukuran Sebenarnya (1050px)</strong> sesuai dokumen asli.
            </p>
          </div>
        </div>

        {/* Right / Bottom: Controls */}
        <div
          className={`${
            isWideStudio ? "lg:col-span-12" : "lg:col-span-4"
          } bg-white rounded-2xl border border-stone-200 p-5 space-y-5 shadow-xs transition-all`}
        >
          {/* Internal Subtabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("style")}
              className={cn(
                "flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center",
                activeTab === "style" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              )}
            >
              Latar &amp; Bingkai
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={cn(
                "flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center",
                activeTab === "text" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              )}
            >
              Teks Judul
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={cn(
                "flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center",
                activeTab === "table" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              )}
            >
              Tabel &amp; Kolom
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={cn(
                "flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center",
                activeTab === "summary" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              )}
            >
              Komponen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={cn(
                "flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center",
                activeTab === "presets" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              )}
            >
              Preset
            </button>
          </div>

          {/* TAB 1: LATAR & BINGKAI */}
          {activeTab === "style" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Template Gambar Latar Belakang (Back Template)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadBg}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {config.backgroundUrl ? (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={config.backgroundUrl}
                        alt="Template Belakang"
                        className="w-16 h-10 object-cover rounded-md border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-800 truncate">Template Kustom Terpasang</p>
                        <a
                          href={config.backgroundUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                        >
                          Lihat Gambar <ExternalLink size={9} />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingBg}
                        className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        Ganti Gambar
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveBg}
                        className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-xl border-2 border-dashed border-stone-200 hover:border-blue-400 bg-stone-50/50 hover:bg-blue-50/20 text-center cursor-pointer transition-all"
                  >
                    <UploadCloud size={20} className="mx-auto text-blue-600 mb-1.5" />
                    <p className="text-xs font-bold text-stone-800">
                      {uploadingBg ? "Mengunggah..." : "Unggah Gambar Template Belakang"}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, JPEG (Maks. 5MB)</p>
                  </div>
                )}
              </div>

              {/* Border Styles */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Gaya Bingkai Luar (Border Style)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "solid", label: "Bingkai Standar (Solid)" },
                    { id: "gold-frame", label: "Bingkai Emas (Gold Frame)" },
                    { id: "double", label: "Garis Ganda (Double)" },
                    { id: "dashed", label: "Garis Putus (Dashed)" },
                    { id: "none", label: "Tanpa Bingkai Luar" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setConfig({ ...config, borderStyle: b.id as any })}
                      className={cn(
                        "p-2.5 rounded-xl text-left text-xs font-semibold border transition-all",
                        config.borderStyle === b.id
                          ? "bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-2xs"
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Warna Latar Belakang (Base Color)
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { color: "#ffffff", label: "Putih Murni" },
                    { color: "#fffdf9", label: "Kuning Gading" },
                    { color: "#f8fafc", label: "Biru Salju" },
                    { color: "#fafaf9", label: "Batu Hangat" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setConfig({ ...config, backgroundColor: c.color })}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        config.backgroundColor === c.color
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-stone-200"
                      )}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEKS & JUDUL */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Judul Utama Transkrip
                </label>
                <input
                  type="text"
                  value={config.headerTitle}
                  onChange={(e) => setConfig({ ...config, headerTitle: e.target.value })}
                  placeholder="Transkrip Nilai & Capaian Kompetensi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Subjudul Dokumen (Bahasa Inggris / Keterangan)
                </label>
                <input
                  type="text"
                  value={config.headerSubtitle}
                  onChange={(e) => setConfig({ ...config, headerSubtitle: e.target.value })}
                  placeholder="Official Academic Transcript & Competency Assessment"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TABEL & KOLOM */}
          {activeTab === "table" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Tema Warna Header Tabel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "dark", label: "Slate Charcoal (Standar)", color: "bg-stone-900" },
                    { id: "amber", label: "Classic Amber / Gold", color: "bg-amber-900" },
                    { id: "blue", label: "Ocean Maritime Blue", color: "bg-sky-950" },
                    { id: "emerald", label: "Emerald Eco Green", color: "bg-emerald-950" },
                    { id: "minimal", label: "Minimalist Light", color: "bg-stone-100" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setConfig({ ...config, tableTheme: t.id as any })}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold border transition-all",
                        config.tableTheme === t.id
                          ? "bg-blue-50 border-blue-500 text-blue-950 font-bold shadow-2xs"
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                      )}
                    >
                      <span className={cn("w-3.5 h-3.5 rounded-md shrink-0 border border-stone-300", t.color)} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Switches */}
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <p className="text-xs font-bold text-stone-800">Visibilitas Kolom Tabel:</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700">Kolom Kategori (Modul / Kuis / Tugas)</span>
                  <input
                    type="checkbox"
                    checked={config.showCategoryColumn}
                    onChange={(e) => setConfig({ ...config, showCategoryColumn: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700">Kolom Beban Jam Pelajaran (JP)</span>
                  <input
                    type="checkbox"
                    checked={config.showWorkloadColumn}
                    onChange={(e) => setConfig({ ...config, showWorkloadColumn: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700">Kolom Grade Huruf (A / B / C)</span>
                  <input
                    type="checkbox"
                    checked={config.showGradeColumn}
                    onChange={(e) => setConfig({ ...config, showGradeColumn: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-700">Kolom Lencana Status (Kompeten / Lulus)</span>
                  <input
                    type="checkbox"
                    checked={config.showStatusBadge}
                    onChange={(e) => setConfig({ ...config, showStatusBadge: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KOMPONEN RINGKASAN & VERIFIKASI */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-stone-800">Komponen Penilaian &amp; Legalisasi:</p>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <div>
                  <p className="text-xs font-semibold text-stone-800">Kartu Skor Rata-rata Kumulatif</p>
                  <p className="text-[10px] text-stone-400">Menampilkan kalkulasi skor 0-100</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.showScoreSummary}
                  onChange={(e) => setConfig({ ...config, showScoreSummary: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <div>
                  <p className="text-xs font-semibold text-stone-800">Kartu Predikat Kelulusan</p>
                  <p className="text-[10px] text-stone-400">Menampilkan predikat (Dengan Pujian, dll)</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPredicate}
                  onChange={(e) => setConfig({ ...config, showPredicate: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <div>
                  <p className="text-xs font-semibold text-stone-800">Panduan Skala Penilaian</p>
                  <p className="text-[10px] text-stone-400">Keterangan standar nilai 85-100 dsb.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.showScaleLegend}
                  onChange={(e) => setConfig({ ...config, showScaleLegend: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-xs font-semibold text-stone-800">QR Code Verifikasi Online</p>
                  <p className="text-[10px] text-stone-400">Pindai kamera untuk validasi sertifikat sah</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.showQrCode}
                  onChange={(e) => setConfig({ ...config, showQrCode: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 5: PRESET */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-800">Pilih Preset Tema Siap Pakai:</p>
              {BACK_DESIGN_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleApplyPreset(p.config)}
                  className={cn(
                    "p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:border-blue-400 group",
                    config.presetId === p.id
                      ? "bg-blue-50/70 border-blue-500 shadow-2xs"
                      : "bg-white border-stone-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-600">
                      Terapkan
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
