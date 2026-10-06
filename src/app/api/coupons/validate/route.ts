import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const validateCouponSchema = z.object({
  code: z.string().min(1).trim().toUpperCase(),
  courseId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const { code, courseId } = validateCouponSchema.parse(body);

    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Kode kupon tidak valid atau tidak aktif" }, { status: 404 });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Kode kupon telah kedaluwarsa" }, { status: 400 });
    }

    // Check max usage
    if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
      return NextResponse.json({ error: "Kuota penggunaan kupon ini telah habis" }, { status: 400 });
    }

    // Fetch course to calculate price
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { slug: courseId }], published: true },
      select: { id: true, price: true, discountPrice: true, title: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    // 1. Restriction: Specific Course Only
    if (coupon.courseId && coupon.courseId !== course.id) {
      return NextResponse.json(
        {
          error: `Kupon ini hanya berlaku khusus untuk kelas: "${coupon.course?.title || "Kelas Tertentu"}"`,
        },
        { status: 400 }
      );
    }

    // 2. Restriction: Specific Users Only (Allowed Emails Whitelist)
    if (coupon.allowedEmails && coupon.allowedEmails.trim().length > 0) {
      if (!session?.user?.email) {
        return NextResponse.json(
          {
            error: "Kupon ini memiliki akses terbatas. Silakan masuk (login) terlebih dahulu untuk menggunakannya.",
          },
          { status: 401 }
        );
      }

      const allowedList = coupon.allowedEmails
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = session.user.email.toLowerCase();
      if (!allowedList.includes(userEmail)) {
        return NextResponse.json(
          {
            error: `Kupon ini bersifat terbatas dan akun Anda (${session.user.email}) tidak terdaftar sebagai penerima kupon ini.`,
          },
          { status: 403 }
        );
      }
    }

    // 3. Restriction: Max Usage Per User
    if (userId && coupon.maxUsagePerUser) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsageCount >= coupon.maxUsagePerUser) {
        return NextResponse.json(
          {
            error: `Anda sudah mencapai batas penggunaan (${coupon.maxUsagePerUser}x) untuk kupon ini.`,
          },
          { status: 400 }
        );
      }
    }

    const basePrice = course.discountPrice ?? course.price;

    if (coupon.minPurchase && basePrice < coupon.minPurchase) {
      return NextResponse.json(
        { error: `Minimal transaksi untuk kupon ini adalah Rp ${coupon.minPurchase.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (basePrice * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, basePrice);
    }

    const finalAmount = Math.max(0, basePrice - discountAmount);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        courseId: coupon.courseId,
        courseTitle: coupon.course?.title || null,
        isExclusiveUser: !!(coupon.allowedEmails && coupon.allowedEmails.trim().length > 0),
      },
      basePrice,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Input kupon tidak valid" }, { status: 400 });
    }
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Gagal memvalidasi kupon" }, { status: 500 });
  }
}
