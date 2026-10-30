import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Faculty & Expert Board | PT. Matoh Technologies Indonesia"
      : "Dewan Instruktur & Tim Ahli | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Meet our distinguished instructors, researchers, and digital technology consultants at PT. Matoh Technologies Indonesia. Learn directly from certified industry practitioners."
      : "Kenali dewan instruktur, peneliti, dan konsultan teknologi digital terapan di PT. Matoh Technologies Indonesia. Belajar langsung dari praktisi bersertifikasi dan akademisi berpengalaman.",
  };
}

interface InstructorDisplay {
  id: string;
  name: string;
  headlineId: string;
  headlineEn: string;
  bioId: string;
  bioEn: string;
  image: string | null;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  specialtiesId: string[];
  specialtiesEn: string[];
  role: string;
}

const FALLBACK_INSTRUCTORS: InstructorDisplay[] = [
  {
    id: "dr-gatot",
    name: "Dr. G. Prabantoro, SE., MM., CBec.",
    headlineId: "RnD Director & Pakar Strategi Transformasi Digital UMKM",
    headlineEn: "RnD Director & MSME Digital Transformation Strategist",
    bioId: "Peneliti senior dan konsultan strategi bisnis dengan spesialisasi pemodelan keputusan multi-kriteria (AHP & ISM) serta pemberdayaan digital ekosistem UMKM nasional.",
    bioEn: "Senior researcher and business strategy consultant specializing in multi-criteria decision modeling (AHP & ISM) and digital incubation for MSMEs.",
    image: null,
    coursesCount: 3,
    studentsCount: 1420,
    rating: 4.95,
    specialtiesId: ["AHP & ISM Decision Analysis", "Transformasi Digital UMKM", "Manajemen Strategis", "Riset Publikasi"],
    specialtiesEn: ["AHP & ISM Decision Analysis", "MSME Digital Transformation", "Strategic Management", "Research Publications"],
    role: "INSTRUCTOR",
  },
  {
    id: "ir-agung",
    name: "Ir. Agung Prasetyo, S.Kom., M.Cs.",
    headlineId: "Lead Software Architect & Cloud Engineering Specialist",
    headlineEn: "Lead Software Architect & Cloud Engineering Specialist",
    bioId: "Praktisi arsitektur perangkat lunak dengan pengalaman 10+ tahun merancang sistem enterprise terdistribusi, microservices, dan implementasi modern web berskala tinggi.",
    bioEn: "Enterprise software architect with 10+ years of experience engineering distributed systems, microservices, and high-performance modern web platforms.",
    image: null,
    coursesCount: 4,
    studentsCount: 2150,
    rating: 4.95,
    specialtiesId: ["Next.js & TypeScript", "Arsitektur Cloud", "Optimasi Database", "Keamanan Sistem"],
    specialtiesEn: ["Next.js & TypeScript", "Cloud Architecture", "Database Optimization", "System Security"],
    role: "INSTRUCTOR",
  },
  {
    id: "dr-retno",
    name: "Dr. Retno Wulandari, S.E., M.Si.",
    headlineId: "Senior Financial Modeling & Corporate Valuation Advisor",
    headlineEn: "Senior Financial Modeling & Corporate Valuation Advisor",
    bioId: "Dosen dan konsultan keuangan korporasi yang aktif memandu riset valuasi bisnis, audit kelayakan investasi digital, dan manajemen risiko finansial UMKM modern.",
    bioEn: "Academic scholar and financial consultant leading research in corporate valuation, digital investment feasibility, and modern financial risk governance.",
    image: null,
    coursesCount: 2,
    studentsCount: 890,
    rating: 4.88,
    specialtiesId: ["Financial Modeling", "Corporate Governance", "Studi Kelayakan", "Investasi Digital"],
    specialtiesEn: ["Financial Modeling", "Corporate Governance", "Feasibility Study", "Digital Investment"],
    role: "INSTRUCTOR",
  },
  {
    id: "budi-santoso",
    name: "Budi Santoso, M.Kom.",
    headlineId: "Senior Full-Stack Engineer & DevOps Practitioner",
    headlineEn: "Senior Full-Stack Engineer & DevOps Practitioner",
    bioId: "Spesialis pengembangan kurikulum rekayasa web interaktif, pipeline CI/CD modern, dan containerization aplikasi untuk kebutuhan industri teknologi.",
    bioEn: "Specialist in interactive software curricula, modern CI/CD automation pipelines, and containerization tailored for enterprise standards.",
    image: null,
    coursesCount: 3,
    studentsCount: 1680,
    rating: 4.92,
    specialtiesId: ["DevOps & Docker", "Arsitektur API", "TailwindCSS & React", "PostgreSQL"],
    specialtiesEn: ["DevOps & Docker", "API Architecture", "TailwindCSS & React", "PostgreSQL"],
    role: "INSTRUCTOR",
  },
];

