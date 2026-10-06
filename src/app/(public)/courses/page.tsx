import { Suspense } from "react";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/course-card";
import { CourseSortSelect } from "@/components/courses/course-sort-select";
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
    q?: string;
    category?: string;
    level?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getCourses(params: {
  q?: string;
  category?: string;
  level?: string;
  sort?: string;
  page?: number;
}) {
  try {
    const { q, category, level, sort = "popular", page = 1 } = params;
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { published: true };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { name: { contains: category, mode: "insensitive" } };
    }

    if (level && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level)) {
      where.level = level;
    }

    const orderBy: Record<string, string>[] = [];
    if (sort === "popular") orderBy.push({ enrollCount: "desc" });
    else if (sort === "newest") orderBy.push({ createdAt: "desc" });
    else if (sort === "rating") orderBy.push({ rating: "desc" });
    else if (sort === "price-asc") orderBy.push({ price: "asc" });
    else if (sort === "price-desc") orderBy.push({ price: "desc" });

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { name: true, image: true } },
          category: { select: { name: true } },
        },
        orderBy,
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

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("courses");
  const [session, { courses, total, pages }, categories] = await Promise.all([
    auth(),
    getCourses({
      q: params.q,
      category: params.category,
      level: params.level,
      sort: params.sort,
      page: params.page ? parseInt(params.page) : 1,
    }),
    getCategories(),
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

  const currentPage = params.page ? parseInt(params.page) : 1;

  const levelOptions = [
    { value: "BEGINNER", label: t("level.BEGINNER") },
    { value: "INTERMEDIATE", label: t("level.INTERMEDIATE") },
    { value: "ADVANCED", label: t("level.ADVANCED") },
  ];

  const sortOptions = [
    { value: "popular", label: t("sort.popular") },
    { value: "newest", label: t("sort.newest") },
    { value: "rating", label: t("sort.rating") },
    { value: "price-asc", label: t("sort.price_asc") },
    { value: "price-desc", label: t("sort.price_desc") },
  ];

  return (
    <div className="pt-20 bg-[#faf8f5] min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50/70 via-[#faf8f5] to-[#faf8f5] border-b border-stone-200/70 py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 border border-blue-200/60 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{isEn ? "Matoh Learning Catalog" : "Katalog Pelatihan Matoh"}</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 mb-3 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("catalog_title")}
          </h1>
          <p className="text-stone-500 mb-6 text-sm sm:text-base max-w-2xl leading-relaxed">
            {isEn
              ? `Explore ${total} curated, industry-aligned courses crafted by leading tech practitioners.`
              : `${total} kelas terstruktur dan kurikulum industri siap membantumu menguasai skill masa depan.`}
          </p>

          {/* Search bar */}
          <form method="GET" action="/courses" className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder={t("search_placeholder")}
                className="w-full h-12 pl-10 pr-4 rounded-2xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-warm hover:shadow-warm-lg transition-all shrink-0"
            >
              {isEn ? "Search" : "Cari Kelas"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0 w-full">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs sticky top-24 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {t("filter.category")}
                  </h3>
                  {params.category && (
                    <a href="/courses" className="text-[11px] text-blue-600 hover:underline">
                      Reset
                    </a>
                  )}
                </div>
                <div className="space-y-1">
                  <a
                    href="/courses"
                    className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      !params.category
                        ? "bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                    }`}
                  >
                    {isEn ? "All Categories" : "Semua Kategori"}
                  </a>
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/courses?category=${encodeURIComponent(cat.name)}${params.level ? `&level=${params.level}` : ""}${params.sort ? `&sort=${params.sort}` : ""}`}
                      className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        params.category === cat.name
                          ? "bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs"
                          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {t("filter.level")}
                  </h3>
                </div>
                <div className="space-y-1">
                  {levelOptions.map((opt) => (
                    <a
                      key={opt.value}
                      href={`/courses?${params.q ? `q=${params.q}&` : ""}${params.category ? `category=${params.category}&` : ""}level=${opt.value}${params.sort ? `&sort=${params.sort}` : ""}`}
                      className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        params.level === opt.value
                          ? "bg-blue-50/90 text-blue-950 font-bold border border-blue-200/80 shadow-2xs"
                          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                      }`}
                    >
                      {opt.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-stone-500">
                {isEn ? (
                  <>
                    Showing <span className="font-medium text-stone-900">{courses.length}</span> of <span className="font-medium text-stone-900">{total}</span> courses
                  </>
                ) : (
                  <>
                    Menampilkan <span className="font-medium text-stone-900">{courses.length}</span> dari <span className="font-medium text-stone-900">{total}</span> kelas
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-stone-500 hidden sm:block">{t("sort_label")}</label>
                <CourseSortSelect defaultValue={params.sort ?? "popular"} options={sortOptions} />
              </div>
            </div>

            {/* Course grid */}
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array(6).fill(0).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{t("not_found_title")}</h3>
                  <p className="text-stone-500">{t("not_found_desc")}</p>
                  <a href="/courses" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
                    {t("reset_filter")}
                  </a>
                </div>
              )}
            </Suspense>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={`/courses?${new URLSearchParams({ ...params, page: String(page) }).toString()}`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-stone-300 text-stone-700 hover:border-blue-400"
                    }`}
                  >
                    {page}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
