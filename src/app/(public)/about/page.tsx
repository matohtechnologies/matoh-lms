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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "en" ? "About Us | PT. Matoh Technologies Indonesia" : "Tentang Kami | PT. Matoh Technologies Indonesia",
    description:
      locale === "en"
        ? "Discover the history, vision, mission, and expert board behind PT. Matoh Technologies Indonesia (AHU-064920.AH.01.30.Tahun 2024) — empowering MSMEs and academia through applied digital technology."
        : "Kenali sejarah, visi, misi, dan tim ahli di balik PT. Matoh Technologies Indonesia (SK Menkumham: AHU-064920.AH.01.30.Tahun 2024) — memberdayakan UMKM dan insan akademik melalui literasi teknologi digital terapan.",
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const [studentsCount, coursesCount, lessonsCount, certsCount, dbInstructors] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    prisma.course.count({ where: { published: true } }).catch(() => 0),
    prisma.lesson.count().catch(() => 0),
    prisma.certificate.count().catch(() => 0),
    prisma.user.findMany({
      where: { role: { in: ["INSTRUCTOR", "ADMIN"] } },
      select: { id: true, name: true, image: true, bio: true, role: true },
      take: 8,
    }).catch(() => []),
  ]);

  const statsList = [
    { value: studentsCount.toLocaleString(), label: isEn ? "Registered Learners" : "Siswa & Peserta Didik" },
    { value: coursesCount.toLocaleString(), label: isEn ? "Published Programs" : "Program Pelatihan" },
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

  const leadership = dbInstructors.map((user) => ({
    id: user.id,
    name: user.name || (user.role === "ADMIN" ? "Admin Matoh Technologies" : "Instruktur"),
    role: user.role === "ADMIN" ? (isEn ? "Platform Administrator" : "Administrator Platform") : (isEn ? "Expert Instructor" : "Dewan Pengajar & Peneliti"),
    experience: isEn ? "Certified Expert" : "Praktisi & Akademisi Terverifikasi",
    bio: user.bio || (isEn ? "Dedicated expert fostering digital literacy and research excellence." : "Pakar dan pembimbing kurikulum terapan PT. Matoh Technologies Indonesia."),
    image: user.image,
  }));

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Header */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs font-bold mb-6 shadow-2xs">
            <Image
              src="/images/matoh-logo.png"
              alt="Matoh Technologies"
              width={16}
              height={16}
              className="object-contain"
            />
            {isEn ? "PT. Matoh Technologies Indonesia" : "Profil PT. Matoh Technologies Indonesia"}
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            Make You <br />
            <span className="text-gradient">Ready Digital</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Center of excellence for digital technology adoption, empowering entrepreneurs, MSMEs, educators, and researchers through structured learning and applied consultation."
              : "Menjadi pusat pembelajaran penerapan teknologi digital terbaik bagi pelaku usaha (UMKM), akademisi, dan peserta didik di seluruh Indonesia."}
          </p>
        </div>
      </section>

      {/* History, Milestone Timeline & Legal Standing */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
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
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 relative hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-blue-600">2000</span>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
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
              <div className="pt-4 mt-4 border-t border-slate-200/80 text-[11px] font-medium text-slate-500">
                ✓ Pelatihan internet & komputer dasar
              </div>
            </div>

            {/* Step 2: 2008 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/90 relative hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-blue-600">2008</span>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
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
              <div className="pt-4 mt-4 border-t border-slate-200/80 text-[11px] font-medium text-slate-500">
                ✓ Bimbingan MCDM & Scale-Up UMKM
              </div>
            </div>

            {/* Step 3: 2024 - Sekarang */}
            <div className="bg-blue-50/60 rounded-3xl p-6 border-2 border-blue-300 relative shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-blue-700">2024</span>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
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
              <div className="pt-4 mt-4 border-t border-blue-200/80 text-[11px] font-bold text-blue-800">
                ✓ SK Kemenkumham AHU-064920.2024
              </div>
            </div>
          </div>

          {/* Interactive Legal Card */}
          <LegalTrustCard locale={locale} />
        </div>
      </section>

      {/* Concrete Stats */}
      <section className="py-14 bg-[#f8fafc] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {statsList.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {value}
                </p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pedagogical Pillars */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
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
                className="bg-[#f8fafc] rounded-3xl border border-slate-200/80 p-7 hover:shadow-warm transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 inline-block mb-5">
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
      {/* Leadership & Instructors */}
      <section className="py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {isEn ? "Instructors & Leadership" : "Tim Akademik & Instruktur"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Mentored Directly by Industry Practitioners" : "Dibimbing Langsung oleh Praktisi Berpengalaman"}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isEn
                ? "Our mentors come from top engineering organizations and have solved real-world scaling challenges."
                : "Pengajar kami adalah praktisi aktif yang berkecimpung langsung dalam pengembangan aplikasi skala besar."}
            </p>
          </div>

          {leadership.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadership.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-warm transition-all group"
                >
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-xs overflow-hidden">
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{person.name.charAt(0)}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {person.name}
                    </h4>
                    <p className="text-xs font-semibold text-blue-700 mt-0.5">{person.role}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>{person.experience}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100">
                      {person.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#f8fafc] rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto">
              <p className="text-slate-600 text-sm">
                {isEn
                  ? "Instructor profiles are currently being updated by the administration team."
                  : "Profil tim pengajar dan instruktur sedang dalam proses sinkronisasi oleh pihak administrasi."}
              </p>
            </div>
          )}
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
              <span>{isEn ? "Explore Programs" : "Jelajahi Katalog Program"}</span>
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
