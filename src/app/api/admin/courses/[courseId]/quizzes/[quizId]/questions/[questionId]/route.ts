import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
