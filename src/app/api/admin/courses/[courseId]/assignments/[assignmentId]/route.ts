import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
