import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, ExternalLink, BookOpen, GraduationCap } from "lucide-react";
import { AddToLinkedInButton } from "@/components/certificates/add-to-linkedin-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { format } from "date-fns";
import { id as idLocale, enUS as enLocale } from "date-fns/locale";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Sertifikat Kelulusan — PT. Matoh Technologies Indonesia" };

interface CertItem {
  id: string;
  certificateCode: string;
  issuedAt: Date;
  course: {
    title: string;
    thumbnail: string | null;
    category: { name: string };
    instructor: { name: string | null };
  };
}

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("dashboard");
  const dateLocale = isEn ? enLocale : idLocale;

  let certificates: CertItem[] = [];
  try {
    const dbCerts = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            category: { select: { name: true } },
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
    certificates = dbCerts;
  } catch (error) {
    console.error("Error fetching certificates:", error);
    certificates = [];
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("certs_title")}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {t("certs_count", { count: certificates.length })}
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-2xs">
            <Award size={30} />
          </div>
          <h3
            className="text-lg font-bold text-stone-900 mb-1.5"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {t("no_certs_title")}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mb-2 max-w-sm mx-auto">
            {t("no_certs_desc")}
          </p>
          <p className="text-[11px] text-stone-400 mb-6 max-w-sm mx-auto">
            {t("no_certs_hint")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/my-courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <BookOpen size={14} />
              {t("view_my_courses")}
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200/80 bg-white text-stone-700 hover:text-blue-700 text-xs font-bold hover:bg-blue-50/60 transition-colors shadow-2xs"
            >
              <GraduationCap size={14} />
              {t("explore_courses")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-warm hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between"
            >
              {/* Certificate Preview Banner */}
              <div className="h-36 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100/80 flex items-center justify-center relative border-b border-stone-100 overflow-hidden p-3">
                {/* Decorative border */}
                <div className="absolute inset-2.5 border border-blue-300/60 rounded-xl pointer-events-none" />
                <div className="absolute inset-3.5 border border-dashed border-blue-300/40 rounded-lg pointer-events-none" />

                <div className="text-center relative z-10 space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/50 flex items-center justify-center mx-auto shadow-2xs">
                    <Award size={20} className="text-blue-700" />
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-950">
                    Certificate of Completion
                  </p>
                  <p className="text-[9px] font-mono font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full inline-block border border-blue-200">
                    #{cert.certificateCode.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block mb-1.5">
                    {cert.course.category.name}
                  </span>
                  <h3
                    className="font-bold text-stone-900 text-sm leading-snug line-clamp-2"
                    style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                  >
                    {cert.course.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">
                    {t("cert_instructor")}: {cert.course.instructor?.name || "Ahmad Fadhil"}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {t("cert_issued")}:{" "}
                    {format(new Date(cert.issuedAt), "d MMMM yyyy", {
                      locale: dateLocale,
                    })}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <Link
                    href={`/certificates/${cert.certificateCode}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <ExternalLink size={13} />
                    {t("cert_view_print")}
                  </Link>
                  <AddToLinkedInButton
                    courseTitle={cert.course.title}
                    certificateCode={cert.certificateCode}
                    issuedAt={cert.issuedAt}
                    size="sm"
                    variant="brand"
                    locale={locale}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
