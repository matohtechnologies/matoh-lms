import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateQuestionSchema = z.object({
  question: z.string().min(5, "Teks soal minimal 5 karakter").optional(),
  options: z
    .array(z.string().min(1, "Opsi jawaban tidak boleh kosong"))
    .min(2, "Minimal 2 opsi pilihan")
    .optional(),
  correctAnswer: z.number().min(0).optional(),
  explanation: z.string().nullable().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; quizId: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, questionId } = await params;
    const body = await req.json();
    const data = updateQuestionSchema.parse(body);

    const existingQuestion = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion || existingQuestion.quizId !== quizId) {
      return NextResponse.json({ error: "Soal kuis tidak ditemukan" }, { status: 404 });
    }

    // Validate correctAnswer against options length
    const effectiveOptions = data.options ?? existingQuestion.options;
    const effectiveCorrectAnswer =
      data.correctAnswer !== undefined ? data.correctAnswer : existingQuestion.correctAnswer;

    if (effectiveCorrectAnswer >= effectiveOptions.length) {
      return NextResponse.json(
        { error: "Kunci jawaban benar tidak sesuai dengan pilihan yang tersedia" },
        { status: 400 }
      );
    }

    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        ...(data.question !== undefined && { question: data.question }),
        ...(data.options !== undefined && { options: data.options }),
        ...(data.correctAnswer !== undefined && { correctAnswer: data.correctAnswer }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data soal tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error updating quiz question:", error);
    return NextResponse.json({ error: "Gagal memperbarui soal kuis" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; quizId: string; questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;

    await prisma.quizQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true, message: "Soal kuis berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting quiz question:", error);
    return NextResponse.json({ error: "Gagal menghapus soal kuis" }, { status: 500 });
  }
}

