import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CouponManager, type CouponItem, type CourseOption, type UserOption } from "./coupon-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manajemen Kupon Diskon — Admin" };

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  let coupons: CouponItem[] = [];
  let courses: CourseOption[] = [];
  let availableUsers: UserOption[] = [];

  try {
    const [dbCoupons, dbCourses, dbUsers] = await Promise.all([
      prisma.coupon.findMany({
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
      prisma.course.findMany({
        where: { published: true },
        select: { id: true, title: true, slug: true, price: true },
        orderBy: { title: "asc" },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
        take: 100,
      }),
    ]);

    coupons = dbCoupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minPurchase: c.minPurchase,
      maxDiscount: c.maxDiscount,
      maxUsage: c.maxUsage,
      usedCount: c.usedCount,
      maxUsagePerUser: c.maxUsagePerUser,
      courseId: c.courseId,
      allowedEmails: c.allowedEmails,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      course: c.course ? { id: c.course.id, title: c.course.title, slug: c.course.slug, price: c.course.price } : null,
      usages: c.usages.map((u) => ({
        id: u.id,
        couponId: u.couponId,
        userId: u.userId,
        orderId: u.orderId,
        usedAt: u.usedAt.toISOString(),
        user: u.user ? { id: u.user.id, name: u.user.name, email: u.user.email } : undefined,
      })),
      _count: c._count,
    }));

    courses = dbCourses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      price: c.price,
    }));

    availableUsers = dbUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));
  } catch (error) {
    console.error("Error loading coupons page data:", error);
  }

  return (
    <CouponManager
      initialCoupons={coupons}
      courses={courses}
      availableUsers={availableUsers}
    />
  );
}
