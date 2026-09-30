import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMidtransTransaction } from "@/lib/midtrans";
import { z } from "zod";
import { nanoid } from "nanoid";

import { checkRateLimit } from "@/lib/rate-limit";

const createPaymentSchema = z.object({
  courseId: z.string(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 15 order creation attempts per minute
  const rateLimit = checkRateLimit(req, {
    identifier: "payment_create",
    limit: 15,
    windowMs: 60 * 1000,
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
    const { courseId } = createPaymentSchema.parse(body);

    // Get course from DB
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
        published: true,
      },
    }).catch(() => null);

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
    }).catch(() => null);

    if (existingEnrollment) {
      return NextResponse.json({ error: "Kamu sudah terdaftar di kelas ini" }, { status: 409 });
    }

    // If free course, enroll directly
    if (course.price === 0) {
      await prisma.enrollment.create({
        data: { userId: session.user.id, courseId: course.id },
      }).catch(() => null);

      await prisma.course.update({
        where: { id: course.id },
        data: { enrollCount: { increment: 1 } },
      }).catch(() => null);

      return NextResponse.json({ success: true, type: "free" });
    }

    // Create order
    const orderId = `EA-${Date.now()}-${nanoid(6).toUpperCase()}`;
    const finalAmount = course.discountPrice ?? course.price;

    await prisma.order.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        amount: finalAmount,
        midtransOrderId: orderId,
        status: "PENDING",
      },
    }).catch(() => null);

    // Get user for customer details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }).catch(() => ({ name: session.user?.name, email: session.user?.email }));

    // Create Midtrans transaction
    const transaction = await createMidtransTransaction({
      orderId,
      grossAmount: Math.round(finalAmount),
      items: [
        {
          id: courseId,
          price: Math.round(finalAmount),
          quantity: 1,
          name: course.title.slice(0, 50),
        },
      ],
      customer: {
        first_name: user?.name?.split(" ")[0] ?? "User",
        last_name: user?.name?.split(" ").slice(1).join(" "),
        email: user?.email ?? "",
      },
    });

    return NextResponse.json({
      success: true,
      type: "paid",
      token: transaction.token,
      orderId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Gagal membuat transaksi pembayaran" },
      { status: 500 }
    );
  }
}
