"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Volume2, VolumeX, Sparkles, Trophy, Calendar } from "lucide-react";
import { isSoundEnabled, toggleSoundEnabled, playPopSound } from "@/lib/sound-effects";
import Link from "next/link";

interface StreakDay {
  date: string;
  dayName: string;
  completed: boolean;
  isToday: boolean;
}

interface StreakData {
  streakCount: number;
  longestStreak: number;
  todayCompleted: boolean;
  totalActiveDays: number;
  history: StreakDay[];
  message: string;
}

export function LearningStreakBadge() {
  const [data, setData] = useState<StreakData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/user/streak");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silently fail if user is not authenticated or network error
    }
  };

  useEffect(() => {
    fetchStreak();
    setSoundOn(isSoundEnabled());

    const handleSoundToggle = () => {
      setSoundOn(isSoundEnabled());
    };
    window.addEventListener("sound-fx-toggle", handleSoundToggle);

    // Refresh streak when user marks a lesson complete
    const handleProgressUpdate = () => {
      fetchStreak();
    };
    window.addEventListener("lesson-completed", handleProgressUpdate);

    return () => {
      window.removeEventListener("sound-fx-toggle", handleSoundToggle);
      window.removeEventListener("lesson-completed", handleProgressUpdate);
    };
  }, []);

  // Close popover when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleSound = () => {
    const next = toggleSoundEnabled();
    setSoundOn(next);
    if (next) {
      playPopSound();
    }
  };

  if (!data) return null;

  const count = data.streakCount;
  const isHot = count > 0;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Navbar Badge Button */}
      <button
        id="learning-streak-badge-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          playPopSound();
        }}
        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 shadow-2xs select-none ${
          isHot
            ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-orange-300/80 text-orange-700 hover:border-orange-400 hover:scale-105 hover:shadow-orange-200/50"
            : "bg-stone-50 border-stone-200/90 text-stone-600 hover:bg-stone-100/80 hover:text-stone-800"
        }`}
        title="Api Semangat Belajar (Daily Learning Streak)"
        aria-label="Daily Learning Streak"
      >
        <span
          className={`relative flex items-center justify-center transition-transform duration-300 ${
            isHot ? "group-hover:scale-110" : ""
          }`}
        >
          <Flame
            size={16}
            className={`transition-colors duration-300 ${
              isHot
                ? "text-orange-500 fill-orange-500 animate-pulse"
                : "text-stone-400"
            }`}
          />
          {data.todayCompleted && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          )}
        </span>
        <span className="font-extrabold tracking-tight">
          {count} {count === 1 ? "Hari" : "Hari"}
        </span>
      </button>

      {/* Interactive Details Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2.5 w-80 sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-warm-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isHot
                    ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                <Flame size={18} className={isHot ? "fill-white" : ""} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 leading-tight">
                  Api Semangat Belajar
                </h4>
                <p className="text-[10px] text-stone-500">Daily Learning Streak</p>
              </div>
            </div>

            {/* Streak Counter Chip */}
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                isHot
                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              🔥 {count} Hari Beruntun
            </div>
          </div>

          {/* Motivational Message */}
          <div className="my-3 p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 text-stone-700 text-xs leading-relaxed flex items-start gap-2">
            <Sparkles size={14} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-stone-700">{data.message}</p>
          </div>

          {/* 7-Day Activity Calendar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                <Calendar size={11} /> 7 Hari Terakhir
              </span>
              <span className="text-[10px] text-stone-400">
                {data.todayCompleted ? "✅ Target hari ini tercapai" : "⏳ Target belum selesai"}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl bg-stone-50/80 border border-stone-200/60">
              {data.history.map((day) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center py-1.5 rounded-lg transition-all ${
                    day.isToday
                      ? "ring-1.5 ring-orange-400/80 bg-white shadow-2xs"
                      : ""
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold mb-1 ${
                      day.isToday ? "text-orange-600" : "text-stone-400"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform ${
                      day.completed
                        ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs scale-105"
                        : day.isToday
                        ? "border-2 border-dashed border-orange-400 text-orange-500 bg-orange-50/50 animate-pulse"
                        : "bg-stone-200/60 text-stone-300"
                    }`}
                    title={`${day.date}: ${day.completed ? "Selesai" : "Tidak ada aktivitas"}`}
                  >
                    {day.completed ? (
                      <Flame size={12} className="fill-white" />
                    ) : (
                      <span className="text-[9px] font-bold">•</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Bar: Longest Streak & Total Active Days */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center gap-2">
              <Trophy size={14} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-[9px] text-stone-400 uppercase font-semibold">Rekor Terpanjang</p>
                <p className="text-xs font-bold text-stone-800">{data.longestStreak} Hari</p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[9px] text-stone-400 uppercase font-semibold">Total Hari Belajar</p>
                <p className="text-xs font-bold text-stone-800">{data.totalActiveDays} Hari</p>
              </div>
            </div>
          </div>

          {/* Micro-interaction Sound FX Toggle */}
          <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              {soundOn ? (
                <Volume2 size={14} className="text-blue-600" />
              ) : (
                <VolumeX size={14} className="text-stone-400" />
              )}
              <span className="text-[11px] font-medium">Efek Suara Mikro-interaksi</span>
            </div>
            <button
              onClick={handleToggleSound}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                soundOn ? "bg-blue-600" : "bg-stone-300"
              }`}
              title="Aktif/Nonaktifkan efek suara (pop & celebration)"
              aria-label="Toggle sound effects"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  soundOn ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Quick Action CTA */}
          <div className="mt-3">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Lanjutkan Belajar Sekarang</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
