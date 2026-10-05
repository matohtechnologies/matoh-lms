import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import AdminNavLink, { type AdminNavItem } from "./admin-nav-link";
import SignOutButton from "@/components/auth/signout-button";
import { UserSidebarBadge } from "@/components/layout/user-sidebar-badge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  const tAdmin = await getTranslations("admin");

  const adminNavItems: AdminNavItem[] = [
    { href: "/admin", label: tAdmin("nav_overview"), exact: true },
    { href: "/admin/courses", label: tAdmin("nav_courses") },
    { href: "/admin/users", label: tAdmin("nav_users") },
    { href: "/admin/orders", label: tAdmin("nav_orders") },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
      {/* Mobile Top Navigation */}
      <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/80 p-4 sticky top-0 z-40 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-2xs">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <span
              className="font-bold text-slate-900 text-sm block leading-none"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              Earthy<span className="text-blue-600">Admin</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard?view=student"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 transition-colors border border-slate-200/60"
          >
            {tAdmin("student_mode")}
          </Link>
          <SignOutButton
            variant="admin"
            className="w-auto p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <span className="sr-only">Keluar</span>
          </SignOutButton>
          <UserSidebarBadge
            initialUser={{
              name: session.user?.name,
              email: session.user?.email,
              image: session.user?.image,
              role: session.user?.role,
            }}
            variant="mobile-admin"
          />
        </div>
      </header>

      {/* Mobile Horizontal Subnav */}
      <div className="lg:hidden bg-white/80 backdrop-blur-xs px-4 py-2 border-b border-slate-200/80 flex gap-2 overflow-x-auto text-xs">
        {adminNavItems.map((item) => (
          <AdminNavLink key={item.href} item={item} />
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200/80 flex-col fixed top-0 left-0 h-screen z-40 shadow-xs">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <span
                className="font-bold text-slate-900 text-sm block leading-tight"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                Earthy<span className="text-blue-600">Academy</span>
              </span>
              <span className="inline-block text-[10px] text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100">
          <UserSidebarBadge
            initialUser={{
              name: session.user?.name,
              email: session.user?.email,
              image: session.user?.image,
              role: session.user?.role,
            }}
            variant="admin"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3.5 overflow-y-auto space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          {adminNavItems.map((item) => (
            <AdminNavLink key={item.href} item={item} />
          ))}

          <div className="mt-8 pt-4 border-t border-slate-100">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {tAdmin("quick_nav")}
            </p>
            <Link
              href="/dashboard?view=student"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 transition-colors border border-transparent hover:border-blue-200/60"
            >
              <BookOpen size={14} className="text-slate-400" />
              {tAdmin("student_preview")}
            </Link>
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-stone-100">
          <SignOutButton variant="admin" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
