import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createDiscussionSchema = z.object({
  content: z.string().min(3, "Isi diskusi minimal 3 karakter"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const discussions = await prisma.discussion.findMany({
      where: {
        course: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, image: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ discussions });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json({ error: "Gagal mengambil data diskusi" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const data = createDiscussionSchema.parse(body);

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const discussion = await prisma.discussion.create({
      data: {
        courseId: course.id,
        userId: session.user.id,
        content: data.content,
      },
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
        replies: true,
      },
    });

    return NextResponse.json({ discussion }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data diskusi tidak valid" }, { status: 400 });
    }
    console.error("Error creating discussion:", error);
    return NextResponse.json({ error: "Gagal mengirim diskusi" }, { status: 500 });
  }
}
