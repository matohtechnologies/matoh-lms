"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { resolveThumbnailUrl } from "@/lib/youtube";

interface CourseMediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function CourseMediaPicker({
  value,
  onChange,
  label = "Thumbnail Kursus",
  hint = "Unggah gambar sampul kursus dari komputer atau masukkan link URL gambar (JPG, PNG, WebP).",
}: CourseMediaPickerProps) {
  const [mode, setMode] = useState<"upload" | "link">(
    value?.startsWith("/uploads/") || !value ? "upload" : "link"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewThumbnail = resolveThumbnailUrl(value) || value;

  const handleFileUpload = async (file: File) => {
    // Only accept images for course thumbnail
    if (!file.type.startsWith("image/")) {
      setUploadError("Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan untuk thumbnail kursus.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "courses");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat upload gambar";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <h2 className="font-semibold text-stone-900 text-base">{label}</h2>
          <p className="text-xs text-stone-500 mt-0.5">{hint}</p>
        </div>

        {/* Source Toggle Tabs */}
        <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "upload"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Upload size={13} />
            <span>Upload Gambar</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "link"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <LinkIcon size={13} />
            <span>Tautan / URL</span>
          </button>
        </div>
      </div>

      {/* Input Mode 1: Local File Upload */}
      {mode === "upload" ? (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50/50"
                : "border-stone-300 hover:border-blue-400 bg-stone-50/50 hover:bg-blue-50/20"
            }`}
          >
            <label htmlFor="course-thumbnail-upload" className="sr-only">Unggah Thumbnail</label>
            <input
              id="course-thumbnail-upload"
              name="thumbnailFile"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <ImageIcon size={24} />
                )}
              </div>

              {isUploading ? (
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Mengunggah gambar ke server...
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Mohon tunggu beberapa detik
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Klik untuk memilih gambar atau seret file ke sini
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Format: <strong>JPG, PNG, WebP</strong> (Rasio 16:9 disarankan)
                  </p>
                </div>
              )}
            </div>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Input Mode 2: Link URL */
        <div className="space-y-3">
          <Input
            label="URL Gambar Thumbnail"
            placeholder="https://images.unsplash.com/... atau https://.../gambar.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            hint="Masukkan tautan langsung ke file gambar (JPG, PNG, WebP) atau link YouTube untuk mengambil cover otomatis."
          />
        </div>
      )}

      {/* Live Preview Box */}
      {value && (
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} className="text-emerald-500" />
              <span>Pratinjau Thumbnail Kursus</span>
            </p>

            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
            >
              <Trash2 size={12} />
              <span>Hapus Gambar</span>
            </button>
          </div>

          <div className="w-full sm:w-80 aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewThumbnail}
              alt="Pratinjau Thumbnail"
              width={480}
              height={270}
              style={{ aspectRatio: "16 / 9" }}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src.includes("maxresdefault.jpg")) {
                  img.src = img.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                } else {
                  img.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                }
              }}
            />
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span className="truncate">
              Gambar terpilih: <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded">{value}</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
