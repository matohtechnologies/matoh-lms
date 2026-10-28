import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { resolveThumbnailUrl } from "@/lib/youtube";
import { CourseHeroMedia } from "@/components/courses/course-hero-media";
import { CourseCompetencyBadges } from "@/components/courses/course-competency-badges";
import { CourseCurriculumList } from "@/components/courses/course-curriculum-list";
import { MobileStickyBar } from "@/components/courses/mobile-sticky-bar";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

export const revalidate = 60;

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getCourse = cache(async (slug: string) => {
  try {
    return await prisma.course.findUnique({
      where: { slug, published: true },
      include: {
        instructor: { select: { id: true, name: true, image: true, headline: true, bio: true } },
        category: true,
        sections: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Kelas tidak ditemukan" };
  return {
    title: course.title,
    description: course.description.slice(0, 160),
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";
  const tDetail = await getTranslations("course_detail");
  const [course, session] = await Promise.all([
    getCourse(slug),
    auth(),
  ]);

  if (!course) notFound();
  const displayCourse = course;

  // Check if user is enrolled
  let isEnrolled = false;
  if (session?.user?.id && course) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment || session.user.role === "ADMIN";
  }

  const isFree = displayCourse.price === 0;
  const finalPrice = displayCourse.discountPrice ?? displayCourse.price;

  let customWhatYouLearn: string[] | null = null;
  if (displayCourse.whatYouLearn) {
    try {
      const parsed = JSON.parse(displayCourse.whatYouLearn);
      if (Array.isArray(parsed) && parsed.length > 0) {
        customWhatYouLearn = parsed.filter(
          (item) => typeof item === "string" && item.trim().length > 0
        );
      }
    } catch {
      const lines = displayCourse.whatYouLearn
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length > 0) customWhatYouLearn = lines;
    }
  }

  const whatYouLearn =
    customWhatYouLearn && customWhatYouLearn.length > 0
      ? customWhatYouLearn
      : isEn
      ? [
          "Master foundational concepts and comprehensive principles",
          "Implement real-world practical projects from scratch to production",
          "Adopt professional best practices used by leading tech companies",
          "Build an impressive portfolio to showcase to recruiters",
          "Earn an industry-recognized certificate of completion",
          "Join an active community of learners and experienced mentors",
        ]
      : [
          "Memahami konsep dasar dan fundamental materi",
          "Mengimplementasikan project nyata dari awal sampai production",
          "Menguasai best practices yang digunakan industri",
          "Membangun portfolio project yang impressive",
          "Mendapatkan sertifikat yang diakui perusahaan",
          "Bergabung dengan komunitas pelajar aktif",
        ];

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: displayCourse.title,
    description: displayCourse.description,
    provider: {
      "@type": "Organization",
      name: "PT. Matoh Technologies Indonesia",
      sameAs: "https://www.matohtechnologies.com",
    },
    instructor: {
      "@type": "Person",
      name: displayCourse.instructor?.name || "Dewan Instruktur Matoh Technologies",
    },
    offers: {
      "@type": "Offer",
      category: isFree ? "Free" : "Paid",
      price: finalPrice,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `PT${displayCourse.duration || 60}M`,
    },
    ...(displayCourse.rating && displayCourse.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: displayCourse.rating.toFixed(1),
            reviewCount: Math.max(1, displayCourse.reviewCount || 1),
          },
        }
      : {}),
  };

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen pb-16 relative">
      {/* Ambient subtle top glow (matching landing, about & contact) */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/70 via-sky-50/20 to-transparent pointer-events-none" />
      {/* Schema.org Course JSON-LD for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link href="/courses" className="hover:text-blue-600 transition-colors">
                {tDetail("breadcrumb_courses")}
              </Link>
              <span>/</span>
              <span className="text-slate-700 truncate">{displayCourse.category.name}</span>
            </div>

            {/* Course header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="info">{displayCourse.category.name}</Badge>
                <LevelBadge level={displayCourse.level} locale={locale} />
                {isEnrolled && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {tDetail("already_enrolled")}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {displayCourse.title}
              </h1>
              <p className="text-slate-600 leading-relaxed mb-5">{displayCourse.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                {displayCourse.rating != null && displayCourse.rating > 0 && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={displayCourse.rating} size={15} />
                      <span className="font-semibold text-amber-600">{displayCourse.rating.toFixed(1)}</span>
                      <span className="text-slate-400">({displayCourse.reviewCount} {isEn ? "reviews" : "ulasan"})</span>
                    </div>
                    <span className="text-slate-300">•</span>
                  </>
                )}
                <span>
                  {(displayCourse.enrollCount ?? 0).toLocaleString()} {isEn ? "students" : "pelajar"}
                </span>
                {displayCourse.duration && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{formatDuration(displayCourse.duration)}</span>
                  </>
                )}
                {displayCourse.totalLessons && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{displayCourse.totalLessons} {isEn ? "lessons" : "materi"}</span>
                  </>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mt-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
                  {displayCourse.instructor.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-slate-500">{tDetail("instructor")}</p>
                  <p className="text-sm font-semibold text-blue-600">{displayCourse.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* Mobile price card */}
            <div className="lg:hidden bg-white rounded-2xl p-5 shadow-sm">
              <PriceCard
                course={displayCourse}
                isFree={isFree}
                finalPrice={finalPrice}
                isEnrolled={isEnrolled}
                userId={session?.user?.id}
                locale={locale}
              />
            </div>

            {/* Competency & Career Outcomes Bar */}
            <CourseCompetencyBadges
              categoryName={displayCourse.category.name}
              courseTitle={displayCourse.title}
              whatYouLearn={whatYouLearn}
              locale={locale}
            />

            {/* Playable Course Hero Media */}
            <CourseHeroMedia
              title={displayCourse.title}
              thumbnail={displayCourse.thumbnail}
              fallbackLessonVideoUrl={
                displayCourse.sections
                  ?.flatMap((s) => s.lessons)
                  ?.find((l) => l.videoUrl)?.videoUrl
              }
            />

            {/* What You'll Learn */}
            <div className="bg-blue-50/70 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {tDetail("what_learn")}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                  {tDetail("curriculum")}
                </h2>
                {displayCourse.sections && displayCourse.sections.length > 0 && (
                  <span className="text-xs text-slate-500 font-medium">
                    {displayCourse.sections.length} {isEn ? "sections" : "bagian"} • {displayCourse.totalLessons ?? 0} {isEn ? "lessons" : "materi"}
                  </span>
                )}
              </div>
              {displayCourse.sections && displayCourse.sections.length > 0 ? (
                <CourseCurriculumList
                  sections={displayCourse.sections}
                  courseId={displayCourse.id}
                  isEnrolled={isEnrolled}
                  isEn={isEn}
                  finalPrice={finalPrice}
                  isFreeCourse={isFree}
                  userId={session?.user?.id}
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-sm shadow-2xs">
                  {isEn ? "Course curriculum is being prepared by the instructor." : "Kurikulum kelas sedang dipersiapkan oleh instruktur."}
                </div>
              )}
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {isEn ? "About the Instructor" : "Tentang Instruktur"}
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden ring-1 ring-slate-200/80">
                  {displayCourse.instructor.image ? (
                    <img
                      src={displayCourse.instructor.image}
                      alt={displayCourse.instructor.name || "Instructor"}
                      width={64}
                      height={64}
                      style={{ aspectRatio: "1 / 1" }}
                      className="w-full h-full object-cover aspect-square"
                    />
                  ) : (
                    <span>{displayCourse.instructor.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{displayCourse.instructor.name}</h3>
                  <p className="text-sm font-semibold text-blue-600 mb-2">
                    {displayCourse.instructorHeadline ||
                      displayCourse.instructor.headline ||
                      (isEn ? "Lead Instructor" : "Dewan Instruktur")}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {displayCourse.instructorBio ||
                      displayCourse.instructor.bio ||
                      (isEn
                        ? "Experienced industry practitioner and educator with deep domain expertise and real-world implementation track record."
                        : "Praktisi dan akademisi berpengalaman dengan rekam jejak riset, konsultasi industri, dan pembimbingan intensif.")}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {displayCourse.reviews && displayCourse.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                  {tDetail("reviews")}
                </h2>
                <div className="space-y-4">
                  {displayCourse.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl shadow-2xs p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {review.user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">{review.user.name}</span>
                            <StarRating rating={review.rating} size={13} />
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Price Card */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <PriceCard
                  course={displayCourse}
                  isFree={isFree}
                  finalPrice={finalPrice}
                  isEnrolled={isEnrolled}
                  userId={session?.user?.id}
                  locale={locale}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Bottom Purchase Bar */}
      <MobileStickyBar
        courseId={displayCourse.id}
        courseTitle={displayCourse.title}
        price={displayCourse.price}
        discountPrice={displayCourse.discountPrice}
        isFree={isFree}
        isEnrolled={isEnrolled}
        userId={session?.user?.id}
        locale={locale}
      />
    </div>
  );
}

function PriceCard({
  course,
  isFree,
  finalPrice,
  isEnrolled,
  userId,
  locale = "id",
}: {
  course: { id: string; price: number; discountPrice?: number | null; title: string };
  isFree: boolean;
  finalPrice: number;
  isEnrolled: boolean;
  userId?: string;
  locale?: string;
}) {
  const isEn = locale === "en";
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price;

  return (
    <div className="space-y-4">
      {/* Price / Enrolled Status */}
      <div>
        {isEnrolled ? (
          <div className="p-3.5 bg-emerald-50 rounded-xl space-y-1">
            <div className="text-emerald-800 font-bold text-sm">
              {isEn ? "You Already Own This Course" : "Kelas Sudah Anda Miliki"}
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {isEn
                ? "You are already enrolled and have full lifetime access to this course."
                : "Anda sudah terdaftar dan memiliki akses penuh seumur hidup ke materi kelas ini."}
            </p>
          </div>
        ) : isFree ? (
          <p className="text-3xl font-bold text-green-600">{isEn ? "Free" : "Gratis"}</p>
        ) : (
          <div>
            <p className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(finalPrice, locale)}
            </p>
            {hasDiscount && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 line-through text-sm">
                  {formatCurrency(course.price, locale)}
                </span>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {isEn ? "Save" : "Hemat"} {Math.round(((course.price - finalPrice) / course.price) * 100)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA Button */}
      {isEnrolled ? (
        <Link href={`/learn/${course.id}`} className="block w-full">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            size="lg"
          >
            <Play size={16} />
            {isEn ? "Continue Learning (Enter Course)" : "Lanjutkan Belajar (Masuk Kelas)"}
          </Button>
        </Link>
      ) : (
        <Link
          href={userId ? `/checkout/${course.id}` : `/login?callbackUrl=/checkout/${course.id}`}
          className="block w-full"
        >
          <Button className="w-full" size="lg">
            {isFree ? (isEn ? "Enroll for Free" : "Daftar Gratis") : (isEn ? "Buy Now" : "Beli Sekarang")}
          </Button>
        </Link>
      )}

      {/* Includes */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-700">{isEn ? "This course includes:" : "Termasuk:"}</p>
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{isEn ? "Lifetime access" : "Akses seumur hidup"}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{`${(course as { totalLessons?: number | null }).totalLessons ?? 50}+ ${isEn ? "video lessons" : "materi video"}`}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{isEn ? "Certificate of completion" : "Sertifikat kelulusan"}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{isEn ? "30-day money-back guarantee" : "Garansi uang kembali 30 hari"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}


