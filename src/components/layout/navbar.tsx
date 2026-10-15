"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  BookOpen,
  User,
  LayoutDashboard,
  Shield,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  Palette,
  Smartphone,
  Cloud,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Building2,
  Compass,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { useAppLocale } from "@/components/providers/locale-provider";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/auth/signout-button";
import { LearningStreakBadge } from "@/components/gamification/learning-streak-badge";
import { CertificateVerificationModal } from "@/components/certificates/certificate-verification-modal";

interface NavbarCategoryItem {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  icon?: string | null;
  _count?: { courses: number };
}

interface NavbarProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
  categories?: NavbarCategoryItem[];
}

export function Navbar({ user, categories }: NavbarProps) {
  const { data: session } = useSession();
  const { locale } = useAppLocale();
  const isEn = locale === "en";

  const currentUser = session?.user
    ? {
      ...user,
      ...session.user,
      image: session.user.image ?? user?.image,
      name: session.user.name ?? user?.name,
    }
    : user;
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isMobileProgramOpen, setIsMobileProgramOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProgramDropdownOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleMouseEnterProgram = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsProgramDropdownOpen(true);
  };

  const handleMouseLeaveProgram = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProgramDropdownOpen(false);
    }, 150);
  };

  const getCategoryIcon = (slug: string) => {
    if (slug.includes("web") || slug.includes("code")) return Code2;
    if (slug.includes("data") || slug.includes("ai")) return Database;
    if (slug.includes("design") || slug.includes("ui")) return Palette;
    if (slug.includes("mobile") || slug.includes("app")) return Smartphone;
    if (slug.includes("cloud") || slug.includes("devops")) return Cloud;
    if (slug.includes("marketing") || slug.includes("growth")) return TrendingUp;
    return BookOpen;
  };

  const getCategoryColor = (slug: string) => {
    if (slug.includes("web")) return "text-blue-600 bg-blue-50 border-blue-200/60";
    if (slug.includes("data")) return "text-emerald-600 bg-emerald-50 border-emerald-200/60";
    if (slug.includes("design")) return "text-purple-600 bg-purple-50 border-purple-200/60";
    if (slug.includes("mobile")) return "text-amber-600 bg-amber-50 border-amber-200/60";
    if (slug.includes("cloud")) return "text-sky-600 bg-sky-50 border-sky-200/60";
    if (slug.includes("marketing")) return "text-rose-600 bg-rose-50 border-rose-200/60";
    return "text-blue-600 bg-blue-50 border-blue-200/60";
  };

  const programCategories = (categories && categories.length > 0)
    ? categories.map((cat) => ({
      icon: getCategoryIcon(cat.slug),
      color: getCategoryColor(cat.slug),
      name: isEn ? (cat.nameEn || cat.name) : cat.name,
      desc: cat._count?.courses !== undefined
        ? (isEn ? `${cat._count.courses} active courses available` : `${cat._count.courses} kelas tersedia`)
        : (isEn ? "Curated learning track" : "Program belajar terstruktur"),
      href: `/courses?category=${encodeURIComponent(cat.name)}`,
      badge: cat._count?.courses && cat._count.courses > 0 ? (isEn ? `${cat._count.courses} Courses` : `${cat._count.courses} Kelas`) : undefined,
    }))
    : [
      {
        icon: Code2,
        color: "text-blue-600 bg-blue-50 border-blue-200/60",
        name: isEn ? "All Programs" : "Semua Program",
        desc: isEn ? "Browse all available courses in database" : "Jelajahi semua kelas di database",
        href: "/courses",
        badge: undefined,
      },
    ];

  const programFormats = [
    {
      icon: GraduationCap,
      title: isEn ? "Intensive Career Bootcamp" : "Bootcamp Karir Intensif",
      desc: isEn
        ? "12-16 week structured curriculum with 1-on-1 mentorship and recruiter-ready production portfolio."
        : "Kurikulum 12-16 minggu dengan bimbingan mentor 1-on-1 dan portofolio produksi siap uji recruiter.",
      tag: isEn ? "Full-Time / Part-Time" : "Penuh Waktu / Paruh Waktu",
      href: "/courses?level=INTERMEDIATE",
    },
    {
      icon: Sparkles,
      title: isEn ? "Self-Paced Masterclass" : "Masterclass Belajar Mandiri",
      desc: isEn
        ? "Flexible self-paced learning with 4K video, periodic evaluation quizzes, and QR-verified certificates."
        : "Belajar mandiri fleksibel dengan video resolusi tinggi, kuis evaluasi berkala, dan sertifikat ber-QR.",
      tag: isEn ? "Lifetime Access" : "Akses Selamanya",
      href: "/courses",
    },
    {
      icon: Building2,
      title: isEn ? "Corporate & B2B Upskilling" : "Pelatihan Perusahaan & B2B",
      desc: isEn
        ? "Custom structured training to elevate your company's software and digital engineering teams."
        : "Pelatihan kustom terstruktur untuk meningkatkan kapabilitas tim teknologi dan digital perusahaan.",
      tag: isEn ? "Enterprise Solution" : "Solusi Perusahaan",
      href: "/contact",
    },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-warm"
          : "bg-white/80 backdrop-blur-xs border-b border-stone-100/60 sm:bg-transparent sm:border-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 xl:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center p-1.5 group-hover:border-blue-400 group-hover:shadow-xs transition-all">
            <Image
              src="/images/matoh-logo.png"
              alt="PT. Matoh Technologies Indonesia"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <span
            className="font-bold text-stone-900 text-lg sm:text-xl tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            Matoh<span className="text-blue-600">Technologies</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {/* 1. Beranda */}
          <Link
            href="/"
            className={cn(
              "px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
              pathname === "/"
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
            )}
          >
            <span className="whitespace-nowrap">{t("home")}</span>
          </Link>

          {/* 2. Dropdown Program */}
          <div
            className="relative shrink-0"
            onMouseEnter={handleMouseEnterProgram}
            onMouseLeave={handleMouseLeaveProgram}
          >
            <button
              type="button"
              onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
              className={cn(
                "flex items-center gap-1 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
                pathname.startsWith("/courses") || isProgramDropdownOpen
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
              )}
            >
              <span className="whitespace-nowrap">{t("programs")}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200 shrink-0",
                  isProgramDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Mega Dropdown Menu */}
            {isProgramDropdownOpen && (
              <div
                className="absolute top-full -left-20 w-[780px] bg-white rounded-3xl border border-stone-200/90 shadow-warm-xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseEnter={handleMouseEnterProgram}
                onMouseLeave={handleMouseLeaveProgram}
              >
                {/* Header within dropdown */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      {isEn ? "Industry Standard Curricula" : "Kurikulum Standar Industri"}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {isEn ? "Choose your dream course category & career path" : "Pilih kategori kelas & jalur karir impian Anda"}
                    </span>
                  </div>
                  <Link
                    href="/courses"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
                    onClick={() => setIsProgramDropdownOpen(false)}
                  >
                    <span>{isEn ? "Browse All Courses" : "Katalog Semua Kelas"}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* Left Column: Categories */}
                  <div className="col-span-7 space-y-2 border-r border-stone-100 pr-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-2">
                      {t("career_tracks")}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {programCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-stone-50 transition-colors group"
                            onClick={() => setIsProgramDropdownOpen(false)}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform",
                                cat.color
                              )}
                            >
                              <Icon size={17} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                                  {cat.name}
                                </p>
                                {cat.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                                    {cat.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                {cat.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Learning Formats (5 cols) */}
                  <div className="col-span-5 space-y-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-2">
                      {t("learning_formats")}
                    </p>
                    <div className="space-y-2">
                      {programFormats.map((fmt) => {
                        const Icon = fmt.icon;
                        return (
                          <Link
                            key={fmt.title}
                            href={fmt.href}
                            className="block p-3 rounded-2xl border border-stone-200/70 hover:border-blue-200 hover:bg-blue-50/30 transition-all group shadow-2xs"
                            onClick={() => setIsProgramDropdownOpen(false)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon size={15} className="text-blue-600" />
                              <h4 className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                                {fmt.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-2">
                              {fmt.desc}
                            </p>
                            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                              {fmt.tag}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Dropdown Bottom Banner */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 bg-stone-50/80 -mx-6 -mb-6 p-4 rounded-b-3xl">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-stone-700">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {isEn ? "QR-Verified Certificate" : "Sertifikat Terverifikasi QR"}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-stone-700">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {isEn ? "1-on-1 Portfolio Review" : "Review Portofolio 1-on-1"}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-stone-700">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      {isEn ? "Lifetime Access" : "Akses Selamanya"}
                    </span>
                  </div>

                  <Link
                    href="/courses"
                    className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    onClick={() => setIsProgramDropdownOpen(false)}
                  >
                    <span>{t("explore_all_programs")}</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Verifikasi Sertifikat */}
          <button
            type="button"
            onClick={() => setIsVerifyModalOpen(true)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0",
              pathname.startsWith("/verify")
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
            )}
            title={isEn ? "Verify certificate by serial ID" : "Verifikasi keaslian sertifikat dengan nomor seri"}
          >
            <span className="whitespace-nowrap">{isEn ? "Verify Certificate" : "Verifikasi Sertifikat"}</span>
          </button>

          {/* 4. Tentang Kami */}
          <Link
            href="/about"
            className={cn(
              "px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
              pathname === "/about"
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
            )}
          >
            <span className="whitespace-nowrap">{t("about")}</span>
          </Link>

          {/* 5. Kontak */}
          <Link
            href="/contact"
            className={cn(
              "px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
              pathname === "/contact"
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
            )}
          >
            <span className="whitespace-nowrap">{t("contact")}</span>
          </Link>
        </div>

        {/* Right side: Language Switcher, Daily Streak & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user && <LearningStreakBadge />}
          <LanguageSwitcher />

          {user ? (
            <div className="relative">
              <button
                id="user-menu-button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-1 ring-blue-200/60 shadow-2xs">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name ?? "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser?.name?.[0]?.toUpperCase() ?? "U"}</span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[100px] truncate">
                  {currentUser?.name}
                </span>
                <ChevronDown size={14} className="text-stone-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-stone-200 shadow-warm-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {currentUser?.name}
                        </p>
                        {currentUser?.role === "ADMIN" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 truncate">{currentUser?.email}</p>
                    </div>

                    {user.role === "ADMIN" ? (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 transition-colors"
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
                          {isEn ? "Manage Courses" : "Kelola Kelas"}
                        </Link>
                        <Link
                          href="/dashboard?view=student"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} className="text-stone-400" />
                          {isEn ? "Student Mode" : "Mode Siswa"}
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
                <Button variant="ghost" size="sm" className="font-semibold text-stone-700">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-xs">
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-2 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Buka Menu"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-5 space-y-2 shadow-warm-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* 1. Beranda */}
          <Link
            href="/"
            className={cn(
              "block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors",
              pathname === "/" ? "bg-blue-50 text-blue-700" : "text-stone-800 hover:bg-stone-50"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            {t("home")}
          </Link>

          {/* 2. Program Accordion */}
          <div className="rounded-xl border border-stone-200/80 overflow-hidden bg-stone-50/50">
            <button
              type="button"
              onClick={() => setIsMobileProgramOpen(!isMobileProgramOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-stone-800 hover:bg-stone-100/70 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Compass size={16} className="text-blue-600" />
                <span>{t("programs")}</span>
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-stone-500 transition-transform duration-200",
                  isMobileProgramOpen && "rotate-180"
                )}
              />
            </button>

            {isMobileProgramOpen && (
              <div className="px-3 pb-3 pt-1 space-y-1 bg-white border-t border-stone-200/70">
                <p className="px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  {isEn ? "Main Categories" : "Kategori Utama"}
                </p>
                {programCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Icon size={14} className="text-blue-600 shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-2 border-t border-stone-100">
                  <Link
                    href="/courses"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/80"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span>{isEn ? "Browse All Courses Catalog" : "Lihat Semua Katalog Kelas"}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Verifikasi Sertifikat */}
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              setIsVerifyModalOpen(true);
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer",
              pathname.startsWith("/verify")
                ? "bg-emerald-50 text-emerald-800"
                : "text-stone-800 hover:bg-stone-50"
            )}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>{isEn ? "Verify Certificate" : "Verifikasi Sertifikat"}</span>
            </span>
            <ArrowRight size={14} className="text-stone-400" />
          </button>

          {/* 4. Tentang Kami */}
          <Link
            href="/about"
            className={cn(
              "block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors",
              pathname === "/about" ? "bg-blue-50 text-blue-700" : "text-stone-800 hover:bg-stone-50"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            {t("about")}
          </Link>

          {/* 5. Kontak */}
          <Link
            href="/contact"
            className={cn(
              "block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors",
              pathname === "/contact" ? "bg-blue-50 text-blue-700" : "text-stone-800 hover:bg-stone-50"
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            {t("contact")}
          </Link>

          {/* Daily Streak in Mobile */}
          {user && (
            <div className="pt-2 pb-1 px-4 flex items-center justify-between border-t border-stone-100">
              <span className="text-xs text-stone-500 font-medium">
                {isEn ? "Daily Learning Streak" : "Api Semangat Belajar"}
              </span>
              <LearningStreakBadge />
            </div>
          )}

          {/* Language Switcher in Mobile */}
          <div className="pt-3 pb-1 px-4 flex items-center justify-between border-t border-stone-100">
            <span className="text-xs text-stone-500 font-medium">
              {isEn ? "Select Language" : "Pilih Bahasa / Language"}
            </span>
            <LanguageSwitcher />
          </div>

          {/* Auth options in Mobile */}
          {user ? (
            <div className="pt-2 border-t border-stone-100 space-y-1">
              {user.role === "ADMIN" ? (
                <>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Shield size={16} />
                    Admin Console
                  </Link>
                  <Link
                    href="/dashboard?view=student"
                    className="block px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {isEn ? "Student Preview Mode" : "Mode Pratinjau Siswa"}
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
            <div className="flex gap-2 pt-3">
              <Link href="/login" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full font-semibold">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setIsMobileOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-xs">
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Interactive Certificate Verification Modal */}
      <CertificateVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        isEn={isEn}
      />
    </header>
  );
}
