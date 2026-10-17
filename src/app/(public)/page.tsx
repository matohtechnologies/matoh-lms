import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, CheckCircle, ShieldCheck, Quote, Sparkles, TrendingUp, Network, Award, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import { FeaturedCoursesShowcase } from "@/components/home/featured-courses-showcase";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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

async function getRecentReviews() {
  try {
    return await prisma.review.findMany({
      where: { rating: { gte: 4 } },
      include: {
        user: { select: { name: true, image: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
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

      {/* Light Rays */}
      <path d="M16 2V5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 6.5L8.6 8.6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M2.5 16H5.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M25.5 6.5L23.4 8.6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M26.5 16H29.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

      {/* Glass Bulb Body */}
      <path
        d="M16 6C11.58 6 8 9.58 8 14C8 16.92 9.57 19.48 11.91 20.87C12.59 21.27 13 22.01 13 22.8V23C13 23.55 13.45 24 14 24H18C18.55 24 19 23.55 19 23V22.8C19 22.01 19.41 21.27 20.09 20.87C22.43 19.48 24 16.92 24 14C24 9.58 20.42 6 16 6Z"
        fill="url(#bulbGlowGrad)"
        stroke="#D97706"
        strokeWidth="1.2"
      />

      {/* Internal Glowing Filament */}
      <path
        d="M13.5 15.5L15 12.5L17 15.5L18.5 12.5"
        stroke="#EA580C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Specular White Highlight */}
      <path
        d="M11 11C11.8 9.5 13.2 8.5 15 8.2"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Base Screw Thread Metal */}
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

      {/* Rolled Diploma parchment in background */}
      <rect x="5.5" y="22" width="21" height="5.5" rx="2.75" fill="url(#diplomaGrad)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Red Ribbon on Diploma */}
      <rect x="14" y="22" width="4" height="5.5" fill="#EF4444" />
      <path d="M14.5 27.5L13 31L16 29.5L18.5 31L17.5 27.5" fill="#DC2626" />

      {/* Skull Cap underside */}
      <path
        d="M10 13.5V18.5C10 20.8 12.7 22.5 16 22.5C19.3 22.5 22 20.8 22 18.5V13.5L16 16.5L10 13.5Z"
        fill="url(#capBottomGrad)"
      />

      {/* Diamond Mortarboard Top */}
      <path
        d="M16 4L3 10.5L16 17L29 10.5L16 4Z"
        fill="url(#capTopGrad)"
        stroke="#1E40AF"
        strokeWidth="1"
      />

      {/* 3D Highlight edge */}
      <path d="M16 5.5L26.5 10.8L16 15.8" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

      {/* Center Gold Button */}
      <ellipse cx="16" cy="10.5" rx="1.5" ry="1" fill="url(#goldTasselGrad)" />

      {/* Golden Tassel Cord & Fringe */}
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
  const t = await getTranslations("hero");
  const tc = await getTranslations("courses");
  const tHome = await getTranslations("home");

  const [featuredCourses, stats, reviews, session] = await Promise.all([
    getFeaturedCourses(),
    getStats(),
    getRecentReviews(),
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

  // Authentic ecosystem partners / institutional reach
  const hiringEcosystem = [
    "Universitas Indonesia",
    "Kementerian Koperasi & UKM",
    "Komunitas UMKM Naik Kelas",
    "Ikatan Akademisi & Peneliti",
    "Kemenristekdikti",
    "Jurnal Riset Matoh",
    "Sentra Bisnis Digital",
  ];

  // The 4-Pillar Modern Learning Method (Matoh Technologies Standard)
  const pillars = isEn
    ? [
      {
        num: "01",
        title: "Applied MSME Digital Marketing",
        desc: "Bridge the gap where only 40% of Indonesian MSMEs sell digitally. Learn battle-tested strategies proven to boost sales up to 70%.",
      },
      {
        num: "02",
        title: "Scientific Decision Making (AHP & ISM)",
        desc: "Master Analytic Hierarchy Process (AHP) and Interpretive Structural Modeling (ISM) for policy makers, researchers, and corporate leadership.",
      },
      {
        num: "03",
        title: "Business Forecasting & Applied SWOT",
        desc: "Analyze business forecasting trends, statistical modeling, and SWOT matrix to navigate market disruption and seize new opportunities.",
      },
      {
        num: "04",
        title: "Verifiable Digital Credentials",
        desc: "Earn authenticated certificates equipped with unique tamper-proof validation QR codes and permanent institutional registry.",
      },
    ]
    : [
      {
        num: "01",
        title: "Digital Marketing Terapan UMKM",
        desc: "Mengatasi kesenjangan digital di mana baru 40% UMKM memanfaatkan pemasaran digital. Dibimbing strategi praktis yang terbukti mendongkrak penjualan hingga 70%.",
      },
      {
        num: "02",
        title: "Metodologi Keputusan Ilmiah (AHP & ISM)",
        desc: "Kuasai Analytic Hierarchy Process (AHP) dan Interpretive Structural Modeling (ISM) untuk perumusan kebijakan publik, strategi bisnis, dan riset akademik.",
      },
      {
        num: "03",
        title: "Peramalan Bisnis & Analisis SWOT",
        desc: "Analisis peramalan tren bisnis masa depan, pemodelan statistik, dan formulasi matriks SWOT untuk menghadapi dinamika pasar dan memitigasi risiko.",
      },
      {
        num: "04",
        title: "Kredensial Digital Terverifikasi",
        desc: "Setiap kelulusan diterbitkan sertifikat resmi ber-QR code unik yang dapat divalidasi keabsahannya oleh institusi, perguruan tinggi, dan korporasi.",
      },
    ];

  // FAQ Items tailored to eliminate friction and highlight automated LMS
  const faqItems = isEn
    ? [
      {
        question: "Can beginners and MSME owners join the programs?",
        answer:
          "Yes, absolutely. Our courses start from core fundamentals with clear, step-by-step guidance before progressing to intermediate and advanced topics.",
      },
      {
        question: "Do I get lifetime access to all learning materials?",
        answer:
          "Yes. Once enrolled, you receive permanent 24/7 access to all video lessons, resources, practical templates, and future curriculum updates.",
      },
      {
        question: "How does automated enrollment and certificate verification work?",
        answer:
          "Upon instant payment via QRIS or Virtual Account, you are automatically enrolled into the classroom. After finishing the curriculum, an official digital certificate with a verifiable QR code is issued immediately.",
      },
      {
        question: "What payment methods are supported?",
        answer:
          "We support instant automated payments via QRIS, GoPay, ShopeePay, Virtual Accounts (BCA, Mandiri, BNI, BRI), and Credit/Debit Cards.",
      },
      {
        question: "Can academic institutions request in-house workshops for AHP, ISM, or research?",
        answer:
          "Yes. We regularly conduct tailored workshops for universities, research centers, and government bodies. Contact our research hotline on WhatsApp.",
      },
    ]
    : [
      {
        question: "Apakah pemula dan pelaku UMKM tanpa latar belakang IT bisa mengikuti?",
        answer:
          "Tentu saja. Kelas kami dirancang khusus dengan langkah-langkah praktis dan aplikatif agar langsung dapat diterapkan pada bisnis sehari-hari.",
      },
      {
        question: "Apakah akses video dan materi berlaku seumur hidup?",
        answer:
          "Ya. Sekali mendaftar, Anda memiliki akses permanen seumur hidup (24/7 lifetime access) ke seluruh modul video, file latihan, dan pembaruan materi.",
      },
      {
        question: "Bagaimana cara kerja pendaftaran otomatis dan sertifikasi digital?",
        answer:
          "Setelah pembayaran instan terverifikasi melalui QRIS atau Virtual Account, Anda langsung otomatis terdaftar di kelas. Setelah menuntaskan seluruh materi, sertifikat resmi ber-QR code diterbitkan secara otomatis.",
      },
      {
        question: "Metode pembayaran apa saja yang didukung?",
        answer:
          "Kami mendukung pembayaran instan otomatis melalui QRIS, GoPay, ShopeePay, Virtual Account semua bank utama (BCA, Mandiri, BNI, BRI), hingga Kartu Kredit/Debit.",
      },
      {
        question: "Apakah institusi kampus dapat mengajukan pelatihan khusus AHP, ISM, atau metodologi riset?",
        answer:
          "Ya, kami secara berkala menyelenggarakan workshop in-house untuk dosen, peneliti, dan mahasiswa pascasarjana. Hubungi hotline riset kami di WhatsApp.",
      },
    ];

  return (
    <div className="bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. HERO SECTION (Luminous, Airy, Human-Crafted) */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden gradient-hero border-b border-slate-100">
        {/* Subtle luminous ambient accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-100/50 via-sky-50/30 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Compelling Editorial Pitch */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>PT. Matoh Technologies Indonesia • AHU-064920.AH.01.30.Tahun 2024</span>
              </div>

              {/* Main Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] tracking-tight text-balance"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                Make You <br />
                <span className="text-gradient">Ready Digital</span>
              </h1>

              {/* Subheadline with high legibility */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl text-pretty">
                {isEn
                  ? "Center of excellence for digital technology adoption. Empowering MSMEs, educators, and researchers through project-driven curriculums, MCDM decision analysis, and instant verified certifications."
                  : "Pusat pembelajaran penerapan teknologi digital terbaik bagi pelaku usaha (UMKM), akademisi, dan peserta didik. Kuasai Digital Marketing, Peramalan Bisnis, dan Analisis Keputusan Ilmiah (AHP & ISM) dengan sertifikasi otomatis."}
              </p>

              {/* Action Buttons with clear primary hierarchy */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="rounded-2xl h-14 px-8 text-sm font-bold shadow-warm-lg hover:shadow-xl bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5 cursor-pointer"
                    rightIcon={<ArrowRight size={17} />}
                  >
                    {isEn ? "Explore All Programs" : "Jelajahi Program Pelatihan"}
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

              {/* Live Metric Strip (Clean, zero clutter, real database values) */}
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
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>{isEn ? "30-Day Money-Back Guarantee" : "Garansi 30 Hari Uang Kembali"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Illustration (gambar-heading.svg) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Animated Luminous Blue Background (Gerak-gerak halus) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                {/* Primary moving blue glow blob */}
                <div className="absolute w-72 h-72 sm:w-[430px] sm:h-[430px] rounded-full bg-gradient-to-tr from-blue-500/30 via-sky-400/25 to-indigo-500/25 blur-3xl animate-blob-drift" />

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
                  className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 hover:scale-[1.02]"
                />

                {/* Floating Badge 1: Top Right */}
                <div className="absolute -top-1 -right-1 sm:top-2 sm:right-2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-warm rounded-2xl p-3 flex items-center gap-2.5 transition-all hover:scale-105 pointer-events-auto animate-float-gentle">
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
                <div className="absolute -bottom-2 -left-1 sm:bottom-4 sm:left-2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-warm rounded-2xl p-3 flex items-center gap-2.5 transition-all hover:scale-105 pointer-events-auto animate-float-gentle-reverse">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <ColorfulGraduationIcon className="w-8 h-8 drop-shadow-xs" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">
                      {isEn ? "Official Certification" : "Sertifikat Kelulusan Resmi"}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold leading-tight">
                      {isEn ? "Verifiable & LinkedIn Integrated" : "Tervalidasi Digital & LinkedIn"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALUMNI HIRING ECOSYSTEM STRIP */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            {isEn
              ? "Alumni working across leading technology and enterprise teams"
              : "Alumni kami telah berkarier di berbagai ekosistem teknologi terkemuka"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-slate-400 font-bold text-sm tracking-tight">
            {hiringEcosystem.map((company) => (
              <span
                key={company}
                className="px-3 py-1 rounded-lg hover:text-slate-700 transition-colors"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE 4-PILLAR MODERN LEARNING METHOD (Architectural Dot Matrix & Bento Grid) */}
      <section id="tentang-kami" className="relative py-24 lg:py-32 bg-slate-50/80 border-b border-slate-200/80 scroll-mt-20 overflow-hidden">
        {/* Architectural Dot Matrix Texture */}
        <div className="absolute inset-0 bg-dot-matrix opacity-70 pointer-events-none" />
        
        {/* Ambient gradient spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-blue-100/40 via-sky-50/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider bg-white/90 px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-xs mb-4">
              <Sparkles size={13} className="text-blue-600" />
              <span>{isEn ? "The Matoh Standard" : "Standar Matoh Technologies"}</span>
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn
                ? "Engineered for tangible career outcomes"
                : "Metode Belajar Terstruktur yang Membawa Hasil Nyata"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3.5 leading-relaxed max-w-xl mx-auto">
              {isEn
                ? "Every detail of the platform is designed to take you from foundational understanding to production-level confidence."
                : "Dirancang secara spesifik untuk mengubah pemula menjadi talenta siap kerja yang percaya diri menghadapi kebutuhan industri."}
            </p>
          </div>

          {/* Bento Grid Composition with Staggered ScrollReveal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Item 1: Wide Card (spans 2 cols on lg) - Digital Marketing Terapan */}
            <ScrollReveal delayMs={0} className="lg:col-span-2">
              <div className="bento-card bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-subtle flex flex-col justify-between relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-warm">
                      01
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      {isEn ? "High-Impact MSME" : "Paling Diminati UMKM"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {pillars[0].title}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                    {pillars[0].desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg">
                    <TrendingUp size={14} /> +70% {isEn ? "Sales Conversion" : "Peningkatan Omzet"}
                  </span>
                  <span>•</span>
                  <span>{isEn ? "Practical Step-by-Step Guidance" : "Panduan Langkah demi Langkah"}</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Item 2: Vertical Card (1 col) - Metodologi Keputusan Ilmiah AHP & ISM */}
            <ScrollReveal delayMs={120}>
              <div className="bento-card bg-white rounded-3xl p-8 border border-slate-200/90 shadow-subtle flex flex-col justify-between group h-full">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-warm">
                      02
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      MCDM &amp; ISM
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {pillars[1].title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillars[1].desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-indigo-700">
                  <Network size={14} />
                  <span>{isEn ? "Public Policy & Research" : "Riset Akademik & Kebijakan"}</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Item 3: Vertical Card (1 col) - Peramalan Bisnis & Analisis SWOT */}
            <ScrollReveal delayMs={180}>
              <div className="bento-card bg-white rounded-3xl p-8 border border-slate-200/90 shadow-subtle flex flex-col justify-between group h-full">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-warm">
                      03
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      {isEn ? "Market Forecast" : "Peramalan Pasar"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {pillars[2].title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillars[2].desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <TrendingUp size={14} />
                  <span>{isEn ? "Statistical Trend Modeling" : "Pemodelan Tren Statistik"}</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Bento Item 4: Wide Card (spans 2 cols on lg) - Kredensial Digital Terverifikasi */}
            <ScrollReveal delayMs={240} className="lg:col-span-2">
              <div className="bento-card bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-subtle flex flex-col justify-between relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-warm">
                      04
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      {isEn ? "Verified Registry" : "Validasi QR Code Resmi"}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {pillars[3].title}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                    {pillars[3].desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg">
                    <Award size={14} /> {isEn ? "Permanent Registry & LinkedIn Ready" : "Sertifikat Digital Anti-Pemalsuan"}
                  </span>
                  <span>•</span>
                  <span>{isEn ? "Direct QR Code Validation" : "Dapat Diverifikasi Langsung via QR"}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. FOUNDER PHILOSOPHY & THREE CORE BELIEFS (Deep Midnight Contrast) */}
      <section className="relative py-24 lg:py-32 bg-[#0B1120] text-white overflow-hidden border-b border-slate-800">
        {/* Technical Blueprint lines with dark glow */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-25 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(14,165,233,0.18)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Quote Card: Editorial Dark Card */}
            <ScrollReveal direction="left" delayMs={0} className="lg:col-span-6 flex">
              <div className="w-full glass-card-dark rounded-3xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border border-slate-700/80">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-8">
                    <Quote size={13} className="text-blue-400" />
                    <span>{isEn ? "Founder's Philosophy" : "Filosofi & Pesan Pendiri"}</span>
                  </div>
                  <blockquote className="text-lg sm:text-xl text-slate-100 leading-relaxed font-normal italic">
                    &ldquo;Menguasai teknologi digital sama pentingnya seperti kita hidup perlu bernafas. Kalau kita masih mau tetap hidup ya kita harus selalu bisa bernafas. Begitu pula dengan bisnis dan pendidikan, pelakunya harus menguasai teknologi digital supaya bisa selalu &lsquo;hidup&rsquo; dalam setiap kerja bisnis dan pendidikannya...&rdquo;
                  </blockquote>
                </div>
                <div className="pt-8 mt-10 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base sm:text-lg">Dr. G. Prabantoro, SE., MM., CBec.</h4>
                    <p className="text-xs text-blue-400 font-medium mt-0.5">Founder &amp; RnD Director • PT. Matoh Technologies Indonesia</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Slogan Resmi</span>
                    <span className="text-xs font-bold text-white bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 inline-block mt-1">
                      &ldquo;Make You Ready Digital&rdquo;
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right 3 Core Beliefs Cards: Interactive Dark Cards */}
            <ScrollReveal direction="right" delayMs={150} className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-800/60 inline-block mb-3">
                  {isEn ? "Core Philosophy" : "3 Keyakinan Pokok Matoh"}
                </span>
                <h3
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {isEn ? "Why Digital Transformation Cannot Wait" : "Fondasi Penerapan Teknologi Digital Terarah"}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base mt-2.5 leading-relaxed">
                  {isEn
                    ? "Our foundational principles built on 16+ years of empowering Indonesian SMEs and academic researchers."
                    : "Baru 40% UMKM memanfaatkan pemasaran digital, padahal terbukti mampu menaikkan penjualan hingga 70%. Berikut komitmen kami:"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-850 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-warm group-hover:scale-105 transition-transform">
                      01
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">Optimalisasi Kinerja UMKM</h4>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                        Literasi digital sangat dibutuhkan untuk mengoptimalkan performa penjualan, branding, dan automasi proses bisnis harian UMKM.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-850 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-warm group-hover:scale-105 transition-transform">
                      02
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">Peningkatan Kinerja Akademisi &amp; Peserta Didik</h4>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                        Penguasaan metodologi analisis keputusan (MCDM: AHP, ISM) &amp; peramalan bisnis mutlak diperlukan untuk riset dan publikasi bereputasi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-850 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-warm group-hover:scale-105 transition-transform">
                      03
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">Pendampingan &amp; Kolaborasi Berkelanjutan</h4>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                        Meningkatkan literasi digital tidak bisa instan satu arah; membutuhkan pembelajaran mandiri terarah dan ekosistem pendampingan nyata.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. FEATURED POPULAR COURSES SHOWCASE (Interactive Category Tabs) */}
      <section id="program" className="py-20 lg:py-28 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
                {isEn ? "Curated Programs" : "Program Pilihan"}
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {tc("title")}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                {tc("subtitle")}
              </p>
            </div>

            <Link href="/courses">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 hover:border-slate-300 text-slate-700"
                rightIcon={<ArrowRight size={15} />}
              >
                {tc("view_all")}
              </Button>
            </Link>
          </div>

          <FeaturedCoursesShowcase
            courses={featuredCourses}
            enrolledCourseIds={enrolledCourseIds}
            locale={locale}
            isEn={isEn}
          />
        </div>
      </section>

      {/* 5. STUDENT REVIEWS / LEARNING COMMITMENT (Warm Amber & Asymmetric Elevation) */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-50/90 via-amber-50/20 to-white border-b border-slate-200/80 overflow-hidden">
        {/* Soft warm light bloom */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-amber-200/15 via-orange-100/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50/90 px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-xs mb-4">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span>
                {reviews.length > 0
                  ? (isEn ? "Student Reviews" : "Ulasan Pembelajar")
                  : (isEn ? "Quality Commitment" : "Standar Kualitas")}
              </span>
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {reviews.length > 0
                ? tHome("testimonials_title")
                : (isEn ? "Engineered for True Competency" : "Komitmen Keunggulan Pembelajaran")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed max-w-xl mx-auto">
              {reviews.length > 0
                ? tHome("testimonials_subtitle")
                : (isEn
                  ? "Transparent standards, industry-aligned curriculums, and lifelong guidance."
                  : "Standar pembelajaran transparan, materi berbasis industri nyata, dan sertifikasi digital terverifikasi.")}
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((item, idx) => (
                <ScrollReveal key={item.id} delayMs={idx * 120}>
                  <div
                    className="bento-card bg-white rounded-3xl p-8 border border-slate-200/90 shadow-subtle flex flex-col justify-between relative overflow-hidden group h-full"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed font-normal">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <p className="text-[11px] text-slate-400 mb-2">
                        {isEn ? "Course:" : "Kelas:"}{" "}
                        <span className="font-semibold text-slate-700">{item.course.title}</span>
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {item.user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {item.user.name || (isEn ? "Learner" : "Siswa")}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle size={11} className="text-blue-500" />
                            <span>{isEn ? "Verified Learner" : "Siswa Terverifikasi"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: isEn ? "Curated Practical Projects" : "Kurikulum Praktis & Riil",
                  desc: isEn
                    ? "Every course is structured around real-world software development challenges that employers look for."
                    : "Setiap kelas dirancang berbasis studi kasus industri nyata agar Anda menguasai keahlian yang sesungguhnya.",
                },
                {
                  title: isEn ? "Permanent Lifetime Access" : "Akses Seumur Hidup",
                  desc: isEn
                    ? "Learn at your own pace with unrestricted permanent access to modules, exercises, and updates."
                    : "Belajar tanpa batasan waktu dengan akses permanen ke seluruh modul video dan pembaruan materi.",
                },
                {
                  title: isEn ? "Verifiable Digital Credentials" : "Sertifikasi Resmi Digital",
                  desc: isEn
                    ? "Earn authenticated certificates equipped with unique validation codes for your professional portfolio."
                    : "Raih sertifikat ber-QR code unik yang dapat divalidasi keabsahannya oleh tim rekrutmen perusahaan.",
                },
              ].map((card, idx) => (
                <ScrollReveal key={idx} delayMs={idx * 120}>
                  <div
                    className="bento-card bg-white rounded-3xl p-8 border border-slate-200/90 shadow-subtle flex flex-col justify-between h-full"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center font-bold text-sm mb-4">
                      0{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base mb-2">{card.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. TRANSPARENT FAQ (Technical Blueprint Grid Pattern) */}
      <section className="relative py-24 lg:py-32 bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Subtle technical blueprint lines */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-35 pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/60 shadow-xs mb-4">
              <HelpCircle size={13} className="text-blue-600" />
              <span>{tHome("faq_badge")}</span>
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {tHome("faq_title")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed max-w-xl mx-auto">
              {tHome("faq_subtitle")}
            </p>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* 6.5. DIRECT CAREER ADVISORY & CONTACT BANNER (Emerald & Sky Dual Accent) */}
      <section id="kontak" className="relative py-20 bg-slate-50/90 border-b border-slate-200/80 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-3xl border-2 border-emerald-500/20 p-8 sm:p-12 shadow-warm-lg flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle,rgba(52,211,153,0.12)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="space-y-3.5 max-w-2xl text-left relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/70 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isEn ? "Free Consultation & Advisory" : "Konsultasi Pelatihan & Riset Terapan"}</span>
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {isEn
                  ? "Need Guidance on the Best Program for Your Organization or Thesis?"
                  : "Bingung Memilih Program Pelatihan untuk UMKM atau Riset Anda?"}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isEn
                  ? "Discuss your background and objectives with the Matoh Technologies academic & technical team. Get customized syllabus recommendations, methodology consultations, and practical implementation blueprints."
                  : "Diskusikan kebutuhan usaha atau riset Anda langsung dengan tim konsultan Matoh Technologies. Dapatkan rekomendasi kurikulum, konsultasi metode (MCDM/Forecasting), dan roadmap implementasi terarah."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="rounded-2xl h-13 px-7 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-warm w-full cursor-pointer hover:-translate-y-0.5 transition-transform"
                  rightIcon={<ArrowRight size={16} />}
                >
                  {isEn ? "Contact Admissions" : "Hubungi Tim Matoh"}
                </Button>
              </Link>
              <a
                href="https://wa.me/6281210106680?text=Halo%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20program%20pelatihan."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>WhatsApp Hotline Resmi</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONVERTING CLOSING CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 relative overflow-hidden text-white">
        {/* Soft background light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,0,0,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-7">
          <h2
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {tHome("cta_title")}
          </h2>

          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {tHome("cta_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
            <Link href="/register">
              <Button
                size="lg"
                variant="white"
                className="rounded-2xl h-13 px-8 text-base w-full sm:w-auto hover:-translate-y-0.5"
                rightIcon={<ArrowRight size={18} />}
              >
                {tHome("cta_btn_primary")}
              </Button>
            </Link>

            <Link href="/courses">
              <Button
                size="lg"
                variant="outline-white"
                className="rounded-2xl h-13 px-7 text-base w-full sm:w-auto hover:-translate-y-0.5"
              >
                {tHome("cta_btn_secondary")}
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100 font-medium">
            {(isEn
              ? ["No credit card required to explore", "Full lifetime access", "30-day money-back guarantee"]
              : ["Tanpa kartu kredit saat daftar", "Akses materi seumur hidup", "30 hari garansi uang kembali"]
            ).map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle size={15} className="text-sky-200" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
