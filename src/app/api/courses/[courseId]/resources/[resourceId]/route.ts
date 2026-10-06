import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ courseId: string; resourceId: string }>;
}

const updateResourceSchema = z.object({
  title: z.string().min(2, "Judul bahan ajar minimal 2 karakter").optional(),
  description: z.string().nullable().optional(),
  fileUrl: z.string().min(1, "URL atau file bahan ajar wajib diisi").optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().int().nullable().optional(),
  type: z.string().optional(),
  sectionId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId, resourceId } = await params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existingResource = await prisma.courseResource.findFirst({
      where: { id: resourceId, courseId: course.id },
    });

    if (!existingResource) {
      return NextResponse.json({ error: "Bahan belajar tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateResourceSchema.parse(body);

    if (data.sectionId) {
      const sectionExists = await prisma.section.findFirst({
        where: { id: data.sectionId, courseId: course.id },
      });
      if (!sectionExists) {
        return NextResponse.json({ error: "Chapter / Seksi tidak valid untuk kelas ini" }, { status: 400 });
      }
    }

    const updatedResource = await prisma.courseResource.update({
      where: { id: resourceId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.fileName !== undefined && { fileName: data.fileName }),
        ...(data.fileSize !== undefined && { fileSize: data.fileSize }),
        ...(data.type !== undefined && { type: data.type.toUpperCase() }),
        ...(data.sectionId !== undefined && { sectionId: data.sectionId || null }),
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

    return NextResponse.json({ success: true, resource: updatedResource });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data bahan ajar tidak valid" }, { status: 400 });
    }
    console.error("Error updating course resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId, resourceId } = await params;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existingResource = await prisma.courseResource.findFirst({
      where: { id: resourceId, courseId: course.id },
    });

    if (!existingResource) {
      return NextResponse.json({ error: "Bahan belajar tidak ditemukan" }, { status: 404 });
    }

    await prisma.courseResource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true, message: "Bahan belajar berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting course resource:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
