import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const { courseId } = await params;

    const quizzes = await prisma.quiz.findMany({
      where: {
        course: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
      },
      include: {
        section: {
          select: { id: true, title: true, order: true },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        attempts: session?.user?.id
          ? {
              where: session.user.role === "ADMIN" ? {} : { userId: session.user.id },
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            }
          : false,
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = quizzes.map((q) => ({
      ...q,
      attempts: q.attempts ?? [],
    }));

    return NextResponse.json({ quizzes: formatted });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kuis" },
      { status: 500 }
    );
  }
}
