import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const updateCategorySchema = z.object({
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { categoryId } = await params;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { courses: true },
        },
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            published: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching single category:", error);
    return NextResponse.json({ error: "Gagal memuat kategori" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { categoryId } = await params;
    const body = await req.json();

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data input tidak valid" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const { name, icon } = parsed.data;
    const nameEn = parsed.data.nameEn?.trim() || name;

    let slug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(name);
    if (!slug) {
      slug = existingCategory.slug;
    }

    // Check slug collision with other categories
    if (slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== categoryId) {
        return NextResponse.json(
          { error: `Slug "${slug}" sudah digunakan oleh kategori lain` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        nameEn,
        slug,
        icon: icon !== undefined ? (icon || null) : existingCategory.icon,
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Gagal memperbarui kategori" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { categoryId } = await params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    // Check if courses are linked
    if (category._count.courses > 0) {
      return NextResponse.json(
        {
          error: `Kategori "${category.name}" masih terhubung dengan ${category._count.courses} kelas aktif. Pindahkan kelas ke kategori lain terlebih dahulu sebelum menghapus.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: `Kategori "${category.name}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
