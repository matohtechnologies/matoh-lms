"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, Users, ShoppingBag, type LucideIcon } from "lucide-react";

const ADMIN_ICON_MAP: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/courses": BookOpen,
  "/admin/users": Users,
  "/admin/orders": ShoppingBag,
};

export interface AdminNavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export default function AdminNavLink({ item }: { item: AdminNavItem }) {
  const pathname = usePathname();
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = ADMIN_ICON_MAP[item.href] || LayoutDashboard;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-blue-50/90 text-blue-950 font-semibold shadow-2xs border border-blue-200/80"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
          isActive
            ? "bg-blue-600 text-white shadow-2xs"
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
        )}
      >
        <Icon size={14} />
      </div>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
