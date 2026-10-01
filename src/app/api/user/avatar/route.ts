import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * GET /api/user/avatar?id=<userId>
 * Retrieves user profile photo directly from PostgreSQL database.
 * If data URI, converts to binary and serves with proper cache headers.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let targetUserId = searchParams.get("id");

    if (!targetUserId) {
      const session = await auth();
      targetUserId = session?.user?.id ?? null;
    }

    if (!targetUserId) {
      return new NextResponse("User not specified", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { image: true, name: true },
    });

    if (!user || !user.image) {
      // Return a clean inline SVG placeholder
      const initial = (user?.name?.[0] || "U").toUpperCase();
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f97316"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>
          <rect width="128" height="128" rx="28" fill="url(#grad)"/>
          <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
        </svg>
      `.trim();
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // If stored as Data URL (base64) in database
    if (user.image.startsWith("data:")) {
      const matches = user.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const imageBuffer = Buffer.from(base64Data, "base64");

        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Length": imageBuffer.length.toString(),
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // If stored as external or relative URL, redirect to it
    return NextResponse.redirect(new URL(user.image, req.url));
  } catch (error) {
    console.error("Error retrieving avatar from database:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

/**
 * POST /api/user/avatar
 * Uploads user photo directly into PostgreSQL database (as optimized base64 Data URL in User.image).
 * No hardcoded local paths or disk writes.
 */
export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const rateLimit = checkRateLimit(req, {
    identifier: "avatar_upload",
    limit: 15,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.isAllowed && rateLimit.response) {
    return rateLimit.response;
  }

  try {
    // 2. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let finalDataUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "File foto tidak ditemukan" }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.has(file.type?.toLowerCase())) {
        return NextResponse.json(
          { error: "Tipe file tidak didukung. Harap unggah JPEG, PNG, WebP, atau GIF." },
          { status: 400 }
        );
      }

      if (file.size > MAX_AVATAR_SIZE) {
        return NextResponse.json(
          { error: "Ukuran file terlalu besar. Maksimal 5MB." },
          { status: 400 }
        );
      }

      const rawBuffer = Buffer.from(await file.arrayBuffer());

      // Optimize image: resize to 320x320, convert to high-efficiency WebP, strip metadata
      try {
        const optimizedBuffer = await sharp(rawBuffer)
          .rotate() // Auto-orient based on EXIF
          .resize(320, 320, {
            fit: "cover",
            position: "center",
          })
          .webp({ quality: 85, effort: 4 })
          .toBuffer();

        finalDataUrl = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;
      } catch (err) {
        console.error("Image processing error with sharp:", err);
        return NextResponse.json(
          { error: "File gambar tidak valid atau rusak." },
          { status: 400 }
        );
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body.image === "string" && body.image.startsWith("data:image/")) {
        finalDataUrl = body.image;
      } else {
        return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Content-Type tidak didukung" }, { status: 400 });
    }

    if (!finalDataUrl) {
      return NextResponse.json({ error: "Gagal memproses data gambar" }, { status: 400 });
    }

    // 3. Save directly to PostgreSQL database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: finalDataUrl },
      select: { id: true, name: true, image: true },
    });

    const avatarUrl = `/api/user/avatar?id=${session.user.id}&t=${Date.now()}`;

    return NextResponse.json({
      success: true,
      url: finalDataUrl, // Data URI stored in DB
      avatarUrl,         // Dynamic DB endpoint
      user: updatedUser,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Gagal menyimpan foto profil ke database" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/avatar
 * Removes user photo directly from PostgreSQL database.
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json({ error: "Gagal menghapus foto dari database" }, { status: 500 });
  }
}