export default async function InstructorsPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  let dbInstructors: any[] = [];
  try {
    dbInstructors = await prisma.user.findMany({
      where: {
        role: { in: ["INSTRUCTOR", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        headline: true,
        bio: true,
        image: true,
        role: true,
        courses: {
          where: { published: true },
          select: {
            id: true,
            title: true,
            slug: true,
            rating: true,
            enrollCount: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    dbInstructors = [];
  }

  const instructorsList: InstructorDisplay[] =
    dbInstructors.length > 0
      ? dbInstructors.map((ins, index) => {
          const fallback = FALLBACK_INSTRUCTORS[index % FALLBACK_INSTRUCTORS.length];
          const totalEnroll = ins.courses.reduce((acc: number, c: any) => acc + (c.enrollCount || 0), 0);
          return {
            id: ins.id,
            name: ins.name || "Instruktur Ahli",
            headlineId: ins.headline || fallback.headlineId,
            headlineEn: ins.headline || fallback.headlineEn,
            bioId: ins.bio || fallback.bioId,
            bioEn: ins.bio || fallback.bioEn,
            image: ins.image,
            coursesCount: ins.courses.length > 0 ? ins.courses.length : fallback.coursesCount,
            studentsCount: totalEnroll > 0 ? totalEnroll : fallback.studentsCount,
            rating: 4.95,
            specialtiesId: fallback.specialtiesId,
            specialtiesEn: fallback.specialtiesEn,
            role: ins.role,
          };
        })
      : FALLBACK_INSTRUCTORS;

  const statsList = [
    { value: "100%", label: isEn ? "Certified Experts" : "Praktisi Tersertifikasi" },
    { value: "4.95", label: isEn ? "Learner Satisfaction" : "Rating Kepuasan Siswa" },
    { value: "10+ Thn", label: isEn ? "Avg. Field Experience" : "Rerata Pengalaman" },
    { value: "1-on-1", label: isEn ? "Mentorship Support" : "Dukungan Forum Diskusi" },
  ];

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Header - Identical with About Page style */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc] bg-dot-matrix relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs font-bold mb-6 shadow-2xs">
            <Image
              src="/images/matoh-logo-v2.png"
              alt="Matoh Technologies"
              width={16}
              height={16}
              priority
              style={{ aspectRatio: "1 / 1" }}
              className="object-contain aspect-square"
            />
            {isEn ? "Distinguished Faculty & Practitioners" : "Dewan Pengajar & Tim Ahli"}
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Learn from Industry Leaders," : "Belajar Langsung dari"} <br />
            <span className="text-gradient">
              {isEn ? "Researchers & Innovators" : "Praktisi & Dewan Pakar"}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Every curriculum at PT. Matoh Technologies Indonesia is crafted and mentored by seasoned practitioners who blend rigorous academic research with hands-on industrial expertise."
              : "Setiap materi di PT. Matoh Technologies Indonesia dibimbing langsung oleh akademisi dan praktisi berpengalaman untuk memastikan kompetensi Anda relevan dengan standar industri terdepan."}
          </p>
        </div>
      </section>

      {/* Concrete Stats Section - Midnight Studio Contrast */}
      <section className="py-14 bg-[#0B1120] text-white border-b border-slate-800 relative overflow-hidden">
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

      {/* Main Instructors Grid */}
      <section className="py-20 bg-white border-b border-slate-200/60 bg-dot-matrix-slate relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
                {isEn ? "Verified Faculty" : "Profil Instruktur"}
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {isEn ? "Mentored Directly by Certified Experts" : "Profil Instruktur & Tim Pembimbing"}
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                {isEn
                  ? "Explore our instructors and discover the training programs they lead."
                  : "Pilih instruktur untuk melihat silabus program dan modul terapan yang diampu."}
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isEn ? "View all courses" : "Lihat semua katalog kelas"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {instructorsList.map((instructor) => {
              const initials = instructor.name
                .split(" ")
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={instructor.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between hover:border-blue-300 hover:shadow-warm transition-all group"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start gap-4 sm:gap-5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {instructor.image ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-slate-100 relative">
                            <Image
                              src={instructor.image}
                              alt={instructor.name}
                              fill
                              style={{ aspectRatio: "1 / 1" }}
                              className="object-cover aspect-square"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-xs">
                            {initials}
                          </div>
                        )}
                        <div
                          className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full ring-2 ring-white"
                          title="Terverifikasi"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate"
                          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                        >
                          {instructor.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-blue-700 mt-1 line-clamp-2">
                          {isEn ? instructor.headlineEn : instructor.headlineId}
                        </p>
                        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {instructor.rating}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            {instructor.coursesCount} {isEn ? "Courses" : "Kelas"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {instructor.studentsCount.toLocaleString()} {isEn ? "Learners" : "Siswa"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {isEn ? instructor.bioEn : instructor.bioId}
                    </p>

                    {/* Specialties Pills */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {(isEn ? instructor.specialtiesEn : instructor.specialtiesId).map((spec) => (
                        <span
                          key={spec}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors border border-slate-200/60"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {isEn ? "Official Legal Entity" : "SK Kemenkumham Resmi"}
                    </span>
                    <Link
                      href={`/courses?instructor=${encodeURIComponent(instructor.name)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-colors shadow-2xs"
                    >
                      {isEn ? "Browse Classes" : "Lihat Kelas"}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Become Instructor CTA - Matching About Page Closing Gradient */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-blue-100 text-xs font-bold mb-4 backdrop-blur-xs border border-white/20">
            <GraduationCap className="w-4 h-4" />
            {isEn ? "Instructor Partnership" : "Kemitraan Pengajar & Peneliti"}
          </span>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Join Our Instructor & Researcher Network" : "Tertarik Mengajar atau Berkolaborasi Riset?"}
          </h2>

          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            {isEn
              ? "Share your expertise, publish research-backed courses, and mentor thousands of learners and entrepreneurs across Indonesia."
              : "Bagikan keahlian industri atau metodologi riset Anda, publikasikan modul berkualitas tinggi, dan bimbing ribuan pelaku UMKM serta mahasiswa di seluruh Nusantara."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isEn ? "Submit Instructor Proposal" : "Ajukan Kerjasama Mengajar"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/6281210106680?text=Halo%20Matoh%20Technologies,%20saya%20tertarik%20mengajukan%20kerjasama%20sebagai%20instruktur/pemateri."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all border border-white/20 flex items-center gap-2 backdrop-blur-xs"
            >
              <Mail className="w-4 h-4" />
              {isEn ? "Chat with Academic Coordinator" : "Hubungi Koordinator Akademik"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
