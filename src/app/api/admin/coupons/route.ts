import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createCouponSchema = z.object({
  code: z
    .string()
    .min(2, "Kode kupon minimal 2 karakter")
    .max(50, "Kode kupon maksimal 50 karakter")
    .trim()
    .toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discountValue: z.number().positive("Besaran diskon harus lebih dari 0"),
  minPurchase: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  maxUsage: z.number().int().positive().optional().nullable(),
  maxUsagePerUser: z.number().int().positive().default(1).optional().nullable(),
  courseId: z.string().optional().nullable(),
  allowedEmails: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filterCourse = searchParams.get("courseId") || "";
    const filterStatus = searchParams.get("status") || "ALL"; // ALL, ACTIVE, INACTIVE, EXPIRED

    const now = new Date();

    const where: Record<string, unknown> = {};

    if (search.trim()) {
      where.OR = [
        { code: { contains: search.trim(), mode: "insensitive" } },
        { allowedEmails: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (filterCourse === "GLOBAL") {
      where.courseId = null;
    } else if (filterCourse && filterCourse !== "ALL") {
      where.courseId = filterCourse;
    }

    if (filterStatus === "ACTIVE") {
      where.isActive = true;
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
    } else if (filterStatus === "INACTIVE") {
      where.isActive = false;
    } else if (filterStatus === "EXPIRED") {
      where.expiresAt = { lte: now };
    }

    const [coupons, totalCount, courses, registeredUsers] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          course: {
            select: { id: true, title: true, slug: true, price: true },
          },
          usages: {
            take: 5,
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count(),
      prisma.course.findMany({
        where: { published: true },
        select: { id: true, title: true, slug: true },
        orderBy: { title: "asc" },
      }),
      // Sample list of users to assist admin in picking allowed users
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({
      coupons,
      totalCount,
      courses,
      availableUsers: registeredUsers,
    });
  } catch (error) {
    console.error("Error fetching admin coupons:", error);
    return NextResponse.json({ error: "Gagal memuat data kupon" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = createCouponSchema.parse(body);

    // Verify code uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Kode kupon "${data.code}" sudah ada. Gunakan kode lain.` },
        { status: 400 }
      );
    }

    // Verify courseId if specified
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        return NextResponse.json({ error: "Kelas yang dipilih tidak valid" }, { status: 400 });
      }
    }

    // Clean allowed emails format if specified
    let cleanedAllowedEmails: string | null = null;
    if (data.allowedEmails && data.allowedEmails.trim()) {
      const emailList = data.allowedEmails
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0 && e.includes("@"));

      if (emailList.length > 0) {
        cleanedAllowedEmails = Array.from(new Set(emailList)).join(", ");
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? 0,
        maxDiscount: data.maxDiscount || null,
        maxUsage: data.maxUsage || null,
        maxUsagePerUser: data.maxUsagePerUser ?? 1,
        courseId: data.courseId || null,
        allowedEmails: cleanedAllowedEmails,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data kupon tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Gagal membuat kupon baru" }, { status: 500 });
  }
}
