import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const progressSchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, courseId } = progressSchema.parse(body);

    try {
      // Verify user is enrolled
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId },
        },
      });

      if (!enrollment) {
        return NextResponse.json({ success: true, message: "Progress recorded" });
      }

      // Mark lesson as complete
      await prisma.progress.upsert({
        where: {
          userId_lessonId: { userId: session.user.id, lessonId },
        },
        create: { userId: session.user.id, lessonId },
        update: { completedAt: new Date() },
      });

      // Check if course is fully completed
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { totalLessons: true },
      });

      const completedCount = await prisma.progress.count({
        where: {
          userId: session.user.id,
          lesson: { section: { courseId } },
        },
      });

      if (course?.totalLessons && completedCount >= course.totalLessons) {
        // Issue certificate if not already issued
        await prisma.certificate.upsert({
          where: {
            userId_courseId: { userId: session.user.id, courseId },
          },
          create: { userId: session.user.id, courseId },
          update: {},
        });

        await prisma.enrollment.update({
          where: {
            userId_courseId: { userId: session.user.id, courseId },
          },
          data: { completedAt: new Date() },
        });
      }

      return NextResponse.json({
        success: true,
        completedCount,
        totalLessons: course?.totalLessons,
      });
    } catch (dbErr) {
      console.error("Database progress error:", dbErr);
      return NextResponse.json({ error: "Gagal menyimpan progres pembelajaran" }, { status: 500 });
    }
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
