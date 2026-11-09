import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

// MIME types lookup
const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getCandidatePaths(relativePath: string): string[] {
  const candidates: string[] = [];

  if (process.env.UPLOADS_DIR) {
    candidates.push(path.join(process.env.UPLOADS_DIR, relativePath));
  }

  // Persistent VPS shared uploads directory
  candidates.push(path.join("/var/www/lms-platform/shared/uploads", relativePath));

  // Local Next.js public uploads
  candidates.push(path.join(process.cwd(), "public", "uploads", relativePath));

  // Standalone release uploads fallback
  candidates.push(path.join(process.cwd(), "uploads", relativePath));

  return candidates;
}

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
        isPaid: true,
        price: true,
        fileUrl: true,
        fileName: true,
      },
    });

    if (!pub || !pub.fileUrl) {
      return new NextResponse("Berkas tidak ditemukan", { status: 404 });
    }

    // 1. Authorization check
    if (pub.isPaid && pub.price > 0) {
      if (!userId) {
        return new NextResponse("Harap masuk (login) untuk mengunduh berkas berbayar", { status: 401 });
      }

      if (!isAdmin) {
        const access = await prisma.publicationAccess.findUnique({
          where: {
            userId_publicationId: {
              userId,
              publicationId: pub.id,
            },
          },
        });

        if (!access) {
          return new NextResponse("Akses berkas terkunci. Silakan lakukan pembayaran terlebih dahulu.", { status: 403 });
        }
      }
    }

    // 2. If external HTTP/HTTPS URL, redirect safely
    if (pub.fileUrl.startsWith("http://") || pub.fileUrl.startsWith("https://")) {
      return NextResponse.redirect(new URL(pub.fileUrl));
    }

    // 3. Local filesystem resolving
    // Strip leading "/uploads/" if present
    const cleanRelative = pub.fileUrl.replace(/^\/?uploads\//, "");
    const candidatePaths = getCandidatePaths(cleanRelative);

    let targetFilePath: string | null = null;
    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        targetFilePath = candidate;
        break;
      }
    }

    if (!targetFilePath) {
      return new NextResponse("File fisik tidak ditemukan di server", { status: 404 });
    }

    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const stat = fs.statSync(targetFilePath);
    const fileBuffer = fs.readFileSync(targetFilePath);

    const downloadFileName = pub.fileName || path.basename(targetFilePath);
    const encodedFileName = encodeURIComponent(downloadFileName);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Content-Disposition": `attachment; filename="${downloadFileName}"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "private, no-transform, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error downloading publication file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

