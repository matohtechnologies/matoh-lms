import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    maintenance: process.env.MAINTENANCE_MODE === "true",
    timestamp: new Date().toISOString(),
  });
}
