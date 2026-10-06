import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { z } from "zod";

const updateAssignmentSchema = z.object({
  title: z.string().min(3, "Judul tugas minimal 3 karakter").optional(),
  description: z.string().min(10, "Instruksi/deskripsi tugas minimal 10 karakter").optional(),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  sectionId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId } = await params;
    const body = await req.json();
    const data = updateAssignmentSchema.parse(body);

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.fileName !== undefined && { fileName: data.fileName }),
        ...(data.sectionId !== undefined && { sectionId: data.sectionId || null }),
      },
      include: {
        section: { select: { id: true, title: true, order: true } },
      },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tugas tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Gagal memperbarui tugas" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId } = await params;

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ success: true, message: "Tugas berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ error: "Gagal menghapus tugas" }, { status: 500 });
  }
}
