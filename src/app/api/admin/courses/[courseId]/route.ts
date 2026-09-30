import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { resolveThumbnailUrl } from "@/lib/youtube";

const courseUpdateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(10).optional(),
  categoryId: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  duration: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        instructor: { select: { name: true } },
        sections: {
          include: { lessons: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const data = courseUpdateSchema.parse(body);

    const updateData = {
      ...data,
      ...(data.thumbnail !== undefined && {
        thumbnail: data.thumbnail ? resolveThumbnailUrl(data.thumbnail) : null,
      }),
    };

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    return NextResponse.json({ course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await params;

    await prisma.course.delete({ where: { id: courseId } });

    return NextResponse.json({ message: "Course deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
