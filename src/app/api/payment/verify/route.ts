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
        include: { course: true, publication: true },
      });
    }

    if (!order) {
      order = await prisma.order.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { course: true, publication: true },
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // 1. If order is already finalized as PAID, return immediately (Idempotent)
    if (order.status === "PAID") {
      let isGranted = false;
      if (order.courseId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: order.courseId,
            },
          },
        });
        isGranted = !!enrollment;
      } else if (order.publicationId) {
        const access = await prisma.publicationAccess.findUnique({
          where: {
            userId_publicationId: {
              userId: order.userId,
              publicationId: order.publicationId,
            },
          },
        });
        isGranted = !!access;
      }

      return NextResponse.json({
        success: true,
        enrolled: isGranted,
        accessGranted: isGranted,
        order: {
          id: order.id,
          orderId: order.midtransOrderId,
          amount: order.amount,
          status: "PAID",
        },
        course: order.course
          ? {
              id: order.course.id,
              title: order.course.title,
              slug: order.course.slug,
              thumbnail: order.course.thumbnail,
            }
          : null,
        publication: order.publication
          ? {
              id: order.publication.id,
              title: order.publication.titleId,
              slug: order.publication.slug,
            }
          : null,
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
        course: order.course
          ? {
              id: order.course.id,
              title: order.course.title,
              slug: order.course.slug,
            }
          : null,
        publication: order.publication
          ? {
              id: order.publication.id,
              title: order.publication.titleId,
              slug: order.publication.slug,
            }
          : null,
      });
    }

    // 3. Mark as PAID idempotently in database
    const txOps: any[] = [
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod,
        },
      }),
    ];

    if (order.courseId) {
      txOps.push(
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
        })
      );
    } else if (order.publicationId) {
      txOps.push(
        prisma.publicationAccess.upsert({
          where: {
            userId_publicationId: {
              userId: order.userId,
              publicationId: order.publicationId,
            },
          },
          create: {
            userId: order.userId,
            publicationId: order.publicationId,
            orderId: order.id,
          },
          update: {},
        })
      );
    }

    const [updatedOrder] = await prisma.$transaction(txOps);

    // Send receipt email asynchronously
    const itemTitle = order.course?.title || order.publication?.titleId;
    if (session.user.email && itemTitle) {
      sendOrderReceiptEmail({
        to: session.user.email,
        name: session.user.name,
        orderId: order.midtransOrderId || order.id,
        courseTitle: itemTitle,
        amount: order.amount,
      }).catch((err) => console.error("[Receipt Email Error]:", err));
    }

    return NextResponse.json({
      success: true,
      enrolled: true,
      accessGranted: true,
      order: {
        id: updatedOrder.id,
        orderId: updatedOrder.midtransOrderId,
        amount: updatedOrder.amount,
        status: "PAID",
      },
      course: order.course
        ? {
            id: order.course.id,
            title: order.course.title,
            slug: order.course.slug,
            thumbnail: order.course.thumbnail,
          }
        : null,
      publication: order.publication
        ? {
            id: order.publication.id,
            title: order.publication.titleId,
            slug: order.publication.slug,
          }
        : null,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
