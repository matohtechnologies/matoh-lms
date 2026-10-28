import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const filter = searchParams.get("filter") || "all"; // all, unread, read

    const where: Record<string, unknown> = {};

    if (filter === "unread") {
      where.isRead = false;
    } else if (filter === "read") {
      where.isRead = true;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
        { institution: { contains: q, mode: "insensitive" } },
      ];
    }

    const [inquiries, totalCount, unreadCount] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      inquiries,
      stats: {
        total: totalCount,
        unread: unreadCount,
        read: totalCount - unreadCount,
      },
    });
  } catch (error) {
    console.error("[Admin Inquiries GET]", error);
    return NextResponse.json(
      { error: "Gagal memuat pesan konsultasi" },
      { status: 500 }
    );
  }
}

