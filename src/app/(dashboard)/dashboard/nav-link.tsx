"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/my-courses": BookOpen,
  "/dashboard/certificates": Award,
  "/dashboard/orders": ShoppingBag,
  "/dashboard/profile": User,
};

export interface DashboardNavItem {
  href: string;
  label: string;
  exact?: boolean;
  badge?: number;
}

export default function DashboardNavLink({ item }: { item: DashboardNavItem }) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const Icon = ICON_MAP[item.href] ?? LayoutDashboard;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group",
        isActive
          ? "bg-orange-50/90 text-orange-950 font-bold border border-orange-200/80 shadow-2xs"
          : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
          isActive
            ? "bg-orange-600 text-white shadow-2xs"
            : "bg-stone-100 text-stone-500 group-hover:bg-stone-200/80 group-hover:text-stone-700"
        )}
      >
        <Icon size={14} />
      </div>
      <span className="truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-orange-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}
