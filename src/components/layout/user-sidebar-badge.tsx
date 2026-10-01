"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

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

  const name = session?.user?.name ?? initialUser?.name ?? "Pengguna";
  const email = session?.user?.email ?? initialUser?.email ?? "";
  const image = session?.user?.image ?? initialUser?.image ?? null;
  const role = session?.user?.role ?? initialUser?.role ?? "USER";
  const isAdmin = role === "ADMIN";
  const userInitial = name?.[0]?.toUpperCase() ?? "U";

  if (variant === "mobile-dashboard" || variant === "mobile-admin") {
    return (
      <Link
        href="/dashboard/profile"
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs overflow-hidden ring-1 ring-stone-200/60 hover:opacity-90 transition-opacity"
        title="Buka Profil"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
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
        className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/60 hover:bg-stone-100/70 transition-colors group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs overflow-hidden ring-1 ring-stone-200/60">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-stone-900 truncate group-hover:text-orange-600 transition-colors">
            {name}
          </p>
          <p className="text-[11px] text-stone-500 truncate">Super Administrator</p>
        </div>
      </Link>
    );
  }

  // Default: dashboard variant
  return (
    <Link
      href="/dashboard/profile"
      className="flex items-center gap-3 p-2 rounded-xl bg-stone-50/70 border border-stone-200/60 hover:bg-stone-100/70 transition-colors group"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs overflow-hidden ring-1 ring-stone-200/60">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{userInitial}</span>
        )}
      </div>
      <div className="overflow-hidden min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-stone-900 truncate group-hover:text-orange-600 transition-colors">
            {name}
          </p>
          {isAdmin && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200/60 shrink-0">
              ADMIN
            </span>
          )}
        </div>
        <p className="text-[11px] text-stone-400 truncate mt-0.5">{email}</p>
      </div>
    </Link>
  );
}
