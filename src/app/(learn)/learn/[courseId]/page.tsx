import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LearnPageClient, { type LearnCourseData } from "./learn-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ruang Belajar — PT. Matoh Technologies Indonesia" };

interface LearnPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/learn/${courseId}`);
  }

  // 1. Fetch real course from database
  let dbCourse = null;
  try {
    dbCourse = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        sections: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching course for learning room:", err);
  }

  if (!dbCourse) {
    notFound();
  }

  const isAdmin = session.user.role === "ADMIN";

  // 2. Validate enrollment
  let completedLessonIds: string[] = [];
  let isEnrolled = false;

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: dbCourse.id,
        },
      },
    });
    isEnrolled = !!enrollment;

    // Auto-heal: If user has a PAID order for this course, enroll them now
    if (!isEnrolled) {
      const paidOrder = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          courseId: dbCourse.id,
          status: "PAID",
        },
      });
      if (paidOrder) {
        await prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: dbCourse.id,
            },
          },
          create: {
            userId: session.user.id,
            courseId: dbCourse.id,
          },
          update: {},
        });
        isEnrolled = true;
      }
    }

    if (isEnrolled || isAdmin) {
      const progressList = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          lesson: { section: { courseId: dbCourse.id } },
        },
        select: { lessonId: true },
      });
      completedLessonIds = progressList.map((p) => p.lessonId);
    }
  } catch (err) {
    console.error("Error checking enrollment:", err);
  }

  if (!isEnrolled && !isAdmin) {
    redirect(`/courses/${dbCourse.slug}`);
  }

  const courseData: LearnCourseData = {
    id: dbCourse.id,
    slug: dbCourse.slug,
    title: dbCourse.title,
    description: dbCourse.description,
    thumbnail: dbCourse.thumbnail,
    instructor: dbCourse.instructor,
    sections: dbCourse.sections.map((s) => ({
      id: s.id,
      title: s.title,
      titleEn: s.titleEn ?? null,
      order: s.order,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        sectionId: l.sectionId,
        title: l.title,
        titleEn: l.titleEn ?? null,
        slug: l.slug,
        duration: l.duration ?? 10,
        isFree: l.isFree ?? false,
        order: l.order,
        videoUrl: l.videoUrl ?? null,
        content: l.content ?? null,
      })),
    })),
  };

  return (
    <LearnPageClient
      courseId={dbCourse.id}
      initialCourse={courseData}
      initialCompletedLessonIds={completedLessonIds}
    />
  );
}
