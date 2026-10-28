import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: {
        ...(typeof body.isRead === "boolean" ? { isRead: body.isRead } : {}),
        ...(body.markReplied ? { repliedAt: new Date(), isRead: true } : {}),
      },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("[Admin Inquiries PATCH]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pesan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.contactInquiry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Pesan berhasil dihapus" });
  } catch (error) {
    console.error("[Admin Inquiries DELETE]", error);
    return NextResponse.json(
      { error: "Gagal menghapus pesan" },
      { status: 500 }
    );
  }
}
