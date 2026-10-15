import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCertificateCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EA-${timestamp}-${randomPart}`;
}

import { formatCertificateSerialNumber } from "@/lib/certificate-serial";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // Rate limit: 10 claims per minute per user/IP
  const rateLimit = checkRateLimit(req, {
    identifier: "certificate_claim",
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const userId = session.user.id;

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      include: {
        instructor: { select: { name: true } },
        certificateSetting: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const setting = course.certificateSetting || {
      isEnabled: true,
      title: "Certificate of Completion",
      subtitle:
        "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, evaluasi kuis, dan pemenuhan seluruh kriteria kelulusan.",
      issuerName: "PT. Matoh Technologies Indonesia",
      signatoryName1: course.instructor?.name || "Dr. G. Prabantoro, SE., MM., CBec.",
      signatoryRole1: "Lead Instructor & RnD Director",
      signatoryName2: "Dr. E. Lovita, SE., Ak., M.Si., CA.",
      signatoryRole2: "Head of Academic Board",
      templateUrl: null as string | null,
      templateConfig: null as any,
      minProgress: 100,
      requireQuizPassed: true,
      requireAssignmentApproved: true,
    };

    if (!setting.isEnabled) {
      return NextResponse.json(
        { error: "Penerbitan sertifikat dinonaktifkan untuk kelas ini" },
        { status: 400 }
      );
    }

    // Check enrollment
    let enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (!enrollment && session.user?.role === "ADMIN") {
      enrollment = await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId: course.id } },
        create: { userId, courseId: course.id },
        update: {},
      });
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: "Anda belum terdaftar pada kelas ini" },
        { status: 403 }
      );
    }

    // Check existing certificate
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (existingCert) {
      return NextResponse.json({
        success: true,
        certificate: existingCert,
        message: "Sertifikat sudah pernah diterbitkan sebelumnya",
      });
    }

    // Verify Criteria
    // 1. Progress
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId: course.id } },
    });
    const completedLessons = await prisma.progress.count({
      where: {
        userId,
        lesson: { section: { courseId: course.id } },
      },
    });
    const currentProgress =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 100;

    if (currentProgress < setting.minProgress) {
      return NextResponse.json(
        {
          error: `Progres materi Anda belum mencukupi (${currentProgress}% dari minimal ${setting.minProgress}%).`,
        },
        { status: 400 }
      );
    }

    // 2. Quizzes
    if (setting.requireQuizPassed) {
      const quizzes = await prisma.quiz.findMany({
        where: { courseId: course.id },
        include: {
          attempts: {
            where: { userId },
            select: { passed: true, score: true },
          },
        },
      });

      const unpassed = quizzes.filter(
        (q) => !q.attempts.some((att) => att.passed || att.score >= q.passingScore)
      );

      if (unpassed.length > 0) {
        return NextResponse.json(
          {
            error: `Masih ada ${unpassed.length} kuis evaluasi yang belum Anda selesaikan atau belum lulus.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Assignments
    if (setting.requireAssignmentApproved) {
      const assignments = await prisma.assignment.findMany({
        where: { courseId: course.id },
        include: {
          submissions: {
            where: { userId },
            select: { status: true },
          },
        },
      });

      const unapproved = assignments.filter(
        (a) => !a.submissions.some((s) => s.status === "APPROVED")
      );

      if (unapproved.length > 0) {
        return NextResponse.json(
          {
            error: `Masih ada ${unapproved.length} tugas/submission yang belum disetujui (APPROVED) oleh instruktur.`,
          },
          { status: 400 }
        );
      }
    }

    // All criteria met -> Issue certificate
    const fallbackCourseCode =
      course.slug
        ?.split("-")
        .map((w) => w[0]?.toUpperCase())
        .join("")
        .slice(0, 6) || "CERT";

    const courseCode = (setting as any).courseCode || fallbackCourseCode;
    const pattern = (setting as any).serialPattern || "MT/{COURSE_CODE}/{YEAR}/{COUNTER}";
    const counterPadding = (setting as any).counterPadding ?? 4;

    // Determine the next sequence counter
    let currentCounter = (setting as any).nextCounter;
    if (!currentCounter || currentCounter < 1) {
      const existingCount = await prisma.certificate.count({
        where: { courseId: course.id },
      });
      currentCounter = existingCount + 1;
    }

    let code = formatCertificateSerialNumber({
      pattern,
      courseCode,
      counter: currentCounter,
      counterPadding,
      issueDate: new Date(),
    });

    // Check collision safety
    const existingCodeCert = await prisma.certificate.findUnique({
      where: { certificateCode: code },
    });
    if (existingCodeCert) {
      code = `${code}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    const signatory1 = setting.signatoryName1 || course.instructor?.name || "Ahmad Fadhil";

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId: course.id,
        certificateCode: code,
        title: setting.title,
        subtitle: setting.subtitle,
        issuerName: setting.issuerName,
        signatoryName1: signatory1,
        signatoryRole1: setting.signatoryRole1 || "Lead Instructor",
        signatoryName2: setting.signatoryName2 || "Dr. Santoso W.",
        signatoryRole2: setting.signatoryRole2 || "Head of Curriculum",
        templateUrl: setting.templateUrl ?? null,
        templateConfig: (setting as any).templateConfig ?? undefined,
      } as any,
    });

    // Increment nextCounter for next issuance if setting exists
    if (course.certificateSetting?.id) {
      await prisma.certificateSetting
        .update({
          where: { id: course.certificateSetting.id },
          data: { nextCounter: currentCounter + 1 },
        })
        .catch((e) => console.warn("Failed to increment certificate counter:", e));
    }

    // Mark enrollment as completed if not already marked
    await prisma.enrollment.updateMany({
      where: { userId, courseId: course.id, completedAt: null },
      data: { completedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      certificate,
      message: "Selamat! Kriteria kelulusan terpenuhi dan sertifikat resmi Anda berhasil diterbitkan.",
    });
  } catch (error) {
    console.error("Error claiming certificate:", error);
    return NextResponse.json(
      { error: "Gagal menerbitkan sertifikat" },
      { status: 500 }
    );
  }
}
