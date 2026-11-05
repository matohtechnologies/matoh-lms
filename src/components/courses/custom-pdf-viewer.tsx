"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCcw,
  FileText,
  Loader2,
  Lock,
} from "lucide-react";

interface CustomPdfViewerProps {
  url: string;
  title: string;
  userIdentifier?: string | null;
}

export function CustomPdfViewer({
  url,
  title,
  userIdentifier = "Peserta Resmi Matoh Technologies",
}: CustomPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>("1");
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  // Helper to lock screen orientation to landscape on mobile devices
  const lockOrientationLandscape = useCallback(async () => {
    try {
      if (
        typeof window !== "undefined" &&
        window.screen?.orientation &&
        typeof (window.screen.orientation as any).lock === "function"
      ) {
        await (window.screen.orientation as any).lock("landscape");
      }
    } catch {
      // Silently catch unsupported devices (desktop, iOS Safari) or user-denied locks
    }
  }, []);

  // Helper to unlock screen orientation
  const unlockOrientation = useCallback(() => {
    try {
      if (
        typeof window !== "undefined" &&
        window.screen?.orientation &&
        typeof window.screen.orientation.unlock === "function"
      ) {
        window.screen.orientation.unlock();
      }
    } catch {}
  }, []);

  // Track portrait vs landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== "undefined") {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Touch Swipe Gesture State for Mobile
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Dynamic floating watermark position (updates periodically to prevent static redaction)
  const [watermarkSeed, setWatermarkSeed] = useState<{ x: number; y: number }>({ x: 20, y: 35 });

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkSeed({
        x: Math.floor(10 + Math.random() * 60),
        y: Math.floor(15 + Math.random() * 65),
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Calculate auto-fit width scale based on current container size
  const calculateFitScale = useCallback(() => {
    if (!stageRef.current) return 1.0;
    const stageWidth = stageRef.current.clientWidth;
    // Mobile padding 16px each side (32px), Desktop 48px
    const padding = stageWidth < 640 ? 24 : 48;
    const availableWidth = stageWidth - padding;
    if (availableWidth > 200) {
      // Standard A4 width at scale 1.0 is ~595px
      const computedScale = parseFloat((availableWidth / 595).toFixed(2));
      // Clamp between 0.45 and 2.0
      return Math.max(0.45, Math.min(computedScale, 2.0));
    }
    return 1.0;
  }, []);

  // 1. Load PDF Document via PDF.js
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    async function loadPdf() {
      try {
        const pdfjsLib = await import("pdfjs-dist/build/pdf.min.mjs");
        if (typeof window !== "undefined") {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const loadingTask = pdfjsLib.getDocument({
          url,
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setIsLoading(false);

          // Initial auto-fit scale
          const initialScale = calculateFitScale();
          setScale(initialScale);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Gagal memuat dokumen PDF:", err);
          setError("Gagal memuat dokumen PDF. Pastikan file valid dan dapat diakses.");
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [url, calculateFitScale]);

  // Handle window resize / screen orientation change (especially when entering landscape fullscreen)
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth < 1024 || document.fullscreenElement) {
          setScale(calculateFitScale());
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [calculateFitScale]);

  // 2. Render Page onto Canvas
  const renderPage = useCallback(
    async (pageNum: number, currentScale: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        // Cancel existing render if busy
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        const viewport = page.getViewport({ scale: currentScale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // 2x supersampling for crisp Retina & OLED mobile screens

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Kesalahan render halaman PDF:", err);
        }
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (pdfDoc && totalPages > 0) {
      renderPage(currentPage, scale);
      setJumpPageInput(String(currentPage));
    }
  }, [pdfDoc, currentPage, scale, totalPages, renderPage]);

  // Navigation handlers
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(parseFloat((prev + 0.15).toFixed(2)), 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(parseFloat((prev - 0.15).toFixed(2)), 0.45));
  };

  const handleResetZoom = () => {
    setScale(calculateFitScale());
  };

  const handleFitWidth = () => {
    setScale(calculateFitScale());
  };

  // Fullscreen handlers with Screen Orientation locking for mobile devices
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    const isCurrentFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement
    );

    if (!isCurrentFs) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);

        // Lock mobile screen orientation to landscape
        await lockOrientationLandscape();
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } catch (err) {
        console.error("Exit fullscreen error:", err);
      }
      setIsFullscreen(false);
      unlockOrientation();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen) {
        await lockOrientationLandscape();
        // Give time for layout reflow then fit scale
        setTimeout(() => {
          setScale(calculateFitScale());
        }, 150);
      } else {
        unlockOrientation();
        setTimeout(() => {
          setScale(calculateFitScale());
        }, 150);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      unlockOrientation();
    };
  }, [calculateFitScale, lockOrientationLandscape, unlockOrientation]);

  // Keyboard shortcut listener for page turns & anti-print / anti-save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Anti-Save (Ctrl+S / Cmd+S) & Anti-Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Page Navigation with Left / Right Arrows
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  // Touch Gesture Handling for Mobile Swipe (Left = Next, Right = Prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;

    // Minimum swipe threshold: 50px horizontal, with minimal vertical displacement
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 60) {
      if (diffX < 0) {
        // Swiped Left -> Go to Next Page
        handleNextPage();
      } else {
        // Swiped Right -> Go to Prev Page
        handlePrevPage();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col bg-slate-900 border border-slate-800 text-slate-100 overflow-hidden select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen h-[100dvh] w-screen rounded-none"
          : "h-[75vh] min-h-[460px] sm:h-[660px] rounded-2xl shadow-xl border-b border-slate-200"
      }`}
      onContextMenu={(e) => e.preventDefault()} // Anti-inspect / save image
    >
      {/* ── Top Interactive Toolbar (Fully Responsive) ────────────────────────────────── */}
      <div className="bg-slate-950/95 border-b border-slate-800/80 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 z-20 backdrop-blur-md">
        {/* Left: Document Info & Security Badge */}
        <div className="flex items-center gap-2 min-w-0 pr-1 sm:pr-2">
          <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
            <FileText size={15} />
          </span>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[130px] xs:max-w-[170px] sm:max-w-xs md:max-w-md">
              {title}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Lock size={10} /> Mode Baca Aman
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Proteksi Unduhan Aktif</span>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet: Centered Page Controls */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1 shadow-inner">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Halaman Sebelumnya (Panah Kiri)"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1 text-xs font-mono">
            <input
              type="text"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              onBlur={() => setJumpPageInput(String(currentPage))}
              className="w-10 text-center bg-slate-950 border border-slate-700/80 rounded-md py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading || totalPages === 0}
              aria-label="Nomor Halaman"
            />
            <span className="text-slate-500">/</span>
            <span className="text-slate-300 min-w-[20px] text-center">
              {totalPages || "-"}
            </span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Halaman Berikutnya (Panah Kanan)"
            aria-label="Halaman Berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Zoom & Fullscreen Controls (Touch Targets min 40px) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.45 || isLoading}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Perkecil Tampilan (Zoom Out)"
            aria-label="Perkecil"
          >
            <ZoomOut size={16} />
          </button>

          {/* Zoom Level Indicator */}
          <span
            onClick={handleResetZoom}
            className="hidden xs:inline-block px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all select-none"
            title="Klik untuk Sesuaikan Lebar Layar"
          >
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5 || isLoading}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Perbesar Tampilan (Zoom In)"
            aria-label="Perbesar"
          >
            <ZoomIn size={16} />
          </button>

          {/* Fit Width (Desktop / Tablet) */}
          <button
            type="button"
            onClick={handleFitWidth}
            disabled={isLoading}
            className="hidden sm:inline-flex w-8 h-8 rounded-xl items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition-colors"
            title="Sesuaikan Lebar Layar (Fit Width)"
            aria-label="Sesuaikan Lebar Layar"
          >
            <RotateCcw size={14} />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-700 transition-colors"
            title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Mode Layar Penuh (F)"}
            aria-label="Layar Penuh"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* ── Document Stage (Touch & Swipe enabled for Mobile) ──────────────────── */}
      <div
        ref={stageRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex-1 overflow-auto custom-scrollbar flex items-start justify-center p-2 sm:p-5 bg-slate-900/90 pb-16 sm:pb-6"
      >
        {/* Fullscreen Mobile Portrait Hint (when auto-orientation lock is not supported or device is in portrait) */}
        {isFullscreen && isPortrait && (
          <div className="sm:hidden absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-sky-500/40 text-sky-200 text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md pointer-events-none animate-pulse">
            <RotateCcw size={13} className="text-sky-400 shrink-0" />
            <span>Putar HP ke posisi landscape untuk layar penuh</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xs text-slate-300 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-xs font-medium tracking-wide">Mempersiapkan materi PDF aman...</p>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
              <FileText size={24} />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Gagal Memuat PDF</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Canvas Document Wrapper with Anti-Inspect Overlays */}
        <div className="relative inline-block transition-transform duration-150 ease-out shadow-2xl rounded-sm overflow-hidden bg-white max-w-full">
          {/* Active Canvas */}
          <canvas
            ref={canvasRef}
            className="block max-w-none pointer-events-none select-none"
            style={{ filter: "contrast(1.02)" }}
          />

          {/* 1. Transparent Non-Selectable Overlay (prevents right-click 'save image as', drag to desktop) */}
          <div
            className="absolute inset-0 z-10 cursor-default"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          />

          {/* 2. Floating Forensic Dynamic Watermark */}
          <div
            className="absolute pointer-events-none select-none z-20 font-mono tracking-wider transition-all duration-1000 ease-in-out text-slate-800/15 font-bold text-[11px] sm:text-xs md:text-sm rotate-[-25deg] whitespace-nowrap"
            style={{
              top: `${watermarkSeed.y}%`,
              left: `${watermarkSeed.x}%`,
            }}
          >
            🔒 {userIdentifier} • Akses Materi Terdaftar
          </div>

          {/* 3. Repeating Subtle Background Watermarks */}
          <div className="absolute inset-0 pointer-events-none select-none z-15 overflow-hidden flex flex-col justify-around opacity-[0.05] rotate-[-20deg]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-900 whitespace-nowrap">
                MATOH TECHNOLOGIES • {userIdentifier} • MATOH TECHNOLOGIES • {userIdentifier}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile-Only Thumb-Friendly Bottom Floating Bar (Touch target min 44x44px) ──────── */}
      <div className="sm:hidden absolute bottom-3 inset-x-3 z-30 flex items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage <= 1 || isLoading}
          className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 active:bg-blue-600 active:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-200 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span>{currentPage}</span>
          <span className="text-slate-500">/</span>
          <span>{totalPages || "-"}</span>
          <span className="text-[10px] text-slate-400 ml-1 font-sans font-normal hidden xs:inline">(Geser layar)</span>
        </div>

        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 active:bg-blue-600 active:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Halaman Berikutnya"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Anti-Print CSS Injected Specifically for this View ────────────────── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .custom-pdf-viewer,
          canvas {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
