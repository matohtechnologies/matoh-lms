import Link from "next/link";
import { ArrowRight, Star, Users, BookOpen, Award, CheckCircle, Play, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";

export const revalidate = 60;

async function getFeaturedCourses() {
  try {
    const featured = await prisma.course.findMany({
      where: { published: true, featured: true },
      include: {
        instructor: { select: { name: true, image: true } },
        category: { select: { name: true } },
      },
      orderBy: { enrollCount: "desc" },
      take: 8,
    });
    if (featured.length > 0) return featured;

    return await prisma.course.findMany({
      where: { published: true },
      include: {
        instructor: { select: { name: true, image: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [students, courses, instructors] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.course.count({ where: { published: true } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    ]);
    return { students, courses, instructors };
  } catch {
    return { students: 0, courses: 0, instructors: 0 };
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("hero");
  const tc = await getTranslations("courses");
  const tHome = await getTranslations("home");

  const [featuredCourses, stats, session] = await Promise.all([
    getFeaturedCourses(),
    getStats(),
    auth(),
  ]);

  const enrolledCourseIds = new Set<string>();
  if (session?.user?.id) {
    if (session.user.role === "ADMIN") {
      featuredCourses.forEach((c) => enrolledCourseIds.add(c.id));
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      });
      enrollments.forEach((e) => enrolledCourseIds.add(e.courseId));
    }
  }

  const statItems = [
    { value: stats.students.toLocaleString() + "+", label: t("stat_students"), icon: Users },
    { value: stats.courses + "+", label: t("stat_courses"), icon: BookOpen },
    { value: stats.instructors + "+", label: t("stat_instructors"), icon: Award },
    { value: "4.9", label: t("stat_rating"), icon: Star },
  ];

  const features = [
    { icon: "🎯", title: tHome("features.curriculum_title"), desc: tHome("features.curriculum_desc") },
    { icon: "⚡", title: tHome("features.flexible_title"), desc: tHome("features.flexible_desc") },
    { icon: "🏆", title: tHome("features.certificate_title"), desc: tHome("features.certificate_desc") },
    { icon: "💬", title: tHome("features.community_title"), desc: tHome("features.community_desc") },
  ];

  const categories = [
    { name: isEn ? "Web Development" : "Web Development", icon: "💻", count: 42 },
    { name: isEn ? "Data Science" : "Data Science", icon: "📊", count: 28 },
    { name: isEn ? "UI/UX Design" : "UI/UX Design", icon: "🎨", count: 19 },
    { name: isEn ? "Mobile Dev" : "Mobile Dev", icon: "📱", count: 23 },
    { name: isEn ? "Cybersecurity" : "Cybersecurity", icon: "🔐", count: 15 },
    { name: isEn ? "Digital Marketing" : "Digital Marketing", icon: "📣", count: 31 },
    { name: isEn ? "Cloud Computing" : "Cloud Computing", icon: "☁️", count: 18 },
    { name: isEn ? "Business & Startup" : "Bisnis & Startup", icon: "🚀", count: 24 },
  ];

  const testimonials = isEn
    ? [
        {
          name: "Rizky Pratama",
          role: "Frontend Developer at Tokopedia",
          avatar: "R",
          text: "Earthy Academy truly transformed my career. Within 6 months, I successfully transitioned from my old job into the tech industry.",
          rating: 5,
          course: "React.js Modern Development",
        },
        {
          name: "Sari Dewi",
          role: "UI/UX Designer at Gojek",
          avatar: "S",
          text: "Well-structured curriculum and supportive mentors. I started from zero and am now working as a professional product designer.",
          rating: 5,
          course: "UI/UX Design Masterclass",
        },
        {
          name: "Budi Santoso",
          role: "Data Analyst at BCA",
          avatar: "B",
          text: "The best investment I have ever made. Worth every penny! Up-to-date content that directly aligns with modern tech requirements.",
          rating: 5,
          course: "Python for Data Science",
        },
      ]
    : [
        {
          name: "Rizky Pratama",
          role: "Frontend Developer at Tokopedia",
          avatar: "R",
          text: "Earthy Academy benar-benar mengubah karir saya. Dalam 6 bulan, saya berhasil pindah dari pekerjaan lama ke tech industry.",
          rating: 5,
          course: "React.js Modern Development",
        },
        {
          name: "Sari Dewi",
          role: "UI/UX Designer at Gojek",
          avatar: "S",
          text: "Materi yang sangat terstruktur dan instruktur yang sabar. Saya belajar dari nol dan sekarang sudah bekerja sebagai designer profesional.",
          rating: 5,
          course: "UI/UX Design Masterclass",
        },
        {
          name: "Budi Santoso",
          role: "Data Analyst at BCA",
          avatar: "B",
          text: "Investasi terbaik yang pernah saya lakukan. Worth every rupiah! Materi up-to-date dan relevan dengan kebutuhan industri.",
          rating: 5,
          course: "Python for Data Science",
        },
      ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden gradient-hero">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-orange-100 opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-64 h-64 rounded-full bg-amber-100 opacity-60 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left content */}
            <div className="space-y-7 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                {t("badge")}
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.1] text-balance" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                {t("title").split("\n").map((line, i) => (
                  <span key={i}>
                    {i === 1 ? (
                      <span className="text-gradient">{line}</span>
                    ) : (
                      line
                    )}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>

              <p className="text-lg text-stone-600 leading-relaxed max-w-lg">
                {t("subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link href="/courses">
                  <Button size="lg" rightIcon={<ArrowRight size={18} />}>
                    {t("cta_primary")}
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" leftIcon={<Play size={18} />}>
                    {t("cta_secondary")}
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {["R", "S", "B", "A", "D"].map((letter, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: `hsl(${i * 30 + 20}, 70%, 55%)`,
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-sm font-semibold text-stone-700 ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {isEn ? "from 10,000+ reviews" : "dari 10.000+ ulasan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Stats cards */}
            <div className="relative hidden lg:grid grid-cols-2 gap-4">
              {statItems.map(({ value, label, icon: Icon }, i) => (
                <div
                  key={label}
                  className={`bg-white rounded-2xl p-6 shadow-warm border border-stone-200 ${i === 1 ? "translate-y-4" : ""} ${i === 3 ? "-translate-y-4" : ""}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                    <Icon size={22} className="text-orange-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                    {value}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">{label}</p>
                </div>
              ))}

              {/* Floating achievement */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-warm-lg border border-stone-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">{t("floating_badge_label")}</p>
                  <p className="font-bold text-stone-900">{t("floating_badge_count")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — mobile only */}
      <section className="lg:hidden bg-white border-y border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {statItems.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-extrabold text-stone-900">{value}</p>
              <p className="text-xs text-stone-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
              {tHome("categories_title")}
            </h2>
            <p className="text-stone-500">{tHome("categories_subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-200 transition-all duration-200 text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-stone-700 group-hover:text-orange-700 leading-tight">
                  {cat.name}
                </span>
                <span className="text-[11px] text-stone-400">{cat.count} {tHome("courses_unit")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                {tc("title")}
              </h2>
              <p className="text-stone-500">{tc("subtitle")}</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
                {tc("view_all")}
              </Button>
            </Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredCourses.map((course) => (
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
                  instructor={course.instructor}
                  category={course.category}
                  locale={locale}
                  isEnrolled={enrolledCourseIds.has(course.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-stone-500 text-sm">{tHome("empty_courses")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Features / Why Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
              {tHome("features_title")}
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              {tHome("features_subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-stone-900 mb-2 group-hover:text-orange-800">
                  {feature.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
              {tHome("testimonials_title")}
            </h2>
            <p className="text-stone-500">{tHome("testimonials_subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-warm hover:shadow-warm-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-stone-600 leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs text-stone-400 mb-3">
                    {isEn ? "Course taken:" : "Kelas yang diambil:"}{" "}
                    <span className="text-orange-600">{t.course}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                      <p className="text-xs text-stone-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-600 to-amber-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white opacity-5 translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
            {tHome("cta_title")}
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            {tHome("cta_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
                rightIcon={<ArrowRight size={18} />}
              >
                {tHome("cta_btn_primary")}
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                {tHome("cta_btn_secondary")}
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-orange-100">
            {(isEn
              ? ["No credit card required", "Full lifetime access", "30-day money-back guarantee"]
              : ["Tanpa kartu kredit", "Akses seumur hidup", "Garansi uang kembali 30 hari"]
            ).map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle size={16} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
