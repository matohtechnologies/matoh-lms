import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { PublicationType } from "@prisma/client";

function estimateReadingTime(text: string): { id: string; en: string } {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return {
    id: `${minutes} menit baca`,
    en: `${minutes} min read`,
  };
}

function formatPublishDate(date: Date): { id: string; en: string } {
  return {
    id: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    en: date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/publications/[id] - Get detail of single publication
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication) {
      return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ publication });
  } catch (error) {
    console.error("Error fetching publication detail:", error);
    return NextResponse.json({ error: "Gagal memuat detail konten" }, { status: 500 });
  }
}

// PATCH /api/admin/publications/[id] - Update existing publication
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.publication.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();

    // Quick toggles (e.g. from table switch)
    if (Object.keys(body).length === 1) {
      if ("published" in body) {
        const updated = await prisma.publication.update({
          where: { id },
          data: { published: Boolean(body.published) },
        });
        return NextResponse.json({ success: true, publication: updated });
      }
      if ("featured" in body) {
        const updated = await prisma.publication.update({
          where: { id },
          data: { featured: Boolean(body.featured) },
        });
        return NextResponse.json({ success: true, publication: updated });
      }
    }

    const {
      titleId,
      titleEn,
      slug: rawSlug,
      type,
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
      authors,
      coverImage,
      publishedAt,
      tags,
      references,
      published,
      featured,
    } = body;

    const dataToUpdate: any = {};

    if (authors !== undefined && Array.isArray(authors)) {
      dataToUpdate.authors = authors;
      if (authors.length > 0) {
        const names = authors.map((a: any) => a.name?.trim()).filter(Boolean);
        if (names.length === 1) dataToUpdate.author = names[0];
        else if (names.length === 2) dataToUpdate.author = `${names[0]} & ${names[1]}`;
        else if (names.length > 2) dataToUpdate.author = `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;

        if (authors[0]?.role && !authorRole) dataToUpdate.authorRole = authors[0].role.trim();
        if (authors[0]?.bio && !authorBioId) dataToUpdate.authorBioId = authors[0].bio.trim();
      }
    }

    if (titleId !== undefined) {
      if (!titleId.trim()) return NextResponse.json({ error: "Judul Bahasa Indonesia wajib diisi" }, { status: 400 });
      dataToUpdate.titleId = titleId.trim();
    }
    if (titleEn !== undefined) dataToUpdate.titleEn = titleEn?.trim() || null;

    if (rawSlug !== undefined) {
      const newSlug = slugify(rawSlug.trim());
      if (!newSlug) return NextResponse.json({ error: "Slug tidak valid" }, { status: 400 });

      // Check collision with other publications
      const collision = await prisma.publication.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
        select: { id: true },
      });
      if (collision) {
        return NextResponse.json(
          { error: `Slug "${newSlug}" sudah digunakan oleh konten lain.` },
          { status: 400 }
        );
      }
      dataToUpdate.slug = newSlug;
    }

    if (type !== undefined) {
      dataToUpdate.type = type === "RESEARCH" ? "RESEARCH" : "PUBLICATION";
    }

    if (excerptId !== undefined) {
      if (!excerptId.trim()) return NextResponse.json({ error: "Ringkasan (Excerpt) wajib diisi" }, { status: 400 });
      dataToUpdate.excerptId = excerptId.trim();
    }
    if (excerptEn !== undefined) dataToUpdate.excerptEn = excerptEn?.trim() || null;

    if (contentId !== undefined) {
      if (!contentId.trim()) return NextResponse.json({ error: "Konten artikel wajib diisi" }, { status: 400 });
      dataToUpdate.contentId = contentId.trim();

      const readTimes = estimateReadingTime(contentId);
      dataToUpdate.readTimeId = readTimes.id;
      dataToUpdate.readTimeEn = readTimes.en;
    }
    if (contentEn !== undefined) dataToUpdate.contentEn = contentEn?.trim() || null;

    if (abstractId !== undefined) dataToUpdate.abstractId = abstractId?.trim() || null;
    if (abstractEn !== undefined) dataToUpdate.abstractEn = abstractEn?.trim() || null;

    if (categoryId !== undefined) {
      if (!categoryId.trim()) return NextResponse.json({ error: "Kategori wajib diisi" }, { status: 400 });
      dataToUpdate.categoryId = categoryId.trim();
    }
    if (categoryEn !== undefined) dataToUpdate.categoryEn = categoryEn?.trim() || dataToUpdate.categoryId || existing.categoryId;

    if (author !== undefined) {
      if (!author.trim()) return NextResponse.json({ error: "Nama penulis wajib diisi" }, { status: 400 });
      dataToUpdate.author = author.trim();
    }
    if (authorRole !== undefined) dataToUpdate.authorRole = authorRole?.trim() || null;
    if (authorBioId !== undefined) dataToUpdate.authorBioId = authorBioId?.trim() || null;
    if (authorBioEn !== undefined) dataToUpdate.authorBioEn = authorBioEn?.trim() || null;

    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage?.trim() || null;

    if (publishedAt !== undefined) {
      const pubDate = publishedAt ? new Date(publishedAt) : new Date();
      dataToUpdate.publishedAt = pubDate;
      const humanDates = formatPublishDate(pubDate);
      dataToUpdate.dateId = humanDates.id;
      dataToUpdate.dateEn = humanDates.en;
    }

    if (tags !== undefined) {
      dataToUpdate.tags = Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [];
    }

    if (references !== undefined) {
      dataToUpdate.references = Array.isArray(references) ? references : [];
    }

    if (published !== undefined) dataToUpdate.published = Boolean(published);
    if (featured !== undefined) dataToUpdate.featured = Boolean(featured);

    const updated = await prisma.publication.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, publication: updated });
  } catch (error: any) {
    console.error("Error updating publication:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui konten riset/publikasi" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/publications/[id] - Remove publication
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.publication.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    }

    await prisma.publication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Konten berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json({ error: "Gagal menghapus konten riset/publikasi" }, { status: 500 });
  }
}

