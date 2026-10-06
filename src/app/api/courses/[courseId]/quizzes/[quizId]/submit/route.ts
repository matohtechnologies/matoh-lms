import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.number()),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await req.json();
    const { answers } = submitQuizSchema.parse(body);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Kuis tidak ditemukan" }, { status: 404 });
    }

    // Check if quiz is assigned to a section/chapter and if user has completed all lessons in it
    if (quiz.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: quiz.sectionId },
        include: { lessons: { select: { id: true } } },
      });

      if (section && section.lessons.length > 0) {
        const totalSectionLessons = section.lessons.length;
        const completedSectionLessons = await prisma.progress.count({
          where: {
            userId: session.user.id,
            lessonId: { in: section.lessons.map((l) => l.id) },
          },
        });

        if (completedSectionLessons < totalSectionLessons) {
          return NextResponse.json(
            {
              error: `Kuis terkunci. Anda harus menyelesaikan semua materi pembelajaran pada bab "${section.title}" terlebih dahulu (${completedSectionLessons}/${totalSectionLessons} selesai).`,
              locked: true,
              sectionTitle: section.title,
              completedCount: completedSectionLessons,
              totalCount: totalSectionLessons,
            },
            { status: 403 }
          );
        }
      }
    }

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;

    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.upsert({
      where: {
        userId_quizId: {
          userId: session.user.id,
          quizId: quiz.id,
        },
      },
      create: {
        userId: session.user.id,
        quizId: quiz.id,
        score,
        passed,
        answers,
      },
      update: {
        score,
        passed,
        answers,
      },
    });

    return NextResponse.json({
      attempt,
      score,
      passed,
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data jawaban kuis tidak valid" }, { status: 400 });
    }
    console.error("Error submitting quiz:", error);
    return NextResponse.json({ error: "Gagal menyimpan hasil kuis" }, { status: 500 });
  }
}
