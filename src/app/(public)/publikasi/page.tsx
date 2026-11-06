import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getLocale } from "next-intl/server";
import { PUBLICATIONS } from "@/lib/publications";

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
                  className="border border-slate-200 rounded-2xl p-6 hover:border-slate-400 transition-colors flex flex-col justify-between h-full bg-white group shadow-2xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {readTime}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      <Link href={`/publikasi/${post.slug}`}>
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
                      href={`/publikasi/${post.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform py-1 px-2 rounded-lg hover:bg-blue-50"
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
