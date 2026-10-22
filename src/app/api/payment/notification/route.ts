import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { sendOrderReceiptEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id: orderId,
      transaction_status,
      payment_type,
      signature_key,
      status_code,
      gross_amount,
    } = body;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const isValid = verifyMidtransSignature(
      orderId,
      status_code,
      gross_amount,
      serverKey,
      signature_key
    );

    if (!isValid) {
      console.error("Invalid Midtrans signature for order:", orderId);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { midtransOrderId: orderId },
      include: {
        user: { select: { email: true, name: true } },
        course: { select: { title: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update based on status
    if (["capture", "settlement"].includes(transaction_status)) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paymentMethod: payment_type,
            paidAt: new Date(),
          },
        }),
        prisma.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: order.courseId,
            },
          },
          create: { userId: order.userId, courseId: order.courseId },
          update: {},
        }),
        prisma.course.update({
          where: { id: order.courseId },
          data: { enrollCount: { increment: 1 } },
        }),
      ]);

      // Send transactional receipt email asynchronously
      if (order.user?.email && order.course?.title) {
        sendOrderReceiptEmail({
          to: order.user.email,
          name: order.user.name,
          orderId: order.midtransOrderId || order.id,
          courseTitle: order.course.title,
          amount: order.amount,
        }).catch((err) => console.error("[Receipt Email Error]:", err));
      }
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
