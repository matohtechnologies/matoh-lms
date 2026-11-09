import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  Network,
  MessageSquare,
  Star,
  Globe,
  Code2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLocale } from "next-intl/server";
import { CourseCard } from "@/components/courses/course-card";

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
      take: 4,
    });
    if (featured.length > 0) return featured;

    return await prisma.course.findMany({
      where: { published: true },
      include: {
        instructor: { select: { name: true, image: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [students, courses, instructors, reviewsAgg] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.course.count({ where: { published: true } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);
    return {
      students,
      courses,
      instructors,
      reviewAvg: reviewsAgg._avg.rating || 0,
      reviewCount: reviewsAgg._count.id || 0,
    };
  } catch {
    return { students: 0, courses: 0, instructors: 0, reviewAvg: 0, reviewCount: 0 };
  }
}

function ColorfulLightbulbIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bulbGlowGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <linearGradient id="bulbBaseGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>

      <path d="M16 2V5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 6.5L8.6 8.6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M2.5 16H5.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M25.5 6.5L23.4 8.6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M26.5 16H29.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

      <path
        d="M16 6C11.58 6 8 9.58 8 14C8 16.92 9.57 19.48 11.91 20.87C12.59 21.27 13 22.01 13 22.8V23C13 23.55 13.45 24 14 24H18C18.55 24 19 23.55 19 23V22.8C19 22.01 19.41 21.27 20.09 20.87C22.43 19.48 24 16.92 24 14C24 9.58 20.42 6 16 6Z"
        fill="url(#bulbGlowGrad)"
        stroke="#D97706"
        strokeWidth="1.2"
      />

      <path
        d="M13.5 15.5L15 12.5L17 15.5L18.5 12.5"
        stroke="#EA580C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M11 11C11.8 9.5 13.2 8.5 15 8.2"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <rect x="13" y="24" width="6" height="2" rx="0.5" fill="url(#bulbBaseGrad)" stroke="#475569" strokeWidth="0.5" />
      <rect x="13.5" y="26.5" width="5" height="1.8" rx="0.5" fill="url(#bulbBaseGrad)" stroke="#475569" strokeWidth="0.5" />
      <path d="M14 28.5C14 29.3 14.9 30 16 30C17.1 30 18 29.3 18 28.5H14Z" fill="#334155" />
    </svg>
  );
}

function ColorfulGraduationIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="capBottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="goldTasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="diplomaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>

      <rect x="5.5" y="22" width="21" height="5.5" rx="2.75" fill="url(#diplomaGrad)" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="14" y="22" width="4" height="5.5" fill="#EF4444" />
      <path d="M14.5 27.5L13 31L16 29.5L18.5 31L17.5 27.5" fill="#DC2626" />

      <path
        d="M10 13.5V18.5C10 20.8 12.7 22.5 16 22.5C19.3 22.5 22 20.8 22 18.5V13.5L16 16.5L10 13.5Z"
        fill="url(#capBottomGrad)"
      />

      <path
        d="M16 4L3 10.5L16 17L29 10.5L16 4Z"
        fill="url(#capTopGrad)"
        stroke="#1E40AF"
        strokeWidth="1"
      />

      <path d="M16 5.5L26.5 10.8L16 15.8" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="16" cy="10.5" rx="1.5" ry="1" fill="url(#goldTasselGrad)" />

      <path
        d="M16 10.5C20 10.5 24 12.5 24.5 16.5L24.5 21"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="20" r="1.5" fill="url(#goldTasselGrad)" />
      <path d="M23 21.5L24 25.5H25L26 21.5" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const [featuredCourses, stats, session] = await Promise.all([
    getFeaturedCourses(),
    getStats(),
    auth(),
  ]);

  const enrolledCourseIds: string[] = [];
  if (session?.user?.id) {
    if (session.user.role === "ADMIN") {
      featuredCourses.forEach((c) => enrolledCourseIds.push(c.id));
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      });
      enrollments.forEach((e) => enrolledCourseIds.push(e.courseId));
    }
  }

  // 4 Curated Publications
  const publicationHighlights = isEn
    ? [
      {
        slug: "strategi-transformasi-digital-umkm-2026",
        title: "MSME Digital Transformation Roadmap: AI Marketing to Inventory Automation",
        category: "Digital Transformation",
        author: "Tim Konsultan Matoh Tech",
        readTime: "5 min read",
      },
      {
        slug: "arsitektur-web-modern-nextjs-app-router",
        title: "Architecting Scalable Enterprise Platforms with Next.js App Router",
        category: "Web Engineering",
        author: "Ir. Agung Prasetyo, M.Cs.",
        readTime: "6 min read",
      },
      {
        slug: "pentingnya-sertifikasi-kompetensi-terverifikasi",
        title: "Why QR-Verifiable Certificates with Legal Backing Matter to Recruiters",
        category: "Certification",
        author: "Dr. Retno Wulandari, M.Si.",
        readTime: "4 min read",
      },
      {
        slug: "audit-keamanan-api-dan-autentikasi",
        title: "Modern API Security Audits & Next-Gen Authentication Frameworks",
        category: "Cybersecurity",
        author: "Bambang Sudarsono, S.Kom., M.T.",
        readTime: "6 min read",
      },
    ]
    : [
      {
        slug: "strategi-transformasi-digital-umkm-2026",
        title: "Roadmap Transformasi Digital UMKM: Dari Pemasaran AI hingga Inventori",
        category: "Transformasi Digital",
        author: "Tim Konsultan Matoh Tech",
        readTime: "5 menit baca",
      },
      {
        slug: "arsitektur-web-modern-nextjs-app-router",
        title: "Membangun Platform Web Skalabel dengan Next.js App Router",
        category: "Rekayasa Web",
        author: "Ir. Agung Prasetyo, M.Cs.",
        readTime: "6 menit baca",
      },
      {
        slug: "pentingnya-sertifikasi-kompetensi-terverifikasi",
        title: "Mengapa Sertifikat Digital Berbasis QR Code Krusial bagi Lulusan?",
        category: "Sertifikasi",
        author: "Dr. Retno Wulandari, M.Si.",
        readTime: "4 menit baca",
      },
      {
        slug: "audit-keamanan-api-dan-autentikasi",
        title: "Audit Keamanan API dan Autentikasi Modern pada Arsitektur Web",
        category: "Keamanan Sistem",
        author: "Bambang Sudarsono, S.Kom., M.T.",
        readTime: "6 menit baca",
      },
    ];

  return (
    <div className="bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* =========================================================================
          SECTION 1: HOME (HERO)
          Luminous, Animated Background, Interactive Blobs & Floating Badges
         ========================================================================= */}
      <section id="home" className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden gradient-hero border-b border-slate-100">
        {/* Subtle luminous ambient accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-100/50 via-sky-50/30 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Big Headline & Interactive Controls */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Main Headline */}
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.08] tracking-tight text-balance"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                Make You <br />
                <span className="text-gradient">Ready on Digital</span>
              </h1>

              {/* Subheadline with high legibility */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl text-pretty">
                {isEn
                  ? "Center of excellence for digital technology adoption. Empowering MSMEs, educators, and researchers through project-driven curriculums, MCDM decision analysis, and instant verified certifications."
                  : "Pusat pembelajaran penerapan teknologi digital terbaik bagi pelaku usaha (UMKM), akademisi, dan peserta didik. Kuasai Digital Marketing, Peramalan Bisnis, dan Analisis Keputusan Ilmiah (AHP & ISM) dengan sertifikasi otomatis."}
              </p>

              {/* Action Buttons with clear primary hierarchy */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link href="#course">
                  <Button
                    size="lg"
                    className="rounded-2xl h-14 px-8 text-sm font-bold shadow-warm-lg hover:shadow-xl bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5 cursor-pointer"
                    rightIcon={<ArrowRight size={17} />}
                  >
                    {isEn ? "Browse Courses" : "Jelajahi Kelas"}
                  </Button>
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-all"
                >
                  <span>{isEn ? "About Matoh Technologies" : "Profil & Legalitas Kami"}</span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Live Metric Strip */}
              <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-slate-600">
                {stats.reviewCount > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {stats.reviewAvg.toFixed(1)}/5
                    </span>
                    <span className="text-slate-400">
                      ({stats.reviewCount.toLocaleString(locale === "en" ? "en-US" : "id-ID")}{" "}
                      {isEn ? "reviews" : "ulasan"})
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="font-bold text-slate-900 text-sm">{stats.courses}</span>
                      <span className="text-slate-500">{isEn ? "Curated Courses" : "Kelas Aktif"}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2 font-medium">
                      <span className="font-bold text-slate-900 text-sm">{stats.students}</span>
                      <span className="text-slate-500">{isEn ? "Registered Learners" : "Siswa Terdaftar"}</span>
                    </div>
                  </>
                )}

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>{isEn ? "30-Day Money-Back Guarantee" : "Garansi 30 Hari Uang Kembali"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Illustration with animated background & floating badges */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Animated Luminous Blue Background (Drift Blobs & Rotating Rings) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                {/* Primary moving blue glow blob */}
                <div className="absolute w-72 h-72 sm:w-[430px] sm:h-[430px] rounded-full bg-gradient-to-tr from-blue-500/30 via-sky-400/25 to-blue-600/20 blur-3xl animate-blob-drift" />

                {/* Secondary counter-drifting cyan/sky blob */}
                <div className="absolute w-60 h-60 sm:w-[360px] sm:h-[360px] rounded-full bg-gradient-to-bl from-sky-400/30 via-teal-300/20 to-blue-600/25 blur-3xl animate-blob-drift-reverse" />

                {/* Concentric rotating ambient decorative rings */}
                <div className="absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full border border-blue-400/25 border-dashed animate-spin-ultra-slow" />
                <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full border border-sky-300/20 pointer-events-none" />
              </div>

              <div className="relative w-full max-w-lg lg:max-w-xl mx-auto flex items-center justify-center">
                <Image
                  src="/gambar-heading.svg"
                  alt="Ilustrasi Pembelajaran Digital Matoh Technologies"
                  width={620}
                  height={620}
                  priority
                  unoptimized
                  style={{ aspectRatio: "1 / 1" }}
                  className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 hover:scale-[1.02] aspect-square"
                />

                {/* Floating Badge 1: Top Right */}
                <div className="absolute -top-1 -right-1 sm:top-2 sm:right-2 bg-white/95 backdrop-blur-md shadow-warm rounded-2xl p-3 flex items-center gap-2.5 transition-all hover:scale-105 pointer-events-auto animate-float-gentle">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <ColorfulLightbulbIcon className="w-8 h-8 drop-shadow-xs" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">
                      {isEn ? "Applied Digital Skills" : "Keahlian Digital Terapan"}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {isEn ? "Marketing & MCDM Analysis" : "Pemasaran & Analisis MCDM"}
                    </p>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Left */}
                <div className="absolute -bottom-2 -left-1 sm:bottom-4 sm:left-2 bg-white/95 backdrop-blur-md shadow-warm rounded-2xl p-3 flex items-center gap-2.5 transition-all hover:scale-105 pointer-events-auto animate-float-gentle-reverse">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <ColorfulGraduationIcon className="w-8 h-8 drop-shadow-xs" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">
                      {isEn ? "Official Certification" : "Sertifikat Kelulusan Resmi"}
                    </p>
                    <p className="text-[10px] text-blue-600 font-semibold leading-tight">
                      {isEn ? "Verifiable & LinkedIn Integrated" : "Tervalidasi Digital & LinkedIn"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ONLINE COURSE (4 KELAS)
          Judul besar di tengah, subtitle singkat, 4 card sejajar, tombol Lihat Semua di tengah
         ========================================================================= */}
      <section id="course" className="py-20 sm:py-28 border-b border-slate-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Online Course
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Practical real-world curriculums with official verifiable certification."
                : "Kurikulum praktis berbasis proyek riil dengan sertifikasi kompetensi resmi."}
            </p>
          </div>

          {/* 4 Cards in 1 Row */}
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
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                />

              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-slate-500">
              {isEn ? "No courses available yet." : "Belum ada kelas yang ditampilkan."}
            </div>
          )}

          {/* Centered Button "Lihat Semua" */}
          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-slate-300 hover:border-blue-600 bg-white text-slate-800 hover:text-blue-600 font-semibold text-sm sm:text-base transition-colors shadow-2xs"
            >
              <span>{isEn ? "View All Courses" : "Lihat Semua"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: RISET
          Judul besar di tengah, subtitle singkat, 2 card lebar sejajar, tombol Lihat Semua di tengah
         ========================================================================= */}
      <section id="riset" className="py-20 sm:py-28 border-b border-slate-200 scroll-mt-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Research" : "Riset"}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Scientific decision methodologies for public policy, academic studies, and business."
                : "Metodologi ilmiah dan sains keputusan untuk perumusan kebijakan publik dan bisnis."}
            </p>
          </div>

          {/* 2 Wide Horizontal Cards Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Card 1: AHP */}
            <div className="border border-slate-200 rounded-xl p-7 sm:p-9 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded">
                    MCDM Analysis
                  </span>
                  <Network size={22} className="text-slate-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Analytic Hierarchy Process (AHP)
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {isEn
                    ? "Decomposes complex multi-criteria decisions into pairwise comparisons with verified mathematical consistency (CR < 0.10) for objective prioritization."
                    : "Menentukan prioritas keputusan multi-kriteria berbasis matriks perbandingan berpasangan dengan verifikasi rasio konsistensi matematis yang teruji."}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                    <Image
                      src="/images/avatars/founder-prabantoro.svg"
                      alt="Dr. G. Prabantoro"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{isEn ? "Dr. G. Prabantoro, SE., MM." : "Dipimpin: Dr. G. Prabantoro"}</span>
                </div>
                <span className="text-blue-600 font-semibold">Konsistensi Rasio &lt; 0.10</span>
              </div>
            </div>

            {/* Card 2: ISM */}
            <div className="border border-slate-200 rounded-xl p-7 sm:p-9 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded">
                    Structural Modeling
                  </span>
                  <Layers size={22} className="text-slate-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Interpretive Structural Modeling (ISM)
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {isEn
                    ? "Maps contextual dependencies among complex variables, establishes hierarchical structures, and formulates strategic institutional policy roadmaps."
                    : "Memetakan hubungan kausal antarelemen variabel kompleks, menentukan hierarki struktural, dan merumuskan roadmap implementasi kebijakan institusi."}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium">
                <span>{isEn ? "Institutional Policy" : "Perumusan Kebijakan Publik"}</span>
                <span className="text-blue-600 font-semibold">Model Digraf Kontekstual</span>
              </div>
            </div>
          </div>

          {/* Centered Button "Lihat Semua" */}
          <div className="text-center mt-12">
            <Link
              href="/riset"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-slate-300 hover:border-blue-600 bg-white text-slate-800 hover:text-blue-600 font-semibold text-sm sm:text-base transition-colors shadow-2xs"
            >
              <span>{isEn ? "View Research Details" : "Lihat Semua"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PUBLIKASI
          Judul besar di tengah, subtitle singkat, 4 card sejajar, tombol Lihat Semua di tengah
         ========================================================================= */}
      <section id="publikasi" className="py-20 sm:py-28 border-b border-slate-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Publications" : "Publikasi"}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Applied research papers, case studies, and engineering articles."
                : "Karya tulis ilmiah, studi kasus terapan, dan wawasan teknologi."}
            </p>
          </div>

          {/* 4 Cards in 1 Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {publicationHighlights.map((post) => (
              <article
                key={post.slug}
                className="border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors flex flex-col justify-between h-full bg-white group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                    <Link href={`/publikasi/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate max-w-[150px] font-medium">{post.author}</span>
                  <Link
                    href={`/publikasi/${post.slug}`}
                    className="text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{isEn ? "Read" : "Baca"}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Centered Button "Lihat Semua" */}
          <div className="text-center mt-12">
            <Link
              href="/publikasi"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-slate-300 hover:border-blue-600 bg-white text-slate-800 hover:text-blue-600 font-semibold text-sm sm:text-base transition-colors shadow-2xs"
            >
              <span>{isEn ? "View All Publications" : "Lihat Semua"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: DEVELOPER (JASA PEMBUATAN WEBSITE & SISTEM KUSTOM)
          Judul besar di tengah, subtitle singkat, 3 card sejajar, tombol Lihat Semua di tengah
         ========================================================================= */}
      <section id="developer" className="py-20 sm:py-28 border-b border-slate-200 scroll-mt-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Developer
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Custom website and tailored software system development engineered for your specific business requirements."
                : "Layanan profesional pembuatan website, aplikasi web, dan sistem informasi kustom sesuai alur kebutuhan bisnis Anda."}
            </p>
          </div>

          {/* 3 Cards in 1 Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Service 1: Website Perusahaan & Portal Bisnis */}
            <div className="border border-slate-200 rounded-xl p-7 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    {isEn ? "Company Profile & Web Portals" : "Website Profil & Portal Bisnis"}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-0.5">
                    {isEn ? "Brand Credibility & High Conversion" : "Kredibilitas Tinggi & Siap SEO"}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Modern, responsive websites engineered with lightning-fast load times, SEO architecture, and bespoke UI design tailored to your corporate identity."
                    : "Website representatif, elegan, dan mobile-first dengan kecepatan muat tinggi, struktur SEO optimal, dan desain eksklusif yang memperkuat citra bisnis Anda."}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs font-mono text-slate-600">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Next.js</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">SEO Ready</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Responsive</span>
              </div>
            </div>

            {/* Service 2: Aplikasi Web & Sistem Informasi Kustom */}
            <div className="border border-slate-200 rounded-xl p-7 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Code2 size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    {isEn ? "Custom Web App & Information Systems" : "Aplikasi Web & Sistem Kustom"}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-0.5">
                    {isEn ? "Tailored Internal Workflow Automation" : "Sesuai Alur Proses Klien"}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Custom business applications, operations management portals, internal ERP/CRM dashboards, and specialized data tracking software built from scratch."
                    : "Sistem manajemen operasional, portal administrasi, dashboard monitoring data, dan aplikasi alur kerja internal yang dirancang khusus mengikuti proses organisasi Anda."}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs font-mono text-slate-600">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Dashboard</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Custom Flow</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">PostgreSQL</span>
              </div>
            </div>

            {/* Service 3: Platform E-Commerce & Integrasi Transaksi */}
            <div className="border border-slate-200 rounded-xl p-7 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Database size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    {isEn ? "E-Commerce & Digital Platforms" : "E-Commerce & Integrasi Sistem"}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-0.5">
                    {isEn ? "Payment Gateways & Realtime APIs" : "Payment Gateway & Otomasi API"}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Secure transactional systems featuring bank transfer & e-wallet payment gateways, automated WhatsApp receipts, and third-party API synchronizations."
                    : "Platform transaksi online terintegrasi payment gateway (QRIS, VA Bank, E-Wallet), notifikasi instan, serta integrasi API pihak ketiga dengan keamanan data teruji."}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs font-mono text-slate-600">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Midtrans/Xendit</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Secure API</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded">Cloud</span>
              </div>
            </div>
          </div>

          {/* Centered Button "Lihat Semua" */}
          <div className="text-center mt-12">
            <Link
              href="/developer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-slate-300 hover:border-blue-600 bg-white text-slate-800 hover:text-blue-600 font-semibold text-sm sm:text-base transition-colors shadow-2xs"
            >
              <span>{isEn ? "View All Developer Services" : "Lihat Semua"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: KONSULTAN
          Judul besar di tengah, subtitle singkat, 2 kolom: kiri teks penjelasan, kanan card kontak
         ========================================================================= */}
      <section id="konsultan" className="py-20 sm:py-28 border-b border-slate-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Consultant" : "Konsultan"}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Strategic business advisory, research mentorship, and customized corporate workshops."
                : "Layanan konsultasi strategi bisnis, pendampingan riset, dan pelatihan khusus korporat/kampus."}
            </p>
          </div>

          {/* 2-Column Layout as in the wireframe sketch:
              Left: Brief text & services
              Right: Action card box with WhatsApp Hotline & Form button */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
            {/* Left Column: Brief description & service items */}
            <div className="lg:col-span-7 space-y-5">
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-semibold">
                {isEn
                  ? "We provide end-to-end advisory for MSME business acceleration, academic scientific decision modeling, and corporate upskilling programs."
                  : "Kami menyediakan pendampingan profesional untuk akselerasi bisnis UMKM, bimbingan metodologi keputusan ilmiah akademisi, dan pelatihan khusus institusi."}
              </p>

              <div className="space-y-3 pt-1 text-sm sm:text-base text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>{isEn ? "MSME Digital Transformation Advisory (Up to +70% Sales)" : "Pendampingan Digitalisasi UMKM (Peningkatan omzet hingga 70%)"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>{isEn ? "Decision Science Mentorship (AHP & ISM for Theses & Policies)" : "Bimbingan Metodologi Sains Keputusan (AHP & ISM untuk Tesis/Kebijakan)"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>{isEn ? "Corporate In-House Workshops & Academic Training" : "In-House Training & Workshop Korporasi / Kampus"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>{isEn ? "Financial Feasibility Studies & Valuation Advisory" : "Studi Kelayakan Finansial & Valuasi Investasi Bisnis"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Action Card Box */}
            <div className="lg:col-span-5 border border-slate-200 rounded-xl p-7 sm:p-8 bg-slate-50/70 text-center space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                {isEn ? "Schedule a Consultation" : "Konsultasikan Kebutuhan Anda"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {isEn
                  ? "Discuss your project directly with our advisory team."
                  : "Diskusikan rencana riset, pelatihan, atau bisnis Anda bersama tim kami."}
              </p>

              <div className="space-y-2.5 pt-2">
                <a
                  href="https://wa.me/6281210106680?text=Halo%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20layanan%20konsultan%20dan%20riset."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs"
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp Hotline</span>
                </a>

                <Link
                  href="/konsultan"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 hover:border-blue-600 hover:text-blue-600 bg-white text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
                >
                  <span>{isEn ? "View Consulting Details" : "Pelajari Layanan Konsultan"}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
