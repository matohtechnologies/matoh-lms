import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createQuizSchema = z.object({
  title: z.string().min(3, "Judul kuis minimal 3 karakter"),
  description: z.string().optional(),
  passingScore: z.number().min(10).max(100).default(70),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const data = createQuizSchema.parse(body);

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: data.title,
        description: data.description,
        passingScore: data.passingScore,
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Gagal membuat kuis" }, { status: 500 });
  }
}
