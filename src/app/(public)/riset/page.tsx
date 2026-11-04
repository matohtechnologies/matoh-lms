import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Network,
  Layers,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Quote,
  MessageSquare,
  FileText,
  Building2,
  Users,
  Compass,
  Award,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Applied Research & Decision Science (AHP & ISM) | PT. Matoh Technologies Indonesia"
      : "Riset Terapan & Sains Keputusan Ilmiah (AHP & ISM) | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Official applied research division of PT. Matoh Technologies Indonesia. Specializing in Multi-Criteria Decision Making (AHP), Interpretive Structural Modeling (ISM), and business forecasting."
      : "Divisi riset terapan resmi PT. Matoh Technologies Indonesia. Spesialisasi dalam sains keputusan multi-kriteria (AHP), pemodelan hierarkis struktural (ISM), dan peramalan bisnis terukur.",
  };
}

export default async function RisetPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div className="pt-20 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 min-h-screen">
      {/* Header / Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              <Sparkles size={13} className="text-indigo-600" />
              <span>{isEn ? "RnD & Decision Science Division" : "Divisi Riset & Sains Keputusan"}</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Applied Research & Scientific Methodologies" : "Metodologi Ilmiah & Riset Terapan"}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? "Bridging rigorous academic decision modeling with real-world industry adoption, public policy priorities, and MSME digital transformation."
                : "Menjembatani metodologi pengambilan keputusan ilmiah (AHP & ISM) dengan implementasi riil industri, kebijakan publik, dan akselerasi UMKM."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href="https://wa.me/6281210106680?text=Halo%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20bimbingan%20riset%20dan%20metodologi%20AHP/ISM."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-xs"
              >
                <MessageSquare size={16} />
                <span>{isEn ? "Research Consultation" : "Konsultasi Bimbingan Riset"}</span>
              </a>

              <Link
                href="/publikasi"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-sm transition-colors"
              >
                <span>{isEn ? "View Publications" : "Lihat Karya Publikasi"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Core Pillars: AHP, ISM & Forecasting */}
      <section className="py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Core Methodological Frameworks" : "Kerangka Metodologi Utama"}
            </h2>
            <p className="text-base text-slate-500 mt-2">
              {isEn
                ? "Standardized scientific frameworks developed to address multi-dimensional complexities."
                : "Standar metode ilmiah kuantitatif dan kualitatif teruji untuk pengambilan keputusan multi-kriteria."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Framework 1: AHP */}
            <div className="border border-slate-200 rounded-xl p-8 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded">
                    MCDM Analysis
                  </span>
                  <Network size={22} className="text-blue-600" />
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900">
                  Analytic Hierarchy Process (AHP)
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "A structured technique for organizing and analyzing complex multi-criteria decisions based on mathematics and expert psychology. Enables policy makers to calculate objective priority weights with rigorous consistency tests."
                    : "Metode dekomposisi hierarki keputusan multi-kriteria berbasis matriks perbandingan berpasangan (pairwise comparisons) dengan validasi Consistency Ratio (CR < 0.10) guna menghasilkan bobot prioritas yang objektif."}
                </p>

                <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>{isEn ? "Pairwise Comparison Matrices with Saaty's 1-9 Scale" : "Matriks Perbandingan Berpasangan Skala 1-9 Saaty"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>{isEn ? "Mathematical Consistency Ratio (CR < 0.10) Guarantee" : "Uji Rasio Konsistensi Matematis (CR < 0.10)"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <span>{isEn ? "Multi-Stakeholder Expert Synthesis" : "Sintesis Penilaian Pakar Multi-Disiplin"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Penerapan: Kebijakan Publik &amp; UMKM</span>
                <span className="text-blue-600 font-semibold">Tervalidasi Ilmiah</span>
              </div>
            </div>

            {/* Framework 2: ISM */}
            <div className="border border-slate-200 rounded-xl p-8 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded">
                    Structural Modeling
                  </span>
                  <Layers size={22} className="text-indigo-600" />
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900">
                  Interpretive Structural Modeling (ISM)
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "An interactive learning process where a set of directly and indirectly related elements are structured into a comprehensive systemic digraph. Classifies driving power and dependence via MICMAC analysis."
                    : "Metodologi pemodelan terstruktur untuk mentransformasikan relasi kontekstual variabel sistem yang kompleks menjadi model hierarki digraf terarah, dilengkapi analisis klasifikasi kuadran MICMAC."}
                </p>

                <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span>{isEn ? "Structural Self-Interaction Matrix (SSIM)" : "Penyusunan Matriks SSIM Berbasis Pakar"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span>{isEn ? "Reachability & Level Partitioning Digraph" : "Matriks Keterjangkauan & Partisi Level Hierarkis"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span>{isEn ? "MICMAC Classification (Autonomous, Dependent, Linkage, Driver)" : "Analisis Kuadran MICMAC (Driving Power vs Dependency)"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Penerapan: Desain Strategi Institusi</span>
                <span className="text-indigo-600 font-semibold">Model Digraf Kontekstual</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Research Philosophy */}
      <section className="py-16 sm:py-24 border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-xs space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              <Quote size={13} className="text-blue-600" />
              <span>{isEn ? "Research Direction & Philosophy" : "Arah & Komitmen Riset Terapan"}</span>
            </div>

            <blockquote className="text-lg sm:text-xl text-slate-800 font-medium leading-relaxed italic">
              &ldquo;{isEn
                ? "Mastering digital technology is as fundamental as breathing. For businesses, MSMEs, and educational institutions to thrive sustainably, adopting proven decision models and applied technology is essential."
                : "Menguasai teknologi digital sama pentingnya seperti kita hidup perlu bernafas. Kalau kita masih mau tetap hidup ya kita harus selalu bisa bernafas. Begitu pula dengan bisnis dan pendidikan, pelakunya harus menguasai teknologi digital supaya bisa selalu hidup dalam setiap kerja bisnis dan pendidikannya..."}&rdquo;
            </blockquote>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-xs">
                  <Image
                    src="/images/avatars/founder-prabantoro.svg"
                    alt="Dr. G. Prabantoro, SE., MM., CBec."
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Dr. G. Prabantoro, SE., MM., CBec.</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Founder &amp; RnD Director • PT. Matoh Technologies Indonesia</p>
                  <p className="text-[11px] text-blue-600 font-mono mt-0.5">Slogan: Make You Ready on Digital</p>
                </div>
              </div>

              <a
                href="https://wa.me/6281210106680?text=Halo%20Dr.%20G.%20Prabantoro,%20saya%20ingin%20konsultasi%20riset%20dan%20metodologi%20AHP/ISM."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
              >
                <MessageSquare size={14} />
                <span>Konsultasi Langsung via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Research Services & Consultation Offerings */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Research Services & Academic Advisory" : "Layanan Riset & Bimbingan Akademik"}
            </h2>
            <p className="text-base text-slate-500 mt-2">
              {isEn
                ? "Collaborative research and consultation programs for universities, government bodies, and corporate teams."
                : "Program bimbingan riset terstruktur untuk mahasiswa pascasarjana, dosen, perguruan tinggi, dan instansi."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Bimbingan Tesis &amp; Disertasi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pendampingan intensif perumusan kuisioner pakar, pengolahan matriks AHP &amp; ISM, dan interpretasi hasil untuk publikasi jurnal ilmiah bereputasi.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Riset Kebijakan Publik (Pemda/BUMN)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penyusunan naskah kebijakan berbasis analisis multikriteria objektif dan pemetaan hierarki variabel kunci implementasi strategis.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Workshop &amp; In-House Training</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pelatihan praktis penggunaan software keputusan (Expert Choice, SuperDecisions, ISM toolkit) untuk tim akademisi dan perencana kebijakan.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-xs"
            >
              <span>{isEn ? "Submit Research Inquiry" : "Ajukan Kerjasama Riset"}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

