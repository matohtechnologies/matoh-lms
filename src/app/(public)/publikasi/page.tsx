import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Research Publications & Technology Insights | PT. Matoh Technologies Indonesia"
      : "Publikasi Riset & Wawasan Teknologi | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Collection of applied research papers, decision science methodologies (AHP & ISM), and software engineering articles by PT. Matoh Technologies Indonesia."
      : "Kumpulan artikel publikasi riset terapan, sains keputusan ilmiah (AHP & ISM), dan arsitektur rekayasa teknologi PT. Matoh Technologies Indonesia.",
  };
}

interface PublicationItem {
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  categoryId: string;
  categoryEn: string;
  author: string;
  authorRole: string;
  dateId: string;
  dateEn: string;
  readTimeId: string;
  readTimeEn: string;
  tags: string[];
}

const PUBLICATIONS: PublicationItem[] = [
  {
    slug: "penerapan-ahp-ism-prioritas-digitalisasi-umkm",
    titleId: "Penerapan Metodologi AHP dan ISM dalam Menentukan Prioritas Digitalisasi UMKM Indonesia",
    titleEn: "Applying AHP and ISM Methodologies to Prioritize Indonesian MSME Digitalization Strategies",
    excerptId: "Bagaimana kombinasi Analytic Hierarchy Process (AHP) dan Interpretive Structural Modeling (ISM) membantu para pengambil kebijakan memetakan strategi digitalisasi yang paling berdampak langsung pada peningkatan omzet.",
    excerptEn: "How combining the Analytic Hierarchy Process (AHP) and Interpretive Structural Modeling (ISM) empowers policymakers and business leaders to identify high-impact digital transformation priorities.",
    categoryId: "Decision Science",
    categoryEn: "Decision Science",
    author: "Dr. G. Prabantoro, SE., MM., CBec.",
    authorRole: "RnD Director PT. Matoh Technologies Indonesia",
    dateId: "18 Oktober 2026",
    dateEn: "October 18, 2026",
    readTimeId: "7 menit baca",
    readTimeEn: "7 min read",
    tags: ["AHP", "ISM", "UMKM", "Decision Science"],
  },
  {
    slug: "strategi-transformasi-digital-umkm-2026",
    titleId: "Roadmap Transformasi Digital UMKM: Dari Pemasaran AI hingga Otomasi Manajemen Inventori",
    titleEn: "MSME Digital Transformation Roadmap: From AI Marketing to Inventory Automation",
    excerptId: "Panduan komprehensif bagi pelaku usaha kecil dan menengah untuk mengadopsi platform digital secara efisien tanpa pembengkakan biaya modal maupun operasional.",
    excerptEn: "A comprehensive roadmap for small and medium enterprises to adopt modern digital workflows efficiently without ballooning capital and operational expenses.",
    categoryId: "Transformasi Digital",
    categoryEn: "Digital Transformation",
    author: "Tim Konsultan Matoh Tech",
    authorRole: "Divisi Konsultasi Bisnis & UMKM",
    dateId: "14 Oktober 2026",
    dateEn: "October 14, 2026",
    tags: ["E-Commerce", "Otomasi", "Strategi Bisnis"],
    readTimeId: "5 menit baca",
    readTimeEn: "5 min read",
  },
  {
    slug: "arsitektur-web-modern-nextjs-app-router",
    titleId: "Membangun Platform Web Skalabel dengan Next.js App Router dan Standalone Container",
    titleEn: "Architecting Scalable Enterprise Web Platforms with Next.js App Router and Containers",
    excerptId: "Eksplorasi teknis mengenai performa streaming SSR, Content Security Policy (CSP) ketat, dan optimasi aset untuk performa loading di bawah 1 detik.",
    excerptEn: "A technical deep-dive into streaming server components, hardened Content Security Policies (CSP), and asset optimizations for sub-second page loads.",
    categoryId: "Rekayasa Web",
    categoryEn: "Web Engineering",
    author: "Ir. Agung Prasetyo, M.Cs.",
    authorRole: "Lead Software Architect",
    dateId: "10 Oktober 2026",
    dateEn: "October 10, 2026",
    tags: ["Next.js", "TypeScript", "Performance"],
    readTimeId: "6 menit baca",
    readTimeEn: "6 min read",
  },
  {
    slug: "pentingnya-sertifikasi-kompetensi-terverifikasi",
    titleId: "Mengapa Sertifikat Digital Berbasis QR Code dan SK Kemenkumham Krusial bagi Lulusan?",
    titleEn: "Why QR-Verifiable Certificates with Legal Corporate Backing Matter to Recruiters",
    excerptId: "Menganalisis pergeseran paradigma rekrutmen industri saat ini terhadap verifikasi keabsahan sertifikat portofolio kandidat secara instan dan permanen.",
    excerptEn: "Examining why modern industry recruiters prioritize tamper-proof digital credentials verified by legal corporate registries over unverified certificates.",
    categoryId: "Sertifikasi",
    categoryEn: "Certification",
    author: "Dr. Retno Wulandari, M.Si.",
    authorRole: "Senior Academic Advisor",
    dateId: "05 Oktober 2026",
    dateEn: "October 05, 2026",
    tags: ["Sertifikasi", "Verifikasi QR", "Standar Industri"],
    readTimeId: "4 menit baca",
    readTimeEn: "4 min read",
  },
  {
    slug: "audit-keamanan-api-dan-autentikasi",
    titleId: "Praktik Terbaik Mengamankan API Endpoint & Manajemen Token Sesi pada Aplikasi Enterprise",
    titleEn: "Best Practices for Hardening API Endpoints and Session Token Security in Enterprise Apps",
    excerptId: "Langkah-langkah mitigasi serangan path traversal, null byte injection, serta implementasi rate limiting adaptif pada REST/RPC API modern.",
    excerptEn: "Defensive engineering techniques to mitigate path traversal, null byte injection, and adaptive rate limiting across mission-critical REST/RPC APIs.",
    categoryId: "Keamanan Sistem",
    categoryEn: "System Security",
    author: "Budi Santoso, M.Kom.",
    authorRole: "Senior DevOps & Cloud Engineer",
    dateId: "28 September 2026",
    dateEn: "September 28, 2026",
    tags: ["Cybersecurity", "Rate Limiting", "API Protection"],
    readTimeId: "8 menit baca",
    readTimeEn: "8 min read",
  },
  {
    slug: "penerbitan-riset-akademik-dan-haki",
    titleId: "Panduan Menjembatani Riset Akademik Kampus Menjadi Produk Teknologi yang Berkelanjutan",
    titleEn: "Bridging Academic Research to Market-Ready Technological Solutions",
    excerptId: "Tahapan perlindungan hak kekayaan intelektual (HAKI) dan strategi hilirisasi penelitian dosen/mahasiswa agar siap diadopsi oleh pasar industri.",
    excerptEn: "Essential steps for Intellectual Property protection (IP) and commercialization strategies for academic research into viable industry products.",
    categoryId: "Riset & Inovasi",
    categoryEn: "Research & Innovation",
    author: "Dr. G. Prabantoro, SE., MM., CBec.",
    authorRole: "RnD Director PT. Matoh Technologies Indonesia",
    dateId: "20 September 2026",
    dateEn: "September 20, 2026",
    tags: ["HAKI", "Hilirisasi Riset", "Akademisi"],
    readTimeId: "6 menit baca",
    readTimeEn: "6 min read",
  },
];

export default async function PublikasiPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

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
              {isEn ? "Research Papers & Tech Insights" : "Publikasi Riset & Wawasan Teknologi"}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? "Peer-reviewed applied research papers, decision science frameworks, and enterprise software engineering whitepapers."
                : "Kumpulan artikel ilmiah, studi kasus sains keputusan, dan panduan teknis rekayasa perangkat lunak dari tim peneliti dan arsitek PT. Matoh Technologies Indonesia."}
            </p>
          </div>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PUBLICATIONS.map((post) => {
              const title = isEn ? post.titleEn : post.titleId;
              const excerpt = isEn ? post.excerptEn : post.excerptId;
              const category = isEn ? post.categoryEn : post.categoryId;
              const date = isEn ? post.dateEn : post.dateId;
              const readTime = isEn ? post.readTimeEn : post.readTimeId;

              return (
                <article
                  key={post.slug}
                  className="border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors flex flex-col justify-between h-full bg-white group shadow-2xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                        {category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {readTime}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[170px]">{post.author}</p>
                      <p className="text-[10px] text-slate-400">{date}</p>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>{isEn ? "Read Article" : "Baca Artikel"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

