import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const sectionCreateSchema = z.object({
  title: z.string().min(2, "Judul seksi minimal 2 karakter").max(200),
  order: z.number().int().optional(),
});

export async function POST(
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
    const data = sectionCreateSchema.parse(body);

    let order = data.order;
    if (order === undefined) {
      const lastSection = await prisma.section.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });
      order = (lastSection?.order ?? 0) + 1;
    }

    const section = await prisma.section.create({
      data: {
        title: data.title,
        order,
        courseId,
      },
      include: {
        lessons: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Create section error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
