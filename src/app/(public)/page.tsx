import Link from "next/link";
import { ArrowRight, Star, CheckCircle, ShieldCheck, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations, getLocale } from "next-intl/server";
import { HeroInteractiveShowcase } from "@/components/home/hero-interactive-showcase";
import { FeaturedCoursesShowcase } from "@/components/home/featured-courses-showcase";
import { FaqAccordion } from "@/components/home/faq-accordion";

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
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="rounded-2xl h-13 px-7 text-sm font-semibold shadow-warm hover:shadow-warm-lg bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                    rightIcon={<ArrowRight size={17} />}
                  >
                    {isEn ? "Explore Training Programs" : "Jelajahi Program Pelatihan"}
                  </Button>
                </Link>

                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl h-13 px-6 text-sm font-semibold border-slate-200 hover:border-slate-300 bg-white/80 hover:bg-slate-50 text-slate-700 shadow-xs"
                  >
                    {isEn ? "About Matoh Technologies" : "Profil & Legalitas Kami"}
                  </Button>
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

            {/* Right Column: High-fidelity Interactive Stage */}
            <div className="lg:col-span-6">
              <HeroInteractiveShowcase isEn={isEn} studentCount={stats.students} />
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

      {/* 3. THE 4-PILLAR MODERN LEARNING METHOD (Human-designed, No Emojis) */}
      <section id="tentang-kami" className="py-20 lg:py-28 bg-slate-50/70 border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {isEn ? "The Matoh Standard" : "Standar Matoh Technologies"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {isEn
                ? "Engineered for tangible career outcomes"
                : "Metode Belajar Terstruktur yang Membawa Hasil Nyata"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              {isEn
                ? "Every detail of the platform is designed to take you from foundational understanding to production-level confidence."
                : "Dirancang secara spesifik untuk mengubah pemula menjadi talenta siap kerja yang percaya diri menghadapi kebutuhan industri."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.num}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-subtle hover:shadow-warm transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-2xl font-black text-blue-600/80 block mb-4 group-hover:text-blue-700 transition-colors">
                    {pillar.num}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3.5. FOUNDER PHILOSOPHY & THREE CORE BELIEFS */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Quote Card */}
            <div className="lg:col-span-6 bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div>
                <Quote className="text-blue-400 mb-6 w-10 h-10 opacity-80" />
                <blockquote className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal italic">
                  &ldquo;Menguasai teknologi digital sama pentingnya seperti kita hidup perlu bernafas. Kalau kita masih mau tetap hidup ya kita harus selalu bisa bernafas. Begitu pula dengan bisnis dan pendidikan, pelakunya harus menguasai teknologi digital supaya bisa selalu &lsquo;hidup&rsquo; dalam setiap kerja bisnis dan pendidikannya...&rdquo;
                </blockquote>
              </div>
              <div className="pt-6 mt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-base">Dr. G. Prabantoro, SE., MM., CBec.</h4>
                  <p className="text-xs text-blue-400 font-medium">Founder &amp; RnD Director • PT. Matoh Technologies Indonesia</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">Slogan Resmi</span>
                  <span className="text-xs font-bold text-white">&ldquo;Make You Ready Digital&rdquo;</span>
                </div>
              </div>
            </div>

            {/* Right 3 Core Beliefs Cards */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
                  {isEn ? "Core Philosophy" : "3 Keyakinan Pokok Matoh"}
                </span>
                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
                >
                  {isEn ? "Why Digital Transformation Cannot Wait" : "Fondasi Penerapan Teknologi Digital Terarah"}
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  {isEn
                    ? "Our foundational principles built on 16+ years of empowering Indonesian SMEs and academic researchers."
                    : "Baru 40% UMKM memanfaatkan pemasaran digital, padahal terbukti mampu menaikkan penjualan hingga 70%. Berikut komitmen kami:"}
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:shadow-subtle transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      01
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Optimalisasi Kinerja UMKM</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Literasi digital sangat dibutuhkan untuk mengoptimalkan performa penjualan, branding, dan automasi proses bisnis harian UMKM.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:shadow-subtle transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      02
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Peningkatan Kinerja Akademisi &amp; Peserta Didik</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Penguasaan metodologi analisis keputusan (MCDM: AHP, ISM) &amp; peramalan bisnis mutlak diperlukan untuk riset dan publikasi bereputasi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:shadow-subtle transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      03
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Pendampingan &amp; Kolaborasi Berkelanjutan</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Meningkatkan literasi digital tidak bisa instan satu arah; membutuhkan pembelajaran mandiri terarah dan ekosistem pendampingan nyata.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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

      {/* 5. STUDENT REVIEWS / LEARNING COMMITMENT (Authentic, Real Data) */}
      <section className="py-20 lg:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {reviews.length > 0
                ? (isEn ? "Student Reviews" : "Ulasan Pembelajar")
                : (isEn ? "Quality Commitment" : "Standar Kualitas")}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {reviews.length > 0
                ? tHome("testimonials_title")
                : (isEn ? "Engineered for True Competency" : "Komitmen Keunggulan Pembelajaran")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {reviews.length > 0
                ? tHome("testimonials_subtitle")
                : (isEn
                    ? "Transparent standards, industry-aligned curriculums, and lifelong guidance."
                    : "Standar pembelajaran transparan, materi berbasis industri nyata, dan sertifikasi digital terverifikasi.")}
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-subtle hover:shadow-warm transition-all duration-300 flex flex-col justify-between"
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {item.user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.user.name || (isEn ? "Learner" : "Siswa")}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {isEn ? "Verified Learner" : "Siswa Terverifikasi"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-subtle hover:shadow-warm transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. TRANSPARENT FAQ (Eliminate doubts & boost conversions) */}
      <section className="py-20 lg:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {tHome("faq_badge")}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {tHome("faq_title")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {tHome("faq_subtitle")}
            </p>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* 6.5. DIRECT CAREER ADVISORY & CONTACT BANNER */}
      <section id="kontak" className="py-16 bg-[#f8fafc] border-b border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-warm flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="space-y-3 max-w-2xl text-left relative z-10">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
                {isEn ? "Free Consultation & Advisory" : "Konsultasi Pelatihan & Riset Terapan"}
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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
                  className="rounded-2xl h-12 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-warm w-full"
                  rightIcon={<ArrowRight size={16} />}
                >
                  {isEn ? "Contact Admissions" : "Hubungi Tim Matoh"}
                </Button>
              </Link>
              <a
                href="https://wa.me/6281210106680?text=Halo%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20program%20pelatihan."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-sm font-bold transition-colors"
              >
                <span>WhatsApp Hotline Resmi</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONVERTING CLOSING CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 relative overflow-hidden text-white">
        {/* Soft background light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-7">
          <h2
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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
