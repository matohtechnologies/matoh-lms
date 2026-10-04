"use client";

import React, { useState, useRef } from "react";
import {
  CertificateDesignConfig,
  CertificateElement,
  CertificateDataValues,
  DEFAULT_DESIGN_PRESETS,
  PLACEHOLDER_OPTIONS,
} from "@/lib/certificate-templates";
import { CertificateCanvasRenderer } from "./certificate-canvas-renderer";
import {
  Palette,
  Type,
  Move,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Layers,
  Sliders,
  Eye,
  RefreshCcw,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface CertificateDesignerProps {
  initialConfig?: CertificateDesignConfig | null;
  initialTemplateUrl?: string | null;
  sampleData: CertificateDataValues;
  onSave: (config: CertificateDesignConfig, backgroundUrl?: string | null) => Promise<void>;
  courseTitle: string;
}

export function CertificateDesigner({
  initialConfig,
  initialTemplateUrl,
  sampleData,
  onSave,
  courseTitle,
}: CertificateDesignerProps) {
  // Setup config with fallback to Classic Gold preset
  const defaultInitial = initialConfig && initialConfig.elements?.length > 0
    ? initialConfig
    : {
        ...DEFAULT_DESIGN_PRESETS[0].config,
        backgroundUrl: initialTemplateUrl || null,
      };

  const [config, setConfig] = useState<CertificateDesignConfig>(defaultInitial);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    config.elements[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<"element" | "canvas" | "presets" | "elements_list">("element");
  const [previewMode, setPreviewMode] = useState<"sample" | "tags">("sample");
  const [zoomScale, setZoomScale] = useState<"fit" | "75" | "100" | "125">("100");
  const [isWideStudio, setIsWideStudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = config.elements.find((el) => el.id === selectedElementId);

  const handleZoomOut = () => {
    if (zoomScale === "125") setZoomScale("100");
    else if (zoomScale === "100") setZoomScale("75");
    else if (zoomScale === "75") setZoomScale("fit");
  };

  const handleZoomIn = () => {
    if (zoomScale === "fit") setZoomScale("75");
    else if (zoomScale === "75") setZoomScale("100");
    else if (zoomScale === "100") setZoomScale("125");
  };

  const currentRatio = config.aspectRatio || "a4";
  const getRatioDimensionText = () => {
    switch (currentRatio) {
      case "16:9":
        return "1050 × 590 px (16:9 Widescreen)";
      case "16:10":
        return "1050 × 656 px (16:10 Standar)";
      case "a4":
      default:
        return "1050 × 742 px (A4 Landscape 297 × 210 mm)";
    }
  };

  // Handle selecting an element from canvas or list
  const handleSelectElement = (id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      setActiveTab("element"); // Automatically switch to "Elemen" tab!
    }
  };

  // Update a single property of selected element
  const updateSelectedElement = (updates: Partial<CertificateElement>) => {
    if (!selectedElementId) return;
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el
      ),
    }));
  };

  // Update element position from drag
  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, x, y } : el)),
    }));
  };

  // Add new element
  const handleAddElement = (type: "placeholder" | "custom_text", keyOrText?: string) => {
    const newId = `el-${Date.now()}`;
    const newElement: CertificateElement =
      type === "placeholder"
        ? {
            id: newId,
            name: PLACEHOLDER_OPTIONS.find((p) => p.key === keyOrText)?.label || "Placeholder",
            type: "placeholder",
            placeholderKey: (keyOrText as any) || "student_name",
            x: 50,
            y: 50,
            fontSize: 18,
            fontWeight: "bold",
            fontFamily: "sans",
            color: "#1c1917",
            textAlign: "center",
          }
        : {
            id: newId,
            name: "Teks Kustom",
            type: "custom_text",
            customText: keyOrText || "Teks Baru",
            x: 50,
            y: 50,
            fontSize: 14,
            fontWeight: "normal",
            fontFamily: "sans",
            color: "#44403c",
            textAlign: "center",
          };

    setConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newId);
    setActiveTab("element");
  };

  // Remove element
  const handleDeleteElement = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Apply preset design
  const handleApplyPreset = (preset: typeof DEFAULT_DESIGN_PRESETS[0]) => {
    if (confirm(`Terapkan gaya desain "${preset.name}"? Pengaturan posisi elemen akan disesuaikan dengan template ini.`)) {
      setConfig({
        ...preset.config,
        backgroundUrl: config.backgroundUrl || preset.config.backgroundUrl || null,
      });
      setSelectedElementId(preset.config.elements[0]?.id || null);
    }
  };

  // Handle background template upload
  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "certificates");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah file gambar");

      setConfig((prev) => ({
        ...prev,
        backgroundUrl: data.url,
        backgroundType: "image",
      }));
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah template latar belakang");
    } finally {
      setUploadingBg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Save
  const handleSaveDesign = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(config, config.backgroundUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      alert("Terjadi kesalahan saat menyimpan desain sertifikat");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Studio Editor Desain Sertifikat</h3>
            <p className="text-xs text-stone-500">
              Geser elemen langsung pada kanvas, atur tipografi, atau gunakan template preset.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Preview Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setPreviewMode("sample")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                previewMode === "sample"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Data Contoh
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("tags")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                previewMode === "tags"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Placeholder
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveDesign}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Simpan Desain
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <span>Desain tata letak sertifikat berhasil disimpan ke sistem!</span>
        </div>
      )}

      {/* Main Designer Grid: Canvas + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Canvas Work Area (8 cols in split mode, 12 cols in wide studio mode) */}
        <div className={`${isWideStudio ? "lg:col-span-12" : "lg:col-span-8"} space-y-3 transition-all`}>
          <div className="bg-stone-900 rounded-3xl p-4 sm:p-5 shadow-warm-lg flex flex-col border border-stone-800">
            {/* Workbench Header Toolbar: Dimension info, Aspect ratio, Zoom, and Wide Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-stone-800 text-xs">
              {/* Left: Document Dimension & Aspect Ratio Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800/80 text-amber-300 font-mono text-[11px] border border-stone-700/60 shadow-2xs">
                  📐 {getRatioDimensionText()}
                </span>

                <div className="flex items-center bg-stone-800/90 rounded-lg p-0.5 border border-stone-700/60">
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: "a4" }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      currentRatio === "a4" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    A4 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: "16:10" }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      currentRatio === "16:10" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    16:10
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: "16:9" }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      currentRatio === "16:9" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    16:9
                  </button>
                </div>
              </div>

              {/* Right: Zoom Controls & Wide Workspace Toggle */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-stone-800/90 rounded-lg p-0.5 border border-stone-700/60">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale === "fit"}
                    className="p-1 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomScale("fit")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      zoomScale === "fit" ? "bg-stone-700 text-white font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale("75")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      zoomScale === "75" ? "bg-stone-700 text-white font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale("100")}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                      zoomScale === "100" ? "bg-orange-600 text-white shadow-xs" : "text-amber-400 hover:text-amber-300"
                    }`}
                    title="Ukuran Nyata Dokumen (1050px)"
                  >
                    100% (Ukuran Sebenarnya)
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale("125")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      zoomScale === "125" ? "bg-stone-700 text-white font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    125%
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale === "125"}
                    className="p-1 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWideStudio(!isWideStudio)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isWideStudio
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700"
                  }`}
                  title={isWideStudio ? "Kembalikan Tampilan Split" : "Perluas Studio Kanvas Penuh"}
                >
                  {isWideStudio ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Scrollable Artboard Canvas Stage */}
            <div className="w-full overflow-auto p-2 sm:p-6 flex justify-center items-center rounded-2xl bg-stone-950/50 border border-stone-800/80 min-h-[440px]">
              <div
                style={{
                  width:
                    zoomScale === "fit"
                      ? "100%"
                      : zoomScale === "75"
                      ? "788px"
                      : zoomScale === "125"
                      ? "1312px"
                      : "1050px", // 100% Ukuran Sebenarnya!
                  maxWidth: zoomScale === "fit" ? "1050px" : undefined,
                  minWidth: zoomScale === "100" ? "1050px" : zoomScale === "125" ? "1312px" : undefined,
                }}
                className="transition-all duration-200 shrink-0"
              >
                <CertificateCanvasRenderer
                  config={config}
                  data={sampleData}
                  isInteractive={true}
                  selectedElementId={selectedElementId}
                  onSelectElement={handleSelectElement}
                  onUpdateElementPosition={handleUpdatePosition}
                  useSampleFallback={previewMode === "sample"}
                  className="rounded-2xl shadow-2xl bg-white"
                />
              </div>
            </div>

            <p className="text-[11px] text-stone-400 mt-3 text-center">
              💡 <span className="font-semibold text-stone-300">Tips:</span> Kanvas dirender pada{" "}
              <strong className="text-amber-300">Ukuran Sebenarnya (1050px)</strong> sehingga proporsi huruf dan tata letak persis sama dengan hasil cetak. Klik dan geser elemen teks untuk mengubah posisi.
            </p>
          </div>

          {/* Quick Add Placeholder Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
            <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Plus size={14} className="text-orange-600" />
              Tambah Placeholder Data Cepat ke Kanvas:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PLACEHOLDER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleAddElement("placeholder", opt.key)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-orange-50 hover:border-orange-300 text-stone-700 hover:text-orange-700 text-[11px] font-medium transition-colors"
                >
                  + {opt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAddElement("custom_text", "Teks Tambahan")}
                className="px-2.5 py-1 rounded-lg border border-dashed border-stone-300 bg-white hover:bg-stone-50 text-stone-600 text-[11px] font-semibold transition-colors"
              >
                + Teks Bebas
              </button>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Inspector & Settings Tabs */}
        <div
          className={`${
            isWideStudio ? "lg:col-span-12" : "lg:col-span-4"
          } bg-white rounded-2xl border border-stone-200 shadow-warm overflow-hidden transition-all`}
        >
          {/* Inspector Tab Bar */}
          <div className="flex border-b border-stone-200 bg-stone-50/70 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("element")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "element"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Type size={14} />
              Elemen
              {selectedElement && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("canvas")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "canvas"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Palette size={14} />
              Kanvas &amp; Latar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "presets"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles size={14} />
              Template
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("elements_list")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "elements_list"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Layers size={14} />
              Daftar ({config.elements.length})
            </button>
          </div>

          {/* Tab 1: Element Properties */}
          {activeTab === "element" && (
            <div className="p-5 space-y-4">
              {selectedElement ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {selectedElement.type === "placeholder" ? "Placeholder Sistem" : "Teks Kustom"}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">{selectedElement.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteElement(selectedElement.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus elemen ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Element Content */}
                  {selectedElement.type === "placeholder" ? (
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        Pilih Data Placeholder:
                      </label>
                      <select
                        value={selectedElement.placeholderKey || "student_name"}
                        onChange={(e) => {
                          const opt = PLACEHOLDER_OPTIONS.find((p) => p.key === e.target.value);
                          updateSelectedElement({
                            placeholderKey: e.target.value as any,
                            name: opt?.label || "Placeholder",
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-orange-500 bg-white"
                      >
                        {PLACEHOLDER_OPTIONS.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label} ({p.tag})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        Teks Kustom (Mendukung tag placeholder):
                      </label>
                      <textarea
                        rows={2}
                        value={selectedElement.customText || ""}
                        onChange={(e) => updateSelectedElement({ customText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-orange-500 resize-none"
                      />
                    </div>
                  )}

                  {/* Typography Row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        Jenis Font
                      </label>
                      <select
                        value={selectedElement.fontFamily || "sans"}
                        onChange={(e) => updateSelectedElement({ fontFamily: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                      >
                        <option value="serif">Serif (Elegan)</option>
                        <option value="sans">Sans-serif (Modern)</option>
                        <option value="jakarta">Plus Jakarta Sans</option>
                        <option value="mono">Monospace (Kode)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        Ketebalan
                      </label>
                      <select
                        value={selectedElement.fontWeight || "normal"}
                        onChange={(e) => updateSelectedElement({ fontWeight: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                      >
                        <option value="normal">Normal (400)</option>
                        <option value="medium">Medium (500)</option>
                        <option value="semibold">Semibold (600)</option>
                        <option value="bold">Bold (700)</option>
                        <option value="extrabold">Extra Bold (800)</option>
                      </select>
                    </div>
                  </div>

                  {/* Font Size & Color */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-semibold text-stone-500 uppercase">
                          Ukuran Teks
                        </label>
                        <span className="text-[10px] font-bold text-stone-700">
                          {selectedElement.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="9"
                        max="48"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                        className="w-full accent-orange-600 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        Warna Teks
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.color || "#1c1917"}
                          onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-200 p-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.color || "#1c1917"}
                          onChange={(e) => updateSelectedElement({ color: e.target.value })}
                          className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alignment & Styles */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
                        Perataan
                      </label>
                      <div className="flex items-center border border-stone-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({ textAlign: "left" })}
                          className={`p-1.5 rounded ${
                            selectedElement.textAlign === "left"
                              ? "bg-orange-100 text-orange-700"
                              : "text-stone-400 hover:text-stone-700"
                          }`}
                        >
                          <AlignLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({ textAlign: "center" })}
                          className={`p-1.5 rounded ${
                            selectedElement.textAlign === "center"
                              ? "bg-orange-100 text-orange-700"
                              : "text-stone-400 hover:text-stone-700"
                          }`}
                        >
                          <AlignCenter size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSelectedElement({ textAlign: "right" })}
                          className={`p-1.5 rounded ${
                            selectedElement.textAlign === "right"
                              ? "bg-orange-100 text-orange-700"
                              : "text-stone-400 hover:text-stone-700"
                          }`}
                        >
                          <AlignRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                        <input
                          type="checkbox"
                          checked={selectedElement.fontStyle === "italic"}
                          onChange={(e) =>
                            updateSelectedElement({
                              fontStyle: e.target.checked ? "italic" : "normal",
                            })
                          }
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span>Miring</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-stone-700">
                        <input
                          type="checkbox"
                          checked={selectedElement.uppercase || false}
                          onChange={(e) => updateSelectedElement({ uppercase: e.target.checked })}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span>KAPITAL</span>
                      </label>
                    </div>
                  </div>

                  {/* Position Coordinates */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Move size={12} /> Koordinat Posisi (%):
                      </span>
                      <span>X: {selectedElement.x}% • Y: {selectedElement.y}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Posisi X (% dari kiri)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedElement.x}
                          onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded border border-stone-200 bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block">Posisi Y (% dari atas)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedElement.y}
                          onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded border border-stone-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <Type size={32} className="mx-auto text-stone-300" />
                  <p className="text-xs font-semibold text-stone-600">Belum Ada Elemen Dipilih</p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    Klik teks mana pun di atas kanvas atau pilih dari tab &quot;Daftar&quot; untuk mengedit ukuran, font, warna, dan posisinya.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Canvas & Background Settings */}
          {activeTab === "canvas" && (
            <div className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Pengaturan Latar &amp; Bingkai Kanvas
              </h4>

              {/* Format & Rasio Aspek Kanvas */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2.5">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Sliders size={14} className="text-orange-600" />
                  Format Dokumen &amp; Rasio Aspek
                </span>
                <p className="text-[11px] text-stone-500">
                  Pilih ukuran standar yang digunakan saat mencetak PDF dan menampilkan sertifikat:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: "a4" }))}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      currentRatio === "a4"
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div>
                      <p className="font-bold">A4 Landscape (297 × 210 mm)</p>
                      <p className="text-[10px] text-stone-500 font-normal">
                        Standar resmi ijazah &amp; sertifikat kelulusan (Resolusi 1050 × 742 px)
                      </p>
                    </div>
                    {currentRatio === "a4" && <CheckCircle2 size={16} className="text-orange-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: "16:10" }))}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      currentRatio === "16:10"
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div>
                      <p className="font-bold">Standar Layar Digital (16:10)</p>
                      <p className="text-[10px] text-stone-500 font-normal">
                        Format modern proporsional laptop &amp; tablet (Resolusi 1050 × 656 px)
                      </p>
                    </div>
                    {currentRatio === "16:10" && <CheckCircle2 size={16} className="text-orange-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: "16:9" }))}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      currentRatio === "16:9"
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div>
                      <p className="font-bold">Layar Lebar / Widescreen (16:9)</p>
                      <p className="text-[10px] text-stone-500 font-normal">
                        Format presentasi video &amp; monitor lebar (Resolusi 1050 × 590 px)
                      </p>
                    </div>
                    {currentRatio === "16:9" && <CheckCircle2 size={16} className="text-orange-600 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Upload Custom Background */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <UploadCloud size={14} className="text-orange-600" />
                    Gambar Template Latar Belakang
                  </span>
                  {config.backgroundUrl && (
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, backgroundUrl: null }))}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadBackground}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {config.backgroundUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={config.backgroundUrl}
                      alt="Background"
                      className="w-16 h-10 object-cover rounded border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-stone-700 truncate">
                        Template Kustom Terpasang
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingBg}
                        className="text-[10px] text-orange-600 hover:underline mt-0.5 font-medium"
                      >
                        Ganti File Gambar...
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingBg}
                    className="w-full py-2 px-3 border border-dashed border-stone-300 rounded-xl hover:border-orange-500 hover:bg-orange-50/20 text-stone-600 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {uploadingBg ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                    Unggah Template Gambar Sendiri
                  </button>
                )}
              </div>

              {/* Background Color */}
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Warna Latar Dasar:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor || "#ffffff"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-stone-200 p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor || "#ffffff"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Border Styles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Gaya Bingkai Border:
                  </label>
                  <select
                    value={config.borderStyle || "none"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, borderStyle: e.target.value as any }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                  >
                    <option value="none">Tanpa Border</option>
                    <option value="gold-frame">Bingkai Emas (Parchment)</option>
                    <option value="solid">Garis Tunggal (Solid)</option>
                    <option value="double">Garis Ganda (Double)</option>
                    <option value="dashed">Garis Putus (Dashed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Warna Border:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={config.borderColor || "#e2e8f0"}
                      onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                      className="w-7 h-7 rounded border border-stone-200 p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.borderColor || "#e2e8f0"}
                      onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                      className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Seal Badge Toggle */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-800">Lencana Segel Terverifikasi</p>
                  <p className="text-[10px] text-stone-400">Tampilkan seal badge emas resmi di kanvas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSealBadge ?? true}
                    onChange={(e) => setConfig((prev) => ({ ...prev, showSealBadge: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Tab 3: Template Presets */}
          {activeTab === "presets" && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-stone-500 mb-2">
                Pilih salah satu template siap pakai di bawah untuk mengganti tata letak secara instan:
              </p>
              <div className="space-y-2.5">
                {DEFAULT_DESIGN_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-orange-500 hover:bg-orange-50/30 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 group-hover:text-orange-700">
                        {p.name}
                      </h5>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded shrink-0">
                      Terapkan
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Elements Tree List */}
          {activeTab === "elements_list" && (
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-700">Daftar Elemen Kanvas</span>
                <span className="text-[11px] text-stone-400">{config.elements.length} Elemen</span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {config.elements.map((el, idx) => (
                  <div
                    key={el.id}
                    onClick={() => {
                      setSelectedElementId(el.id);
                      setActiveTab("element");
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      selectedElementId === el.id
                        ? "bg-orange-50 border-orange-300 text-orange-950 font-bold"
                        : "bg-white border-stone-200 hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono text-stone-400">{idx + 1}</span>
                      <span className="truncate">{el.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {el.x}%, {el.y}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(el.id);
                        }}
                        className="text-stone-300 hover:text-red-600 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
