import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { resolveThumbnailUrl } from "@/lib/youtube";

const courseSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  categoryId: z.string().optional(),
  instructorId: z.string().optional(),
  instructorHeadline: z.string().nullable().optional(),
  instructorBio: z.string().nullable().optional(),
  whatYouLearn: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price: z.number().min(0),
  discountPrice: z.number().min(0).nullable().optional(),
  duration: z.number().min(0).optional(),
  thumbnail: z.string().optional().nullable(),
  published: z.boolean(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [categories, instructors] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          headline: true,
          bio: true,
          role: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ categories, instructors });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = courseSchema.parse(body);

    // Check slug uniqueness
    const existing = await prisma.course.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug sudah digunakan. Gunakan slug yang berbeda." },
        { status: 409 }
      );
    }

    // Get or create category
    let categoryId = data.categoryId;
    if (!categoryId) {
      const defaultCat = await prisma.category.findFirst();
      categoryId = defaultCat?.id;
    }

    // Determine instructorId
    let instructorId = data.instructorId || session.user.id;
    if (data.instructorId) {
      const instructorExists = await prisma.user.findUnique({ where: { id: data.instructorId } });
      if (!instructorExists) {
        instructorId = session.user.id;
      }
    } else {
      const instructorExists = await prisma.user.findUnique({ where: { id: instructorId } });
      if (!instructorExists) {
        const fallbackInstructor = await prisma.user.findFirst({
          where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
        });
        if (fallbackInstructor) {
          instructorId = fallbackInstructor.id;
        }
      }
    }

    const whatYouLearnStr = Array.isArray(data.whatYouLearn)
      ? JSON.stringify(data.whatYouLearn)
      : data.whatYouLearn;

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        price: data.price,
        discountPrice: data.discountPrice,
        duration: data.duration ?? 0,
        thumbnail: data.thumbnail ? resolveThumbnailUrl(data.thumbnail) : null,
        published: data.published,
        categoryId: categoryId!,
        instructorId,
        instructorHeadline: data.instructorHeadline || null,
        instructorBio: data.instructorBio || null,
        whatYouLearn: whatYouLearnStr || null,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
