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
  useSampleFallback = true,
  className = "",
}: CertificateCanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

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
      if (!draggingId || !dragStart || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

      const newX = Math.round(Math.max(2, Math.min(98, dragStart.startX + deltaX)));
      const newY = Math.round(Math.max(2, Math.min(98, dragStart.startY + deltaY)));

      onUpdateElementPosition?.(draggingId, newX, newY);
    },
    [draggingId, dragStart, onUpdateElementPosition]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingId, handleMouseMove, handleMouseUp]);

  const getFontFamilyClass = (family?: string) => {
    switch (family) {
      case "serif":
        return "font-serif";
      case "jakarta":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-sans";
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
            } ${isDragging ? "opacity-75 cursor-grabbing" : ""}`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform:
                el.textAlign === "center"
                  ? "translate(-50%, -50%)"
                  : el.textAlign === "right"
                  ? "translate(-100%, -50%)"
                  : "translate(0, -50%)",
              maxWidth: el.maxWidth ? `${el.maxWidth}%` : "92%",
              width: el.textAlign === "center" ? "auto" : undefined,
              textAlign: el.textAlign,
            }}
          >
            <p
              className={`${getFontFamilyClass(el.fontFamily)} leading-[1.25]`}
              style={{
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
              }}
            >
              {text || (isInteractive ? `[${el.name}]` : "")}
            </p>

            {/* Position coordinate badge when selected in editor */}
            {isSelected && isInteractive && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-mono rounded shadow-xs whitespace-nowrap pointer-events-none">
                {el.name} ({el.x}%, {el.y}%)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
