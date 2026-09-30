import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const replySchema = z.object({
  content: z.string().min(2, "Balasan minimal 2 karakter"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { discussionId } = await params;
    const body = await req.json();
    const { content } = replySchema.parse(body);

    const reply = await prisma.discussionReply.create({
      data: {
        discussionId,
        userId: session.user.id,
        content,
      },
      include: {
        user: { select: { id: true, name: true, image: true, role: true } },
      },
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data balasan tidak valid" }, { status: 400 });
    }
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Gagal membalas diskusi" }, { status: 500 });
  }
}
