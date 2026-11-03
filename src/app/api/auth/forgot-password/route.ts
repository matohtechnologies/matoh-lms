import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per 15 minutes per IP
  const rateLimit = checkRateLimit(req, {
    identifier: "auth_forgot_password",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    // Always return success response for security (prevents user enumeration)
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        // Delete previous unused reset tokens for this user
        await prisma.verificationToken.deleteMany({
          where: { identifier: user.email },
        });

        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

        await prisma.verificationToken.create({
          data: {
            identifier: user.email,
            token,
            expires,
          },
        });

        const origin = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "https://matohtechnologies.com";
        const resetUrl = `${origin}/forgot-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      }
    } catch (err) {
      console.error("[Password Reset Request Error]:", err);
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
