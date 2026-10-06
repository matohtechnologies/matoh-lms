import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const { courseId } = await params;

    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
      },
      include: {
        section: {
          select: { id: true, title: true, order: true },
        },
        submissions: session?.user?.id
          ? {
              where: session.user.role === "ADMIN" ? {} : { userId: session.user.id },
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
              orderBy: { submittedAt: "desc" },
            }
          : false,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Gagal mengambil data tugas" }, { status: 500 });
  }
}
