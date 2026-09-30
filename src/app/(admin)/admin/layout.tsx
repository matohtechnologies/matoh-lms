import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import AdminNavLink, { type AdminNavItem } from "./admin-nav-link";
import SignOutButton from "@/components/auth/signout-button";

const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/courses", label: "Manajemen Kelas" },
  { href: "/admin/users", label: "Manajemen User" },
  { href: "/admin/orders", label: "Semua Transaksi" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Mobile Top Navigation */}
      <header className="lg:hidden bg-stone-900 border-b border-stone-800 p-4 sticky top-0 z-40 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard?view=student"
            className="text-xs text-stone-400 hover:text-white px-2.5 py-1 rounded-lg bg-stone-800"
          >
            Siswa Mode
          </Link>
          <SignOutButton
            variant="admin"
            className="w-auto p-1.5 rounded-lg text-stone-400 hover:text-red-400"
          >
            <span className="sr-only">Keluar</span>
          </SignOutButton>
          <div className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
            {session.user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Subnav */}
      <div className="lg:hidden bg-stone-900 px-4 py-2 border-b border-stone-800 flex gap-2 overflow-x-auto text-xs">
        {adminNavItems.map((item) => (
          <AdminNavLink key={item.href} item={item} />
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-stone-900 flex-col fixed top-0 left-0 h-screen z-40">
        <div className="p-5 border-b border-stone-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block leading-none">
                Earthy Academy
              </span>
              <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {session.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
              <p className="text-xs text-stone-400 truncate">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <AdminNavLink key={item.href} item={item} />
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-stone-800">
            <p className="px-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Navigasi Cepat
            </p>
            <Link
              href="/dashboard?view=student"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
            >
              <BookOpen size={14} className="text-stone-500" />
              Mode Pratinjau Siswa
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-stone-800">
          <SignOutButton variant="admin" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
