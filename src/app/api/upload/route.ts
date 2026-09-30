import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/rate-limit";

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
]);

const ALLOWED_FOLDERS = new Set([
  "avatars",
  "certificates",
  "courses",
  "assignments",
  "general",
]);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB for images/PDFs
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

export async function POST(req: NextRequest) {
  // 1. Rate Limiting: 20 uploads per minute per user/IP
  const rateLimit = checkRateLimit(req, {
    identifier: "file_upload",
    limit: 20,
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = ((formData.get("folder") as string) || "general").toLowerCase().trim();

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // 3. MIME type check
    const mimeType = file.type?.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung. Hanya gambar (JPEG, PNG, WebP, GIF), video (MP4, WebM, OGG, MOV), dan PDF yang diperbolehkan." },
        { status: 400 }
      );
    }

    // 4. File size check based on type
    const isVideo = mimeType.startsWith("video/");
    const maxAllowedSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxAllowedSize) {
      return NextResponse.json(
        { error: `Ukuran file melebihi batas maksimal (${isVideo ? "100MB untuk video" : "15MB untuk gambar"})` },
        { status: 400 }
      );
    }

    // 5. File extension check
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Ekstensi file tidak valid atau berpotensi membahayakan." },
        { status: 400 }
      );
    }

    // 6. Whitelisted target folder
    const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : "general";
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // 7. Sanitize filename and create secure random prefix
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const randomHex = crypto.randomBytes(8).toString("hex");
    const sanitizedBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    
    let finalBuffer: Buffer = rawBuffer;
    let finalExt = ext;

    // 8. If image, process through Sharp to strip malicious metadata and sanitize image binary
    if (mimeType.startsWith("image/") && mimeType !== "image/gif") {
      try {
        const image = sharp(rawBuffer);
        const metadata = await image.metadata();
        
        // Verify valid image dimensions
        if (!metadata.width || !metadata.height) {
          return NextResponse.json({ error: "File gambar tidak valid atau rusak" }, { status: 400 });
        }

        // Auto-orient and strip dangerous EXIF / embedded executable payloads
        finalBuffer = await image
          .rotate()
          .toBuffer();
      } catch (imgError) {
        console.error("Corrupt or invalid image uploaded:", imgError);
        return NextResponse.json(
          { error: "Gambar tidak valid atau terindikasi memiliki format mencurigakan." },
          { status: 400 }
        );
      }
    }

    const uniqueName = `${Date.now()}_${randomHex}_${sanitizedBase}${finalExt}`;
    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, finalBuffer);

    const fileUrl = `/uploads/${folder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: finalBuffer.length,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
