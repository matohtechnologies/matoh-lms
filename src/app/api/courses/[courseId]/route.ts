import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await auth();

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
        published: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        price: true,
        discountPrice: true,
        duration: true,
        totalLessons: true,
        instructor: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let isEnrolled = false;
    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId: course.id },
        },
      });
      isEnrolled = Boolean(enrollment || session.user.role === "ADMIN");
    }

    return NextResponse.json({
      isEnrolled,
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        thumbnail: course.thumbnail,
        price: course.price,
        discountPrice: course.discountPrice,
        duration: course.duration,
        totalLessons: course.totalLessons,
        instructor: { name: course.instructor.name },
        category: { name: course.category.name },
      },
    });
  } catch (error) {
    console.error("Error fetching course detail:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
