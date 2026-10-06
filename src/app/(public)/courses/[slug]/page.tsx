import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, Clock, BookOpen, Award, Play, CheckCircle, ChevronDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { resolveThumbnailUrl } from "@/lib/youtube";
import { CourseHeroMedia } from "@/components/courses/course-hero-media";
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
    <div className="pt-20 bg-[#faf8f5] min-h-screen pb-16">
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
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Link href="/courses" className="hover:text-blue-600 transition-colors">
                {tDetail("breadcrumb_courses")}
              </Link>
              <span>/</span>
              <span className="text-stone-700 truncate">{displayCourse.category.name}</span>
            </div>

            {/* Course header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="info">{displayCourse.category.name}</Badge>
                <LevelBadge level={displayCourse.level} locale={locale} />
                {isEnrolled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                    <CheckCircle size={13} className="text-emerald-600" />
                    {tDetail("already_enrolled")}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {displayCourse.title}
              </h1>
              <p className="text-stone-600 leading-relaxed mb-5">{displayCourse.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600">
                {displayCourse.rating != null && displayCourse.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={displayCourse.rating} size={15} />
                    <span className="font-semibold text-amber-600">{displayCourse.rating.toFixed(1)}</span>
                    <span className="text-stone-400">({displayCourse.reviewCount} {isEn ? "reviews" : "ulasan"})</span>
                  </div>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-stone-400" />
                  {(displayCourse.enrollCount ?? 0).toLocaleString()} {isEn ? "students" : "pelajar"}
                </span>
                {displayCourse.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} className="text-stone-400" />
                    {formatDuration(displayCourse.duration)}
                  </span>
                )}
                {displayCourse.totalLessons && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={15} className="text-stone-400" />
                    {displayCourse.totalLessons} {isEn ? "lessons" : "materi"}
                  </span>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mt-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm">
                  {displayCourse.instructor.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-stone-500">{tDetail("instructor")}</p>
                  <p className="text-sm font-semibold text-blue-600">{displayCourse.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* Mobile price card */}
            <div className="lg:hidden bg-white rounded-2xl border border-stone-200 p-5 shadow-warm">
              <PriceCard
                course={displayCourse}
                isFree={isFree}
                finalPrice={finalPrice}
                isEnrolled={isEnrolled}
                userId={session?.user?.id}
                locale={locale}
              />
            </div>

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
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {tDetail("what_learn")}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-stone-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {tDetail("curriculum")}
              </h2>
              {displayCourse.sections && displayCourse.sections.length > 0 ? (
                <div className="space-y-3">
                  {displayCourse.sections.map((section, idx) => (
                    <details key={section.id} className="group rounded-xl border border-stone-200 overflow-hidden" open={idx === 0}>
                      <summary className="flex items-center justify-between p-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors list-none">
                        <div>
                          <span className="font-semibold text-stone-900 text-sm">{section.title}</span>
                          <span className="ml-2 text-xs text-stone-500">
                            {section.lessons.length} {isEn ? "lessons" : "materi"}
                          </span>
                        </div>
                        <ChevronDown size={16} className="text-stone-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="divide-y divide-stone-100">
                        {section.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${lesson.isFree ? "bg-green-50" : "bg-stone-100"}`}>
                              {lesson.isFree ? (
                                <Play size={12} className="text-green-600 ml-0.5" />
                              ) : (
                                <Lock size={12} className="text-stone-400" />
                              )}
                            </div>
                            <span className="text-sm text-stone-700 flex-1">{lesson.title}</span>
                            {lesson.isFree && (
                              <span className="text-xs text-green-600 font-medium">
                                {tDetail("preview_lesson")}
                              </span>
                            )}
                            {lesson.duration && (
                              <span className="text-xs text-stone-400">{lesson.duration}m</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-sm">
                  {isEn ? "Course curriculum is being prepared by the instructor." : "Kurikulum kelas sedang dipersiapkan oleh instruktur."}
                </div>
              )}
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                {isEn ? "About the Instructor" : "Tentang Instruktur"}
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden ring-1 ring-stone-200/80">
                  {displayCourse.instructor.image ? (
                    <img
                      src={displayCourse.instructor.image}
                      alt={displayCourse.instructor.name || "Instructor"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayCourse.instructor.name?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{displayCourse.instructor.name}</h3>
                  <p className="text-sm font-semibold text-blue-600 mb-2">
                    {displayCourse.instructorHeadline ||
                      displayCourse.instructor.headline ||
                      (isEn ? "Lead Instructor" : "Dewan Instruktur")}
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
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
                <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: "var(--font-poppins, sans-serif)" }}>
                  {tDetail("reviews")}
                </h2>
                <div className="space-y-4">
                  {displayCourse.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-stone-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {review.user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-stone-900">{review.user.name}</span>
                            <StarRating rating={review.rating} size={13} />
                          </div>
                          {review.comment && (
                            <p className="text-sm text-stone-600 mt-1 leading-relaxed">{review.comment}</p>
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
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-warm-lg">
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
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span>{isEn ? "You Already Own This Course" : "Kelas Sudah Anda Miliki"}</span>
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
            <p className="text-3xl font-extrabold text-stone-900">
              {formatCurrency(finalPrice, locale)}
            </p>
            {hasDiscount && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-stone-400 line-through text-sm">
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
      <div className="space-y-2.5 pt-2 border-t border-stone-100">
        <p className="text-sm font-semibold text-stone-700">{isEn ? "This course includes:" : "Termasuk:"}</p>
        {[
          { icon: Clock, text: isEn ? "Lifetime access" : "Akses seumur hidup" },
          { icon: BookOpen, text: `${(course as { totalLessons?: number | null }).totalLessons ?? 50}+ ${isEn ? "video lessons" : "materi video"}` },
          { icon: Award, text: isEn ? "Certificate of completion" : "Sertifikat kelulusan" },
          { icon: CheckCircle, text: isEn ? "30-day money-back guarantee" : "Garansi uang kembali 30 hari" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-stone-600">
            <Icon size={15} className="text-blue-500 shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}


