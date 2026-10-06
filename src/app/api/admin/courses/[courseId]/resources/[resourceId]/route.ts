import { NextRequest } from "next/server";
import { PATCH as patchHandler, DELETE as deleteHandler } from "@/app/api/courses/[courseId]/resources/[resourceId]/route";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; resourceId: string }> }
) {
  return patchHandler(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; resourceId: string }> }
) {
  return deleteHandler(req, context);
}
