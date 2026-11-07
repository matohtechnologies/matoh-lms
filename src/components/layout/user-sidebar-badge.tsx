"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface UserSidebarBadgeProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  variant?: "dashboard" | "admin" | "mobile-dashboard" | "mobile-admin";
}

export function UserSidebarBadge({ initialUser, variant = "dashboard" }: UserSidebarBadgeProps) {
  const { data: session } = useSession();
  const tNav = useTranslations("nav");

  const [imageError, setImageError] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    initialUser?.image ?? session?.user?.image ?? null
  );

  // Sync state if initialUser or session updates
  useEffect(() => {
    if (initialUser?.image) {
      setProfileImage(initialUser.image);
      setImageError(false);
    } else if (session?.user?.image) {
      setProfileImage(session.user.image);
      setImageError(false);
    }
  }, [initialUser?.image, session?.user?.image]);

  // Always fetch latest profile data from database on mount to guarantee fresh image
  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.image) {
          setProfileImage(data.user.image);
          setImageError(false);
        }
      })
      .catch(() => {});
  }, []);

  const name = session?.user?.name ?? initialUser?.name ?? tNav("user_fallback");
  const email = session?.user?.email ?? initialUser?.email ?? "";
  const role = session?.user?.role ?? initialUser?.role ?? "USER";
  const isAdmin = role === "ADMIN";
  const userInitial = name?.[0]?.toUpperCase() ?? "U";

  // Use profileImage, fallback to initialUser or session, or null if error occurred
  const effectiveImage = !imageError ? (profileImage || initialUser?.image || session?.user?.image || null) : null;

  if (variant === "mobile-dashboard" || variant === "mobile-admin") {
    return (
      <Link
        href="/dashboard/profile"
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-2xs overflow-hidden ring-1 ring-slate-200/60 hover:opacity-90 transition-opacity"
        title={tNav("open_profile")}
      >
        {effectiveImage ? (
          <img
            src={effectiveImage}
            alt=""
            width={32}
            height={32}
            onError={() => setImageError(true)}
            style={{ aspectRatio: "1 / 1" }}
            className="w-full h-full object-cover aspect-square"
          />
        ) : (
          <span>{userInitial}</span>
        )}
      </Link>
    );
  }

  if (variant === "admin") {
    return (
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/70 transition-colors group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs overflow-hidden ring-1 ring-slate-200/60">
          {effectiveImage ? (
            <img
              src={effectiveImage}
              alt=""
              width={36}
              height={36}
              onError={() => setImageError(true)}
              style={{ aspectRatio: "1 / 1" }}
              className="w-full h-full object-cover aspect-square"
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
            {name}
          </p>
          <p className="text-[11px] text-slate-500 truncate">Super Administrator</p>
        </div>
      </Link>
    );
  }

  // Default: dashboard variant
  return (
    <Link
      href="/dashboard/profile"
      className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100/70 transition-colors group"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs overflow-hidden ring-1 ring-slate-200/60">
        {effectiveImage ? (
          <img
            src={effectiveImage}
            alt=""
            width={36}
            height={36}
            onError={() => setImageError(true)}
            style={{ aspectRatio: "1 / 1" }}
            className="w-full h-full object-cover aspect-square"
          />
        ) : (
          <span>{userInitial}</span>
        )}
      </div>
      <div className="overflow-hidden min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
            {name}
          </p>
          {isAdmin && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200/60 shrink-0">
              ADMIN
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
      </div>
    </Link>
  );
}
