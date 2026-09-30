"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  ShoppingBag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/my-courses", label: "Kelas", icon: BookOpen },
  { href: "/dashboard/certificates", label: "Sertifikat", icon: Award },
  { href: "/dashboard/orders", label: "Pembelian", icon: ShoppingBag },
  { href: "/dashboard/profile", label: "Profil", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 safe-area-bottom">
      <div className="flex items-stretch h-16">
        {mobileNavItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                isActive ? "text-orange-600" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <div
                className={cn(
                  "w-9 h-6 rounded-full flex items-center justify-center transition-all",
                  isActive ? "bg-orange-100" : ""
                )}
              >
                <Icon size={18} />
              </div>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
