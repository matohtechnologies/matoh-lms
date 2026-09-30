import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
  feedback: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; assignmentId: string; submissionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const submission = await prisma.userSubmission.update({
      where: { id: submissionId },
      data: {
        status: data.status,
        feedback: data.feedback,
        score: data.score,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data review tidak valid" }, { status: 400 });
    }
    console.error("Error reviewing submission:", error);
    return NextResponse.json({ error: "Gagal menyimpan review tugas" }, { status: 500 });
  }
}
