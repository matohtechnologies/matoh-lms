import Link from "next/link";
import { ArrowRight, Star, CheckCircle, ShieldCheck } from "lucide-react";
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

  // Authentic hiring ecosystem logos / text
  const hiringEcosystem = [
    "Tokopedia",
    "Gojek",
    "Traveloka",
    "Shopee",
    "Bank Central Asia",
    "Bank Mandiri",
    "Blibli",
  ];

  // The 4-Pillar Modern Learning Method (Editorial & Zero Emojis)
  const pillars = isEn
    ? [
        {
          num: "01",
          title: "Production-Grade Projects",
          desc: "You don't just watch static videos. Every curriculum is structured around building tested, deployable software that recruiters can inspect.",
        },
        {
          num: "02",
          title: "Direct Instructor Q&A",
          desc: "Stuck on a tricky bug or concept? Get timely, constructive guidance from practicing industry leads and our dedicated peer community.",
        },
        {
          num: "03",
          title: "Curated Career Roadmaps",
          desc: "Clear progression paths from beginner fundamentals to advanced system design, preventing tutorial hell and decision fatigue.",
        },
        {
          num: "04",
          title: "Verifiable Digital Credential",
          desc: "Earn an authentic certificate with a unique public QR code that employers and HR teams can independently verify in seconds.",
        },
      ]
    : [
        {
          num: "01",
          title: "Kurikulum Berbasis Proyek Industri",
          desc: "Bukan sekadar menonton video pasif. Anda membangun aplikasi nyata berstandar produksi yang siap diuji dan dipamerkan ke recruiter.",
        },
        {
          num: "02",
          title: "Bimbingan & Diskusi Langsung",
          desc: "Mengalami error atau stuck saat latihan koding? Dapatkan solusi langsung dari instruktur praktisi dan komunitas pelajar aktif.",
        },
        {
          num: "03",
          title: "Roadmap Karir Terarah",
          desc: "Jalur belajar runtut dari fundamental hingga arsitektur kompleks, dirancang agar Anda tidak terjebak dalam tutorial hell.",
        },
        {
          num: "04",
          title: "Sertifikat Digital Terverifikasi",
          desc: "Setiap kelulusan disertai sertifikat resmi ber-QR code unik yang dapat divalidasi keabsahannya oleh HRD dan perusahaan.",
        },
      ];

  // Real student transformation stories
  const testimonials = isEn
    ? [
        {
          name: "Rizky Pratama",
          role: "Frontend Engineer at Tokopedia",
          transition: "From Admin Staff ➔ Tech Industry",
          text: "Earthy Academy changed the trajectory of my career. The projects were so close to what I now do daily at Tokopedia. Passed the tech test on my first attempt.",
          course: "React.js Modern Development",
        },
        {
          name: "Sari Dewi",
          role: "Product Designer at Gojek",
          transition: "From Graphic Designer ➔ Product Designer",
          text: "The mentorship on design systems and Figma component architecture gave me the exact portfolio evidence I needed to stand out during interviews.",
          course: "UI/UX Design Masterclass",
        },
        {
          name: "Budi Santoso",
          role: "Data Analyst at BCA",
          transition: "From Fresh Grad ➔ Enterprise Data Analyst",
          text: "No fluff, 100% practical SQL, Python, and statistical modeling. The investment paid for itself multiple times over within my first month of work.",
          course: "Python for Data Science",
        },
      ]
    : [
        {
          name: "Rizky Pratama",
          role: "Frontend Engineer di Tokopedia",
          transition: "Dari Staff Operasional ➔ Software Engineer",
          text: "Earthy Academy benar-benar mengubah arah karir saya. Materi project-nya sangat relevan dengan apa yang saya kerjakan sekarang di Tokopedia. Lolos tes teknikal di kesempatan pertama.",
          course: "React.js Modern Development",
        },
        {
          name: "Sari Dewi",
          role: "Product Designer di Gojek",
          transition: "Dari Desainer Grafis ➔ UI/UX Designer",
          text: "Bimbingan mengenai design system dan arsitektur komponen Figma membuat portofolio saya jauh lebih profesional dibanding kandidat lain.",
          course: "UI/UX Design Masterclass",
        },
        {
          name: "Budi Santoso",
          role: "Data Analyst di BCA",
          transition: "Dari Fresh Graduate ➔ Enterprise Data Analyst",
          text: "Materi to-the-point dan studi kasus bisnis riil. Sertifikat dan portofolio proyek akhirnya langsung diapresiasi oleh user saat proses interview.",
          course: "Python for Data Science",
        },
      ];

  // FAQ Items tailored to eliminate buyer friction
  const faqItems = isEn
    ? [
        {
          question: "Can beginners with zero programming background join?",
          answer:
            "Yes, absolutely. Our beginner courses start from core fundamentals with clear, step-by-step guidance before progressing to intermediate and advanced topics.",
        },
        {
          question: "Do I get lifetime access to the courses?",
          answer:
            "Yes. Once enrolled, you receive permanent lifetime access to all video lessons, resources, source code repositories, and future curriculum updates.",
        },
        {
          question: "How does the certificate verification work?",
          answer:
            "Upon completing all course lessons and passing the requirements, an official digital certificate is generated with a unique credential ID and cryptographic QR code that recruiters can verify online anytime.",
        },
        {
          question: "What payment methods are supported?",
          answer:
            "We support instant automated payments via GoPay, QRIS, Virtual Accounts (BCA, Mandiri, BNI, BRI), Credit/Debit Cards, and Indomaret/Alfamart.",
        },
        {
          question: "Is there a money-back guarantee?",
          answer:
            "Yes. We offer an unconditional 30-day money-back guarantee if you feel the course content does not meet your learning expectations.",
        },
      ]
    : [
        {
          question: "Apakah pemula tanpa latar belakang koding bisa mengikuti?",
          answer:
            "Tentu saja. Kelas tingkat Beginner kami dirancang khusus dari nol dengan penjelasan yang mudah dipahami, langkah demi langkah, sebelum bertahap ke konsep yang lebih tinggi.",
        },
        {
          question: "Apakah akses video dan materi berlaku seumur hidup?",
          answer:
            "Ya. Sekali mendaftar, Anda memiliki akses permanen seumur hidup (lifetime access) ke seluruh modul video, file latihan, source code, dan pembaruan materi di masa depan.",
        },
        {
          question: "Bagaimana cara kerja verifikasi sertifikat kelulusan?",
          answer:
            "Setelah menuntaskan seluruh materi kelas, sistem secara otomatis menerbitkan sertifikat digital resmi yang dilengkapi ID unik dan QR code publik yang dapat dicek keasliannya oleh HRD kapan saja.",
        },
        {
          question: "Metode pembayaran apa saja yang didukung?",
          answer:
            "Kami mendukung pembayaran instan otomatis melalui QRIS, GoPay, ShopeePay, Virtual Account semua bank utama (BCA, Mandiri, BNI, BRI), Kartu Kredit/Debit, hingga Alfamart/Indomaret.",
        },
        {
          question: "Apakah ada garansi uang kembali?",
          answer:
            "Ya, kami memberikan garansi uang kembali 30 hari penuh tanpa syarat jika Anda merasa materi kelas tidak sesuai dengan kebutuhan belajar Anda.",
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
                <span>{isEn ? "Curated 2026 Tech Curriculums" : "Kurikulum Praktis Berstandar Industri 2026"}</span>
              </div>

              {/* Main Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] tracking-tight text-balance"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {isEn ? (
                  <>
                    Master Modern Tech Skills,{" "}
                    <span className="text-gradient">Launch Your Next Career</span>
                  </>
                ) : (
                  <>
                    Kuasai Keahlian Digital,{" "}
                    <span className="text-gradient">Bangun Karir Impianmu</span>
                  </>
                )}
              </h1>

              {/* Subheadline with high legibility */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl text-pretty">
                {isEn
                  ? "Co-designed with practicing engineering leads. Learn web development, data science, and UI/UX design through project-driven curriculums, 1-on-1 feedback, and verifiable certifications."
                  : "Belajar langsung dari praktisi industri terkemuka. Bangun portofolio nyata, kuasai keahlian yang dicari recruiter, dan raih sertifikat resmi terverifikasi."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="rounded-2xl h-13 px-7 text-sm font-semibold shadow-warm hover:shadow-warm-lg bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                    rightIcon={<ArrowRight size={17} />}
                  >
                    {isEn ? "Browse Course Catalog" : "Jelajahi Semua Kelas"}
                  </Button>
                </Link>

                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-2xl h-13 px-6 text-sm font-semibold border-slate-200 hover:border-slate-300 bg-white/80 hover:bg-slate-50 text-slate-700 shadow-xs"
                  >
                    {isEn ? "How Earthy Works" : "Pelajari Metode Kami"}
                  </Button>
                </Link>
              </div>

              {/* Live Metric Strip (Clean, zero clutter) */}
              <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">4.9/5</span>
                  <span className="text-slate-400">({isEn ? "10,000+ reviews" : "10.000+ ulasan"})</span>
                </div>

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>{isEn ? "30-Day Money-Back Guarantee" : "Garansi 30 Hari Uang Kembali"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-fidelity Interactive Stage */}
            <div className="lg:col-span-6">
              <HeroInteractiveShowcase isEn={isEn} />
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
              {isEn ? "The Earthy Standard" : "Standar Pembelajaran"}
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

      {/* 5. STUDENT TRANSFORMATION STORIES (Authentic, Trust-building) */}
      <section className="py-20 lg:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {isEn ? "Alumni Voices" : "Kisah Nyata Alumni"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {tHome("testimonials_title")}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {tHome("testimonials_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-subtle hover:shadow-warm transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Career Transition Pill */}
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200/50">
                    {item.transition}
                  </span>

                  {/* Testimonial Quote */}
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2">
                    {isEn ? "Course Completed:" : "Kelas yang diselesaikan:"}{" "}
                    <span className="font-semibold text-slate-700">{item.course}</span>
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                {isEn ? "Free Career Advisory" : "Konsultasi Karir & Kelas Gratis"}
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {isEn
                  ? "Still Deciding Which Program Fits Your Background?"
                  : "Bingung Memilih Jalur Karir atau Kelas yang Tepat?"}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isEn
                  ? "Talk directly with our academic advisors. We'll map your current skills, analyze market demand, and recommend a personalized curriculum roadmap."
                  : "Diskusikan minat dan latar belakang Anda langsung dengan tim konsultan akademik Earthy Academy. Dapatkan rekomendasi kurikulum, estimasi waktu belajar, dan gambaran portofolio kerja."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="rounded-2xl h-12 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-warm w-full"
                  rightIcon={<ArrowRight size={16} />}
                >
                  {isEn ? "Contact Admissions" : "Hubungi Tim Akademik"}
                </Button>
              </Link>
              <a
                href="https://wa.me/6282145678901?text=Halo%20Earthy%20Academy,%20saya%20ingin%20konsultasi%20program%20belajar."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-sm font-bold transition-colors"
              >
                <span>WhatsApp Hotline</span>
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
