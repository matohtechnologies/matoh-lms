import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === "ADMIN";

    const pub = await prisma.publication.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        published: true,
      },
      select: {
        id: true,
        slug: true,
        titleId: true,
        type: true,
        isPaid: true,
        price: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        externalUrl: true,
      },
    });

    if (!pub) {
      return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 });
    }

    let hasAccess = false;

    // 1. If publication is not paid, access is free for everyone
    if (!pub.isPaid || pub.price === 0) {
      hasAccess = true;
    } else if (isAdmin) {
      // 2. Administrators always have access
      hasAccess = true;
    } else if (userId) {
      // 3. Check user purchase entitlement in DB
      const access = await prisma.publicationAccess.findUnique({
        where: {
          userId_publicationId: {
            userId,
            publicationId: pub.id,
          },
        },
      });
      hasAccess = !!access;
    }

    return NextResponse.json({
      id: pub.id,
      slug: pub.slug,
      title: pub.titleId,
      type: pub.type,
      isPaid: pub.isPaid,
      price: pub.price,
      hasAccess,
      hasFile: !!pub.fileUrl,
      fileName: pub.fileName || (pub.fileUrl ? pub.fileUrl.split("/").pop() : null),
      fileSize: pub.fileSize || null,
      hasExternalUrl: !!pub.externalUrl,
      // Only reveal external URL and direct download if access is verified
      externalUrl: hasAccess ? pub.externalUrl : null,
      downloadUrl: hasAccess && pub.fileUrl ? `/api/publications/${pub.id}/download` : null,
    });
  } catch (error) {
    console.error("Error checking publication access:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

