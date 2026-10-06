import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateQuizSchema = z.object({
  title: z.string().min(3, "Judul kuis minimal 3 karakter").optional(),
  description: z.string().nullable().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  sectionId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, courseId } = await params;
    const body = await req.json();
    const data = updateQuizSchema.parse(body);

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz || existingQuiz.courseId !== courseId) {
      return NextResponse.json({ error: "Kuis tidak ditemukan" }, { status: 404 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.passingScore !== undefined && { passingScore: data.passingScore }),
        ...(data.sectionId !== undefined && { sectionId: data.sectionId || null }),
      },
      include: {
        section: { select: { id: true, title: true, order: true } },
      },
    });

    return NextResponse.json({ success: true, quiz: updatedQuiz });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data kuis tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Gagal memperbarui kuis" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ success: true, message: "Kuis berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json({ error: "Gagal menghapus kuis" }, { status: 500 });
  }
}

