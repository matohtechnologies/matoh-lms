import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

// Before custom domain verification, Resend requires onboarding@resend.dev for test sends
export const DEFAULT_SENDER =
  process.env.EMAIL_FROM || "Matoh Technologies <onboarding@resend.dev>";

interface SendPasswordResetParams {
  to: string;
  name?: string | null;
  resetUrl: string;
}

interface SendOrderReceiptParams {
  to: string;
  name?: string | null;
  orderId: string;
  courseTitle: string;
  amount: number;
}

interface SendWelcomeParams {
  to: string;
  name?: string | null;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetParams) {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY is not configured. Email skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  const recipientName = name || "Pelajar";

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to,
      subject: "Atur Ulang Kata Sandi Akun - PT. Matoh Technologies Indonesia",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; }
            .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; margin: 24px 0; }
            .footer { margin-top: 32px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">PT. Matoh Technologies Indonesia</div>
            <h2 style="margin-top: 0; color: #0f172a;">Halo, ${recipientName}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Kami menerima permintaan untuk mengatur ulang kata sandi akun LMS Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
            </p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn" target="_blank">Atur Ulang Kata Sandi</a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              Tautan ini hanya berlaku selama 60 menit. Jika Anda tidak merasa melakukan permintaan ini, abaikan pesan ini dan akun Anda tetap aman.
            </p>
            <div class="footer">
              SK Menkumham: AHU-064920.AH.01.30.Tahun 2024<br/>
              Platform Pembelajaran & Transformasi Digital Terapan
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Resend Error] Failed to send password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[Resend Exception] Error sending email:", err);
    return { success: false, error: err };
  }
}

export async function sendOrderReceiptEmail({
  to,
  name,
  orderId,
  courseTitle,
  amount,
}: SendOrderReceiptParams) {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY is not configured. Email skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  const recipientName = name || "Pelajar";
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to,
      subject: `Konfirmasi Pembayaran Berhasil: ${courseTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .receipt-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; margin: 20px 0; }
            .footer { margin-top: 32px; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 20px;">
              PT. Matoh Technologies Indonesia
            </div>
            <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px;">
              PEMBAYARAN TERKONFIRMASI
            </div>
            <h2 style="margin: 0 0 12px 0; color: #0f172a;">Selamat Datang di Program Pelatihan, ${recipientName}!</h2>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Transaksi Anda telah berhasil diverifikasi oleh payment gateway Midtrans. Akses materi kelas Anda telah terbuka dengan status <strong>Akses Selamanya (Lifetime Access)</strong>.
            </p>
            <div class="receipt-box">
              <div style="font-size: 12px; color: #64748b;">ID Transaksi:</div>
              <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${orderId}</div>
              
              <div style="font-size: 12px; color: #64748b;">Program Kelas:</div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${courseTitle}</div>
              
              <div style="font-size: 12px; color: #64748b;">Total Pembayaran:</div>
              <div style="font-size: 16px; font-weight: 800; color: #2563eb;">${formattedAmount}</div>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://matohtechnologies.com"}/dashboard/my-courses" class="btn" target="_blank">
                Buka Kelas Saya Sekarang
              </a>
            </div>
            <div class="footer">
              SK Menkumham: AHU-064920.AH.01.30.Tahun 2024<br/>
              Simpan bukti email ini sebagai tanda terima transaksi sah.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Resend Error] Failed to send receipt email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("[Resend Exception] Error sending receipt:", err);
    return { success: false, error: err };
  }
}

interface SendContactInquiryParams {
  name: string;
  email: string;
  phone?: string | null;
  category: string;
  institution?: string | null;
  message: string;
}

export async function sendContactInquiryNotificationEmail(params: SendContactInquiryParams) {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY is not configured. Contact inquiry notification skipped.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "kemplang313@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.matohtechnologies.com";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
        .info-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
        .info-table td.label { width: 140px; color: #64748b; font-weight: 600; }
        .message-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
        .btn-wa { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 16px; margin-left: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">PESAN KONSULTASI MASUK</span>
        <h2 style="margin: 0 0 8px 0; color: #0f172a;">Ada Pertanyaan Baru dari Website</h2>
        <p style="font-size: 13px; color: #64748b; margin-top: 0;">Pengunjung telah mengirimkan pesan konsultasi melalui formulir bantuan.</p>

        <table class="info-table">
          <tr>
            <td class="label">Nama Lengkap</td>
            <td><strong>${params.name}</strong></td>
          </tr>
          <tr>
            <td class="label">Email</td>
            <td><a href="mailto:${params.email}" style="color: #2563eb;">${params.email}</a></td>
          </tr>
          <tr>
            <td class="label">WhatsApp / HP</td>
            <td>${params.phone ? `<a href="https://wa.me/${params.phone.replace(/[^0-9]/g, '')}" style="color: #059669;">${params.phone}</a>` : '-'}</td>
          </tr>
          <tr>
            <td class="label">Topik Kebutuhan</td>
            <td><span style="font-weight: 600; color: #1e40af;">${params.category}</span></td>
          </tr>
          <tr>
            <td class="label">Instansi / UMKM</td>
            <td>${params.institution || '-'}</td>
          </tr>
        </table>

        <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Isi Pesan / Pertanyaan:</div>
        <div class="message-box">${params.message}</div>

        <div style="margin-top: 24px; text-align: left;">
          <a href="${appUrl}/admin/inquiries" class="btn" target="_blank">
            Buka Dashboard Admin
          </a>
          ${params.phone ? `
            <a href="https://wa.me/${params.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${params.name}, kami dari tim PT. Matoh Technologies Indonesia menanggapi pesan konsultasi Anda mengenai ${params.category}...`)}" class="btn-wa" target="_blank">
              Balas via WhatsApp
            </a>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Attempt 1: Using default configured sender and recipient
    let result = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: adminEmail,
      replyTo: params.email,
      subject: `[Konsultasi Baru] ${params.category} - ${params.name}`,
      html: emailHtml,
    });

    // Fallback if domain is unverified (status 403)
    if (result.error) {
      console.warn("[Resend Warning] First attempt failed:", result.error.message);

      // Attempt 2: Fallback to onboarding@resend.dev
      result = await resend.emails.send({
        from: "Matoh Technologies <onboarding@resend.dev>",
        to: adminEmail,
        replyTo: params.email,
        subject: `[Konsultasi Baru] ${params.category} - ${params.name}`,
        html: emailHtml,
      });

      // Attempt 3: If in testing sandbox mode, Resend only allows sending to the registered account owner
      if (
        result.error &&
        result.error.message &&
        result.error.message.includes("kemplang313@gmail.com") &&
        adminEmail !== "kemplang313@gmail.com"
      ) {
        console.warn("[Resend Sandbox] Sending to registered account owner: kemplang313@gmail.com");
        result = await resend.emails.send({
          from: "Matoh Technologies <onboarding@resend.dev>",
          to: "kemplang313@gmail.com",
          replyTo: params.email,
          subject: `[Konsultasi Baru Sandbox] ${params.category} - ${params.name}`,
          html: emailHtml,
        });
      }
    }

    if (result.error) {
      console.error("[Resend Error] All attempts to send notification email failed:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (err) {
    console.error("[Resend Exception] Error sending contact notification:", err);
    return { success: false, error: err };
  }
}
