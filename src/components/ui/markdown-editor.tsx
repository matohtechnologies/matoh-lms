"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Check,
  Quote,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  FileCode,
  Highlighter,
  Eye,
  Edit3,
  Columns,
  Maximize2,
  Minimize2,
  Lightbulb,
  Info,
  AlertTriangle,
  HelpCircle,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Tulis isi materi pembelajaran menggunakan format Markdown...",
  label,
  hint,
  minHeight = "280px",
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("split");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Link Inserter Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTitleInput, setLinkTitleInput] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  // Image URL Inserter Modal State
  const [imageUrlModalOpen, setImageUrlModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [imageError, setImageError] = useState("");
  const [previewStatus, setPreviewStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const lastSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Prevent background scrolling while link or image modal is open
  useEffect(() => {
    if (linkModalOpen || imageUrlModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [linkModalOpen, imageUrlModalOpen]);

  // Auto-resize or keep min height
  const wordsCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charsCount = value.length;

  // Helper to insert or wrap markdown tokens around selection
  const insertToken = (
    prefix: string,
    suffix: string = "",
    defaultText: string = "teks"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    if (start === end && lastSelectionRef.current.end > lastSelectionRef.current.start) {
      start = lastSelectionRef.current.start;
      end = lastSelectionRef.current.end;
    }

    const selectedText = value.substring(start, end);
    const replacement = selectedText
      ? `${prefix}${selectedText}${suffix}`
      : `${prefix}${defaultText}${suffix}`;

    const newValue =
      value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const selStart = start + prefix.length;
      const selEnd = selectedText
        ? start + prefix.length + selectedText.length
        : start + prefix.length + defaultText.length;
      textarea.setSelectionRange(selStart, selEnd);
      lastSelectionRef.current = { start: selStart, end: selEnd };
    }, 20);
  };

  // Helper for block prefixes (headings, lists, quotes, checklists) with multiline selection support
  const insertBlockPrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    // Use saved selection if textarea lost focus and had an active selection
    if (start === end && lastSelectionRef.current.end > lastSelectionRef.current.start) {
      start = lastSelectionRef.current.start;
      end = lastSelectionRef.current.end;
    }

    // Expand selection to include the full start and end of all intersecting lines
    const lastNewlineBefore = value.lastIndexOf("\n", start - 1);
    const lineStartIndex = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;

    const nextNewlineAfter = value.indexOf("\n", end);
    const lineEndIndex = nextNewlineAfter === -1 ? value.length : nextNewlineAfter;

    const targetBlock = value.substring(lineStartIndex, lineEndIndex);
    const lines = targetBlock.split("\n");

    // Regex to match existing list/quote/heading prefixes
    const bulletRegex = /^\s*[-*+]\s+/;
    const numberRegex = /^\s*\d+\.\s+/;
    const taskRegex = /^\s*-\s*\[[ xX]\]\s+/;
    const quoteRegex = /^\s*>\s?/;
    const headingRegex = /^\s*#{1,6}\s+/;

    let formattedLines: string[];

    if (prefix === "-") {
      const isAllBulleted = lines.every((l) => bulletRegex.test(l));
      if (isAllBulleted) {
        // Toggle off: remove bullets
        formattedLines = lines.map((l) => l.replace(bulletRegex, ""));
      } else {
        formattedLines = lines.map((l) => {
          const clean = l.replace(taskRegex, "").replace(numberRegex, "").replace(bulletRegex, "");
          return `- ${clean}`;
        });
      }
    } else if (prefix === "1.") {
      const isAllNumbered = lines.every((l) => numberRegex.test(l));
      if (isAllNumbered) {
        // Toggle off: remove numbering
        formattedLines = lines.map((l) => l.replace(numberRegex, ""));
      } else {
        formattedLines = lines.map((l, idx) => {
          const clean = l.replace(taskRegex, "").replace(numberRegex, "").replace(bulletRegex, "");
          return `${idx + 1}. ${clean}`;
        });
      }
    } else if (prefix === "- [ ]") {
      const isAllTasks = lines.every((l) => taskRegex.test(l));
      if (isAllTasks) {
        // Toggle off: remove checklists
        formattedLines = lines.map((l) => l.replace(taskRegex, ""));
      } else {
        formattedLines = lines.map((l) => {
          const clean = l.replace(taskRegex, "").replace(numberRegex, "").replace(bulletRegex, "");
          return `- [ ] ${clean}`;
        });
      }
    } else if (prefix === ">") {
      const isAllQuotes = lines.every((l) => quoteRegex.test(l));
      if (isAllQuotes) {
        // Toggle off: remove blockquotes
        formattedLines = lines.map((l) => l.replace(quoteRegex, ""));
      } else {
        formattedLines = lines.map((l) => `> ${l}`);
      }
    } else if (prefix.startsWith("#")) {
      const isAllSameHeading = lines.every((l) => l.startsWith(`${prefix} `));
      if (isAllSameHeading) {
        // Toggle off
        formattedLines = lines.map((l) => l.replace(headingRegex, ""));
      } else {
        formattedLines = lines.map((l) => {
          const clean = l.replace(headingRegex, "");
          return `${prefix} ${clean}`;
        });
      }
    } else {
      formattedLines = lines.map((l) => `${prefix} ${l}`);
    }

    const replacement = formattedLines.join("\n");
    const newValue =
      value.substring(0, lineStartIndex) +
      replacement +
      value.substring(lineEndIndex);

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newStart = lineStartIndex;
        const newEnd = lineStartIndex + replacement.length;
        if (start !== end) {
          textarea.setSelectionRange(newStart, newEnd);
          lastSelectionRef.current = { start: newStart, end: newEnd };
        } else {
          textarea.setSelectionRange(newEnd, newEnd);
          lastSelectionRef.current = { start: newEnd, end: newEnd };
        }
      }
    }, 20);
  };

  // Table template generator
  const insertTableTemplate = () => {
    const template = `\n| Judul Kolom 1 | Judul Kolom 2 | Judul Kolom 3 |\n| :--- | :--- | :--- |\n| Baris 1, Data A | Baris 1, Data B | Baris 1, Data C |\n| Baris 2, Data A | Baris 2, Data B | Baris 2, Data C |\n`;
    insertToken(template, "", "");
  };

  // Callout template generator
  const insertCallout = (type: "TIP" | "NOTE" | "WARNING") => {
    let title = "Tips:";
    if (type === "NOTE") title = "Catatan Penting:";
    if (type === "WARNING") title = "Peringatan:";

    const template = `\n> [!${type}]\n> **${title}** Tuliskan penjelasan atau catatan penting di sini agar materi lebih mudah dipahami siswa.\n`;
    insertToken(template, "", "");
  };

  // Code block generator
  const insertCodeBlock = () => {
    const template = `\n\`\`\`javascript\n// Tulis kode program di sini\nfunction contohBelajar() {\n  console.log("Selamat belajar!");\n}\n\`\`\`\n`;
    insertToken(template, "", "");
  };

  // Open Link Inserter Modal
  const openLinkModal = () => {
    const textarea = textareaRef.current;
    let start = lastSelectionRef.current.start;
    let end = lastSelectionRef.current.end;
    if (textarea && (textarea.selectionStart !== textarea.selectionEnd || textarea.selectionStart > 0)) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    if (start === 0 && end === 0 && value.length > 0 && lastSelectionRef.current.start === 0) {
      start = value.length;
      end = value.length;
    }
    setSelectionRange({ start, end });
    const selected = value.substring(start, end);
    setLinkTitleInput(selected || "");
    setLinkUrlInput("");
    setLinkError("");
    setLinkModalOpen(true);
  };

  // Apply Link from Modal cleanly
  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const rawUrl = linkUrlInput.trim();
    if (!rawUrl || rawUrl === "https://" || rawUrl === "http://") {
      setLinkError("Harap masukkan tautan URL tujuan terlebih dahulu.");
      return;
    }

    // Clean up accidental duplicate protocol (e.g. https://https://)
    let finalUrl = rawUrl.replace(/^(https?:\/\/)+/i, (m) =>
      m.toLowerCase().startsWith("http://") && !m.toLowerCase().includes("https://") ? "http://" : "https://"
    );

    if (
      !finalUrl.startsWith("http://") &&
      !finalUrl.startsWith("https://") &&
      !finalUrl.startsWith("/") &&
      !finalUrl.startsWith("mailto:") &&
      !finalUrl.startsWith("#")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    const finalTitle = linkTitleInput.trim() || finalUrl;
    const replacement = `[${finalTitle}](${finalUrl})`;

    const textarea = textareaRef.current;
    let start = selectionRange ? selectionRange.start : (lastSelectionRef.current.start || value.length);
    let end = selectionRange ? selectionRange.end : (lastSelectionRef.current.end || value.length);

    if (start < 0) start = 0;
    if (end < start) end = start;
    if (start > value.length) start = value.length;
    if (end > value.length) end = value.length;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    setLinkModalOpen(false);
    setLinkError("");

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const nextPos = start + replacement.length;
        textarea.setSelectionRange(nextPos, nextPos);
        lastSelectionRef.current = { start: nextPos, end: nextPos };
      }
    }, 20);
  };

  // Image Upload and Insertion Handlers
  const uploadAndInsertImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan (PNG, JPG, WebP, GIF).");
      return;
    }

    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "courses");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }

      const imgCaption = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      insertToken(`\n![${imgCaption}](${data.url})\n`, "", "");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndInsertImage(file);
    }
  };

  // Helper to convert web URLs (such as Unsplash photo pages) into direct image URLs
  const normalizeImageUrl = (raw: string): string => {
    let clean = raw.trim().replace(/^(https?:\/\/)+/i, (m) =>
      m.toLowerCase().startsWith("http://") && !m.toLowerCase().includes("https://") ? "http://" : "https://"
    );

    // If user pasted an Unsplash photo webpage link like:
    // https://unsplash.com/photos/escalator-with-illuminated-handrails-in-sumida-MZmJf...
    const unsplashMatch = clean.match(/unsplash\.com\/photos\/(?:[^\/]+\/)?(?:[\w%-]+-)?([a-zA-Z0-9_-]{5,})/i);
    if (unsplashMatch && !clean.includes("images.unsplash.com")) {
      const photoId = unsplashMatch[1];
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
    }

    // Google image proxy redirect
    if (clean.includes("google.") && clean.includes("imgurl=")) {
      try {
        const urlObj = new URL(clean);
        const actual = urlObj.searchParams.get("imgurl");
        if (actual) return decodeURIComponent(actual);
      } catch {}
    }

    if (
      !clean.startsWith("http://") &&
      !clean.startsWith("https://") &&
      !clean.startsWith("/")
    ) {
      clean = `https://${clean}`;
    }

    return clean;
  };

  const openImageUrlModal = () => {
    const textarea = textareaRef.current;
    let start = lastSelectionRef.current.start;
    let end = lastSelectionRef.current.end;
    if (textarea && (textarea.selectionStart !== textarea.selectionEnd || textarea.selectionStart > 0)) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    if (start === 0 && end === 0 && value.length > 0 && lastSelectionRef.current.start === 0) {
      start = value.length;
      end = value.length;
    }
    setSelectionRange({ start, end });
    const selected = value.substring(start, end);
    setImageAltInput(selected || "");
    setImageUrlInput("");
    setImageError("");
    setPreviewStatus("idle");
    setImageUrlModalOpen(true);
  };

  const handleApplyImageUrl = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const rawUrl = imageUrlInput.trim();
    if (!rawUrl || rawUrl === "https://" || rawUrl === "http://") {
      setImageError("Harap masukkan alamat URL gambar terlebih dahulu.");
      return;
    }

    const finalUrl = normalizeImageUrl(rawUrl);
    const caption = imageAltInput.trim() || "Ilustrasi materi";

    const textarea = textareaRef.current;
    let start = selectionRange ? selectionRange.start : (lastSelectionRef.current.start || value.length);
    let end = selectionRange ? selectionRange.end : (lastSelectionRef.current.end || value.length);

    if (start < 0) start = 0;
    if (end < start) end = start;
    if (start > value.length) start = value.length;
    if (end > value.length) end = value.length;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const padBefore = before.length > 0 && !before.endsWith("\n") ? "\n\n" : before.endsWith("\n") && !before.endsWith("\n\n") ? "\n" : "";
    const padAfter = after.length > 0 && !after.startsWith("\n") ? "\n\n" : after.startsWith("\n") && !after.startsWith("\n\n") ? "\n" : "";

    const replacement = `${padBefore}![${caption}](${finalUrl})${padAfter}`;
    const newValue = before + replacement + after;

    onChange(newValue);
    setImageUrlModalOpen(false);
    setImageError("");

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const nextPos = before.length + replacement.length;
        textarea.setSelectionRange(nextPos, nextPos);
        lastSelectionRef.current = { start: nextPos, end: nextPos };
      }
    }, 20);
  };

  // Support pasting image from clipboard (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        uploadAndInsertImage(file);
      }
    }
  };

  // Support Drag & Drop image files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        uploadAndInsertImage(file);
      }
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertToken("**", "**", "teks tebal");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertToken("*", "*", "teks miring");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openLinkModal();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Handle escape to close sub-modals or exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (linkModalOpen) {
          setLinkModalOpen(false);
          return;
        }
        if (imageUrlModalOpen) {
          setImageUrlModalOpen(false);
          return;
        }
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen, linkModalOpen, imageUrlModalOpen]);

  return (
    <div
      className={`flex flex-col rounded-2xl border border-stone-200 bg-white transition-all shadow-xs ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none p-4 sm:p-6 bg-stone-900/40 backdrop-blur-md"
          : ""
      }`}
    >
      {/* Outer wrapper if Fullscreen */}
      <div
        className={`flex flex-col w-full h-full ${
          isFullscreen
            ? "max-w-6xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden"
            : ""
        }`}
      >
        {/* Label & Header Area */}
        {(label || isFullscreen) && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-stone-50/70">
            <div>
              {label && (
                <label htmlFor="markdown-editor-main-textarea" className="text-xs font-bold uppercase tracking-wider text-stone-700">{label}</label>
              )}
              {isFullscreen && (
                <span className="ml-2 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Layar Penuh (Fokus Editor)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="hidden sm:inline">
                <strong>{wordsCount}</strong> kata
              </span>
              <span className="hidden sm:inline">
                <strong>{charsCount}</strong> karakter
              </span>
              <button
                type="button"
                onClick={() => setShowCheatsheet(!showCheatsheet)}
                className="flex items-center gap-1 text-stone-500 hover:text-blue-600 font-semibold"
                title="Bantuan format markdown"
              >
                <HelpCircle size={14} />
                <span className="hidden sm:inline">Panduan Format</span>
              </button>
            </div>
          </div>
        )}

        {/* Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-stone-50 border-b border-stone-200 text-stone-700 select-none">
          {/* Action Button Groups */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Group 1: Typography / Sifat Huruf */}
            <div className="flex items-center bg-white rounded-xl border border-stone-200/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertToken("**", "**", "teks tebal")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors"
                title="Tebal / Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertToken("*", "*", "teks miring")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors"
                title="Miring / Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertToken("~~", "~~", "teks coret")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors"
                title="Coret / Strikethrough"
              >
                <Strikethrough size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertToken("==", "==", "sorotan")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-amber-600"
                title="Sorotan / Highlight"
              >
                <Highlighter size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertToken("`", "`", "kode")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors font-mono"
                title="Kode Baris / Inline Code"
              >
                <Code size={15} />
              </button>
            </div>

            {/* Group 2: Headings */}
            <div className="flex items-center bg-white rounded-xl border border-stone-200/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix("#")}
                className="px-2 py-1 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors font-extrabold text-xs"
                title="Judul Utama (H1)"
              >
                <Heading1 size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix("##")}
                className="px-2 py-1 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors font-bold text-xs"
                title="Sub-judul (H2)"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix("###")}
                className="px-2 py-1 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors font-semibold text-xs"
                title="Poin Pembahasan (H3)"
              >
                <Heading3 size={15} />
              </button>
            </div>

            {/* Group 3: Lists & Paragraphs */}
            <div className="flex items-center bg-white rounded-xl border border-stone-200/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix("-")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors"
                title="Daftar Poin (Bullet List)"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix("1.")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors"
                title="Daftar Angka (Numbered List)"
              >
                <ListOrdered size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix("- [ ]")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-emerald-600"
                title="Checklist / Tugas Interaktif"
              >
                <CheckSquare size={15} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlockPrefix(">")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-blue-600"
                title="Kutipan (Blockquote)"
              >
                <Quote size={15} />
              </button>
            </div>

            {/* Group 4: Rich Blocks & Templates */}
            <div className="flex items-center bg-white rounded-xl border border-stone-200/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={openLinkModal}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-sky-600"
                title="Tautan / Link (Ctrl+K)"
              >
                <LinkIcon size={15} />
              </button>

              {/* Upload Image from Computer */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-rose-600 disabled:opacity-50"
                title="Unggah Gambar dari Komputer (PNG, JPG, WebP, GIF)"
              >
                {isUploadingImage ? (
                  <Loader2 size={15} className="animate-spin text-blue-600" />
                ) : (
                  <ImageIcon size={15} />
                )}
              </button>

              {/* Insert Image from URL */}
              <button
                type="button"
                onClick={openImageUrlModal}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-pink-600"
                title="Sisipkan Gambar dari Link URL"
              >
                <ImagePlus size={15} />
              </button>

              {/* Hidden file input for image upload */}
              <label htmlFor="markdown-image-file-input" className="sr-only">Unggah Berkas Gambar</label>
              <input id="markdown-image-file-input" name="imageFile" type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageFileSelect} />

              <button
                type="button"
                onClick={insertCodeBlock}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-indigo-600"
                title="Blok Kode Program (Syntax Highlighted)"
              >
                <FileCode size={15} />
              </button>
              <button
                type="button"
                onClick={insertTableTemplate}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-teal-600"
                title="Sisipkan Tabel Markdown"
              >
                <TableIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertToken("\n---\n", "", "")}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors text-stone-500"
                title="Garis Pemisah (Horizontal Rule)"
              >
                <Minus size={15} />
              </button>
            </div>

            {/* Group 5: Callout Badges */}
            <div className="hidden sm:flex items-center bg-white rounded-xl border border-stone-200/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => insertCallout("TIP")}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                title="Kotak Tips Praktis"
              >
                <Lightbulb size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertCallout("NOTE")}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                title="Kotak Catatan Materi"
              >
                <Info size={15} />
              </button>
              <button
                type="button"
                onClick={() => insertCallout("WARNING")}
                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                title="Kotak Peringatan / Aturan"
              >
                <AlertTriangle size={15} />
              </button>
            </div>
          </div>

          {/* Right Mode Toggle & Fullscreen */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-stone-200/70 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === "edit"
                    ? "bg-white text-stone-900 shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Mode Tulis Saja"
              >
                <Edit3 size={13} />
                <span className="hidden md:inline">Tulis</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === "split"
                    ? "bg-white text-stone-900 shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Mode Berdampingan (Split View)"
              >
                <Columns size={13} />
                <span className="hidden md:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === "preview"
                    ? "bg-white text-stone-900 shadow-2xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Mode Pratinjau Penuh"
              >
                <Eye size={13} />
                <span className="hidden md:inline">Pratinjau</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-white rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors shadow-2xs"
              title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Buka Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Cheatsheet Accordion */}
        {showCheatsheet && (
          <div className="p-3 bg-blue-50/70 border-b border-blue-200 text-xs text-stone-700 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-150">
            <div>
              <p className="font-bold text-blue-900 mb-0.5">Sifat Teks</p>
              <p className="font-mono text-[11px] text-stone-600">**tebal**</p>
              <p className="font-mono text-[11px] text-stone-600">*miring*</p>
              <p className="font-mono text-[11px] text-stone-600">***tebal & miring***</p>
              <p className="font-mono text-[11px] text-stone-600">~~coret~~</p>
              <p className="font-mono text-[11px] text-stone-600">==sorot==</p>
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-0.5">Judul & Poin</p>
              <p className="font-mono text-[11px] text-stone-600"># Judul 1</p>
              <p className="font-mono text-[11px] text-stone-600">## Judul 2</p>
              <p className="font-mono text-[11px] text-stone-600">- Poin daftar</p>
              <p className="font-mono text-[11px] text-stone-600">1. Angka urut</p>
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-0.5">Tugas & Kutipan</p>
              <p className="font-mono text-[11px] text-stone-600">- [ ] Belum siap</p>
              <p className="font-mono text-[11px] text-stone-600">- [x] Selesai</p>
              <p className="font-mono text-[11px] text-stone-600">&gt; Kutipan kata</p>
              <p className="font-mono text-[11px] text-stone-600">&gt; [!TIP] Tips</p>
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-0.5">Tautan & Gambar</p>
              <p className="font-mono text-[11px] text-stone-600">[Nama](https://..)</p>
              <p className="font-mono text-[11px] text-stone-600">![Foto](https://..)</p>
              <p className="font-mono text-[11px] text-stone-600">`kode baris`</p>
              <p className="font-mono text-[11px] text-stone-600">```js ... ```</p>
            </div>
          </div>
        )}

        {/* Uploading Banner */}
        {isUploadingImage && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-700 font-semibold animate-pulse">
            <Loader2 size={14} className="animate-spin text-blue-600" />
            <span>Sedang mengunggah dan memproses gambar ke server...</span>
          </div>
        )}

        {/* Editor Body */}
        <div
          className={`grid ${
            viewMode === "split"
              ? "grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200"
              : "grid-cols-1"
          } flex-1 overflow-hidden`}
          style={{ minHeight: isFullscreen ? "450px" : minHeight }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Left: Textarea Editor */}
          {viewMode !== "preview" && (
            <div className="flex flex-col h-full bg-stone-50/30">
              <textarea id="markdown-editor-main-textarea" name="markdownContent" ref={textareaRef} value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  lastSelectionRef.current = {
                    start: e.target.selectionStart,
                    end: e.target.selectionEnd,
                  };
                }}
                onSelect={(e) => {
                  lastSelectionRef.current = {
                    start: e.currentTarget.selectionStart,
                    end: e.currentTarget.selectionEnd,
                  };
                }}
                onClick={(e) => {
                  lastSelectionRef.current = {
                    start: e.currentTarget.selectionStart,
                    end: e.currentTarget.selectionEnd,
                  };
                }}
                onKeyUp={(e) => {
                  lastSelectionRef.current = {
                    start: e.currentTarget.selectionStart,
                    end: e.currentTarget.selectionEnd,
                  };
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={placeholder}
                className="w-full flex-1 p-4 font-mono text-sm leading-relaxed text-stone-800 bg-transparent focus:outline-none focus:ring-0 placeholder:text-stone-400 placeholder:font-sans"
                style={{
                  minHeight: isFullscreen ? "450px" : minHeight,
                  maxHeight: isFullscreen ? undefined : "360px",
                }}
              />
            </div>
          )}

          {/* Right: Live Markdown Preview */}
          {viewMode !== "edit" && (
            <div
              className="flex flex-col h-full overflow-y-auto p-5 bg-white"
              style={{
                minHeight: isFullscreen ? "450px" : minHeight,
                maxHeight: isFullscreen ? undefined : "360px",
              }}
            >
              {value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs py-8">
                  <Eye size={24} className="mb-2 opacity-50 text-stone-300" />
                  <p>Pratinjau langsung akan tampil di sini saat Anda menulis.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info (hint) */}
        {hint && !isFullscreen && (
          <div className="px-3 py-1.5 bg-stone-50/50 border-t border-stone-100 text-[11px] text-stone-400">
            {hint}
          </div>
        )}
      </div>

      {/* Link Inserter Interactive Modal */}
      {mounted && linkModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setLinkModalOpen(false);
          }}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="min-h-full flex items-center justify-center pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-stone-900 pointer-events-auto my-auto cursor-default"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <LinkIcon size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-tight">
                      Sisipkan Tautan (Link)
                    </h4>
                    <p className="text-[11px] text-stone-500">Tambahkan URL web atau artikel rujukan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className="space-y-3.5"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleApplyLink();
                  }
                }}
              >
                {linkError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                    <span>{linkError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="md-link-title" className="block text-xs font-bold text-stone-700 mb-1">Teks Tautan (Anchor Text)</label>
                  <input id="md-link-title" name="linkTitle" type="text" value={linkTitleInput} onChange={(e) => setLinkTitleInput(e.target.value)}
                    placeholder="Contoh: Baca Dokumentasi Resmi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 bg-white"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Teks yang dapat diklik oleh siswa (opsional, bawaan adalah URL)
                  </span>
                </div>

                <div>
                  <label htmlFor="md-link-url" className="block text-xs font-bold text-stone-700 mb-1">Alamat URL Tujuan <span className="text-rose-500">*</span></label>
                  <input id="md-link-url" name="linkUrl" type="text" value={linkUrlInput} onChange={(e) => {
                      setLinkUrlInput(e.target.value);
                      if (linkError) setLinkError("");
                    }}
                    placeholder="https://example.com/artikel atau https://google.com"
                    autoFocus
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 bg-white"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Tempel URL lengkap. Awalan https:// akan otomatis ditambahkan jika belum ada.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLinkModalOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleApplyLink();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Sisipkan Tautan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image URL Inserter Interactive Modal */}
      {mounted && imageUrlModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setImageUrlModalOpen(false);
          }}
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="min-h-full flex items-center justify-center pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-stone-900 pointer-events-auto my-auto cursor-default"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                    <ImagePlus size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-tight">
                      Sisipkan Gambar dari URL
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Gunakan tautan gambar online (JPG, PNG, WebP, GIF, SVG)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrlModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className="space-y-3.5"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleApplyImageUrl();
                  }
                }}
              >
                {imageError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                    <span>{imageError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="md-img-url" className="block text-xs font-bold text-stone-700 mb-1">Alamat URL Gambar <span className="text-rose-500">*</span></label>
                  <input id="md-img-url" name="imageUrl" type="text" value={imageUrlInput} onChange={(e) => {
                      const val = e.target.value;
                      setImageUrlInput(val);
                      if (imageError) setImageError("");
                      setPreviewStatus(val.trim().length > 3 ? "loading" : "idle");
                    }}
                    placeholder="https://images.unsplash.com/... atau tautan foto online"
                    autoFocus
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-stone-900 bg-white"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    💡 <strong>Tips:</strong> Klik kanan pada gambar di web lalu pilih <strong>&quot;Salin Alamat Gambar&quot; (Copy Image Address)</strong>. Tautan halaman Unsplash juga otomatis dikonversi.
                  </span>
                </div>

                <div>
                  <label htmlFor="md-img-alt" className="block text-xs font-bold text-stone-700 mb-1">Keterangan / Caption Gambar</label>
                  <input id="md-img-alt" name="imageAlt" type="text" value={imageAltInput} onChange={(e) => setImageAltInput(e.target.value)}
                    placeholder="Contoh: Diagram Alur Proses Bisnis"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-stone-900 bg-white"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Deskripsi gambar yang tampil sebagai caption di bawah foto
                  </span>
                </div>

                {/* Quick Image Preview with Status Badge */}
                {imageUrlInput.trim().length > 3 && (
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                      <span className="uppercase tracking-wider">Pratinjau Gambar</span>
                      {previewStatus === "success" && (
                        <span className="text-emerald-600 flex items-center gap-1 font-bold">
                          <Check size={13} /> Gambar Terdeteksi
                        </span>
                      )}
                      {previewStatus === "error" && (
                        <span className="text-amber-600 flex items-center gap-1 font-bold">
                          <AlertTriangle size={13} /> Belum Terdeteksi
                        </span>
                      )}
                      {previewStatus === "loading" && (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Loader2 size={13} className="animate-spin" /> Memeriksa URL...
                        </span>
                      )}
                    </div>

                    <div className="relative max-h-36 min-h-[70px] flex items-center justify-center bg-white rounded-xl border border-stone-200 overflow-hidden p-1.5">
                      <img src={normalizeImageUrl(imageUrlInput)} alt="Pratinjau" style={{ aspectRatio: "auto" }} className={`max-h-32 mx-auto rounded-lg object-contain transition-opacity duration-200 aspect-auto ${previewStatus === "success" ? "opacity-100" : "opacity-0"}`} onLoad={() => setPreviewStatus("success")} onError={() => setPreviewStatus("error")} />

                      {previewStatus === "error" && (
                        <div className="p-2.5 text-center">
                          <p className="text-xs font-bold text-amber-700">Tautan Bukan File Gambar Langsung</p>
                          <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                            Buka gambar di browser &rarr; <strong>Klik kanan pada gambar</strong> &rarr; pilih <strong>&quot;Salin Alamat Gambar&quot; (Copy Image Address)</strong>, lalu tempelkan kembali di sini.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageUrlModalOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleApplyImageUrl();
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Sisipkan Gambar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
