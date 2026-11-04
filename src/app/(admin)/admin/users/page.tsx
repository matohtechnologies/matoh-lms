import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { AddInstructorModal } from "./add-instructor-modal";
import { UsersTable, type UserRowData } from "./users-table";

export const metadata: Metadata = { title: "Manajemen Pengguna — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");
  const currentUserId = session.user.id;

  const t = await getTranslations("admin");
  const locale = await getLocale();

  let formattedUsers: UserRowData[] = [];

  try {
    const dbUsers = await prisma.user.findMany({
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    formattedUsers = dbUsers.map((u) => ({
      id: u.id,
      name: u.name ?? "Pengguna",
      email: u.email ?? "-",
      role: u.role,
      headline: u.headline ?? null,
      createdAtFormatted: u.createdAt.toLocaleDateString(
        locale === "en" ? "en-US" : "id-ID",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ),
      enrolledCount: u._count.enrollments,
      status: "ACTIVE",
    }));
  } catch {
    formattedUsers = [];
  }

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("users_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {t("users_subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-stone-100 text-stone-700 border border-stone-200/80 px-3 py-1.5 rounded-xl font-bold shadow-2xs">
            {t("total_registered", { count: formattedUsers.length })}
          </span>

          <AddInstructorModal />
        </div>
      </div>

      {/* Users Table with Live Search and Role Filters */}
      <UsersTable
        initialUsers={formattedUsers}
        currentUserId={currentUserId}
      />
    </div>
  );
}
