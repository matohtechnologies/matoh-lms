import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Award,
  Target,
  Heart,
  Star,
  CheckCircle2,
  ShieldCheck,
  Code2,
  Compass,
  ArrowRight,
  Sparkles,
  Building,
  GraduationCap,
} from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { LegalTrustCard } from "@/components/about/legal-trust-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami | PT. Matoh Technologies Indonesia",
  description:
    "Kenali sejarah, visi, misi, dan tim pendiri di balik PT. Matoh Technologies Indonesia (SK Menkumham: AHU-064920.AH.01.30.Tahun 2024) — memberdayakan UMKM dan insan akademik melalui literasi teknologi digital terapan.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const [studentsCount, coursesCount, lessonsCount, certsCount] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    prisma.course.count({ where: { published: true } }).catch(() => 0),
    prisma.lesson.count().catch(() => 0),
    prisma.certificate.count().catch(() => 0),
  ]);

  const statsList = [
    { value: studentsCount.toLocaleString(), label: isEn ? "Registered Learners" : "Siswa & Peserta Didik" },
    { value: coursesCount.toLocaleString(), label: isEn ? "Published Courses" : "Kelas Tersedia" },
    { value: lessonsCount.toLocaleString(), label: isEn ? "Learning Modules" : "Modul Pembelajaran" },
    { value: certsCount.toLocaleString(), label: isEn ? "Verified Certificates" : "Sertifikat Kelulusan" },
  ];

  const pillars = [
    {
      num: "01",
      title: isEn ? "Applied Business & SME Digitalization" : "Digitalisasi Bisnis & UMKM Terapan",
      desc: isEn
        ? "Only 40% of Indonesian MSMEs utilize digital marketing. Our programs are engineered to bridge this gap, proven to accelerate revenue performance up to 70%."
        : "Baru 40% UMKM di Indonesia yang memanfaatkan pemasaran digital. Program kami dirancang praktis untuk menutup celah ini dan terbukti meningkatkan performa penjualan hingga 70%.",
    },
    {
      num: "02",
      title: isEn ? "Academic & Educational Innovation" : "Inovasi Pembelajaran Akademisi",
      desc: isEn
        ? "Empowering educators, lecturers, and researchers with modern asynchronous learning tools, research methods, and curriculum digitization."
        : "Memberdayakan pendidik, dosen, dan peneliti dengan model pembelajaran digital asinkron, kurikulum berbasis teknologi, dan manajemen riset modern.",
    },
    {
      num: "03",
      title: isEn ? "Advanced Decision Modeling (MCDM)" : "Metodologi Keputusan Ilmiah (MCDM)",
      desc: isEn
        ? "Direct instruction in Analytic Hierarchy Process (AHP) and Interpretive Structural Modeling (ISM) for policy makers, researchers, and corporate strategists."
        : "Pelatihan komprehensif Analytic Hierarchy Process (AHP) dan Interpretive Structural Modeling (ISM) untuk perumusan kebijakan publik dan strategi bisnis objektif.",
    },
    {
      num: "04",
      title: isEn ? "Verifiable Digital Credentials" : "Kredensial Digital Terverifikasi",
      desc: isEn
        ? "Official certificates with unique tamper-proof validation QR codes and permanent online registry, backed by PT. Matoh Technologies Indonesia."
        : "Setiap kelulusan diterbitkan sertifikat digital resmi ber-QR code unik dan kode validasi permanen yang dapat diverifikasi oleh institusi manapun.",
    },
  ];

  const founders = [
    {
      name: "Dr. G. Prabantoro, SE., MM., CBec.",
      role: isEn ? "Founder & RnD Director" : "Pendiri & Direktur RnD",
      badge: "Founder",
      expertise: isEn ? "Decision Science (AHP & ISM)" : "Pakar Sains Keputusan (AHP & ISM)",
      bio: isEn
        ? "Pioneered Matoh Technologies over two decades. Renowned specialist in scientific decision methodologies (AHP/ISM), public policy prioritization, and MSME growth."
        : "Pelopor utama perjalanan Matoh Technologies sejak tahun 2000. Pakar metodologi sains keputusan (AHP/ISM), perumusan kebijakan institusi, dan akselerasi UMKM.",
      avatar: "/images/avatars/founder-prabantoro.svg",
    },
    {
      name: "Dr. E. Lovita, SE., Ak., M.Si., CA., CSRS., CSRA., CBec.",
      role: isEn ? "Co-Founder & Accounting Board" : "Co-Founder & Dewan Pakar Akuntansi",
      badge: "Co-Founder",
      expertise: isEn ? "Sustainability & Financial Valuation" : "Akuntansi Keberlanjutan & Kelayakan Finansial",
      bio: isEn
        ? "Distinguished scholar and certified specialist in corporate sustainability reporting (CSRS/CSRA), financial feasibility studies, and academic governance."
        : "Akademisi senior dan pakar tersertifikasi pelaporan keberlanjutan perusahaan (CSRS/CSRA), studi kelayakan finansial, dan tata kelola akuntansi strategis.",
      avatar: "/images/avatars/founder-lovita.svg",
    },
    {
      name: "Dr. T. Aminoto, S.Fis., M.Si.",
      role: isEn ? "Co-Founder & Data Science Board" : "Co-Founder & Dewan Pakar Sains Data",
      badge: "Co-Founder",
      expertise: isEn ? "Quantitative Modeling & Higher Ed" : "Pemodelan Kuantitatif & Riset Sains",
      bio: isEn
        ? "Senior scholar spearheading quantitative data modeling, scientific inquiry methodology, and modern pedagogical digitization for researchers and educators."
        : "Akademisi senior yang mengawal metodologi pemodelan data kuantitatif, protokol riset ilmiah terapan, serta inovasi pembelajaran digital perguruan tinggi.",
      avatar: "/images/avatars/founder-aminoto.svg",
    },
    {
      name: "E. Hermawan, ST., M.Kom.",
      role: isEn ? "Co-Founder & IT Engineering Board" : "Co-Founder & Dewan Pakar Rekayasa TI",
      badge: "Co-Founder",
      expertise: isEn ? "Software Architecture & Cloud" : "Arsitektur Perangkat Lunak & Jaringan",
      bio: isEn
        ? "Technology veteran managing scalable cloud architectures, high-availability LMS platform reliability, and secure cryptographic credential infrastructures."
        : "Praktisi teknologi senior yang memimpin arsitektur komputasi awan, keandalan platform LMS asinkron, dan sistem keamanan registri kredensial digital.",
      avatar: "/images/avatars/founder-hermawan.svg",
    },
  ];

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Header */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc] bg-dot-matrix relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold mb-6 shadow-2xs">
            <Image
              src="/images/matoh-logo-v2.png"
              alt="Matoh Technologies"
              width={16}
              height={16}
              priority
              style={{ aspectRatio: "1 / 1" }}
              className="object-contain aspect-square"
            />
            {isEn ? "PT. Matoh Technologies Indonesia" : "Profil PT. Matoh Technologies Indonesia"}
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            Make Home <br />
            <span className="text-gradient">Ready on Digital</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Center of excellence for digital technology adoption, empowering entrepreneurs, MSMEs, educators, and researchers through structured learning and applied consultation."
              : "Menjadi pusat pembelajaran penerapan teknologi digital terbaik bagi pelaku usaha (UMKM), akademisi, dan peserta didik di seluruh Indonesia."}
          </p>
        </div>
      </section>

      {/* History, Milestone Timeline & Legal Standing */}
      <section className="py-20 bg-white border-b border-slate-200/60 bg-blueprint-grid relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
              {isEn ? "Heritage & Legal Standing" : "Sejarah & Transformasi Legalitas"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {isEn ? "Over Two Decades of Digital Literacy Evolution" : "Perjalanan Lebih dari Dua Dekade Literasi Digital Terapan"}
            </h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              {isEn
                ? "From an early internet technology pioneer in 2000 to an accredited modern EdTech institution."
                : "Dari pelopor fasilitas teknologi internet di awal tahun 2000 hingga institusi pendidikan teknologi berbadan hukum resmi."}
            </p>
          </div>

          {/* Visual Milestone Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: 2000 */}
            <div className="bg-slate-50/80 rounded-3xl p-6 shadow-2xs hover:shadow-sm relative transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-blue-600">2000</span>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                    Fase Inisiasi
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  BARQNET
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Berdiri sebagai penyedia fasilitas komputer dan akses internet pertama bagi civitas akademika, mahasiswa, dosen, serta UMKM di Bojonegoro dan sekitarnya.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/50 text-[11px] font-medium text-slate-500">
                ✓ Pelatihan internet & komputer dasar
              </div>
            </div>

            {/* Step 2: 2008 */}
            <div className="bg-slate-50/80 rounded-3xl p-6 shadow-2xs hover:shadow-sm relative transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-blue-600">2008</span>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                    Transformasi Riset
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  Matoh Technologies
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bertransformasi memperluas portofolio layanan pada bimbingan metodologi keputusan ilmiah (AHP/ISM), manajemen riset publikasi, dan digital marketing terapan.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/50 text-[11px] font-medium text-slate-500">
                ✓ Bimbingan MCDM & Scale-Up UMKM
              </div>
            </div>

            {/* Step 3: 2024 - Sekarang */}
            <div className="bg-blue-50/70 rounded-3xl p-6 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-blue-700">2024</span>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
                    Badan Hukum Resmi
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  PT. Matoh Technologies Indonesia
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Resmi berbadan hukum PT terdaftar Kemenkumham RI dengan peluncuran platform LMS otomatis, sistem transkrip kredensial ber-QR, dan verifikasi sertifikat permanen.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-blue-200/60 text-[11px] font-bold text-blue-800">
                ✓ SK Kemenkumham AHU-064920.2024
              </div>
            </div>
          </div>

          {/* Interactive Legal Card */}
          <LegalTrustCard locale={locale} />
        </div>
      </section>

      {/* Concrete Stats (Midnight Studio Contrast) */}
      <section className="py-16 bg-[#0B1120] text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-matrix opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
            {statsList.map(({ value, label }) => (
              <div key={label} className="text-center px-4 pt-4 sm:pt-0">
                <p
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 tracking-tight"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {value}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pedagogical Pillars */}
      <section className="py-20 bg-white border-b border-slate-200/60 bg-dot-matrix-slate relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
              {isEn ? "Core Pillars" : "Keyakinan & Pilar Kami"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "The Foundation Behind Matoh Technologies" : "Fokus Nyata untuk Hasil yang Terukur"}
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              {isEn
                ? "Connecting digital competencies directly to tangible business revenue and research credibility."
                : "Menghubungkan keahlian digital langsung dengan performa pendapatan bisnis dan kredibilitas riset ilmiah."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => (
              <div
                key={p.num}
                className="bento-card bg-white rounded-3xl shadow-sm hover:shadow-md p-7 flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-block mb-5">
                    {p.num}
                  </span>
                  <h3
                    className="font-bold text-slate-900 text-lg mb-3 leading-snug group-hover:text-blue-600 transition-colors"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders & Leadership Board with Large Profile Photos (No Background Banner) */}
      <section className="py-20 sm:py-28 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
              {isEn ? "Founders & Academic Board" : "Dewan Pendiri & Tokoh Akademik"}
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Founders of Matoh Technologies" : "Tokoh Pendiri PT. Matoh Technologies Indonesia"}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
              {isEn
                ? "Scholars, researchers, and technology pioneers who laid the foundational principles and curriculum standards of our institution."
                : "Para akademisi, peneliti senior, dan praktisi teknologi yang merumuskan pondasi ilmiah serta standar kurikulum pembelajaran terapan kami."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {founders.map((person, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Large Profile Photo - Clean & Dominant (Tanpa background banner) */}
                  <div className="relative w-full aspect-square bg-slate-900 overflow-hidden border-b border-slate-100">
                    <Image
                      src={person.avatar}
                      alt={person.name}
                      fill
                      priority
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-blue-700 shadow-sm backdrop-blur-sm">
                        {person.badge}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-xs font-bold text-blue-700 mt-1">
                        {person.role}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{person.expertise}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                      {person.bio}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400 border-t border-slate-100 pt-3">
                    <span>Dewan Kehormatan</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck size={13} />
                      <span>Resmi Terdaftar</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 text-white text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-6">
          <h2
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Ready to Build Your Tech Career?" : "Siap Memulai Langkah Karir Teknologimu?"}
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {isEn
              ? "Explore all curriculum courses or consult with our academic admissions team today."
              : "Jelajahi seluruh katalog silabus kelas atau hubungi tim konsultan kami untuk menemukan jalur belajar terbaik."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors shadow-sm text-sm"
            >
              <span>{isEn ? "Explore Courses" : "Jelajahi Katalog Kelas"}</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-white/80 hover:bg-white/10 text-white font-bold transition-colors text-sm"
            >
              <span>{isEn ? "Contact Us" : "Hubungi Kami & Konsultasi"}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
