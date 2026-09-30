import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    // Always return success for security (don't reveal if email exists)
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        // In production: generate reset token, send email
        // For now: log the action (email service not yet configured)
        console.log(`[Password Reset] Reset requested for: ${user.email}`);
        
        // TODO: Implement email sending with nodemailer or resend
        // const resetToken = crypto.randomUUID();
        // await prisma.passwordResetToken.create({ data: { userId: user.id, token: resetToken, expiresAt: ... } });
        // await sendPasswordResetEmail(user.email, resetToken);
      }
    } catch {
      // Silently fail - still return success
    }

    // Always return 200 success regardless of whether user exists
    return NextResponse.json({
      message: "Jika email terdaftar, kamu akan menerima tautan reset dalam beberapa menit.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
