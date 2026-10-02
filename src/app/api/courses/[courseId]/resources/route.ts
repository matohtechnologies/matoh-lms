import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const resources = await prisma.courseResource.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Error fetching course resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createResourceSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  fileUrl: z.string().min(1),
  fileName: z.string().optional(),
  fileSize: z.number().int().optional(),
  type: z.enum(["FILE", "GITHUB", "FIGMA", "SLIDE"]).default("FILE"),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    const data = createResourceSchema.parse(body);

    const resource = await prisma.courseResource.create({
      data: {
        courseId: course.id,
        ...data,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data resource tidak valid" }, { status: 400 });
    }
    console.error("Error creating course resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
