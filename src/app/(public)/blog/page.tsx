import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileText,
  Lightbulb,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Blog & Technology Research Publications | PT. Matoh Technologies Indonesia"
      : "Blog, Riset & Publikasi Teknologi | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Applied research papers, decision science methodologies (AHP & ISM), and digital transformation insights from PT. Matoh Technologies Indonesia."
      : "Publikasi riset terapan, metodologi pengambilan keputusan (AHP & ISM), dan wawasan transformasi digital UMKM dari PT. Matoh Technologies Indonesia.",
  };
}

interface BlogPost {
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  categoryId: string;
  categoryEn: string;
  author: string;
  authorRoleId: string;
  authorRoleEn: string;
  dateId: string;
  dateEn: string;
  readTimeId: string;
  readTimeEn: string;
  featured?: boolean;
  tagsId: string[];
  tagsEn: string[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "penerapan-ahp-ism-prioritas-digitalisasi-umkm",
    titleId: "Penerapan Metodologi AHP dan ISM dalam Menentukan Prioritas Digitalisasi UMKM Indonesia",
    titleEn: "Applying AHP and ISM Methodologies to Prioritize Indonesian MSME Digitalization Strategies",
    excerptId: "Bagaimana kombinasi Analytic Hierarchy Process (AHP) dan Interpretive Structural Modeling (ISM) membantu para pengambil kebijakan dan pelaku usaha memetakan strategi digitalisasi yang paling berdampak langsung pada pendapatan.",
    excerptEn: "How combining the Analytic Hierarchy Process (AHP) and Interpretive Structural Modeling (ISM) empowers policymakers and business leaders to identify high-impact digital transformation priorities.",
    categoryId: "Decision Science",
    categoryEn: "Decision Science",
    author: "Dr. G. Prabantoro, SE., MM., CBec.",
    authorRoleId: "RnD Director PT. Matoh Technologies Indonesia",
    authorRoleEn: "RnD Director, PT. Matoh Technologies Indonesia",
    dateId: "18 Oktober 2026",
    dateEn: "October 18, 2026",
    readTimeId: "7 menit baca",
    readTimeEn: "7 min read",
    featured: true,
    tagsId: ["AHP", "ISM", "UMKM", "Decision Support System"],
    tagsEn: ["AHP", "ISM", "MSME", "Decision Support System"],
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
    authorRoleId: "Divisi Konsultasi Bisnis & UMKM",
    authorRoleEn: "Business & MSME Advisory Division",
    dateId: "14 Oktober 2026",
    dateEn: "October 14, 2026",
    readTimeId: "5 menit baca",
    readTimeEn: "5 min read",
    tagsId: ["E-Commerce", "Otomasi", "Strategi Bisnis"],
    tagsEn: ["E-Commerce", "Automation", "Business Strategy"],
  },
  {
    slug: "arsitektur-web-modern-nextjs-app-router",
    titleId: "Membangun Platform Web Skalavel dengan Next.js App Router dan Standalone Container",
    titleEn: "Architecting Scalable Enterprise Web Platforms with Next.js App Router and Containers",
    excerptId: "Eksplorasi teknis mengenai performa streaming SSR, Content Security Policy (CSP) ketat, dan optimasi aset untuk performa loading di bawah 1 detik.",
    excerptEn: "A technical deep-dive into streaming server components, hardened Content Security Policies (CSP), and asset optimizations for sub-second page loads.",
    categoryId: "Rekayasa Web",
    categoryEn: "Web Engineering",
    author: "Ir. Agung Prasetyo, M.Cs.",
    authorRoleId: "Lead Software Architect",
    authorRoleEn: "Lead Software Architect",
    dateId: "10 Oktober 2026",
    dateEn: "October 10, 2026",
    readTimeId: "6 menit baca",
    readTimeEn: "6 min read",
    tagsId: ["Next.js", "TypeScript", "Web Performance"],
    tagsEn: ["Next.js", "TypeScript", "Web Performance"],
  },
  {
    slug: "pentingnya-sertifikasi-kompetensi-terverifikasi",
    titleId: "Mengapa Sertifikat Digital Berbasis QR Code dan SK Kemenkumham Krusial bagi Lulusan?",
    titleEn: "Why QR-Verifiable Certificates with Legal Corporate Backing Matter to Recruiters",
    excerptId: "Menganalisis pergeseran paradigma rekrutmen industri saat ini terhadap verifikasi keabsahan sertifikat portofolio kandidat secara instan dan permanen.",
    excerptEn: "Examining why modern industry recruiters prioritize tamper-proof digital credentials verified by legal corporate registries over unverified certificates.",
    categoryId: "Karier & Sertifikasi",
    categoryEn: "Career & Credentials",
    author: "Dr. Retno Wulandari, M.Si.",
    authorRoleId: "Senior Academic Advisor",
    authorRoleEn: "Senior Academic Advisor",
    dateId: "05 Oktober 2026",
    dateEn: "October 05, 2026",
    readTimeId: "4 menit baca",
    readTimeEn: "4 min read",
    tagsId: ["Sertifikasi", "Verifikasi QR", "Standar Industri"],
    tagsEn: ["Certification", "QR Verification", "Industry Standards"],
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
    authorRoleId: "Senior DevOps & Cloud Engineer",
    authorRoleEn: "Senior DevOps & Cloud Engineer",
    dateId: "28 September 2026",
    dateEn: "September 28, 2026",
    readTimeId: "8 menit baca",
    readTimeEn: "8 min read",
    tagsId: ["Cybersecurity", "Rate Limiting", "API Protection"],
    tagsEn: ["Cybersecurity", "Rate Limiting", "API Protection"],
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
    authorRoleId: "RnD Director PT. Matoh Technologies Indonesia",
    authorRoleEn: "RnD Director, PT. Matoh Technologies Indonesia",
    dateId: "20 September 2026",
    dateEn: "September 20, 2026",
    readTimeId: "6 menit baca",
    readTimeEn: "6 min read",
    tagsId: ["HAKI", "Hilirisasi Riset", "Akademisi"],
    tagsEn: ["Intellectual Property", "Commercialization", "Academia"],
  },
];

