"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Minimalist, tactile Back-to-Top button.
 * Fades in gently after scrolling down and scrolls back up with smooth easing.
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 350);
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

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas halaman"
      title="Kembali ke atas"
      className={cn(
        "fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200/80 backdrop-blur-md flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:text-blue-600 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      )}
    >
      <ArrowUp size={18} strokeWidth={2.2} />
    </button>
  );
}
