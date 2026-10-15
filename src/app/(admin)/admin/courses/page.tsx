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
export const dynamic = "force-dynamic";

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("courses_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">{t("courses_count", { count: courses.length })}</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus size={15} />
          {t("add_class")}
        </Link>
      </div>

      {/* Courses Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200/60 flex-1 max-w-md">
            <Search size={15} className="text-stone-400 shrink-0" />
            <input
              placeholder={t("search_courses")}
              className="flex-1 text-xs bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200/60">
              Total: {courses.length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
              Publish: {courses.filter((c) => c.published).length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 font-semibold border border-stone-200/60">
              Draft: {courses.filter((c) => !c.published).length}
            </span>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={22} />
            </div>
            <p className="text-stone-700 font-bold text-sm mb-1">{t("no_courses")}</p>
            <p className="text-stone-400 text-xs">Klik tombol di atas untuk membuat kelas pertama Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">{t("col_course")}</th>
                  <th className="px-5 py-3.5">{t("col_category")}</th>
                  <th className="px-5 py-3.5">{t("col_level")}</th>
                  <th className="px-5 py-3.5">{t("col_price")}</th>
                  <th className="px-5 py-3.5">{t("col_learners")}</th>
                  <th className="px-5 py-3.5">{t("col_status")}</th>
                  <th className="px-5 py-3.5 text-right">{t("col_action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <div className="w-12 h-8 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/80 shrink-0 relative">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
                            <BookOpen size={16} />
                          </div>
                        )}
                        <div className="min-w-0 max-w-[260px]">
                          <p className="font-bold text-stone-900 truncate">{course.title}</p>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">
                            Oleh: {course.instructor.name || "Instruktur"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-600 font-medium">
                      <span className="bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                        {course.category.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <LevelBadge level={course.level} />
                    </td>
                    <td className="px-5 py-4 font-bold text-stone-900">
                      {course.price === 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                          {t("free")}
                        </span>
                      ) : (
                        formatCurrency(course.price)
                      )}
                    </td>
                    <td className="px-5 py-4 text-stone-600 font-semibold">
                      {course._count.enrollments.toLocaleString()} siswa
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={course.published ? "success" : "default"}>
                        {course.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/courses/${course.id}?tab=curriculum`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors border border-blue-200/60 text-[11px]"
                          title="Kelola Materi Kurikulum"
                        >
                          <BookOpen size={13} />
                          <span>Kurikulum</span>
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}?tab=certificates`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold transition-colors border border-sky-200/60 text-[11px]"
                          title="Studio Sertifikat"
                        >
                          <span>Sertifikat</span>
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}?tab=settings`}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors border border-stone-200/60"
                          title="Edit Pengaturan Kelas"
                        >
                          <Edit size={14} />
                        </Link>
                        <Link
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors border border-stone-200/60"
                          title="Lihat Halaman Publik"
                        >
                          <Eye size={14} />
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
