"use client";

import { ShieldCheck, Award, Sparkles } from "lucide-react";

interface OfficialEmbossedSealProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function OfficialEmbossedSeal({ className = "", size = "md" }: OfficialEmbossedSealProps) {
  const sizeClasses = {
    sm: "w-24 h-24 text-[8px]",
    md: "w-32 h-32 sm:w-36 sm:h-36 text-[9px]",
    lg: "w-40 h-40 sm:w-44 sm:h-44 text-[10px]",
  }[size];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center p-1.5 select-none shrink-0 group ${sizeClasses} ${className}`}
      title="Segel Resmi Keaslian Kredensial PT. Matoh Technologies Indonesia"
    >
      {/* Outer Golden/Bronze Ring with Metallic Texture */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-xl border border-yellow-200/80 p-0.5">
        {/* Subtle Shimmer effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse pointer-events-none" />
      </div>

      {/* Serrated/Notched Border Accent */}
      <div className="absolute inset-1 rounded-full border border-dashed border-amber-900/40" />

      {/* Inner Rich Emerald Core with Radial Gradient */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-b from-emerald-950 via-stone-900 to-emerald-950 border border-amber-300/60 flex flex-col items-center justify-center text-center p-2 shadow-inner overflow-hidden">
        {/* Subtle Radial Shine */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

        {/* Top Arc Text Simulation */}
        <span className="font-extrabold uppercase tracking-widest text-[7px] sm:text-[8px] text-amber-300 drop-shadow-xs">
          PT. MATOH
        </span>

        {/* Center Shield & Star */}
        <div className="relative my-0.5 flex items-center justify-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex items-center justify-center text-emerald-950 shadow-md">
            <ShieldCheck size={20} className="sm:w-5 sm:h-5 text-stone-950 drop-shadow" />
          </div>
        </div>

        {/* Middle Seal Label */}
        <span className="font-mono font-black uppercase text-[8px] sm:text-[9px] tracking-wider text-yellow-300 drop-shadow">
          VERIFIED
        </span>

        {/* Bottom Menkumham Legal Note */}
        <span className="font-semibold text-[6px] sm:text-[6.5px] uppercase tracking-tighter text-amber-200/80 mt-0.5">
          AHU-064920.2024
        </span>
      </div>
    </div>
  );
}
