import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CertificateView } from "./certificate-view";
import type { Metadata } from "next";

interface CertificatePageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ completed?: string }>;
}

async function getCertificate(code: string, userId?: string) {
  try {
    return await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateCode: code },
          { id: code },
          ...(userId ? [{ courseId: code, userId }] : []),
          ...(userId ? [{ course: { slug: code }, userId }] : []),
        ],
      },
      include: {
        user: { select: { name: true } },
        course: {
          include: {
            instructor: { select: { name: true } },
            category: { select: { name: true } },
            certificateSetting: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const { code } = await params;
  const cert = await getCertificate(code);
  if (!cert) return { title: "Sertifikat Tidak Ditemukan" };
  return {
    title: `Sertifikat: ${cert.course.title} — ${cert.user.name}`,
    description: `Sertifikat kelulusan resmi dari Earthy Academy untuk kelas ${cert.course.title}`,
  };
}

export default async function CertificateViewPage({ params, searchParams }: CertificatePageProps) {
  const { code } = await params;
  const { completed } = await searchParams;
  const session = await auth();

  // Check if explicitly flagged as uncompleted (from learn page)
  const isExplicitlyUncompleted = completed === "false";
  if (isExplicitlyUncompleted) {
    return <CertificateView code={code} isLocked={true} />;
  }

  // Try to find real certificate from DB
  const certificate = await getCertificate(code, session?.user?.id);

  if (certificate) {
    const setting = certificate.course.certificateSetting;
    return (
      <CertificateView
        code={code}
        isLocked={false}
        studentName={certificate.user.name ?? "Pelajar"}
        courseTitle={certificate.course.title}
        categoryName={certificate.course.category.name}
        issuedAt={certificate.issuedAt.toISOString()}
        certificateCode={certificate.certificateCode}
        certificateTitle={certificate.title || setting?.title || "Certificate of Completion"}
        subtitle={
          certificate.subtitle ||
          setting?.subtitle ||
          "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, evaluasi kuis, dan pemenuhan seluruh kriteria kelulusan."
        }
        issuerName={certificate.issuerName || setting?.issuerName || "Earthy Academy"}
        instructorName={
          certificate.signatoryName1 ||
          setting?.signatoryName1 ||
          certificate.course.instructor.name ||
          "Ahmad Fadhil"
        }
        signatoryRole1={certificate.signatoryRole1 || setting?.signatoryRole1 || "Lead Instructor"}
        signatoryName2={certificate.signatoryName2 || setting?.signatoryName2 || "Dr. Santoso W."}
        signatoryRole2={
          certificate.signatoryRole2 || setting?.signatoryRole2 || "Head of Curriculum"
        }
        templateUrl={certificate.templateUrl || setting?.templateUrl || undefined}
        templateConfig={(certificate as any).templateConfig || (setting as any)?.templateConfig || null}
      />
    );
  }

  // Check if code refers to a course where user is enrolled but haven't earned certificate yet
  if (session?.user?.id) {
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: code }, { slug: code }] },
      select: { id: true, title: true },
    });

    if (course) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      });

      if (enrollment) {
        return (
          <CertificateView
            code={code}
            isLocked={true}
            courseTitle={course.title}
            lockReason="Anda belum memenuhi seluruh kriteria kelulusan (progres materi, kelulusan kuis, atau persetujuan tugas) pada kelas ini."
          />
        );
      }
    }
  }

  // Certificate not found in DB
  notFound();
}
