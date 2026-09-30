import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const lessonUpdateSchema = z.object({
  title: z.string().min(2, "Judul materi minimal 2 karakter").max(200).optional(),
  slug: z.string().optional(),
  videoUrl: z.string().url("URL video tidak valid").optional().or(z.literal("")).nullable(),
  duration: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  order: z.number().int().optional(),
  content: z.string().optional().or(z.literal("")).nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;
    const body = await req.json();
    const data = lessonUpdateSchema.parse(body);

    // Verify lesson belongs to a section in this course
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: { courseId },
      },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.content !== undefined && { content: data.content || null }),
      },
    });

    return NextResponse.json({ lesson: updatedLesson });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Update lesson error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: { courseId },
      },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    // Recalculate total lessons count for course
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { totalLessons },
    });

    return NextResponse.json({ message: "Lesson deleted", totalLessons });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
