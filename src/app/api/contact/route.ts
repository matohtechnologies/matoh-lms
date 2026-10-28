import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactInquiryNotificationEmail } from "@/lib/email";
import { ensureInquiriesTable } from "@/lib/db-inquiries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, category, institution, message } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Pesan atau pertanyaan wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? String(phone).trim() : null;
    const trimmedCategory = category ? String(category).trim() : "Konsultasi Kelas & Karir";
    const trimmedInstitution = institution ? String(institution).trim() : null;
    const trimmedMessage = message.trim();

    // 1. Save to Database (with auto-create table fallback)
    let inquiry;
    try {
      inquiry = await prisma.contactInquiry.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          category: trimmedCategory,
          institution: trimmedInstitution,
          message: trimmedMessage,
        },
      });
    } catch (dbErr: unknown) {
      const errMsg = String(dbErr);
      if (
        errMsg.includes("contact_inquiries") ||
        errMsg.includes("does not exist") ||
        (dbErr as { code?: string })?.code === "P2021"
      ) {
        console.warn("[Contact API] Table missing, auto-creating contact_inquiries table...");
        await ensureInquiriesTable();
        inquiry = await prisma.contactInquiry.create({
          data: {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            category: trimmedCategory,
            institution: trimmedInstitution,
            message: trimmedMessage,
          },
        });
      } else {
        throw dbErr;
      }
    }

    // 2. Send Email Notification to Admin in background
    sendContactInquiryNotificationEmail({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      category: trimmedCategory,
      institution: trimmedInstitution,
      message: trimmedMessage,
    }).catch((emailErr: unknown) => {
      console.error("[Contact API] Background email send failed:", emailErr);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pesan Anda berhasil dikirim dan tersimpan.",
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Contact API] Error handling inquiry submission:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan pesan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
