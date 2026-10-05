"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
  Sparkles,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  extractYouTubeVideoId,
  getEmbedUrl,
  isVideoUrl,
  isYouTubeUrl,
  resolveThumbnailUrl,
} from "@/lib/youtube";

interface CourseMediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function CourseMediaPicker({
  value,
  onChange,
  label = "Thumbnail & Media Banner Kelas",
  hint,
}: CourseMediaPickerProps) {
  const [mode, setMode] = useState<"link" | "upload">(
    value?.startsWith("/uploads/") ? "upload" : "link"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = isVideoUrl(value);
  const isYouTube = isYouTubeUrl(value);
  const isImage = value && !isVideo && !isYouTube;
  const youTubeEmbedUrl = isYouTube ? getEmbedUrl(value, true) : null;
  const previewThumbnail = resolveThumbnailUrl(value);

  const handleFileUpload = async (file: File) => {
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

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah file");
      }

      onChange(data.url);
      setTestPlaying(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat upload";
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

  const handleLinkInput = (inputVal: string) => {
    const trimmed = inputVal.trim();
    if (isYouTubeUrl(trimmed)) {
      // If YouTube video, auto-resolve thumbnail or keep video URL
      onChange(trimmed);
    } else {
      onChange(trimmed);
    }
    setTestPlaying(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <h2 className="font-semibold text-stone-900 text-base">{label}</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {hint || "Unggah video/gambar dari komputer atau masukkan link URL (mendukung YouTube & MP4)"}
          </p>
        </div>

        {/* Source Toggle Tabs */}
        <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 self-start sm:self-auto">
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
            <span>Tautan / Link</span>
          </button>
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
            <span>Upload File Lokal</span>
          </button>
        </div>
      </div>

      {/* Input Mode 1: Link URL */}
      {mode === "link" ? (
        <div className="space-y-3">
          <Input
            label="URL Gambar atau Link Video"
            placeholder="https://www.youtube.com/watch?v=... atau https://images.unsplash.com/... atau https://.../video.mp4"
            value={value}
            onChange={(e) => handleLinkInput(e.target.value)}
            hint="Mendukung link video YouTube, URL file video langsung (.mp4, .webm), atau link gambar banner."
          />

          {isYouTube && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-xs">
              <Film size={15} className="shrink-0 text-red-500" />
              <span>
                <strong>Video YouTube Terdeteksi!</strong> Siswa dapat langsung memutar video ini di halaman kelas, dan gambar thumbnail resolusi tinggi otomatis diambil sebagai poster.
              </span>
            </div>
          )}

          {isVideo && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-700 text-xs">
              <Video size={15} className="shrink-0 text-blue-500" />
              <span>
                <strong>File Video Terdeteksi!</strong> Media ini akan disajikan sebagai video preview banner yang dapat diputar siswa.
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Input Mode 2: Local File Upload */
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
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
                  <Upload size={24} />
                )}
              </div>

              {isUploading ? (
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Mengunggah file ke server...
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Mohon tunggu beberapa detik
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Klik untuk memilih file atau seret file ke sini
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Mendukung <strong>Gambar</strong> (JPG, PNG, WebP hingga 15MB) atau <strong>Video</strong> (MP4, WebM hingga 100MB)
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
      )}

      {/* Live Interactive Preview Box */}
      {value && (
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              {isVideo ? (
                <Video size={14} className="text-blue-500" />
              ) : isYouTube ? (
                <Film size={14} className="text-red-500" />
              ) : (
                <ImageIcon size={14} className="text-emerald-500" />
              )}
              <span>Pratinjau Media Banner</span>
            </p>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setTestPlaying(false);
              }}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
            >
              <Trash2 size={12} />
              <span>Hapus Media</span>
            </button>
          </div>

          <div className="w-full sm:w-96 aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-900 relative group shadow-sm">
            {/* If YouTube and testing playback */}
            {isYouTube && testPlaying && youTubeEmbedUrl ? (
              <iframe
                src={youTubeEmbedUrl}
                title="Preview Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isVideo ? (
              /* If direct video file */
              <video
                src={value}
                controls
                className="w-full h-full object-contain bg-black"
                preload="metadata"
              >
                Browser Anda tidak mendukung preview video.
              </video>
            ) : (
              /* If YouTube or normal image */
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewThumbnail || value}
                  alt="Preview Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src.includes("maxresdefault.jpg")) {
                      img.src = img.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                    } else {
                      img.src =
                        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                    }
                  }}
                />

                {/* If YouTube, show play overlay */}
                {isYouTube && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setTestPlaying(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg hover:scale-105 transition-all"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Tes Putar Video YouTube</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span className="truncate">
              Media terpilih: <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded">{value}</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
