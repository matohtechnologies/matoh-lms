import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMidtransTransaction } from "@/lib/midtrans";
import { z } from "zod";
import { nanoid } from "nanoid";

import { checkRateLimit } from "@/lib/rate-limit";

const createPaymentSchema = z
  .object({
    courseId: z.string().optional(),
    publicationId: z.string().optional(),
    couponCode: z.string().optional().nullable(),
  })
  .refine((data) => data.courseId || data.publicationId, {
    message: "Harap pilih kursus atau publikasi yang ingin dibeli",
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
    const { courseId, publicationId, couponCode } = createPaymentSchema.parse(body);

    // ==========================================
    // A. Handle Publication / Research Purchase
    // ==========================================
    if (publicationId) {
      const pub = await prisma.publication.findFirst({
        where: {
          OR: [{ id: publicationId }, { slug: publicationId }],
          published: true,
        },
      });

      if (!pub) {
        return NextResponse.json(
          { error: "Konten riset/publikasi tidak ditemukan" },
          { status: 404 }
        );
      }

      // Check if already has access
      const existingAccess = await prisma.publicationAccess.findUnique({
        where: {
          userId_publicationId: {
            userId: session.user.id,
            publicationId: pub.id,
          },
        },
      });

      if (existingAccess || session.user.role === "ADMIN") {
        return NextResponse.json(
          { error: "Anda sudah memiliki akses penuh ke berkas ini" },
          { status: 409 }
        );
      }

      const finalAmount = pub.isPaid ? pub.price : 0;

      // If free publication or 0 price, grant access immediately
      if (finalAmount === 0 || !pub.isPaid) {
        await prisma.publicationAccess.create({
          data: {
            userId: session.user.id,
            publicationId: pub.id,
          },
        });

        const orderId = `PUB-FREE-${Date.now()}-${nanoid(6).toUpperCase()}`;
        await prisma.order.create({
          data: {
            userId: session.user.id,
            publicationId: pub.id,
            amount: 0,
            midtransOrderId: orderId,
            status: "PAID",
            paidAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          type: "free",
          publicationId: pub.id,
        });
      }

      // Idempotency: reuse active pending order created within last 15 minutes
      const activePendingOrder = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          publicationId: pub.id,
          status: "PENDING",
          amount: finalAmount,
          paymentToken: { not: null },
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
        select: {
          id: true,
          midtransOrderId: true,
          paymentToken: true,
        },
      });

      if (activePendingOrder?.paymentToken && activePendingOrder?.midtransOrderId) {
        return NextResponse.json({
          success: true,
          type: "paid",
          token: activePendingOrder.paymentToken,
          orderId: activePendingOrder.midtransOrderId,
          reused: true,
        });
      }

      const orderId = `PUB-${Date.now()}-${nanoid(6).toUpperCase()}`;

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      }).catch(() => ({ name: session.user?.name, email: session.user?.email }));

      const transaction = await createMidtransTransaction({
        orderId,
        grossAmount: Math.round(finalAmount),
        items: [
          {
            id: pub.id,
            price: Math.round(finalAmount),
            quantity: 1,
            name: (pub.titleId || "Akses Berkas Riset").slice(0, 50),
          },
        ],
        customer: {
          first_name: user?.name?.split(" ")[0] ?? "User",
          last_name: user?.name?.split(" ").slice(1).join(" "),
          email: user?.email ?? "",
        },
      });

      await prisma.order.create({
        data: {
          userId: session.user.id,
          publicationId: pub.id,
          amount: finalAmount,
          midtransOrderId: orderId,
          paymentToken: transaction.token,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        type: "paid",
        token: transaction.token,
        orderId,
      });
    }

    // ==========================================
    // B. Handle Course Purchase (Default)
    // ==========================================
    if (!courseId) {
      return NextResponse.json(
        { error: "Kursus tidak ditentukan" },
        { status: 400 }
      );
    }

    // Get course from DB
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
        published: true,
      },
    }).catch(() => null);

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
    }).catch(() => null);

    if (existingEnrollment) {
      return NextResponse.json({ error: "Kamu sudah terdaftar di kursus ini" }, { status: 409 });
    }

    const baseAmount = course.discountPrice ?? course.price;
    let discountAmount = 0;
    let appliedCouponId: string | null = null;

    // Validate and apply coupon if provided
    if (couponCode && typeof couponCode === "string" && couponCode.trim().length > 0) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
        const isQuotaExceeded = coupon.maxUsage && coupon.usedCount >= coupon.maxUsage;
        const isMinMet = !coupon.minPurchase || baseAmount >= coupon.minPurchase;

        // Restriction check: Course-specific
        const isCourseAllowed = !coupon.courseId || coupon.courseId === course.id;

        // Restriction check: User-exclusive (allowed emails whitelist)
        let isUserAllowed = true;
        if (coupon.allowedEmails && coupon.allowedEmails.trim().length > 0) {
          const userEmail = session.user.email?.toLowerCase();
          const allowedList = coupon.allowedEmails
            .split(/[\n,;]+/)
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          isUserAllowed = !!(userEmail && allowedList.includes(userEmail));
        }

        // Restriction check: Max usage per user
        let isPerUserLimitOk = true;
        if (coupon.maxUsagePerUser) {
          const userUsageCount = await prisma.couponUsage.count({
            where: { couponId: coupon.id, userId: session.user.id },
          });
          if (userUsageCount >= coupon.maxUsagePerUser) {
            isPerUserLimitOk = false;
          }
        }

        if (
          !isExpired &&
          !isQuotaExceeded &&
          isMinMet &&
          isCourseAllowed &&
          isUserAllowed &&
          isPerUserLimitOk
        ) {
          appliedCouponId = coupon.id;
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (baseAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = Math.min(coupon.discountValue, baseAmount);
          }
        }
      }
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    // If free course or 100% discount, enroll directly
    if (finalAmount === 0 || course.price === 0) {
      await prisma.enrollment.create({
        data: { userId: session.user.id, courseId: course.id },
      }).catch(() => null);

      await prisma.course.update({
        where: { id: course.id },
        data: { enrollCount: { increment: 1 } },
      }).catch(() => null);

      // Record free/zero-payment order
      const orderId = `EA-FREE-${Date.now()}-${nanoid(6).toUpperCase()}`;
      await prisma.order.create({
        data: {
          userId: session.user.id,
          courseId: course.id,
          amount: 0,
          discountAmount,
          couponId: appliedCouponId,
          midtransOrderId: orderId,
          status: "PAID",
          paidAt: new Date(),
        },
      }).catch(() => null);

      if (appliedCouponId) {
        await prisma.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        }).catch(() => null);

        await prisma.couponUsage.create({
          data: {
            couponId: appliedCouponId,
            userId: session.user.id,
            orderId,
          },
        }).catch(() => null);
      }

      return NextResponse.json({ success: true, type: "free" });
    }

    // 1. Idempotency Guard: Reuse active pending order created within the last 15 minutes
    const activePendingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
        status: "PENDING",
        amount: finalAmount,
        couponId: appliedCouponId,
        paymentToken: { not: null },
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      select: {
        id: true,
        midtransOrderId: true,
        paymentToken: true,
      },
    });

    if (activePendingOrder?.paymentToken && activePendingOrder?.midtransOrderId) {
      return NextResponse.json({
        success: true,
        type: "paid",
        token: activePendingOrder.paymentToken,
        orderId: activePendingOrder.midtransOrderId,
        reused: true,
      });
    }

    // 2. Generate unique order ID
    const orderId = `EA-${Date.now()}-${nanoid(6).toUpperCase()}`;

    // Get user for customer details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }).catch(() => ({ name: session.user?.name, email: session.user?.email }));

    // 3. Create Midtrans Snap transaction
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

    // 4. Save Order with paymentToken for idempotency tracking
    await prisma.order.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        amount: finalAmount,
        discountAmount,
        couponId: appliedCouponId,
        midtransOrderId: orderId,
        paymentToken: transaction.token,
        status: "PENDING",
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
