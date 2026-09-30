import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
