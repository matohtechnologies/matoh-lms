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
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const resources = await prisma.courseResource.findMany({
      where: {
        courseId: course.id,
        ...(sectionId ? { sectionId } : {}),
      },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
      orderBy: [
        { sectionId: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Error fetching course resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createResourceSchema = z.object({
  title: z.string().min(2, "Judul bahan ajar minimal 2 karakter"),
  description: z.string().nullable().optional(),
  fileUrl: z.string().min(1, "URL atau file bahan ajar wajib diisi"),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().int().nullable().optional(),
  type: z.string().default("FILE"),
  sectionId: z.string().nullable().optional(),
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

    // If sectionId is provided, verify it belongs to this course
    if (data.sectionId) {
      const sectionExists = await prisma.section.findFirst({
        where: { id: data.sectionId, courseId: course.id },
      });
      if (!sectionExists) {
        return NextResponse.json({ error: "Chapter / Seksi tidak valid untuk kelas ini" }, { status: 400 });
      }
    }

    const resource = await prisma.courseResource.create({
      data: {
        courseId: course.id,
        title: data.title,
        description: data.description || null,
        fileUrl: data.fileUrl,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        type: data.type.toUpperCase(),
        sectionId: data.sectionId || null,
      },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data bahan ajar tidak valid" }, { status: 400 });
    }
    console.error("Error creating course resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
