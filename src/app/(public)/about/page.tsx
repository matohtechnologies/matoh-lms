import Link from "next/link";
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
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "en" ? "About Us | Earthy Academy" : "Tentang Kami | Earthy Academy",
    description:
      locale === "en"
        ? "Discover the story, pedagogical pillars, and expert team behind Earthy Academy — bridging Indonesia's talent gap with industry-grade software education."
        : "Kenali kisah, pilar pembelajaran, dan tim praktisi di balik Earthy Academy — menjembatani kesenjangan talenta digital Indonesia melalui kurikulum berstandar industri.",
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const pillars = [
    {
      num: "01",
      title: isEn ? "Production-Grade Projects" : "Proyek Riil Standar Industri",
      desc: isEn
        ? "No copy-pasting tutorials. Every syllabus requires building tested, deployable software using current stacks like Next.js 15, TypeScript, PostgreSQL, and Docker."
        : "Bukan sekadar menonton video tutorial. Setiap siswa ditantang membangun produk utuh siap pakai yang diuji langsung, siap diinspeksi oleh recruiter perusahaan teknologi.",
    },
    {
      num: "02",
      title: isEn ? "Personal Code Reviews" : "Review Kode & Mentorship Personal",
      desc: isEn
        ? "Assignments are reviewed line-by-line by seasoned practitioners. You learn best practices, clean architecture, and how code reviews work in real engineering teams."
        : "Setiap penugasan dan proyek akhir diperiksa baris per baris oleh praktisi berpengalaman. Siswa mendapatkan feedback terukur mengenai arsitektur kode dan best practice.",
    },
    {
      num: "03",
      title: isEn ? "Verifiable Academic Credentials" : "Kredensial Resmi Berbasis QR",
      desc: isEn
        ? "Every certificate of completion is backed by an immutable credential ID and complete competency transcript, allowing employers to verify scores instantly."
        : "Setiap lulusan dibekali sertifikat resmi dengan ID kredensial unik dan transkrip nilai dua sisi yang dapat diverifikasi secara publik oleh perusahaan manapun secara real-time.",
    },
    {
      num: "04",
      title: isEn ? "Industry Hiring Ecosystem" : "Jaringan Komunitas & Karir",
      desc: isEn
        ? "Connect with a growing network of tech professionals, alumni working at leading tech firms, and hiring partners actively scouting modern digital talent."
        : "Terhubung langsung dengan ribuan alumni yang kini berkarir di decacorn, perbankan, dan agensi terkemuka di Indonesia dan regional Asia Tenggara.",
    },
  ];

  const leadership = [
    {
      name: "Arif Wibowo",
      role: "Founder & Chief Executive",
      experience: "Ex-Engineering Lead Tokopedia & Traveloka",
      bio: "10+ tahun pengalaman membangun sistem backend berskala puluhan juta transaksi per hari. Berkomitmen mentransformasi talenta rekayasa perangkat lunak Indonesia.",
    },
    {
      name: "Dr. Budi Santoso",
      role: "Head of Academic Curriculum & AI",
      experience: "Ph.D. in Computer Science (ITB), Ex-Senior Data Scientist",
      bio: "Peneliti dan praktisi Machine Learning dengan 15+ publikasi internasional. Merancang kurikulum sains data praktis yang relevan dengan kebutuhan industri mutakhir.",
    },
    {
      name: "Sarah Kusuma",
      role: "Head of Product Design & Experience",
      experience: "Ex-Lead Product Designer Unicorn",
      bio: "Membimbing ratusan desainer produk digital memahami riset pengguna empiris, Design System terstruktur, dan prototipe interaktif berstandar global.",
    },
    {
      name: "Ahmad Fadhil",
      role: "Lead Software Architect",
      experience: "Senior Fullstack Engineer & AWS Certified Specialist",
      bio: "Spesialis arsitektur frontend modern, performa web, dan continuous integration. Memastikan kurikulum coding Earthy Academy selalu relevan dengan versi produksi terkini.",
    },
  ];

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Header */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold mb-6 shadow-2xs">
            <BookOpen size={14} className="text-blue-600" />
            {isEn ? "About Earthy Academy" : "Mengenal Earthy Academy"}
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {isEn ? "Built by Engineers," : "Dibuat oleh Praktisi,"} <br />
            <span className="text-gradient">
              {isEn ? "For the Next Generation of Builders" : "Untuk Generasi Baru Talenta Digital"}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "We bridge the gap between academic theory and real-world software engineering through hands-on projects, rigorous code reviews, and transparent accredited credentials."
              : "Kami didirikan dengan satu misi nyata: menutup jurang antara teori akademik tradisional dan kebutuhan industri teknologi yang dinamis melalui kurikulum praktis berbasis proyek produksi."}
          </p>
        </div>
      </section>

      {/* Concrete Stats */}
      <section className="py-14 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "12,400+", label: isEn ? "Graduated Students" : "Siswa & Alumni Aktif" },
              { value: "240+", label: isEn ? "Curriculum Modules" : "Modul & Kelas Tersedia" },
              { value: "94.2%", label: isEn ? "Course Completion Rate" : "Tingkat Kelulusan Program" },
              { value: "4.9 / 5.0", label: isEn ? "Average Alumni Rating" : "Rating Kepuasan Belajar" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
                  style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {isEn ? "Our Learning Methodology" : "Metodologi Pembelajaran Kami"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {isEn ? "The 4 Standards Behind Every Curriculum" : "4 Pilar Standar Kualitas Earthy Academy"}
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              {isEn
                ? "Every program is designed to transform enthusiastic learners into confident, job-ready technology professionals."
                : "Setiap kelas dirancang sistematis agar siswa memiliki portofolio yang dapat diandalkan saat wawancara kerja."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => (
              <div
                key={p.num}
                className="bg-white rounded-3xl border border-slate-200/80 p-7 hover:shadow-warm transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 inline-block mb-5">
                    {p.num}
                  </span>
                  <h3
                    className="font-bold text-slate-900 text-lg mb-3 leading-snug group-hover:text-blue-600 transition-colors"
                    style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
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
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {isEn ? "Mentored Directly by Industry Practitioners" : "Dibimbing Langsung oleh Praktisi Berpengalaman"}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isEn
                ? "Our mentors come from top engineering organizations and have solved real-world scaling challenges."
                : "Pengajar kami adalah praktisi aktif yang berkecimpung langsung dalam pengembangan aplikasi skala besar."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((person) => (
              <div
                key={person.name}
                className="bg-[#f8fafc] rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between hover:border-blue-200 hover:bg-blue-50/20 transition-all"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-xs">
                    {person.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{person.name}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{person.role}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 pb-3 border-b border-slate-200/60">
                    {person.experience}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-3">{person.bio}</p>
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
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {isEn ? "Ready to Build Your Tech Career?" : "Siap Memulai Langkah Karir Teknologimu?"}
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {isEn
              ? "Explore all 240+ structured modules or consult with our academic admissions team today."
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
