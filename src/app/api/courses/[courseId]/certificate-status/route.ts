import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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
      issuerName: "Earthy Academy",
      signatoryName1: course.instructor?.name || "Ahmad Fadhil",
      signatoryRole1: "Lead Instructor",
      signatoryName2: "Dr. Santoso W.",
      signatoryRole2: "Head of Curriculum",
      minProgress: 100,
      requireQuizPassed: true,
      requireAssignmentApproved: true,
    };

    if (!setting.isEnabled) {
      return NextResponse.json({
        isEnabled: false,
        message: "Kelas ini tidak menerbitkan sertifikat kelulusan.",
      });
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
        { error: "Anda belum terdaftar pada kelas ini", enrolled: false },
        { status: 403 }
      );
    }

    // Check existing certificate
    const existingCert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    // 1. Progress calculation
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
    const progressMet = currentProgress >= setting.minProgress;

    // 2. Quizzes evaluation
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: course.id },
      include: {
        attempts: {
          where: { userId },
          select: { passed: true, score: true },
        },
      },
    });

    const totalQuizzes = quizzes.length;
    const passedQuizzes = quizzes.filter((q) =>
      q.attempts.some((att) => att.passed || att.score >= q.passingScore)
    ).length;

    const quizMet =
      !setting.requireQuizPassed || totalQuizzes === 0 || passedQuizzes === totalQuizzes;

    // 3. Assignments evaluation
    const assignments = await prisma.assignment.findMany({
      where: { courseId: course.id },
      include: {
        submissions: {
          where: { userId },
          select: { status: true },
        },
      },
    });

    const totalAssignments = assignments.length;
    const approvedAssignments = assignments.filter((a) =>
      a.submissions.some((s) => s.status === "APPROVED")
    ).length;

    const assignmentMet =
      !setting.requireAssignmentApproved ||
      totalAssignments === 0 ||
      approvedAssignments === totalAssignments;

    const isEligible = progressMet && quizMet && assignmentMet;

    return NextResponse.json({
      isEnabled: true,
      isIssued: Boolean(existingCert),
      isEligible,
      certificate: existingCert
        ? {
            code: existingCert.certificateCode,
            issuedAt: existingCert.issuedAt,
          }
        : null,
      setting: {
        title: setting.title,
        issuerName: setting.issuerName,
        minProgress: setting.minProgress,
        requireQuizPassed: setting.requireQuizPassed,
        requireAssignmentApproved: setting.requireAssignmentApproved,
      },
      criteria: {
        progress: {
          current: currentProgress,
          required: setting.minProgress,
          completedLessons,
          totalLessons,
          met: progressMet,
        },
        quizzes: {
          total: totalQuizzes,
          passed: passedQuizzes,
          required: setting.requireQuizPassed,
          met: quizMet,
        },
        assignments: {
          total: totalAssignments,
          approved: approvedAssignments,
          required: setting.requireAssignmentApproved,
          met: assignmentMet,
        },
      },
    });
  } catch (error) {
    console.error("Error evaluating certificate status:", error);
    return NextResponse.json(
      { error: "Gagal memproses status kriteria sertifikat" },
      { status: 500 }
    );
  }
}
