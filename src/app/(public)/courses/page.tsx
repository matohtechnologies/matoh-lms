import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/course-card";
import { CourseCertificateVerifier } from "@/components/courses/course-certificate-verifier";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semua Kelas",
  description: "Jelajahi ratusan kelas online berkualitas tinggi dari instruktur berpengalaman",
};

export const revalidate = 60;

interface CoursesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function getCourses(page = 1) {
  try {
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { published: true };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { name: true, image: true } },
          category: { select: { name: true } },
        },
        orderBy: [{ enrollCount: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total, pages: Math.ceil(total / pageSize) };
  } catch {
    return { courses: [], total: 0, pages: 1 };
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("courses");
  const currentPage = params.page ? parseInt(params.page) : 1;

  const [session, { courses, total, pages }] = await Promise.all([
    auth(),
    getCourses(currentPage),
  ]);

  const enrolledCourseIds = new Set<string>();
  if (session?.user?.id) {
    if (session.user.role === "ADMIN") {
      courses.forEach((c) => enrolledCourseIds.add(c.id));
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      });
      enrollments.forEach((e) => enrolledCourseIds.add(e.courseId));
    }
  }

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc] border-b border-slate-200/70 py-12 sm:py-16 bg-dot-matrix relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("catalog_title")}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? `Explore ${total} curated, industry-aligned courses crafted by leading tech practitioners.`
              : `${total} kelas terstruktur dan kurikulum industri siap membantumu menguasai skill masa depan.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Course Catalog Section: Clean Minimal View */}
        <section id="daftar-kelas">
          {/* Header Bar: Total Courses Count */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {isEn ? (
                <>
                  Showing <span className="font-bold text-slate-900">{courses.length}</span> of <span className="font-bold text-slate-900">{total}</span> courses
                </>
              ) : (
                <>
                  Menampilkan <span className="font-bold text-slate-900">{courses.length}</span> dari <span className="font-bold text-slate-900">{total}</span> kelas
                </>
              )}
            </p>
          </div>

          {/* Course grid: 4 columns on large screens for optimal visual space */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    slug={course.slug}
                    title={course.title}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    discountPrice={course.discountPrice}
                    level={course.level}
                    rating={course.rating}
                    reviewCount={course.reviewCount}
                    enrollCount={course.enrollCount}
                    totalLessons={course.totalLessons}
                    duration={course.duration}
                    instructor={(course as { instructor: { name?: string | null; image?: string | null } }).instructor}
                    category={course.category}
                    locale={locale}
                    isEnrolled={enrolledCourseIds.has(course.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto my-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {isEn ? "No courses available" : "Belum ada kelas yang tersedia"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                    {t("not_found_desc")}
                  </p>
                </div>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <a
                  key={page}
                  href={`/courses?page=${page}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:border-blue-400"
                    }`}
                >
                  {page}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Certificate Verification Section: Diletakkan SETELAH tampilan course */}
        <div className="mt-20 pt-16 border-t border-slate-200">
          <CourseCertificateVerifier isEn={isEn} />
        </div>
      </div>
    </div>
  );
}
