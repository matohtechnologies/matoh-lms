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
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-orange-50 text-orange-700"
          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
          isActive ? "bg-orange-100" : "bg-stone-100 group-hover:bg-stone-200"
        )}
      >
        <Icon
          size={15}
          className={isActive ? "text-orange-600" : "text-stone-500"}
        />
      </div>
      <span className="truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}
