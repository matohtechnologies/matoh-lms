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
