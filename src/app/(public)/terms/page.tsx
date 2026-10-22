import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import {
  FileText,
  ShieldCheck,
  Building,
  Scale,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Terms of Service | PT. Matoh Technologies Indonesia"
      : "Syarat dan Ketentuan Layanan | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Terms and Conditions governing the use of learning platform services provided by PT. Matoh Technologies Indonesia (AHU-064920.AH.01.30.Tahun 2024)."
      : "Ketentuan dan syarat penggunaan platform pembelajaran serta layanan digital PT. Matoh Technologies Indonesia (SK Kemenkumham: AHU-064920.AH.01.30.Tahun 2024).",
  };
}

export default async function TermsPage() {
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
              className="object-contain"
            />
            {isEn ? "Legal Documentation & Compliance" : "Dokumen Legalitas & Kepatuhan Layanan"}
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Terms of" : "Syarat & Ketentuan"} <br />
            <span className="text-gradient">
              {isEn ? "Service Agreement" : "Layanan Resmi"}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Please read these terms carefully before accessing or using the learning platform operated by PT. Matoh Technologies Indonesia."
              : "Harap membaca ketentuan ini secara seksama sebelum mengakses, mendaftar, atau menggunakan layanan platform pembelajaran PT. Matoh Technologies Indonesia."}
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
                {isEn ? "General Provisions & Corporate Entity" : "Ketentuan Umum & Identitas Perusahaan"}
              </h2>
              <p>
                {isEn
                  ? "These Terms of Service constitute a legally binding agreement between you (the 'User' or 'Learner') and PT. Matoh Technologies Indonesia, an officially registered legal entity in the Republic of Indonesia under Decree of the Minister of Law and Human Rights Number AHU-064920.AH.01.30.Tahun 2024."
                  : "Syarat dan Ketentuan Layanan ini merupakan perjanjian yang mengikat secara hukum antara Anda (selanjutnya disebut 'Pengguna' atau 'Peserta Didik') dan PT. Matoh Technologies Indonesia, entitas perseroan terbatas resmi yang didirikan berdasarkan hukum Republik Indonesia dan disahkan melalui Surat Keputusan Menteri Hukum dan HAM RI Nomor AHU-064920.AH.01.30.Tahun 2024."}
              </p>
              <p className="mt-3">
                {isEn
                  ? "By creating an account, enrolling in a course, or using our services, you expressly agree to be bound by these terms."
                  : "Dengan membuat akun, melakukan transaksi pendaftaran program pelatihan, atau menggunakan fitur-fitur pada platform ini, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang termaktub di dalam dokumen ini."}
              </p>
            </div>

            {/* Section 2 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">2.</span>
                {isEn ? "User Account & Security Responsibility" : "Pendaftaran Akun & Tanggung Jawab Keamanan"}
              </h2>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  {isEn
                    ? "Users must provide accurate, current, and verifiable information during registration, including full legal name and active email address."
                    : "Pengguna wajib memberikan informasi yang akurat, benar, dan dapat diverifikasi saat mendaftar, terutama Nama Lengkap (untuk keperluan penerbitan sertifikat) dan Alamat Email aktif."}
                </li>
                <li>
                  {isEn
                    ? "You are solely responsible for maintaining the confidentiality of your login credentials. PT. Matoh Technologies is not liable for unauthorized access resulting from your failure to safeguard your password."
                    : "Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan keamanan akun Anda. PT. Matoh Technologies tidak bertanggung jawab atas kerugian akibat kelalaian pengguna dalam menjaga kerahasiaan kredensial akses."}
                </li>
                <li>
                  {isEn
                    ? "Account sharing, unauthorized resale, or transferring account access to third parties without prior written consent is strictly prohibited and subject to immediate suspension."
                    : "Satu akun hanya diperuntukkan bagi satu individu terdaftar. Dilarang keras membagikan kredensial login, menjual kembali akses kursus, atau memperbanyak materi tanpa izin tertulis dari manajemen."}
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
                {isEn ? "Course Access, Fees & Automated Payment Gateway" : "Biaya Pendaftaran & Mekanisme Pembayaran Midtrans"}
              </h2>
              <p>
                {isEn
                  ? "Course fees are listed in Indonesian Rupiah (IDR) and processed securely via our licensed payment gateway partner (PT. Midtrans). Payment channels include QRIS, Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata), and major cards."
                  : "Seluruh biaya pendaftaran program dicantumkan dalam mata uang Rupiah (IDR) dan diproses secara aman melalui payment gateway resmi berlisensi (Midtrans). Pembayaran dapat dilakukan melalui QRIS, Transfer Virtual Account, atau Kartu Kredit/Debit."}
              </p>
              <p className="mt-3">
                {isEn
                  ? "Upon confirmed transaction callback from the payment gateway, course enrollment is activated automatically for the authenticated user account with Lifetime Access privilege."
                  : "Setelah sistem menerima notifikasi pembayaran sukses dari gateway, hak akses kelas akan diaktifkan secara instan ke akun pengguna terdaftar dengan status Akses Seumur Hidup (Lifetime Access), kecuali dinyatakan lain secara tertulis pada halaman detail program."}
              </p>
            </div>

            {/* Section 4 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">4.</span>
                {isEn ? "Intellectual Property Rights (HAKI)" : "Hak Kekayaan Intelektual (HAKI) & Hak Cipta"}
              </h2>
              <p>
                {isEn
                  ? "All learning materials, including video lessons, presentation slides, decision support datasets (AHP & ISM), source code examples, and certificate designs, are the intellectual property of PT. Matoh Technologies Indonesia and respective instructors."
                  : "Seluruh konten pembelajaran, materi presentasi, modul keputusan multi-kriteria (AHP & ISM), rekaman video, repositori kode sumber, modul panduan, serta desain sertifikat dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia dan merupakan kekayaan intelektual eksklusif PT. Matoh Technologies Indonesia atau masing-masing instruktur berlisensi."}
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
                <div className="font-bold flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {isEn ? "Prohibited Infringements" : "Larangan Keras Pelanggaran Hak Cipta"}
                </div>
                {isEn
                  ? "Recording, downloading for mass redistribution, re-uploading to torrents/video platforms, or commercializing course material without express written consent constitutes a violation of Indonesian Copyright Law."
                  : "Pengguna dilarang merekam layar, mengunduh untuk disebarluaskan secara publik, menjual kembali materi kursus, atau mengunggah ulang ke platform media publik. Segala bentuk pembajakan akan diproses sesuai hukum yang berlaku di Indonesia."}
              </div>
            </div>

            {/* Section 5 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">5.</span>
                {isEn ? "Certificate Issuance & QR Verification" : "Penerbitan Sertifikat Kelulusan & Verifikasi QR Code"}
              </h2>
              <p>
                {isEn
                  ? "Certificates are issued digitally under the corporate authority of PT. Matoh Technologies Indonesia after a learner fulfills all syllabus criteria (100% lesson progress and passing score on final evaluation/quiz)."
                  : "Sertifikat kompetensi diterbitkan secara digital di bawah otoritas PT. Matoh Technologies Indonesia setelah peserta didik menyelesaikan 100% modul kurikulum serta lulus kuis/evaluasi akademik dengan nilai ambang batas kelulusan."}
              </p>
              <p className="mt-3">
                {isEn
                  ? "Each certificate carries an encrypted cryptographic unique identifier and an accessible verification URL (`/verify/[code]`). Tampering with certificate credentials will permanently invalidate the verification record."
                  : "Setiap sertifikat dilengkapi dengan kode verifikasi unik dan QR Code yang dapat diakses publik pada rute `/verify/[code]`. Segala upaya pemalsuan dokumen atau manipulasi visual sertifikat akan menggugurkan validitas data pada pangkalan basis data resmi kami."}
              </p>
            </div>

            {/* Section 6 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">6.</span>
                {isEn ? "Refund & Cancellation Policy" : "Kebijakan Pengembalian Dana (Refund Policy)"}
              </h2>
              <p>
                {isEn
                  ? "Because our digital course access, downloadable resources, and curriculum access are immediately made available upon payment completion, purchases are generally final. However, if a technical error occurs (such as duplicate deduction or system failure where course access is permanently inaccessible for > 48 hours), you are entitled to a full refund upon reporting to support@matohtechnologies.com within 7 days of purchase."
                  : "Mengingat produk berupa akses digital dan modul yang langsung terbuka seketika setelah pembayaran terkonfirmasi, pembelian kursus pada prinsipnya bersifat final. Namun, jika terjadi kesalahan teknis (seperti pendebetan ganda oleh sistem perbankan atau kendala teknis yang menyebabkan materi tidak dapat diakses lebih dari 48 jam), pengguna berhak mengajukan permohonan pengembalian dana melalui email info@matohtechnologies.com maksimal 7 hari kalender sejak tanggal transaksi."}
              </p>
            </div>

            {/* Section 7 */}
            <div className="pt-8 border-t border-slate-100">
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                <span className="text-blue-600">7.</span>
                {isEn ? "Governing Law & Jurisdiction" : "Hukum yang Berlaku & Penyelesaian Sengketa"}
              </h2>
              <p>
                {isEn
                  ? "These Terms shall be governed by and construed in accordance with the laws of the Republic of Indonesia. Any dispute arising out of or in connection with these terms shall first be settled through amicable deliberation, and if unresolved, through the competent District Court in Indonesia."
                  : "Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul sehubungan dengan pelaksanaan layanan ini akan diselesaikan terlebih dahulu melalui musyawarah mufakat, dan apabila tidak tercapai kata sepakat, akan diselesaikan melalui yurisdiksi Pengadilan Negeri yang berwenang di Indonesia."}
              </p>
            </div>

            {/* Contact Box */}
            <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div
                  className="font-bold text-slate-900"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {isEn ? "Questions regarding our Terms of Service?" : "Ada pertanyaan mengenai dokumen Syarat & Ketentuan?"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {isEn ? "Contact our legal compliance desk" : "Hubungi tim legalitas PT. Matoh Technologies Indonesia"}
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors shrink-0"
              >
                {isEn ? "Contact Legal Desk" : "Hubungi Kami"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
