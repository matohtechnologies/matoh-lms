import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token reset diperlukan"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 reset attempts per 15 minutes per IP
  const rateLimit = checkRateLimit(req, {
    identifier: "auth_reset_password",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const body = await req.json();
    const { token, email, password } = resetPasswordSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if token exists for this identifier
    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: normalizedEmail,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Tautan reset kata sandi tidak valid atau sudah pernah digunakan." },
        { status: 400 }
      );
    }

    // 2. Check if token has expired
    if (new Date() > record.expires) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      });
      return NextResponse.json(
        { error: "Tautan reset kata sandi telah kedaluwarsa. Silakan ajukan permintaan baru." },
        { status: 400 }
      );
    }

    // 3. Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun dengan alamat email ini tidak ditemukan." },
        { status: 404 }
      );
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // 6. Delete all verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Data yang dikirim tidak valid." },
        { status: 400 }
      );
    }
    console.error("[Reset Password Error]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

