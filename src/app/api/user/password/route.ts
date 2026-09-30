import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama diperlukan"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 password change attempts per 15 minutes
  const rateLimit = checkRateLimit(req, {
    identifier: "user_password_change",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const body = await req.json();
    const { oldPassword, newPassword } = passwordSchema.parse(body);

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Akun ini menggunakan login sosial (Google) dan tidak memiliki password" },
        { status: 400 }
      );
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
