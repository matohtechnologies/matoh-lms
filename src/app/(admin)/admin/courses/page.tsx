import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Eye, Search, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { DeleteCourseButton } from "./delete-course-button";

export const metadata: Metadata = { title: "Manajemen Kelas — Admin" };

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  const t = await getTranslations("admin");

  const courses = await prisma.course.findMany({
    include: {
      category: { select: { name: true } },
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
            {t("courses_title")}
          </h1>
          <p className="text-stone-500 text-sm mt-1">{t("courses_count", { count: courses.length })}</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {t("add_class")}
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <Search size={16} className="text-stone-400" />
          <input
            placeholder={t("search_courses")}
            className="flex-1 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
          />
        </div>

        {courses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-stone-400 text-sm">{t("no_courses")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_course")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_category")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_level")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_price")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_learners")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_status")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{t("col_action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-stone-900 max-w-[250px] truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{course.instructor.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-stone-600">{course.category.name}</td>
                    <td className="px-5 py-4">
                      <LevelBadge level={course.level} />
                    </td>
                    <td className="px-5 py-4 text-sm text-stone-900 font-medium">
                      {course.price === 0 ? t("free") : formatCurrency(course.price)}
                    </td>
                    <td className="px-5 py-4 text-sm text-stone-600">
                      {course._count.enrollments.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={course.published ? "success" : "default"}>
                        {course.published ? "Publish" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/courses/${course.id}?tab=curriculum`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold transition-colors"
                          title="Kelola Materi & Kurikulum"
                        >
                          <BookOpen size={13} />
                          <span className="hidden sm:inline">{t("btn_content")}</span>
                        </Link>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                          title="Lihat Halaman Publik"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}?tab=settings`}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                          title="Edit Pengaturan Kelas"
                        >
                          <Edit size={15} />
                        </Link>
                        <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
