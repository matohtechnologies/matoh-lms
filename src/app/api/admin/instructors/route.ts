import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const instructorUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  headline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const instructors = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        bio: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ instructors });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = instructorUpdateSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.image !== undefined && { image: data.image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        bio: true,
        role: true,
      },
    });

    return NextResponse.json({ instructor: updated });
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
