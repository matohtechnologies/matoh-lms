import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

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
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.verificationToken.upsert({
          where: {
            identifier_token: {
              identifier: user.email,
              token,
            },
          },
          create: {
            identifier: user.email,
            token,
            expires,
          },
          update: {
            token,
            expires,
          },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://matohtechnologies.com";
        const resetUrl = `${baseUrl}/forgot-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      }
    } catch (err) {
      console.error("[Password Reset Error]:", err);
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
