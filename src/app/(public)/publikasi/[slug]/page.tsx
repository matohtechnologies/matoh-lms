import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  User,
  Users,
  Quote,
  Sparkles,
  Award,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  getDbPublications,
  getDbPublicationBySlug,
  getDbRelatedPublications,
  checkUserPublicationAccess,
} from "@/lib/publications";
import { auth } from "@/lib/auth";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ArticleActions, CopyCitationButton } from "@/components/public/article-actions";
import { PublicationResourceCard } from "@/components/public/publication-resource-card";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const publications = await getDbPublications();
  return publications.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getDbPublicationBySlug(slug);
  const locale = await getLocale();
  const isEn = locale === "en";

  if (!post) {
    return {
      title: isEn ? "Article Not Found | Matoh LMS" : "Artikel Tidak Ditemukan | Matoh LMS",
    };
  }

  const title = isEn ? post.titleEn : post.titleId;
  const excerpt = isEn ? post.excerptEn : post.excerptId;

  return {
    title: `${title} | PT. Matoh Technologies Indonesia`,
    description: excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
    },
    alternates: {
      canonical: `/publikasi/${post.slug}`,
    },
  };
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getDbPublicationBySlug(slug);

  if (!post) {
    notFound();
  }

  const locale = await getLocale();
  const isEn = locale === "en";

  const title = isEn ? post.titleEn : post.titleId;
  const excerpt = isEn ? post.excerptEn : post.excerptId;
  const category = isEn ? post.categoryEn : post.categoryId;
  const date = isEn ? post.dateEn : post.dateId;
  const readTime = isEn ? post.readTimeEn : post.readTimeId;
  const abstract = isEn ? post.abstractEn : post.abstractId;
  const content = isEn ? post.contentEn : post.contentId;
  const authorBio = isEn ? post.authorBioEn : post.authorBioId;

  const related = await getDbRelatedPublications(post.slug, 3);

  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const initialHasAccess = await checkUserPublicationAccess(
    session?.user?.id,
    post.id || post.slug,
    session?.user?.role
  );

  // Suggested APA citation text
  const apaCitation = `${post.author} (${post.publishedAt.slice(0, 4)}). ${title}. PT. Matoh Technologies Indonesia Research & Engineering Publications. https://matoh.id/publikasi/${post.slug}`;

  // JSON-LD Structured Data for Scholarly / Professional Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: title,
    description: excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: isEn ? "en" : "id",
    author:
      post.authors && post.authors.length > 0
        ? post.authors.map((a) => ({
            "@type": "Person",
            name: a.name,
            jobTitle: a.role || undefined,
            worksFor: {
              "@type": "Organization",
              name: "PT. Matoh Technologies Indonesia",
            },
          }))
        : {
            "@type": "Person",
            name: post.author,
            jobTitle: post.authorRole,
            worksFor: {
              "@type": "Organization",
              name: "PT. Matoh Technologies Indonesia",
            },
          },
    publisher: {
      "@type": "Organization",
      name: "PT. Matoh Technologies Indonesia",
      url: "https://matoh.id",
    },
    keywords: post.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://matoh.id/publikasi/${post.slug}`,
    },
  };

  return (
    <div className="pt-20 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb & Return Bar */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-slate-100 bg-slate-50/70 py-3 print:hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 truncate">
            <Link
              href="/"
              className="hover:text-blue-600 transition-colors shrink-0"
            >
              {isEn ? "Home" : "Beranda"}
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/publikasi"
              className="hover:text-blue-600 transition-colors shrink-0 font-medium text-slate-700"
            >
              {isEn ? "Publications" : "Publikasi"}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="truncate text-slate-400 max-w-[200px] sm:max-w-sm">
              {title}
            </span>
          </div>

          <Link
            href="/publikasi"
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:-translate-x-0.5 transition-transform shrink-0"
          >
            <ArrowLeft size={13} />
            <span>{isEn ? "All Articles" : "Semua Publikasi"}</span>
          </Link>
        </div>
      </nav>

      {/* Article Header */}
      <header className="border-b border-slate-200/80 bg-gradient-to-b from-blue-50/40 via-white to-white py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-6">
            {/* Category & Read Time Pills */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <BookOpen size={13} />
                {category}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                <Clock size={13} />
                {readTime}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                <Calendar size={13} />
                <time dateTime={post.publishedAt}>{date}</time>
              </span>
            </div>

            {/* Main Title */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {title}
            </h1>

            {/* Excerpt / Lead */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {excerpt}
            </p>

            {/* Author Bar & Action Buttons */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Author Info (Single or Multi-Author) */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {post.authors && post.authors.length > 1 ? (
                    <Users size={20} />
                  ) : (
                    post.author
                      .split(" ")
                      .filter((n) => !n.includes("."))
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("") || "MT"
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                    <span>{post.author}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {post.authors && post.authors.length > 1 ? (
                      <span className="text-blue-700 font-semibold">
                        {isEn
                          ? `Collaborative Research Team (${post.authors.length} Authors)`
                          : `Tim Riset Kolaborasi (${post.authors.length} Penulis)`}
                      </span>
                    ) : (
                      post.authorRole
                    )}
                  </div>
                </div>
              </div>

              {/* Share & Actions */}
              <ArticleActions title={title} isEn={isEn} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Reading Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Abstract / Executive Summary Box */}
        {abstract && (
          <section
            aria-labelledby="abstract-heading"
            className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100/80 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <FileText size={15} />
              <h2 id="abstract-heading">
                {isEn ? "Executive Summary / Abstract" : "Ringkasan Eksekutif & Abstrak"}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
              &ldquo;{abstract}&rdquo;
            </p>
          </section>
        )}

        {/* Full Article Content */}
        <article className="prose-container">
          <MarkdownRenderer content={content} />
        </article>

        {/* Gated Resource / Paywall & Download Card */}
        <PublicationResourceCard
          publication={{
            id: post.id,
            slug: post.slug,
            title,
            type: post.type,
            isPaid: post.isPaid,
            price: post.price,
            fileUrl: post.fileUrl,
            fileName: post.fileName,
            fileSize: post.fileSize,
            externalUrl: post.externalUrl,
          }}
          initialHasAccess={initialHasAccess}
          isLoggedIn={isLoggedIn}
          isEn={isEn}
        />

        {/* Tags */}
        <section aria-label="Topic Tags" className="pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">
              {isEn ? "Topics:" : "Topik:"}
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors px-3 py-1 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* Official Citation Box */}
        <section
          aria-labelledby="citation-heading"
          className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Quote size={14} className="text-blue-600" />
              <h3 id="citation-heading">
                {isEn ? "How to Cite this Paper (APA 7th)" : "Format Sitasi yang Disarankan (APA 7th)"}
              </h3>
            </div>
            <CopyCitationButton citation={apaCitation} isEn={isEn} />
          </div>

          <p className="text-xs font-mono text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200/90 leading-relaxed break-words selection:bg-blue-100">
            {apaCitation}
          </p>
        </section>

        {/* Academic References List */}
        {post.references && post.references.length > 0 && (
          <section aria-labelledby="references-heading" className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-blue-600" />
              <h3 id="references-heading" className="text-base sm:text-lg font-bold text-slate-900">
                {isEn ? "References & Further Reading" : "Kepustakaan & Rujukan Ilmiah"}
              </h3>
            </div>
            <ol className="space-y-2.5 text-xs sm:text-sm text-slate-600 pl-4 list-decimal marker:text-slate-400">
              {post.references.map((ref) => (
                <li key={ref.id} className="leading-relaxed">
                  {ref.citation}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Author Bio Card (Single or Multi-Author) */}
        <section
          aria-labelledby="author-heading"
          className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              {post.authors && post.authors.length > 1 ? <Users size={15} /> : <User size={14} />}
              <span id="author-heading">
                {post.authors && post.authors.length > 1
                  ? isEn
                    ? `About the Authors (${post.authors.length} Contributors)`
                    : `Tentang Tim Penulis & Peneliti (${post.authors.length} Orang)`
                  : isEn
                  ? "About the Author"
                  : "Tentang Penulis"}
              </span>
            </div>

            {post.authors && post.authors.length > 1 && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {isEn ? "Research Collaboration" : "Kolaborasi Akademik & Industri"}
              </span>
            )}
          </div>

          {post.authors && post.authors.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.authors.map((auth, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mt-0.5">
                      {auth.name
                        .split(" ")
                        .filter((n) => !n.includes("."))
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("") || `${idx + 1}`}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-white text-sm">{auth.name}</h5>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-400/30">
                            Lead
                          </span>
                        )}
                      </div>
                      {auth.role && (
                        <p className="text-xs text-blue-200 line-clamp-1">{auth.role}</p>
                      )}
                      {auth.bio && (
                        <p className="text-xs text-slate-300 pt-1 leading-relaxed line-clamp-2">
                          {auth.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {post.author
                  .split(" ")
                  .filter((n) => !n.includes("."))
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("") || "MT"}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">{post.author}</h4>
                <p className="text-xs text-blue-200 font-medium">{post.authorRole}</p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  {authorBio}
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              {isEn
                ? "Published by RnD Division PT. Matoh Technologies Indonesia"
                : "Diterbitkan oleh Divisi Riset & Rekayasa PT. Matoh Technologies Indonesia"}
            </span>

            <Link
              href="/konsultan"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-300 hover:text-white transition-colors"
            >
              <span>{isEn ? "Request Consultation" : "Konsultasi Bersama Tim Penulis"}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* Next/Previous or Return CTA */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <Sparkles size={14} />
              <span>{isEn ? "Applied Technology Education" : "Edukasi Teknologi Aplikatif"}</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              {isEn
                ? "Interested in Mastering These Methodologies & Stacks?"
                : "Tertarik Mendalami Metodologi & Arsitektur Terapan Ini?"}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              {isEn
                ? "Access structured video modules, assignments, and verified certificates designed by our industry researchers."
                : "Akses kursus terstruktur, tugas studi kasus riil, dan sertifikat ber-SK Kemenkumham yang dirancang langsung oleh para praktisi kami."}
            </p>
          </div>

          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm shrink-0 min-h-[44px] inline-flex items-center justify-center gap-2"
          >
            <span>{isEn ? "Explore Courses" : "Jelajahi Kursus"}</span>
            <ArrowRight size={14} />
          </Link>
        </section>

        {/* Related Articles Grid */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 id="related-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isEn ? "Related Publications" : "Publikasi Terkait Lainnya"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isEn
                    ? "Explore complementary research and technical engineering whitepapers."
                    : "Eksplorasi artikel riset komplementer dan wawasan rekayasa teknologi lainnya."}
                </p>
              </div>

              <Link
                href="/publikasi"
                className="hidden sm:inline-flex items-center gap-1 font-semibold text-xs text-blue-600 hover:text-blue-700"
              >
                <span>{isEn ? "View All" : "Lihat Semua"}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rel) => {
                const relTitle = isEn ? rel.titleEn : rel.titleId;
                const relExcerpt = isEn ? rel.excerptEn : rel.excerptId;
                const relCategory = isEn ? rel.categoryEn : rel.categoryId;
                const relReadTime = isEn ? rel.readTimeEn : rel.readTimeId;

                return (
                  <article
                    key={rel.slug}
                    className="border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-colors flex flex-col justify-between h-full bg-white group shadow-2xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {relCategory}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={11} />
                          {relReadTime}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        <Link href={`/publikasi/${rel.slug}`}>
                          {relTitle}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {relExcerpt}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate max-w-[140px] font-medium text-[11px]">
                        {rel.author}
                      </span>
                      <Link
                        href={`/publikasi/${rel.slug}`}
                        className="text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs"
                      >
                        <span>{isEn ? "Read" : "Baca"}</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

