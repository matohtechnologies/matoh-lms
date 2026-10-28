import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import DashboardNavLink from "./nav-link";
import SignOutButton from "@/components/auth/signout-button";
import MobileNav from "./mobile-nav";
import { UserSidebarBadge } from "@/components/layout/user-sidebar-badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
  const tDash = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  const navItems = [
    { href: "/dashboard", label: tDash("overview"), exact: true },
    { href: "/dashboard/my-courses", label: tDash("my_courses") },
    { href: "/dashboard/certificates", label: tDash("certificates") },
    { href: "/dashboard/orders", label: tDash("orders") },
    { href: "/dashboard/profile", label: tDash("profile") },
  ];

  const userName = session.user?.name ?? (isEn ? "User" : "Pengguna");
  const userEmail = session.user?.email ?? "";
  const userInitial = userName[0]?.toUpperCase() ?? "U";
  const isAdmin = session.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200/80 flex-col fixed top-0 left-0 h-screen z-30 shadow-xs">
        {/* Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-1 group-hover:border-blue-400 group-hover:scale-105 transition-all">
              <Image
                src="/images/matoh-logo.png"
                alt="Matoh Technologies"
                width={22}
                height={22}
                priority
                style={{ aspectRatio: "1 / 1" }}
                className="object-contain aspect-square"
              />
            </div>
            <span
              className="font-bold text-slate-900 text-base"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Matoh<span className="text-blue-600">Technologies</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-100">
          <UserSidebarBadge
            initialUser={{
              name: userName,
              email: userEmail,
              image: session.user?.image,
              role: session.user?.role,
            }}
            variant="dashboard"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3.5 overflow-y-auto space-y-1">
          {isAdmin && (
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50/80 border border-blue-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={13} className="text-blue-600" /> Mode Administrator
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {tDash("admin_console_desc")}
              </p>
              <Link
                href="/admin"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                {tDash("open_admin_panel")}
              </Link>
            </div>
          )}

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            {tDash("learner_menu")}
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <DashboardNavLink key={item.href} item={item} />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {tDash("explore_section")}
            </p>
            <Link
              href="/courses"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-all border border-transparent hover:border-slate-200/60"
            >
              <BookOpen size={15} className="text-slate-400" />
              {tDash("browse_courses")}
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <SignOutButton variant="dashboard">{tDash("logout")}</SignOutButton>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-0.5">
              <Image
                src="/images/matoh-logo.png"
                alt="Matoh Technologies"
                width={18}
                height={18}
                priority
                style={{ aspectRatio: "1 / 1" }}
                className="object-contain aspect-square"
              />
            </div>
            <span
              className="font-bold text-slate-900 text-sm"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Matoh<span className="text-blue-600">Technologies</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200/60"
              >
                Admin
              </Link>
            )}
            <SignOutButton
              variant="icon"
              title={tDash("logout")}
              aria-label={tDash("logout")}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 bg-white shadow-2xs"
            />
            <UserSidebarBadge
              initialUser={{
                name: userName,
                email: userEmail,
                image: session.user?.image,
                role: session.user?.role,
              }}
              variant="mobile-dashboard"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
