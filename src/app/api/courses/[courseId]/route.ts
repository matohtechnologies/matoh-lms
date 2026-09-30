import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId, published: true },
      select: {
        id: true,
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

    return NextResponse.json({
      course: {
        id: course.id,
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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
