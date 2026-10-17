"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useAppLocale } from "@/components/providers/locale-provider";

export function FloatingActionDock() {
  const { locale } = useAppLocale();
  const isEn = locale === "en";

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;

          if (totalHeight > 0) {
            const progress = Math.min(
              100,
              Math.max(0, (currentScroll / totalHeight) * 100)
            );
            setScrollProgress(progress);
          }

          setIsVisible(currentScroll > 360);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG Circular progress dimensions
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 pointer-events-auto transition-all duration-300 ease-out transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      }`}
      aria-label={isEn ? "Scroll to Top" : "Kembali ke Atas"}
    >
      <button
        onClick={scrollToTop}
        className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white text-slate-700 hover:text-blue-600 shadow-md hover:shadow-lg border border-slate-200/90 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 cursor-pointer group"
        title={isEn ? "Scroll to Top" : "Kembali ke Atas"}
        aria-label="Scroll to top"
      >
        {/* SVG Progress Circle */}
        <svg
          className="absolute inset-0 -rotate-90 pointer-events-none"
          width={size}
          height={size}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Dynamic Progress Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />
        </svg>

        {/* Center Arrow Icon */}
        <ArrowUp
          size={16}
          className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5 text-slate-700 group-hover:text-blue-600"
        />
      </button>
    </div>
  );
}
