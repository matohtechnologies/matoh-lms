import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  content: z.string().optional().default(""),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
}).refine(data => data.content.trim().length > 0 || !!data.fileUrl, {
  message: "Harap masukkan tautan link proyek atau unggah file tugas",
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; assignmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId } = await params;
    const body = await req.json();
    const data = submitSchema.parse(body);

    const submission = await prisma.userSubmission.create({
      data: {
        taskId: assignmentId,
        userId: session.user.id,
        content: data.content.trim() || data.fileUrl || "File tugas terlampir",
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        status: "PENDING",
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data submission tidak valid" }, { status: 400 });
    }
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ error: "Gagal mengirimkan tugas" }, { status: 500 });
  }
}
