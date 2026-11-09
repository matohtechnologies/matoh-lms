import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Network,
  Building2,
  FileText,
  MessageSquare,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { FaqAccordion } from "@/components/home/faq-accordion";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    description: isEn
      ? "Strategic consulting, academic decision science mentorship (AHP & ISM), corporate workshops, and financial feasibility advisory from PT. Matoh Technologies Indonesia."
      : "Layanan konsultasi bisnis digital, bimbingan metodologi keputusan ilmiah (AHP & ISM), in-house training korporat, dan studi kelayakan finansial PT. Matoh Technologies Indonesia.",
  };
}

export default async function KonsultanPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const faqItems = isEn
    ? [
      {
        question: "Who can apply for Matoh Technologies consultation programs?",
        answer:
          "Our advisory services are open to MSME business owners, higher education faculties, researchers, postgraduates, local governments, and enterprise teams.",
      },
      {
        question: "How does the AHP and ISM research mentorship work?",
        answer:
          "Mentorship covers the full research lifecycle: questionnaire design with expert panels, pairwise comparison matrices, mathematical consistency checks, MICMAC analysis, and final synthesis for reputable journal publishing.",
      },
      {
        question: "Can we request customized corporate or university workshops?",
        answer:
          "Yes. We regularly formulate tailored syllabi and in-house training for university lecturers, corporate technology divisions, and government agencies.",
      },
      {
        question: "What is the typical timeframe for a consulting project?",
        answer:
          "Project durations typically range from 2 to 12 weeks depending on scope, data collection requirements, and organizational objectives.",
      },
    ]
    : [
      {
        question: "Siapa saja yang dapat mengajukan layanan konsultasi Matoh Technologies?",
        answer:
          "Layanan konsultasi kami terbuka untuk pelaku UMKM, pimpinan korporasi, dinas pemerintah, dosen, peneliti, dan mahasiswa pascasarjana (Magister/Doktor).",
      },
      {
        question: "Bagaimana alur bimbingan metodologi riset AHP dan ISM?",
        answer:
          "Bimbingan mencakup perumusan model hierarki, desain kuisioner pakar, pengujian rasio konsistensi matematis, pengelompokan variabel MICMAC, hingga penyusunan interpretasi hasil untuk jurnal bereputasi.",
      },
      {
        question: "Apakah instansi kampus atau perusahaan dapat memesan pelatihan khusus in-house?",
        answer:
          "Tentu saja. Kami secara berkala menyelenggarakan in-house training dengan silabus yang disesuaikan secara spesifik dengan target kompetensi tim internal Anda.",
      },
      {
        question: "Berapa lama durasi pelaksanaan pendampingan konsultasi?",
        answer:
          "Durasi bimbingan umumnya berlangsung antara 2 hingga 12 minggu, tergantung pada kompleksitas topik, pengumpulan data pakar, dan target luaran yang diharapkan.",
      },
    ];

  return (
    <div className="pt-20 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 min-h-screen">
      {/* Header / Hero */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Transformative Business & Research Advisory" : "Konsultasi Transformasi Digital, Riset & Bisnis"}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? "Holistic advisory programs delivered by seasoned scholars and technology practitioners for MSME growth, academic theses, and corporate excellence."
                : "Solusi pendampingan langsung dari akademisi dan praktisi teknologi berpengalaman untuk akselerasi UMKM, bimbingan metodologi keputusan ilmiah, dan pelatihan in-house."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href="https://wa.me/6281210106680?text=Halo%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20layanan%20konsultan."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs"
              >
                <MessageSquare size={16} />
                <span>WhatsApp Hotline Resmi</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-sm transition-colors"
              >
                <span>{isEn ? "Submit Inquiry" : "Hubungi via Formulir"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars of Consulting */}
      <section className="py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Our Advisory Domains" : "4 Pilar Layanan Konsultasi"}
            </h2>
            <p className="text-base text-slate-500 mt-2">
              {isEn
                ? "Tailored guidance for business leaders, academics, and institutions."
                : "Pendampingan terarah untuk kebutuhan bisnis, riset akademik, dan peningkatan kapasitas SDM."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Pillar 1 */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? "MSME Digital Transformation" : "Pendampingan Digital UMKM"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Strategy blueprints for digital marketing, automated inventory systems, and conversion funnels proven to boost revenue up to 70%."
                    : "Strategi komprehensif adopsi digital marketing, automasi operasional inventori, dan saluran penjualan online yang terbukti meningkatkan omzet hingga 70%."}
                </p>
              </div>
              <p className="pt-4 mt-5 border-t border-slate-100 text-xs font-semibold text-blue-600">
                Target: Omzet +70%
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Network size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? "Decision Science (AHP/ISM)" : "Bimbingan Riset Keputusan"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Expert mentorship for researchers, postgraduates, and policy makers applying AHP, ISM, and multi-criteria evaluations."
                    : "Bimbingan metodologi AHP dan ISM untuk penulisan tesis, disertasi, serta perumusan kebijakan publik yang kredibel dan objektif."}
                </p>
              </div>
              <p className="pt-4 mt-5 border-t border-slate-100 text-xs font-semibold text-blue-600">
                Riset &amp; Kebijakan Publik
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? "Corporate In-House Training" : "Workshop & In-House Training"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Custom workshops designed for university faculties, state enterprises (BUMN), and corporate teams with hands-on labs."
                    : "Pelatihan khusus dengan kurikulum tailor-made untuk instansi kampus, dinas pemerintahan, dan korporasi."}
                </p>
              </div>
              <p className="pt-4 mt-5 border-t border-slate-100 text-xs font-semibold text-blue-600">
                Kurikulum Kustom Institusi
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isEn ? "Feasibility & Valuation" : "Studi Kelayakan & Valuasi"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Financial modeling, digital investment auditing, and business valuation led by Dr. Retno Wulandari, S.E., M.Si."
                    : "Analisis kelayakan investasi digital, pemodelan finansial, dan audit valuasi bisnis bersama pakar keuangan berpengalaman."}
                </p>
              </div>
              <p className="pt-4 mt-5 border-t border-slate-100 text-xs font-semibold text-blue-600">
                Audit Investasi Finansial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory FAQ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1.5 rounded-full mb-3">
              <HelpCircle size={13} className="text-blue-600" />
              <span>FAQ Konsultasi</span>
            </span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}

