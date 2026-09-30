"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, Users, ShoppingBag, type LucideIcon } from "lucide-react";

const ADMIN_ICON_MAP: Record<string, LucideIcon> = {
  "/admin": BarChart3,
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
  const Icon = ADMIN_ICON_MAP[item.href] || BarChart3;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-stone-800 text-orange-400 font-semibold shadow-sm"
          : "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
      )}
    >
      <Icon
        size={16}
        className={isActive ? "text-orange-400" : "text-stone-500"}
      />
      {item.label}
    </Link>
  );
}
