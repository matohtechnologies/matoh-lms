import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import {
  ShieldCheck,
  Lock,
  Calendar,
  Building,
  CheckCircle2,
  FileCheck2,
  Database,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Privacy Policy | PT. Matoh Technologies Indonesia"
      : "Kebijakan Privasi | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Privacy Policy of PT. Matoh Technologies Indonesia in compliance with Law No. 27 of 2022 on Personal Data Protection (UU PDP)."
      : "Kebijakan Privasi PT. Matoh Technologies Indonesia sesuai dengan Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).",
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Header Banner - Matching About Page style */}
      <section className="py-20 sm:py-24 border-b border-slate-200/70 bg-gradient-to-b from-blue-50/70 via-[#f8fafc] to-[#f8fafc] bg-dot-matrix relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs font-bold mb-6 shadow-2xs">
            <Image
              src="/images/matoh-logo.png"
              alt="Matoh Technologies"
              width={16}
              height={16}
              priority
              style={{ aspectRatio: "1 / 1" }}
              className="object-contain aspect-square"
            />
            {isEn ? "Data Protection & Privacy Compliance" : "Kepatuhan UU No. 27/2022 (UU PDP)"}
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Personal Data" : "Kebijakan Privasi &"} <br />
            <span className="text-gradient">
              {isEn ? "Privacy Policy" : "Pelindungan Data"}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Your trust is our highest priority. Learn how PT. Matoh Technologies Indonesia collects, safeguards, and respects your personal data."
              : "Kepercayaan Anda adalah prioritas utama kami. Ketahui bagaimana PT. Matoh Technologies Indonesia mengumpulkan, memproses, mengamankan, dan melindungi data pribadi Anda."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              SK Menkumham: AHU-064920.AH.01.30.Tahun 2024
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {isEn ? "Updated: October 2026" : "Pembaruan: Oktober 2026"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60 bg-dot-matrix-slate relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-12 shadow-xs space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
            {/* Section 1 */}
            <div>
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">1.</span>
                {isEn ? "Commitment to Data Privacy & Legal Basis" : "Komitmen Privasi & Dasar Hukum Pemrosesan"}
              </h2>
              <p>
                {isEn
                  ? "PT. Matoh Technologies Indonesia ('we', 'us', or 'the Company') is committed to upholding the confidentiality, integrity, and security of personal data entrusted to us. This Privacy Policy is prepared in accordance with the provisions of Law of the Republic of Indonesia Number 27 of 2022 concerning Personal Data Protection (UU PDP) and relevant regulatory frameworks."
                  : "PT. Matoh Technologies Indonesia ('kami' atau 'Perusahaan') berkomitmen menjamin kerahasiaan, integritas, dan keamanan data pribadi yang dipercayakan kepada kami. Kebijakan Privasi ini disusun berlandaskan kepatuhan terhadap Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) serta peraturan perundang-undangan terkait."}
              </p>
            </div>

            {/* Section 2 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">2.</span>
                {isEn ? "Personal Data We Collect" : "Data Pribadi yang Kami Kumpulkan"}
              </h2>
              <p className="mb-3">
                {isEn
                  ? "We only collect data strictly necessary to provide and enhance our educational services:"
                  : "Kami hanya mengumpulkan data yang relevan dan diperlukan untuk kelancaran penyelenggaraan layanan pembelajaran:"}
              </p>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <strong>{isEn ? "Identity & Account Information:" : "Data Identitas & Akun:"}</strong>{" "}
                  {isEn
                    ? "Full legal name (for certificate verification), email address, encrypted hashed passwords, profile avatar, and professional headline."
                    : "Nama lengkap resmi (digunakan untuk keabsahan pencetakan sertifikat), alamat surat elektronik (email), kata sandi terenkripsi (hash), foto profil, dan headline profesional."}
                </li>
                <li>
                  <strong>{isEn ? "Transaction & Payment Data:" : "Data Transaksi & Pembayaran:"}</strong>{" "}
                  {isEn
                    ? "Order ID, course package purchased, payment timestamp, and transaction status returned by the official payment gateway (Midtrans). Note: We never store your full credit card numbers or banking PINs."
                    : "Nomor pesanan (Order ID), nama paket kelas yang dibeli, waktu pembayaran, dan status transaksi yang diteruskan oleh payment gateway resmi (Midtrans). Catatan: Kami tidak pernah menyimpan nomor kartu kredit atau PIN perbankan Anda."}
                </li>
                <li>
                  <strong>{isEn ? "Learning Activity Data:" : "Data Aktivitas Pembelajaran:"}</strong>{" "}
                  {isEn
                    ? "Video completion percentage, quiz scores, assignment submissions, forum discussions, and issued certificate records."
                    : "Persentase penyelesaian video/modul, riwayat nilai kuis evaluasi, pengumpulan tugas, interaksi forum diskusi, dan rekam jejak sertifikat kelulusan."}
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">3.</span>
                {isEn ? "Purpose of Data Processing" : "Tujuan Pengolahan & Penggunaan Data"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2 mb-1 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {isEn ? "Course Access Delivery" : "Penyediaan Hak Akses Belajar"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {isEn
                      ? "Enabling video playback, tracking your learning syllabus, and recording assignment milestones."
                      : "Membuka modul video, merekam progres silabus, dan mencatat milestone belajar peserta."}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2 mb-1 text-sm">
                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                    {isEn ? "Legal Certificate Issuance" : "Penerbitan Sertifikat Resmi"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {isEn
                      ? "Generating verifiable certificates with QR codes for public academic validation."
                      : "Mencetak sertifikat terenkripsi dengan QR code untuk validasi kompetensi oleh rekruter/HRD."}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2 mb-1 text-sm">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    {isEn ? "Account Security & Fraud Prevention" : "Keamanan & Pencegahan Penipuan"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {isEn
                      ? "Protecting sessions, enforcing rate limits, and defending against unauthorized credential theft."
                      : "Menjaga integritas sesi, membatasi request mencurigakan, dan melindungi akun dari pembajakan."}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 flex items-center gap-2 mb-1 text-sm">
                    <Database className="w-4 h-4 text-amber-600" />
                    {isEn ? "Transaction Accounting" : "Pencatatan Pembukuan Resmi"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {isEn
                      ? "Generating official purchase invoices and complying with statutory fiscal requirements."
                      : "Menyediakan invoice pembelian sah dan pelaporan perpajakan sesuai hukum yang berlaku."}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">4.</span>
                {isEn ? "Data Security & Encryption Standard" : "Standar Pengamanan & Enkripsi Data"}
              </h2>
              <p>
                {isEn
                  ? "We implement robust physical, electronic, and organizational safeguards. Communications between your browser and our servers are encrypted using modern Transport Layer Security (TLS 1.3). Passwords are never stored in plain text and are salted using strong cryptographic hashing algorithms (bcrypt with high work factors)."
                  : "Kami menerapkan mekanisme perlindungan data berbasis enkripsi modern. Seluruh jalur komunikasi data antara peramban Anda dan peladen (server) dilindungi oleh protokol Transport Layer Security (TLS 1.3 / HTTPS). Kata sandi akun tidak pernah disimpan dalam bentuk teks terbuka (plain text), melainkan dilindungi menggunakan algoritma cryptographic hashing (bcrypt) berstandar tinggi."}
              </p>
            </div>

            {/* Section 5 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">5.</span>
                {isEn ? "Third-Party Data Sharing Disclosure" : "Pengungkapan kepada Pihak Ketiga"}
              </h2>
              <p>
                {isEn
                  ? "PT. Matoh Technologies Indonesia does NOT sell, rent, or trade your personal data to advertisers or third-party marketing brokers. Data is strictly shared only with essential operational partners, such as licensed Payment Gateway Midtrans (solely to process transactions) and official law enforcement authorities when mandated by court orders under Indonesian law."
                  : "PT. Matoh Technologies Indonesia TIDAK AKAN PERNAH menjual, menyewakan, atau memperdagangkan data pribadi pengguna kepada pihak ketiga atau broker periklanan. Data hanya dibagikan secara terbatas kepada mitra operasional resmi (yaitu payment gateway Midtrans untuk penyelesaian transaksi keuangan) atau kepada aparat penegak hukum apabila diwajibkan oleh penetapan pengadilan yang sah."}
              </p>
            </div>

            {/* Section 6 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">6.</span>
                {isEn ? "Rights of Data Subjects (Your Rights)" : "Hak-Hak Anda sebagai Subjek Data (UU PDP)"}
              </h2>
              <p className="mb-3">
                {isEn
                  ? "Under Law No. 27 of 2022, you have guaranteed legal rights over your personal data:"
                  : "Berdasarkan Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, Anda memiliki hak hukum penuh untuk:"}
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>{isEn ? "Access and obtain copies of your personal data stored in our system." : "Mendapatkan akses dan salinan data pribadi Anda yang tersimpan di sistem kami."}</li>
                <li>{isEn ? "Correct, update, or rectify any inaccuracies in your profile information." : "Memperbarui atau memperbaiki data pribadi yang tidak akurat atau tidak lengkap."}</li>
                <li>{isEn ? "Request the deletion or destruction of your account data (Right to Erasure)." : "Mengajukan permohonan penutupan atau penghapusan data akun (Right to Erasure)."}</li>
                <li>{isEn ? "Withdraw your consent for promotional communications at any time." : "Menarik persetujuan pengiriman komunikasi buletin wawasan kapan saja."}</li>
              </ul>
            </div>

            {/* Section 7 - DPO Contact */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">7.</span>
                {isEn ? "Data Protection Officer (DPO) Contact" : "Kontak Petugas Pelindungan Data (DPO)"}
              </h2>
              <p>
                {isEn
                  ? "For inquiries, requests to exercise your data rights, or privacy-related concerns, please reach out to our dedicated Data Protection Officer:"
                  : "Apabila Anda memiliki pertanyaan, keberatan, atau ingin menggunakan hak-hak perlindungan data pribadi Anda, silakan hubungi tim Pelindungan Data kami melalui:"}
              </p>
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-1.5">
                <div
                  className="font-bold text-slate-900"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  PT. Matoh Technologies Indonesia
                </div>
                <div className="text-slate-600">Email Khusus Privasi: <span className="font-semibold text-blue-600">privacy@matohtechnologies.com</span></div>
                <div className="text-slate-600">Hotline Resmi: <span className="font-semibold text-slate-800">+62 812-1010-6680</span></div>
                <div className="text-slate-500">Legalitas: SK Menkumham RI No. AHU-064920.AH.01.30.Tahun 2024</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
