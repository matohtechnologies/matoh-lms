import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const sectionUpdateSchema = z.object({
  title: z.string().min(2, "Judul seksi minimal 2 karakter").max(200).optional(),
  order: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, sectionId } = await params;
    const body = await req.json();
    const data = sectionUpdateSchema.parse(body);

    const section = await prisma.section.update({
      where: { id: sectionId, courseId },
      data,
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ section });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Update section error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, sectionId } = await params;

    await prisma.section.delete({
      where: { id: sectionId, courseId },
    });

    // Update totalLessons count for course
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { totalLessons },
    });

    return NextResponse.json({ message: "Section deleted", totalLessons });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
