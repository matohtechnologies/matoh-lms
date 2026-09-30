import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Nama maksimal 50 karakter"),
  email: z.string().email("Format email tidak valid").toLowerCase().trim(),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 registrations per 15 minutes per IP
  const rateLimit = checkRateLimit(req, {
    identifier: "auth_register",
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in PostgreSQL database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user, message: "Pendaftaran berhasil. Silakan login." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
