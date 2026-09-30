"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, Menu, X, BookOpen, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import SignOutButton from "@/components/auth/signout-button";

interface NavbarProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/courses", label: t("courses") },
    { href: "/about", label: t("about") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-warm"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-stone-900 text-lg tracking-tight" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
            Earthy<span className="text-orange-600">Academy</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "bg-orange-50 text-orange-700"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {user ? (
            <div className="relative">
              <button
                id="user-menu-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-stone-200 shadow-warm-lg py-1.5 z-20">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                        {user.role === "ADMIN" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>

                    {user.role === "ADMIN" ? (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-600 bg-orange-50/70 hover:bg-orange-100/70 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield size={16} />
                          Admin Console
                        </Link>
                        <Link
                          href="/admin/courses"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BookOpen size={16} className="text-stone-400" />
                          Kelola Kelas
                        </Link>
                        <Link
                          href="/dashboard?view=student"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} className="text-stone-400" />
                          Mode Siswa
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} className="text-stone-400" />
                        {t("dashboard")}
                      </Link>
                    )}

                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} className="text-stone-400" />
                      {t("profile")}
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <SignOutButton variant="navbar">{t("logout")}</SignOutButton>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">{t("login")}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-2 rounded-xl hover:bg-stone-100 text-stone-600"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-orange-50 text-orange-700"
                  : "text-stone-700 hover:bg-stone-50"
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 pb-1 px-4 flex items-center justify-between border-t border-stone-100">
            <span className="text-xs text-stone-500 font-medium">Pilih Bahasa / Language</span>
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="pt-2 border-t border-stone-100 space-y-1">
              {user.role === "ADMIN" ? (
                <>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Shield size={16} />
                    Admin Console (Kelola Platform)
                  </Link>
                  <Link
                    href="/dashboard?view=student"
                    className="block px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Mode Pratinjau Siswa
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {t("dashboard")}
                </Link>
              )}
              <SignOutButton variant="navbar" className="px-4 py-2.5 rounded-xl">
                {t("logout")}
              </SignOutButton>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">{t("login")}</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                <Button size="sm" className="w-full">{t("register")}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
