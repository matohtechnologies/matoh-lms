import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { PublicationManager, type PublicationItemAdmin } from "./publication-manager";
import { PUBLICATIONS } from "@/lib/publications";

export const metadata: Metadata = {
  title: "Manajemen Riset & Publikasi — Admin Matoh Technologies",
};

export const dynamic = "force-dynamic";

export default async function AdminPublicationsPage() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let publications: PublicationItemAdmin[] = [];
  let categories: Array<{ id: string; name: string; nameEn?: string }> = [];

  try {
    let dbItems = await prisma.publication.findMany({
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    });

    let distinctCats = await prisma.publication.findMany({
      select: { categoryId: true, categoryEn: true },
      distinct: ["categoryId"],
    });

    // Auto-seed data publikasi bawaan jika tabel di database masih kosong
    if (dbItems.length === 0) {
      try {
        for (const item of PUBLICATIONS) {
          const isResearch =
            item.type === "RESEARCH" ||
            item.categoryId.toLowerCase().includes("decision") ||
            item.tags.includes("AHP") ||
            item.tags.includes("ISM") ||
            item.slug.includes("riset");

          await prisma.publication.upsert({
            where: { slug: item.slug },
            update: {},
            create: {
              slug: item.slug,
              type: isResearch ? "RESEARCH" : "PUBLICATION",
              titleId: item.titleId,
              titleEn: item.titleEn,
              excerptId: item.excerptId,
              excerptEn: item.excerptEn,
              contentId: item.contentId,
              contentEn: item.contentEn,
              abstractId: item.abstractId,
              abstractEn: item.abstractEn,
              categoryId: item.categoryId,
              categoryEn: item.categoryEn,
              author: item.author,
              authorRole: item.authorRole,
              authorBioId: item.authorBioId,
              authorBioEn: item.authorBioEn,
              authors: (item.authors as any) || [],
              publishedAt: new Date(item.publishedAt),
              dateId: item.dateId,
              dateEn: item.dateEn,
              readTimeId: item.readTimeId,
              readTimeEn: item.readTimeEn,
              tags: item.tags,
              references: (item.references as any) || [],
              published: true,
              featured: false,
              isPaid: false,
              price: 0,
            },
          });
        }

        dbItems = await prisma.publication.findMany({
          orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        });

        distinctCats = await prisma.publication.findMany({
          select: { categoryId: true, categoryEn: true },
          distinct: ["categoryId"],
        });
      } catch (seedErr) {
        console.warn("Auto-seeding default publications skipped:", seedErr);
      }
    }

    publications = dbItems.map((item) => ({
      id: item.id,
      slug: item.slug,
      type: item.type as "PUBLICATION" | "RESEARCH",
      titleId: item.titleId,
      titleEn: item.titleEn,
      excerptId: item.excerptId,
      excerptEn: item.excerptEn,
      contentId: item.contentId,
      contentEn: item.contentEn,
      abstractId: item.abstractId,
      abstractEn: item.abstractEn,
      categoryId: item.categoryId,
      categoryEn: item.categoryEn,
      author: item.author,
      authorRole: item.authorRole,
      authorBioId: item.authorBioId,
      authorBioEn: item.authorBioEn,
      authors: (item.authors as any) || [],
      coverImage: item.coverImage,
      publishedAt: item.publishedAt.toISOString(),
      dateId: item.dateId,
      dateEn: item.dateEn,
      readTimeId: item.readTimeId,
      readTimeEn: item.readTimeEn,
      tags: item.tags,
      references: item.references as any,
      published: item.published,
      featured: item.featured,
      views: item.views,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    categories = distinctCats.map((c) => ({
      id: c.categoryId,
      name: c.categoryId,
      nameEn: c.categoryEn || c.categoryId,
    }));
  } catch (error) {
    console.error("Error loading admin publications page:", error);
  }

  return (
    <PublicationManager
      initialPublications={publications}
      initialCategories={categories}
    />
  );
}

