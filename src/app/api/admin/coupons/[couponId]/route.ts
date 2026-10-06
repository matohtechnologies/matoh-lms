import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ couponId: string }>;
}

const updateCouponSchema = z.object({
  code: z
    .string()
    .min(2, "Kode kupon minimal 2 karakter")
    .max(50, "Kode kupon maksimal 50 karakter")
    .trim()
    .toUpperCase()
    .optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().positive("Besaran diskon harus lebih dari 0").optional(),
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  maxUsage: z.number().int().positive().optional().nullable(),
  maxUsagePerUser: z.number().int().positive().optional().nullable(),
  courseId: z.string().optional().nullable(),
  allowedEmails: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { couponId } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        course: {
          select: { id: true, title: true, slug: true, price: true },
        },
        usages: {
          orderBy: { usedAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { usages: true, orders: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Kupon tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Error fetching single coupon:", error);
    return NextResponse.json({ error: "Gagal memuat detail kupon" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { couponId } = await params;
    const body = await req.json();
    const data = updateCouponSchema.parse(body);

    const existing = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Kupon tidak ditemukan" }, { status: 404 });
    }

    // If code is changing, ensure uniqueness
    if (data.code && data.code !== existing.code) {
      const codeTaken = await prisma.coupon.findUnique({
        where: { code: data.code },
      });
      if (codeTaken) {
        return NextResponse.json(
          { error: `Kode kupon "${data.code}" sudah digunakan kupon lain` },
          { status: 400 }
        );
      }
    }

    // Verify courseId if changing
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        return NextResponse.json({ error: "Kelas yang dipilih tidak valid" }, { status: 400 });
      }
    }

    // Clean allowed emails format if changing
    let cleanedAllowedEmails: string | null | undefined = undefined;
    if (data.allowedEmails !== undefined) {
      if (data.allowedEmails && data.allowedEmails.trim()) {
        const emailList = data.allowedEmails
          .split(/[\n,;]+/)
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0 && e.includes("@"));

        cleanedAllowedEmails = emailList.length > 0 ? Array.from(new Set(emailList)).join(", ") : null;
      } else {
        cleanedAllowedEmails = null;
      }
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.minPurchase !== undefined && { minPurchase: data.minPurchase ?? 0 }),
        ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount || null }),
        ...(data.maxUsage !== undefined && { maxUsage: data.maxUsage || null }),
        ...(data.maxUsagePerUser !== undefined && { maxUsagePerUser: data.maxUsagePerUser ?? 1 }),
        ...(data.courseId !== undefined && { courseId: data.courseId || null }),
        ...(cleanedAllowedEmails !== undefined && { allowedEmails: cleanedAllowedEmails }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data pembaruan tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "Gagal memperbarui kupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { couponId } = await params;

    const existing = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Kupon tidak ditemukan" }, { status: 404 });
    }

    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({ success: true, message: "Kupon berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Gagal menghapus kupon" }, { status: 500 });
  }
}
