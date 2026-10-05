import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const lessonCreateSchema = z.object({
  title: z.string().min(2, "Judul materi minimal 2 karakter").max(200),
  slug: z.string().optional(),
  videoUrl: z.string().url("URL video tidak valid").optional().nullable().or(z.literal("")),
  duration: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  order: z.number().int().optional(),
  content: z.string().optional().nullable().or(z.literal("")),
});

export async function POST(
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
    const data = lessonCreateSchema.parse(body);

    // Verify section belongs to course
    const section = await prisma.section.findUnique({
      where: { id: sectionId, courseId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Determine order
    let order = data.order;
    if (order === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { sectionId },
        orderBy: { order: "desc" },
      });
      order = (lastLesson?.order ?? 0) + 1;
    }

    // Generate unique slug for section
    let baseSlug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "materi";

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.lesson.findUnique({ where: { sectionId_slug: { sectionId, slug } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        slug,
        videoUrl: data.videoUrl || null,
        duration: data.duration ?? 5,
        isFree: data.isFree ?? false,
        order,
        content: data.content || null,
        sectionId,
      },
    });

    // Update totalLessons count on course
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId } },
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { totalLessons },
    });

    return NextResponse.json({ lesson, totalLessons }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Create lesson error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
