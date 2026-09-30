import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const progressSchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  completed: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, courseId, completed } = progressSchema.parse(body);

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true, totalLessons: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const realCourseId = course.id;

    // Verify user is enrolled (or auto-enroll if ADMIN)
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: realCourseId },
      },
    });

    if (!enrollment && session.user.role === "ADMIN") {
      enrollment = await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId: session.user.id, courseId: realCourseId },
        },
        create: { userId: session.user.id, courseId: realCourseId },
        update: {},
      });
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: "Anda belum terdaftar pada kelas ini" },
        { status: 403 }
      );
    }

    if (completed) {
      // Mark lesson as complete
      await prisma.progress.upsert({
        where: {
          userId_lessonId: { userId: session.user.id, lessonId },
        },
        create: { userId: session.user.id, lessonId },
        update: { completedAt: new Date() },
      });
    } else {
      // Unmark lesson
      await prisma.progress.deleteMany({
        where: {
          userId: session.user.id,
          lessonId,
        },
      });
    }

    // Dynamic count of lessons in this course
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId: realCourseId } },
    });

    const completedCount = await prisma.progress.count({
      where: {
        userId: session.user.id,
        lesson: { section: { courseId: realCourseId } },
      },
    });

    return NextResponse.json({
      success: true,
      completed,
      completedCount,
      totalLessons,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
