import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { PublicationType } from "@prisma/client";

// Calculate estimated read time based on word count
function estimateReadingTime(text: string): { id: string; en: string } {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return {
    id: `${minutes} menit baca`,
    en: `${minutes} min read`,
  };
}

// Format date into localized human-readable string
function formatPublishDate(date: Date): { id: string; en: string } {
  return {
    id: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    en: date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
  };
}

// GET /api/admin/publications - List publications with filtering & statistics
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const category = searchParams.get("category") || "ALL";

    const where: any = {};

    if (search) {
      where.OR = [
        { titleId: { contains: search, mode: "insensitive" } },
        { titleEn: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { categoryId: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (type === "PUBLICATION" || type === "RESEARCH") {
      where.type = type as PublicationType;
    }

    if (status === "PUBLISHED") {
      where.published = true;
    } else if (status === "DRAFT") {
      where.published = false;
    }

    if (category !== "ALL") {
      where.categoryId = category;
    }

    const [items, totalCount, pubCount, resCount, publishedCount, draftCount] = await Promise.all([
      prisma.publication.findMany({
        where,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.publication.count(),
      prisma.publication.count({ where: { type: "PUBLICATION" } }),
      prisma.publication.count({ where: { type: "RESEARCH" } }),
      prisma.publication.count({ where: { published: true } }),
      prisma.publication.count({ where: { published: false } }),
    ]);

    // Distinct categories for filter dropdown
    const distinctCategories = await prisma.publication.findMany({
      select: { categoryId: true, categoryEn: true },
      distinct: ["categoryId"],
    });

    return NextResponse.json({
      publications: items,
      stats: {
        total: totalCount,
        publications: pubCount,
        research: resCount,
        published: publishedCount,
        draft: draftCount,
      },
      categories: distinctCategories.map((c: any) => ({
        id: c.categoryId,
        name: c.categoryId,
        nameEn: c.categoryEn || c.categoryId,
      })),
    });
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { error: "Gagal memuat data riset & publikasi" },
      { status: 500 }
    );
  }
}

// POST /api/admin/publications - Create new publication or research item
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      titleId,
      titleEn,
      slug: rawSlug,
      type = "PUBLICATION",
      excerptId,
      excerptEn,
      contentId,
      contentEn,
      abstractId,
      abstractEn,
      categoryId,
      categoryEn,
      author,
      authorRole,
      authorBioId,
      authorBioEn,
      authors = [],
      coverImage,
      publishedAt,
      tags = [],
      references = [],
      published = true,
      featured = false,
    } = body;

    // Resolve composite author string
    let resolvedAuthor = author?.trim() || "";
    if (Array.isArray(authors) && authors.length > 0) {
      const names = authors.map((a: any) => a.name?.trim()).filter(Boolean);
      if (names.length === 1) resolvedAuthor = names[0];
      else if (names.length === 2) resolvedAuthor = `${names[0]} & ${names[1]}`;
      else if (names.length > 2) resolvedAuthor = `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
    }

    // Validation
    if (!titleId || !titleId.trim()) {
      return NextResponse.json({ error: "Judul Bahasa Indonesia wajib diisi" }, { status: 400 });
    }
    if (!excerptId || !excerptId.trim()) {
      return NextResponse.json({ error: "Ringkasan (Excerpt) wajib diisi" }, { status: 400 });
    }
    if (!contentId || !contentId.trim()) {
      return NextResponse.json({ error: "Konten artikel wajib diisi" }, { status: 400 });
    }
    if (!categoryId || !categoryId.trim()) {
      return NextResponse.json({ error: "Kategori wajib dipilih atau diisi" }, { status: 400 });
    }
    if (!resolvedAuthor) {
      return NextResponse.json({ error: "Nama penulis wajib diisi" }, { status: 400 });
    }

    // Slug calculation & check
    const slug = (rawSlug && rawSlug.trim()) ? slugify(rawSlug.trim()) : slugify(titleId.trim());
    if (!slug) {
      return NextResponse.json({ error: "Slug tidak valid" }, { status: 400 });
    }

    const existing = await prisma.publication.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah digunakan oleh konten lain. Silakan ubah slug.` },
        { status: 400 }
      );
    }

    const pubDate = publishedAt ? new Date(publishedAt) : new Date();
    const humanDates = formatPublishDate(pubDate);
    const readTimes = estimateReadingTime(contentId);

    const publication = await prisma.publication.create({
      data: {
        slug,
        type: (type === "RESEARCH" ? "RESEARCH" : "PUBLICATION") as any,
        titleId: titleId.trim(),
        titleEn: titleEn?.trim() || null,
        excerptId: excerptId.trim(),
        excerptEn: excerptEn?.trim() || null,
        contentId: contentId.trim(),
        contentEn: contentEn?.trim() || null,
        abstractId: abstractId?.trim() || null,
        abstractEn: abstractEn?.trim() || null,
        categoryId: categoryId.trim(),
        categoryEn: categoryEn?.trim() || categoryId.trim(),
        author: resolvedAuthor,
        authorRole: authorRole?.trim() || (Array.isArray(authors) && authors[0]?.role?.trim()) || null,
        authorBioId: authorBioId?.trim() || (Array.isArray(authors) && authors[0]?.bio?.trim()) || null,
        authorBioEn: authorBioEn?.trim() || null,
        authors: Array.isArray(authors) ? authors : [],
        coverImage: coverImage?.trim() || null,
        publishedAt: pubDate,
        dateId: humanDates.id,
        dateEn: humanDates.en,
        readTimeId: readTimes.id,
        readTimeEn: readTimes.en,
        tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
        references: Array.isArray(references) ? references : [],
        published: Boolean(published),
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({ success: true, publication }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating publication:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal membuat konten riset/publikasi" },
      { status: 500 }
    );
  }
}

