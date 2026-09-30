import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createQuestionSchema = z.object({
  question: z.string().min(5, "Teks soal minimal 5 karakter"),
  options: z.array(z.string().min(1, "Opsi jawaban tidak boleh kosong")).min(2, "Minimal 2 opsi pilihan"),
  correctAnswer: z.number().min(0),
  explanation: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await req.json();
    const data = createQuestionSchema.parse(body);

    const questionsCount = await prisma.quizQuestion.count({
      where: { quizId },
    });

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        order: questionsCount + 1,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data soal tidak valid" }, { status: 400 });
    }
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Gagal menambahkan soal kuis" }, { status: 500 });
  }
}
