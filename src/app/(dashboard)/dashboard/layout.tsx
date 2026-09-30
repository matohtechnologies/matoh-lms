import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import DashboardNavLink from "./nav-link";
import SignOutButton from "@/components/auth/signout-button";
import MobileNav from "./mobile-nav";

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
    <div className="min-h-screen bg-stone-50 flex">
      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-stone-200 flex-col fixed top-0 left-0 h-screen z-30">
        {/* Logo */}
        <div className="p-4 border-b border-stone-100 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <BookOpen size={16} className="text-white" />
            </div>
            <span
              className="font-bold text-stone-900 text-base"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              Earthy<span className="text-orange-600">Academy</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-stone-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shrink-0">
              {userInitial}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-stone-900 truncate">{userName}</p>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 shrink-0">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {isAdmin && (
            <div className="mb-4 p-3 rounded-xl bg-stone-900 text-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={13} /> Admin Console
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mb-2.5">
                {tDash("admin_console_desc")}
              </p>
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                {tDash("open_admin_panel")}
              </Link>
            </div>
          )}

          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-2">
            {tDash("learner_menu")}
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <DashboardNavLink key={item.href} item={item} />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-2">
              {tDash("explore_section")}
            </p>
            <Link
              href="/courses"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all"
            >
              <BookOpen size={16} className="text-stone-400" />
              {tDash("browse_courses")}
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-stone-100">
          <SignOutButton variant="dashboard" />
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <BookOpen size={13} className="text-white" />
            </div>
            <span
              className="font-bold text-stone-900 text-sm"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              Earthy<span className="text-orange-600">Academy</span>
            </span>
          </Link>
          <div className="flex items-center">
            {/* User avatar mobile */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-5 lg:p-7 pb-24 lg:pb-7">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
