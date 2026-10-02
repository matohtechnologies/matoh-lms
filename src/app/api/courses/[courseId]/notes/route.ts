import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const notes = await prisma.studyNote.findMany({
      where: {
        userId: session.user.id,
        courseId: course.id,
      },
      orderBy: [
        { lesson: { order: "asc" } },
        { timestamp: "asc" },
      ],
      include: {
        lesson: {
          select: { id: true, title: true, order: true },
        },
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching study notes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createNoteSchema = z.object({
  lessonId: z.string().min(1),
  timestamp: z.number().int().min(0),
  content: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await req.json();
    const { lessonId, timestamp, content } = createNoteSchema.parse(body);

    const note = await prisma.studyNote.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        lessonId,
        timestamp,
        content: content.trim(),
      },
      include: {
        lesson: {
          select: { id: true, title: true, order: true },
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Catatan tidak valid" }, { status: 400 });
    }
    console.error("Error creating study note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    await prisma.studyNote.deleteMany({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting study note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
