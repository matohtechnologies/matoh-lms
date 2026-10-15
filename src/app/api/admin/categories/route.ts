import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter")
    .trim(),
  nameEn: z
    .string()
    .max(100, "Nama kategori (English) maksimal 100 karakter")
    .trim()
    .optional()
    .nullable(),
  slug: z
    .string()
    .max(100, "Slug maksimal 100 karakter")
    .trim()
    .optional()
    .nullable(),
  icon: z.string().max(50).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { nameEn: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { courses: true },
        },
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
          },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Gagal memuat kategori" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data input tidak valid" },
        { status: 400 }
      );
    }

    const { name, icon } = parsed.data;
    const nameEn = parsed.data.nameEn?.trim() || name;

    let slug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(name);
    if (!slug) {
      slug = `kategori-${Date.now()}`;
    }

    // Check slug uniqueness
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      // Append random suffix if conflict
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        nameEn,
        slug,
        icon: icon || null,
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Gagal membuat kategori baru" }, { status: 500 });
  }
}
