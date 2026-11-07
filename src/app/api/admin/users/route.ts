import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["USER", "INSTRUCTOR", "ADMIN"]).default("INSTRUCTOR"),
  headline: z.string().trim().max(200, "Headline maksimal 200 karakter").optional().nullable(),
  bio: z.string().trim().max(2000, "Bio maksimal 2000 karakter").optional().nullable(),
  image: z.string().trim().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya admin yang diizinkan." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data yang dimasukkan tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, role, headline, bio, image } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Email ${email} sudah terdaftar di sistem.` },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        headline: headline || null,
        bio: bio || null,
        image: image || null,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        user: newUser,
        message: "Instruktur berhasil ditambahkan ke sistem.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server saat membuat akun." },
      { status: 500 }
    );
  }
}

