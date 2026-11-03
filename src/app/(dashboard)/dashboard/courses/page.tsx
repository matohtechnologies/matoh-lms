import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import {
  DashboardCoursesClient,
  type DashboardCourseItem,
} from "./courses-client";

export const metadata: Metadata = {
  title: "Pilih & Beli Pelatihan — PT. Matoh Technologies Indonesia",
  description:
    "Katalog resmi dan pembelian program pelatihan sertifikasi PT. Matoh Technologies Indonesia langsung dari dasbor pengguna.",
};

export default async function DashboardCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const locale = await getLocale();
  const isEn = locale === "en";

  // Self-healing: auto-enroll any course with PAID order status
  try {
    const paidOrders = await prisma.order.findMany({
      where: { userId: session.user.id, status: "PAID" },
      select: { courseId: true },
    });

    if (paidOrders.length > 0) {
      await Promise.all(
        paidOrders.map((o) =>
          prisma.enrollment
            .upsert({
              where: {
                userId_courseId: {
                  userId: session.user!.id!,
                  courseId: o.courseId,
                },
              },
              create: { userId: session.user!.id!, courseId: o.courseId },
              update: {},
            })
            .catch(() => null)
        )
      );
    }
  } catch (err) {
    console.error("[Dashboard Courses Auto-enroll Error]:", err);
  }

  // Fetch all published courses with details
  const [coursesRaw, userEnrollments, userPendingOrders, categories] =
    await Promise.all([
      prisma.course.findMany({
        where: { published: true },
        include: {
          category: { select: { id: true, name: true } },
          instructor: { select: { id: true, name: true, image: true } },
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                select: {
                  id: true,
                  title: true,
                  titleEn: true,
                  duration: true,
                },
              },
            },
          },
        },
        orderBy: { enrollCount: "desc" },
      }),
      prisma.enrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true },
      }),
      prisma.order.findMany({
        where: { userId: session.user.id, status: "PENDING" },
        select: { courseId: true },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

  const enrolledCourseIds = userEnrollments.map((e) => e.courseId);
  const pendingOrderCourseIds = userPendingOrders.map((o) => o.courseId);

  // Cast courses to match DashboardCourseItem interface
  const courses: DashboardCourseItem[] = coursesRaw.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    titleEn: c.titleEn,
    description: c.description,
    descriptionEn: c.descriptionEn,
    thumbnail: c.thumbnail,
    price: c.price,
    discountPrice: c.discountPrice,
    level: c.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    duration: c.duration,
    totalLessons: c.totalLessons,
    rating: c.rating,
    reviewCount: c.reviewCount,
    enrollCount: c.enrollCount,
    whatYouLearn: c.whatYouLearn,
    category: c.category,
    instructor: c.instructor,
    sections: c.sections.map((s) => ({
      id: s.id,
      title: s.title,
      titleEn: s.titleEn,
      order: s.order,
      lessons: s.lessons,
    })),
  }));

  return (
    <DashboardCoursesClient
      courses={courses}
      categories={categories}
      enrolledCourseIds={enrolledCourseIds}
      pendingOrderCourseIds={pendingOrderCourseIds}
      isEn={isEn}
    />
  );
}

