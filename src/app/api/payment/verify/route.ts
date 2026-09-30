import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId } = body as { orderId?: string };

    const userId = session.user.id;

    // Find order by midtransOrderId or internal order id, or user's latest pending/paid order
    let order = null;
    if (orderId) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ midtransOrderId: orderId }, { id: orderId }],
          userId,
        },
        include: { course: true },
      });
    }

    if (!order) {
      order = await prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { course: true },
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // If order was PENDING, mark as PAID in development / sandbox / demo or upon checkout completion
    if (order.status === "PENDING") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod: order.paymentMethod || "midtrans_snap",
        },
      });
    }

    // Ensure enrollment is created for this course
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: order.userId,
          courseId: order.courseId,
        },
      },
      create: {
        userId: order.userId,
        courseId: order.courseId,
      },
      update: {},
    });

    // Update course enrollCount
    await prisma.course.update({
      where: { id: order.courseId },
      data: { enrollCount: { increment: 1 } },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      enrolled: true,
      enrollmentId: enrollment.id,
      order: {
        id: order.id,
        orderId: order.midtransOrderId,
        amount: order.amount,
        status: "PAID",
      },
      course: {
        id: order.course.id,
        title: order.course.title,
        slug: order.course.slug,
        thumbnail: order.course.thumbnail,
      },
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
