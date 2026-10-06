import { NextRequest } from "next/server";
import { GET as getHandler, POST as postHandler } from "@/app/api/courses/[courseId]/resources/route";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  return getHandler(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  return postHandler(req, context);
}
