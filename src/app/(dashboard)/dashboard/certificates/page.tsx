import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, ExternalLink, BookOpen, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const metadata: Metadata = { title: "Sertifikat — Earthy Academy" };

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
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-stone-900"
          style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
        >
          Sertifikat
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {certificates.length} sertifikat diperoleh
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Award size={28} className="text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            Belum Ada Sertifikat
          </h3>
          <p className="text-stone-500 text-sm mb-2">
            Selesaikan kelas yang kamu ikuti untuk mendapatkan sertifikat resmi
          </p>
          <p className="text-xs text-stone-400 mb-6">
            Sertifikat diterbitkan otomatis saat kamu menyelesaikan 100% materi
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard/my-courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              <BookOpen size={16} />
              Lihat Kelas Saya
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              <GraduationCap size={16} />
              Jelajahi Kelas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Certificate Preview Banner */}
              <div className="h-32 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center relative border-b border-stone-100 overflow-hidden">
                {/* Decorative border */}
                <div className="absolute inset-2 border border-amber-300/50 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 border border-dashed border-amber-200/80 rounded-xl pointer-events-none" />

                {/* Watermark dots */}
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full border-2 border-amber-300/30" />
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-amber-300/30" />
                <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full border-2 border-amber-300/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full border-2 border-amber-300/30" />

                <div className="text-center relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300/60 flex items-center justify-center mx-auto mb-1.5">
                    <Award size={20} className="text-amber-600" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                    Certificate of Completion
                  </p>
                  <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                    #{cert.certificateCode.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs font-semibold text-orange-600 mb-1">
                  {cert.course.category.name}
                </p>
                <h3 className="font-semibold text-stone-900 text-sm leading-snug mb-1 line-clamp-2">
                  {cert.course.title}
                </h3>
                <p className="text-xs text-stone-500 mb-1">
                  Instruktur: {cert.course.instructor.name}
                </p>
                <p className="text-xs text-stone-400 mb-4">
                  Diterbitkan:{" "}
                  {format(new Date(cert.issuedAt), "d MMMM yyyy", {
                    locale: idLocale,
                  })}
                </p>

                <Link
                  href={`/certificates/${cert.certificateCode}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
                >
                  <ExternalLink size={13} />
                  Lihat &amp; Cetak Sertifikat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
