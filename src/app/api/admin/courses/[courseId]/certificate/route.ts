import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const certificateSettingSchema = z.object({
  isEnabled: z.boolean().default(true),
  title: z.string().min(2, "Judul sertifikat minimal 2 karakter"),
  subtitle: z.string().optional().nullable(),
  issuerName: z.string().min(2, "Nama penerbit minimal 2 karakter"),
  signatoryName1: z.string().optional().nullable(),
  signatoryRole1: z.string().optional().nullable(),
  signatoryName2: z.string().optional().nullable(),
  signatoryRole2: z.string().optional().nullable(),
  templateUrl: z.string().optional().nullable(),
  templateConfig: z.any().optional().nullable(),
  minProgress: z.number().min(0).max(100).default(100),
  requireQuizPassed: z.boolean().default(true),
  requireAssignmentApproved: z.boolean().default(true),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
      include: {
        instructor: { select: { name: true } },
        certificateSetting: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    // Get recipients list
    const recipients = await prisma.certificate.findMany({
      where: { courseId: course.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    const defaultSetting = {
      isEnabled: true,
      title: "Certificate of Completion",
      subtitle:
        "Atas keberhasilannya dalam menyelesaikan seluruh modul kurikulum, evaluasi kuis, dan pemenuhan seluruh kriteria kelulusan.",
      issuerName: "Earthy Academy",
      signatoryName1: course.instructor?.name || "Ahmad Fadhil",
      signatoryRole1: "Lead Instructor",
      signatoryName2: "Dr. Santoso W.",
      signatoryRole2: "Head of Curriculum",
      templateUrl: null,
      templateConfig: null,
      minProgress: 100,
      requireQuizPassed: true,
      requireAssignmentApproved: true,
    };

    const setting = course.certificateSetting
      ? {
          ...course.certificateSetting,
          signatoryName1:
            course.certificateSetting.signatoryName1 || course.instructor?.name || "Ahmad Fadhil",
        }
      : defaultSetting;

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        instructorName: course.instructor?.name || "Instruktur",
      },
      setting,
      recipients,
    });
  } catch (error) {
    console.error("Error fetching certificate setting:", error);
    return NextResponse.json(
      { error: "Gagal memuat pengaturan sertifikat" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const data = certificateSettingSchema.parse(body);

    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }] },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const setting = await prisma.certificateSetting.upsert({
      where: { courseId: course.id },
      create: {
        courseId: course.id,
        isEnabled: data.isEnabled,
        title: data.title,
        subtitle: data.subtitle ?? "",
        issuerName: data.issuerName,
        signatoryName1: data.signatoryName1 ?? null,
        signatoryRole1: data.signatoryRole1 ?? "Lead Instructor",
        signatoryName2: data.signatoryName2 ?? null,
        signatoryRole2: data.signatoryRole2 ?? "Head of Curriculum",
        templateUrl: data.templateUrl ?? null,
        templateConfig: data.templateConfig ? (data.templateConfig as any) : undefined,
        minProgress: data.minProgress,
        requireQuizPassed: data.requireQuizPassed,
        requireAssignmentApproved: data.requireAssignmentApproved,
      },
      update: {
        isEnabled: data.isEnabled,
        title: data.title,
        subtitle: data.subtitle ?? "",
        issuerName: data.issuerName,
        signatoryName1: data.signatoryName1 ?? null,
        signatoryRole1: data.signatoryRole1 ?? "Lead Instructor",
        signatoryName2: data.signatoryName2 ?? null,
        signatoryRole2: data.signatoryRole2 ?? "Head of Curriculum",
        templateUrl: data.templateUrl ?? null,
        templateConfig: data.templateConfig !== undefined ? (data.templateConfig as any) : undefined,
        minProgress: data.minProgress,
        requireQuizPassed: data.requireQuizPassed,
        requireAssignmentApproved: data.requireAssignmentApproved,
      },
    } as any);

    return NextResponse.json({
      success: true,
      setting,
      message: "Pengaturan sertifikat berhasil disimpan",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error updating certificate setting:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan sertifikat" },
      { status: 500 }
    );
  }
}
