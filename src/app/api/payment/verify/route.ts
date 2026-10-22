import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkMidtransTransactionStatus } from "@/lib/midtrans";
import { sendOrderReceiptEmail } from "@/lib/email";

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

    // 1. If order is already finalized as PAID, return immediately (Idempotent)
    if (order.status === "PAID") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: order.courseId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        enrolled: !!enrollment,
        enrollmentId: enrollment?.id,
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
    }

    // 2. If order is PENDING, verify status officially with Midtrans API
    let isOfficiallyPaid = false;
    let paymentMethod = order.paymentMethod || "midtrans";

    if (order.midtransOrderId) {
      const midtransStatus = await checkMidtransTransactionStatus(order.midtransOrderId);
      if (
        midtransStatus &&
        ["capture", "settlement"].includes(midtransStatus.transaction_status || "")
      ) {
        isOfficiallyPaid = true;
        paymentMethod = midtransStatus.payment_type || paymentMethod;
      }
    }

    // Fallback for local development demo ONLY when Midtrans keys are dummy
    const isLocalDemo =
      process.env.NODE_ENV !== "production" &&
      (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY.includes("xxxxx"));

    if (!isOfficiallyPaid && !isLocalDemo) {
      return NextResponse.json({
        success: true,
        enrolled: false,
        message: "Status pembayaran belum terkonfirmasi oleh penyedia pembayaran.",
        order: {
          id: order.id,
          orderId: order.midtransOrderId,
          status: order.status,
        },
        course: {
          id: order.course.id,
          title: order.course.title,
          slug: order.course.slug,
        },
      });
    }

    // 3. Mark as PAID idempotently in database
    const [updatedOrder, enrollment] = await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod,
        },
      }),
      prisma.enrollment.upsert({
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
      }),
      prisma.course.update({
        where: { id: order.courseId },
        data: { enrollCount: { increment: 1 } },
      }),
    ]);

    // Send receipt email asynchronously
    if (session.user.email && order.course.title) {
      sendOrderReceiptEmail({
        to: session.user.email,
        name: session.user.name,
        orderId: order.midtransOrderId || order.id,
        courseTitle: order.course.title,
        amount: order.amount,
      }).catch((err) => console.error("[Receipt Email Error]:", err));
    }

    return NextResponse.json({
      success: true,
      enrolled: true,
      enrollmentId: enrollment.id,
      order: {
        id: updatedOrder.id,
        orderId: updatedOrder.midtransOrderId,
        amount: updatedOrder.amount,
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
