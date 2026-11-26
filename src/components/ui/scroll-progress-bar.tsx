"use client";

import { useEffect, useState } from "react";

/**
 * Ultra-smooth reading/scroll progress bar.
 * Pinned at the very top of the window with zero layout shift.
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const percentage = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setProgress(percentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 origin-left transition-[width] duration-150 ease-out shadow-xs"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
