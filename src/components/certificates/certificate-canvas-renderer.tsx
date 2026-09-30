"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  CertificateDesignConfig,
  CertificateElement,
  CertificateDataValues,
  resolveElementText,
} from "@/lib/certificate-templates";
import { ShieldCheck } from "lucide-react";

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

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        if (!isInteractive) return;
        if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "IMG") {
          onSelectElement?.(null);
        }
      }}
      className={`relative w-full aspect-[16/10] overflow-hidden select-none transition-all ${getBorderClasses()} ${className}`}
      style={{
        backgroundColor: config.backgroundColor || "#ffffff",
        borderColor: config.borderColor || "#e2e8f0",
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

      {/* Seal Badge if enabled */}
      {config.showSealBadge && (
        <div
          className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
          style={{
            left: `${config.sealPosition?.x ?? 50}%`,
            top: `${config.sealPosition?.y ?? 78}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-amber-500/30 bg-amber-50/90 flex items-center justify-center text-amber-700 shadow-md">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/90 px-2 py-0.5 rounded-full mt-1">
            VERIFIED
          </span>
        </div>
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
              isInteractive ? "hover:outline hover:outline-1 hover:outline-orange-400 hover:bg-orange-50/20 rounded-md" : ""
            } ${
              isSelected
                ? "outline-2 outline-orange-600 ring-2 ring-orange-400/50 bg-orange-50/30 rounded-md shadow-xs"
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
              maxWidth: el.maxWidth ? `${el.maxWidth}%` : "90%",
              width: el.textAlign === "center" ? "auto" : undefined,
              textAlign: el.textAlign,
            }}
          >
            <p
              className={`${getFontFamilyClass(el.fontFamily)} leading-tight`}
              style={{
                fontSize: `clamp(9px, ${el.fontSize * 0.08}vw + ${el.fontSize * 0.4}px, ${el.fontSize}px)`,
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
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-mono rounded shadow-xs whitespace-nowrap pointer-events-none">
                {el.name} ({el.x}%, {el.y}%)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
