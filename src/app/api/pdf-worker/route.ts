import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const candidatePaths = [
      path.join(process.cwd(), "public", "pdf.worker.min.js"),
      path.join(process.cwd(), "public", "pdf.worker.min.mjs"),
      path.join(__dirname, "../../../../public/pdf.worker.min.js"),
    ];

    let filePath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      return new NextResponse("Worker not found", { status: 404 });
    }

    const content = fs.readFileSync(filePath);
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error serving pdf-worker:", error);
    return new NextResponse("Error serving pdf worker", { status: 500 });
  }
}
