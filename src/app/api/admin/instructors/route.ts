import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateInstructorSchema = z.object({
  id: z.string().min(1, "ID instruktur diperlukan"),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100).optional(),
  headline: z.string().trim().max(200, "Headline maksimal 200 karakter").optional().nullable(),
  bio: z.string().trim().max(3000, "Bio maksimal 3000 karakter").optional().nullable(),
  image: z.string().trim().optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const instructors = await prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
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
  } catch (error) {
    console.error("[ADMIN_INSTRUCTORS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya admin yang diizinkan." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateInstructorSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data yang dimasukkan tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { id, name, headline, bio, image } = parsed.data;

    const existingInstructor = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existingInstructor) {
      return NextResponse.json({ error: "Instruktur tidak ditemukan." }, { status: 404 });
    }

    const updatePayload: {
      name?: string;
      headline?: string | null;
      bio?: string | null;
      image?: string | null;
    } = {};

    if (name !== undefined) updatePayload.name = name;
    if (headline !== undefined) updatePayload.headline = headline || null;
    if (bio !== undefined) updatePayload.bio = bio || null;
    if (image !== undefined) updatePayload.image = image || null;

    const updatedInstructor = await prisma.user.update({
      where: { id },
      data: updatePayload,
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

    return NextResponse.json({
      instructor: updatedInstructor,
      message: "Profil master instruktur berhasil diperbarui.",
    });
  } catch (error) {
    console.error("[ADMIN_INSTRUCTORS_PATCH]", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}

