"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Award,
  ShoppingBag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");

  const mobileNavItems = [
    { href: "/dashboard", labelKey: "mobile_home" as const, icon: LayoutDashboard, exact: true },
    { href: "/dashboard/courses", labelKey: "mobile_catalog" as const, icon: Compass },
    { href: "/dashboard/my-courses", labelKey: "mobile_courses" as const, icon: BookOpen },
    { href: "/dashboard/certificates", labelKey: "mobile_certificates" as const, icon: Award },
    { href: "/dashboard/orders", labelKey: "mobile_orders" as const, icon: ShoppingBag },
    { href: "/dashboard/profile", labelKey: "mobile_profile" as const, icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 safe-area-bottom">
      <div className="flex items-stretch h-16">
        {mobileNavItems.map(({ href, labelKey, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 text-[9px] sm:text-[10px] font-medium transition-colors",
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div
                className={cn(
                  "w-8 h-5 sm:w-9 sm:h-6 rounded-full flex items-center justify-center transition-all",
                  isActive ? "bg-blue-100 text-blue-700" : ""
                )}
              >
                <Icon size={16} />
              </div>
              <span className="truncate max-w-[54px] sm:max-w-none text-center">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
