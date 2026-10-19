"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  CertificateDesignConfig,
  CertificateElement,
  CertificateDataValues,
  resolveElementText,
} from "@/lib/certificate-templates";

interface CertificateCanvasRendererProps {
  config: CertificateDesignConfig;
  data: CertificateDataValues;
  isInteractive?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElementPosition?: (id: string, x: number, y: number) => void;
  onUpdateElementWidth?: (id: string, width: number) => void;
  useSampleFallback?: boolean;
  className?: string;
}

export function CertificateCanvasRenderer({
  config,
  data,
  isInteractive = false,
  selectedElementId = null,
  onSelectElement,
  onUpdateElementPosition,
  onUpdateElementWidth,
  useSampleFallback = true,
  className = "",
}: CertificateCanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    handle: "left" | "right";
    initialWidth: number;
    elementX: number;
    textAlign: "left" | "center" | "right";
  } | null>(null);

  // Handle element mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, el: CertificateElement) => {
    if (!isInteractive) return;
    e.stopPropagation();

    onSelectElement?.(el.id);
    setDraggingId(el.id);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: el.x,
      startY: el.y,
    });
  };

  const handleClick = (e: React.MouseEvent, el: CertificateElement) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onSelectElement?.(el.id);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      // 1. Resizing width mode
      if (resizing) {
        const rect = containerRef.current.getBoundingClientRect();
        const currentMouseX = ((e.clientX - rect.left) / rect.width) * 100;
        let newWidth = resizing.initialWidth;

        if (resizing.textAlign === "center") {
          const dist = Math.abs(currentMouseX - resizing.elementX);
          newWidth = Math.round(Math.max(15, Math.min(100, dist * 2)));
        } else if (resizing.textAlign === "left") {
          if (resizing.handle === "right") {
            newWidth = Math.round(Math.max(15, Math.min(100, currentMouseX - resizing.elementX)));
          } else {
            const rightEdge = resizing.elementX + resizing.initialWidth;
            newWidth = Math.round(Math.max(15, Math.min(100, rightEdge - currentMouseX)));
          }
        } else if (resizing.textAlign === "right") {
          if (resizing.handle === "left") {
            newWidth = Math.round(Math.max(15, Math.min(100, resizing.elementX - currentMouseX)));
          } else {
            const leftEdge = resizing.elementX - resizing.initialWidth;
            newWidth = Math.round(Math.max(15, Math.min(100, currentMouseX - leftEdge)));
          }
        }

        onUpdateElementWidth?.(resizing.id, newWidth);
        return;
      }

      // 2. Dragging position mode
      if (draggingId && dragStart) {
        const rect = containerRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
        const deltaY = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

        const newX = Math.round(Math.max(2, Math.min(98, dragStart.startX + deltaX)));
        const newY = Math.round(Math.max(2, Math.min(98, dragStart.startY + deltaY)));

        onUpdateElementPosition?.(draggingId, newX, newY);
      }
    },
    [draggingId, dragStart, resizing, onUpdateElementPosition, onUpdateElementWidth]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDragStart(null);
    setResizing(null);
  }, []);

  useEffect(() => {
    if (draggingId || resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingId, resizing, handleMouseMove, handleMouseUp]);

  const getFontFamilyStyle = (family?: string): string => {
    switch (family) {
      case "arial":
        return "Arial, Helvetica, sans-serif";
      case "serif":
        return "Georgia, Cambria, 'Times New Roman', Times, serif";
      case "jakarta":
        return "var(--font-poppins, 'Plus Jakarta Sans', sans-serif)";
      case "mono":
        return "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      default:
        return "var(--font-inter, 'Inter', system-ui, sans-serif)";
    }
  };

  const getFontWeightStyle = (weight?: string) => {
    switch (weight) {
      case "normal":
        return 400;
      case "medium":
        return 500;
      case "semibold":
        return 600;
      case "bold":
        return 700;
      case "extrabold":
        return 800;
      default:
        return 600;
    }
  };

  // Border styles
  const getBorderClasses = () => {
    if (config.borderStyle === "none") return "";
    if (config.borderStyle === "gold-frame") {
      return "border-8 border-amber-800/20 shadow-warm-lg";
    }
    if (config.borderStyle === "double") {
      return "border-4 border-double";
    }
    if (config.borderStyle === "dashed") {
      return "border-2 border-dashed";
    }
    return "border-2 border-solid";
  };

  // Dynamic aspect ratio based on config (Default: A4 Landscape 297mm x 210mm)
  const getAspectRatioStyle = () => {
    switch (config.aspectRatio) {
      case "16:9":
        return { aspectRatio: "16 / 9" };
      case "16:10":
        return { aspectRatio: "16 / 10" };
      case "a4":
      default:
        return { aspectRatio: "297 / 210" }; // 1.414:1 standard certificate landscape
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        if (!isInteractive) return;
        if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "IMG") {
          onSelectElement?.(null);
        }
      }}
      className={`relative w-full overflow-hidden select-none transition-all ${getBorderClasses()} ${className}`}
      style={{
        backgroundColor: config.backgroundColor || "#ffffff",
        borderColor: config.borderColor || "#e2e8f0",
        containerType: "inline-size",
        ...getAspectRatioStyle(),
      }}
    >
      {/* Background Image if uploaded */}
      {config.backgroundUrl ? (
        <img
          src={config.backgroundUrl}
          alt="Certificate Template Background"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />
      ) : null}

      {/* Decorative Ornaments for Gold Frame Preset */}
      {config.borderStyle === "gold-frame" && (
        <div className="absolute inset-3 border-2 border-dashed border-amber-600/30 rounded-xl pointer-events-none z-1" />
      )}

      {/* Canvas Elements */}
      {config.elements.map((el) => {
        const text = resolveElementText(el, data, useSampleFallback);
        const isSelected = isInteractive && selectedElementId === el.id;
        const isDragging = draggingId === el.id;
        const isCurrentlyResizing = resizing?.id === el.id;

        const computedWidth = el.width ? `${el.width}%` : (el.textAlign === "center" ? "auto" : undefined);
        const computedMaxWidth = el.maxWidth ? `${el.maxWidth}%` : (el.width ? `${el.width}%` : "92%");

        return (
          <div
            key={el.id}
            onClick={(e) => handleClick(e, el)}
            onMouseDown={(e) => handleMouseDown(e, el)}
            onTouchStart={(e) => {
              if (!isInteractive) return;
              e.stopPropagation();
              onSelectElement?.(el.id);
            }}
            className={`absolute cursor-pointer transition-all select-none p-1.5 -m-1.5 ${
              isSelected ? "z-30" : "z-20 hover:z-25"
            } ${
              isInteractive ? "hover:outline hover:outline-1 hover:outline-blue-400 hover:bg-blue-50/20 rounded-md" : ""
            } ${
              isSelected
                ? "outline-2 outline-blue-600 ring-2 ring-blue-400/50 bg-blue-50/30 rounded-md shadow-xs"
                : ""
            } ${isDragging ? "opacity-75 cursor-grabbing" : ""} ${isCurrentlyResizing ? "ring-2 ring-amber-500" : ""}`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform:
                el.textAlign === "center"
                  ? "translate(-50%, -50%)"
                  : el.textAlign === "right"
                  ? "translate(-100%, -50%)"
                  : "translate(0, -50%)",
              width: computedWidth,
              maxWidth: computedMaxWidth,
              textAlign: el.textAlign,
            }}
          >
            <p
              className="leading-[1.25]"
              style={{
                fontFamily: getFontFamilyStyle(el.fontFamily),
                fontSize: `calc((${el.fontSize} / 1050) * 100cqw)`,
                fontWeight: getFontWeightStyle(el.fontWeight),
                fontStyle: el.fontStyle || "normal",
                color: el.color || "#1c1917",
                textTransform: el.uppercase ? "uppercase" : "none",
                letterSpacing:
                  el.letterSpacing === "widest"
                    ? "0.15em"
                    : el.letterSpacing === "wide"
                    ? "0.05em"
                    : "normal",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {text || (isInteractive ? `[${el.name}]` : "")}
            </p>

            {/* Interactive Left & Right Resize Handles when Selected */}
            {isSelected && isInteractive && (
              <>
                {/* Left handle */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setResizing({
                      id: el.id,
                      handle: "left",
                      initialWidth: el.width || 80,
                      elementX: el.x,
                      textAlign: el.textAlign,
                    });
                  }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-md z-35 flex items-center justify-center"
                  title="Tarik untuk mengatur batas lebar kiri"
                >
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                </div>

                {/* Right handle */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setResizing({
                      id: el.id,
                      handle: "right",
                      initialWidth: el.width || 80,
                      elementX: el.x,
                      textAlign: el.textAlign,
                    });
                  }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-md z-35 flex items-center justify-center"
                  title="Tarik untuk mengatur batas lebar kanan"
                >
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                </div>

                {/* Information badge with live width */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-mono rounded shadow-xs whitespace-nowrap pointer-events-none flex items-center gap-1.5 z-40">
                  <span>{el.name}</span>
                  <span className="opacity-70">•</span>
                  <span>Lebar: {el.width ? `${el.width}%` : "Auto"}</span>
                  <span className="opacity-70">•</span>
                  <span>({el.x}%, {el.y}%)</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
