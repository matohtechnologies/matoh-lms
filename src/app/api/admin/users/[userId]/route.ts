import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter").optional(),
  email: z.string().trim().email("Format email tidak valid").toLowerCase().optional(),
  role: z.enum(["USER", "INSTRUCTOR", "ADMIN"]).optional(),
  headline: z.string().trim().max(200, "Headline maksimal 200 karakter").optional().nullable(),
  bio: z.string().trim().max(3000, "Bio maksimal 3000 karakter").optional().nullable(),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  image: z.string().trim().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya admin yang diizinkan." }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data yang dimasukkan tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Prevent admin from demoting themselves
    if (userId === session.user.id && data.role && data.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role akun sendiri dari status Admin." },
        { status: 400 }
      );
    }

    // If email is changing, verify it is not in use by another user
    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
        select: { id: true },
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: `Email ${data.email} sudah digunakan oleh akun lain.` },
          { status: 409 }
        );
      }
    }

    // Build update payload
    const updatePayload: {
      name?: string;
      email?: string;
      role?: "USER" | "INSTRUCTOR" | "ADMIN";
      headline?: string | null;
      bio?: string | null;
      image?: string | null;
      password?: string;
    } = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.headline !== undefined) updatePayload.headline = data.headline || null;
    if (data.bio !== undefined) updatePayload.bio = data.bio || null;
    if (data.image !== undefined) updatePayload.image = data.image || null;

    if (data.password && data.password.trim().length >= 6) {
      updatePayload.password = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        bio: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "Data instruktur/pengguna berhasil diperbarui.",
    });
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya admin yang diizinkan." }, { status: 403 });
    }

    const { userId } = await params;

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri." },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "Pengguna berhasil dihapus." });
  } catch (error) {
    console.error("[ADMIN_USERS_DELETE]", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server saat menghapus akun." }, { status: 500 });
  }
}
