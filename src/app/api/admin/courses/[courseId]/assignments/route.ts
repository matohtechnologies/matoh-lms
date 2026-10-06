import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAssignmentSchema = z.object({
  title: z.string().min(3, "Judul tugas minimal 3 karakter"),
  description: z.string().min(10, "Instruksi/deskripsi tugas minimal 10 karakter"),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  sectionId: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const data = createAssignmentSchema.parse(body);

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        sectionId: data.sectionId || null,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      },
      include: {
        section: { select: { id: true, title: true, order: true } },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tugas tidak valid" }, { status: 400 });
    }
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Gagal membuat tugas" }, { status: 500 });
  }
}
