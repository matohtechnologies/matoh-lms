import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CategoryManager, type CategoryItem } from "./category-manager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Kategori Kelas — Admin Matoh Technologies",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/dashboard");

  let categories: CategoryItem[] = [];

  try {
    const dbCategories = await prisma.category.findMany({
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

    categories = dbCategories.map((c) => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      slug: c.slug,
      icon: c.icon,
      _count: c._count,
      courses: c.courses,
    }));
  } catch (error) {
    console.error("Error loading categories admin page:", error);
  }

  return <CategoryManager initialCategories={categories} />;
}
