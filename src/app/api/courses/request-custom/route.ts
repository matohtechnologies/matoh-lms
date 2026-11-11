import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactInquiryNotificationEmail } from "@/lib/email";
import { ensureInquiriesTable } from "@/lib/db-inquiries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      requestType = "INDIVIDUAL",
      name,
      email,
      phone,
      institution,
      topic,
      participants,
      format,
      timeline,
      notes,
    } = body;

    // 1. Validasi Input Dasar
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama lengkap atau PIC wajib diisi." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (requestType === "CORPORATE" && (!institution || typeof institution !== "string" || !institution.trim())) {
      return NextResponse.json(
        { error: "Nama perusahaan atau instansi wajib diisi untuk request corporate." },
        { status: 400 }
      );
    }

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Topik atau bidang kursus yang diinginkan wajib diisi." },
        { status: 400 }
      );
    }

    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return NextResponse.json(
        { error: "Mohon jelaskan secara singkat kebutuhan silabus atau tujuan pelatihan Anda." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? String(phone).trim() : null;
    const trimmedInstitution = institution ? String(institution).trim() : null;
    const trimmedTopic = topic.trim();
    const trimmedNotes = notes.trim();
    const isCorporate = requestType === "CORPORATE";

    // 2. Susun pesan komprehensif untuk database & notifikasi email
    const structuredMessage = [
      `=== REQUEST KURSUS CUSTOM ===`,
      `Tipe Pemohon: ${isCorporate ? "🏢 Perusahaan / Corporate / Instansi" : "👤 Individu / Profesional / Tim Kecil"}`,
      `Topik Pelatihan: ${trimmedTopic}`,
      trimmedInstitution ? `Instansi / Perusahaan: ${trimmedInstitution}` : null,
      participants ? `Perkiraan Peserta: ${participants}` : null,
      format ? `Format Pelatihan: ${format}` : null,
      timeline ? `Target Pelaksanaan: ${timeline}` : null,
      ``,
      `--- Rincian Kebutuhan & Silabus ---`,
      trimmedNotes,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const categoryLabel = `Request Kursus Custom (${isCorporate ? "Corporate" : "Individu"})`;

    // 3. Simpan ke Database
    let inquiry;
    try {
      inquiry = await prisma.contactInquiry.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          category: categoryLabel,
          institution: trimmedInstitution,
          message: structuredMessage,
        },
      });
    } catch (dbErr: unknown) {
      const errMsg = String(dbErr);
      if (
        errMsg.includes("contact_inquiries") ||
        errMsg.includes("does not exist") ||
        (dbErr as { code?: string })?.code === "P2021"
      ) {
        console.warn("[Custom Course Request] Table missing, auto-creating table...");
        await ensureInquiriesTable();
        inquiry = await prisma.contactInquiry.create({
          data: {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            category: categoryLabel,
            institution: trimmedInstitution,
            message: structuredMessage,
          },
        });
      } else {
        throw dbErr;
      }
    }

    // 4. Kirim notifikasi email ke Admin secara background
    sendContactInquiryNotificationEmail({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      category: `${categoryLabel} - ${trimmedTopic}`,
      institution: trimmedInstitution || undefined,
      message: structuredMessage,
    }).catch((emailErr) => {
      console.warn("[Custom Course Request] Gagal mengirim notifikasi email admin:", emailErr);
    });

    return NextResponse.json({
      success: true,
      message: "Request kursus custom berhasil dikirim. Tim Matoh Technologies akan segera menghubungi Anda.",
      inquiryId: inquiry.id,
    });
  } catch (error: unknown) {
    console.error("[Custom Course Request API Error]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memproses request kursus custom." },
      { status: 500 }
    );
  }
}

