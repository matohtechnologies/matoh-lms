import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { discussionId } = await params;

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json({ error: "Diskusi tidak ditemukan" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && discussion.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.discussion.delete({
      where: { id: discussionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return NextResponse.json({ error: "Gagal menghapus diskusi" }, { status: 500 });
  }
}
