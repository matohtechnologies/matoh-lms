import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// MIME types lookup
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function getCandidatePaths(relativePath: string): string[] {
  const candidates: string[] = [];

  // 1. Environment variable if set
  if (process.env.UPLOADS_DIR) {
    candidates.push(path.join(process.env.UPLOADS_DIR, relativePath));
  }

  // 2. VPS Shared uploads directory (persistent across deployments)
  candidates.push(path.join("/var/www/lms-platform/shared/uploads", relativePath));

  // 3. Local/Current public/uploads
  candidates.push(path.join(process.cwd(), "public", "uploads", relativePath));

  // 4. Standalone release root uploads fallback
  candidates.push(path.join(process.cwd(), "uploads", relativePath));

  return candidates;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Security check: Prevent path traversal attacks
    for (const segment of pathSegments) {
      if (segment.includes("..") || segment.includes("/") || segment.includes("\\")) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const relativePath = path.join(...pathSegments);
    const candidatePaths = getCandidatePaths(relativePath);

    let targetFilePath: string | null = null;
    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        targetFilePath = candidate;
        break;
      }
    }

    // Fallback: If not found in current candidates, search inside /var/www/lms-platform/releases/*/public/uploads/
    if (!targetFilePath && fs.existsSync("/var/www/lms-platform/releases")) {
      try {
        const releaseDirs = fs.readdirSync("/var/www/lms-platform/releases");
        for (const rDir of releaseDirs) {
          const legacyPath = path.join("/var/www/lms-platform/releases", rDir, "public", "uploads", relativePath);
          if (fs.existsSync(legacyPath)) {
            targetFilePath = legacyPath;
            break;
          }
        }
      } catch {
        // ignore search error
      }
    }

    if (!targetFilePath) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const stat = fs.statSync(targetFilePath);

    // Support HTTP Range requests for video/audio streaming
    const rangeHeader = req.headers.get("range");
    if (rangeHeader && stat.size > 0 && contentType.startsWith("video/")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

      if (start >= stat.size || end >= stat.size) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${stat.size}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(targetFilePath, { start, end });

      // Convert Node readable stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
      });

      return new NextResponse(webStream as unknown as BodyInit, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Standard static file response
    const fileBuffer = fs.readFileSync(targetFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (err) {
    console.error("Error serving uploaded file:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