export default async function BlogPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const categories = isEn
    ? ["All Topics", "Decision Science", "Digital Transformation", "Web Engineering", "Career & Credentials", "System Security"]
    : ["Semua Topik", "Decision Science", "Transformasi Digital", "Rekayasa Web", "Karier & Sertifikasi", "Keamanan Sistem"];

  const statsList = [
    { value: "6+", label: isEn ? "Applied Research Papers" : "Riset Terapan Terbit" },
    { value: "100%", label: isEn ? "Peer-Reviewed & Applied" : "Berdasarkan Pengujian Ilmiah" },
    { value: "5,000+", label: isEn ? "Weekly Professional Readers" : "Pembaca Rutin Mingguan" },
    { value: "AHP & ISM", label: isEn ? "Decision Frameworks" : "Spesialisasi Metodologi" },
  ];

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.filter((p) => p.slug !== featuredPost.slug);

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Header - Identical with About Page style */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc] bg-dot-matrix relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs font-bold mb-6 shadow-2xs">
            <Image
              src="/images/matoh-logo.png"
              alt="Matoh Technologies"
              width={16}
              height={16}
              className="object-contain"
            />
            {isEn ? "Research & Engineering Publications" : "Publikasi Riset & Wawasan Teknologi"}
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Insights, Research &" : "Wawasan, Riset &"} <br />
            <span className="text-gradient">
              {isEn ? "Digital Transformation" : "Transformasi Terapan"}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "In-depth perspectives from our faculty and engineering leads on MSME digitalization, applied multi-criteria decision making (AHP/ISM), and modern web technology."
              : "Tulisan mendalam dari dewan peneliti dan praktisi PT. Matoh Technologies seputar pemodelan keputusan (AHP/ISM), digitalisasi UMKM, dan rekayasa web modern."}
          </p>

          {/* Category Filter Pills styled like about page controls */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat, idx) => (
              <span
                key={cat}
                className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-2xl transition-all cursor-pointer ${
                  idx === 0
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300 border border-slate-200/90 shadow-2xs"
                }`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Concrete Stats Section - Identical Midnight Studio Contrast from About Page */}
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

      {/* Main Content Area */}
      <section className="py-20 bg-white border-b border-slate-200/60 bg-dot-matrix-slate relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Spotlight Featured Article Card */}
          <div className="mb-16">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                {isEn ? "Featured Publication" : "Riset Unggulan"}
              </span>
            </div>

            <div className="bento-card bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs hover:border-blue-300 hover:shadow-warm transition-all group">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                    {isEn ? featuredPost.categoryEn : featuredPost.categoryId}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {isEn ? featuredPost.dateEn : featuredPost.dateId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {isEn ? featuredPost.readTimeEn : featuredPost.readTimeId}
                  </span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {isEn ? featuredPost.titleEn : featuredPost.titleId}
                </h2>

                <p className="mt-4 text-base text-slate-600 leading-relaxed">
                  {isEn ? featuredPost.excerptEn : featuredPost.excerptId}
                </p>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {(isEn ? featuredPost.tagsEn : featuredPost.tagsId).map((t) => (
                    <span
                      key={t}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Author Info & Read CTA */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      GP
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{featuredPost.author}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {isEn ? featuredPost.authorRoleEn : featuredPost.authorRoleId}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                    {isEn ? "Read full publication" : "Baca artikel selengkapnya"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Header for Latest Publications */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block mb-3">
              {isEn ? "Curated Insights" : "Publikasi Pilihan"}
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Latest Research & Practical Guides" : "Artikel & Panduan Terapan Terbaru"}
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              {isEn
                ? "Bridging digital knowledge with actionable business implementation."
                : "Menghubungkan metodologi ilmiah dengan implementasi bisnis yang nyata."}
            </p>
          </div>

          {/* Regular Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {regularPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-300 hover:shadow-warm transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                      {isEn ? post.categoryEn : post.categoryId}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {isEn ? post.readTimeEn : post.readTimeId}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    {isEn ? post.titleEn : post.titleId}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {isEn ? post.excerptEn : post.excerptId}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(isEn ? post.tagsEn : post.tagsId).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{post.author}</div>
                    <div className="text-slate-400 text-[11px]">{isEn ? post.dateEn : post.dateId}</div>
                  </div>
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {isEn ? "Read ➔" : "Baca ➔"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA - Identical gradient banner style from About Page */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-blue-100 text-xs font-bold mb-4 backdrop-blur-xs border border-white/20">
            <TrendingUp className="w-3.5 h-3.5" />
            {isEn ? "Weekly Research Digest" : "Buletin Wawasan Mingguan"}
          </span>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Get Research Insights Straight to Your Inbox" : "Dapatkan Rangkuman Riset Langsung di Email Anda"}
          </h2>

          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            {isEn
              ? "Join 5,000+ entrepreneurs, developers, and researchers receiving our weekly analysis on digital tools, decision science, and practical tutorials."
              : "Bergabung bersama 5.000+ pelaku usaha, pengembang aplikasi, dan akademisi yang menerima ringkasan riset metodologi keputusan dan teknologi digital terapan."}
          </p>

          <div className="max-w-md mx-auto">
            <NewsletterForm isEn={isEn} />
          </div>
        </div>
      </section>
    </div>
  );
}
