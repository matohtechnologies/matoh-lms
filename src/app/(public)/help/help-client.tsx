"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CreditCard,
  GraduationCap,
  Award,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "payment" | "learning" | "certificate" | "account" | "research";
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

const FAQ_DATA: FAQItem[] = [
  // Payment
  {
    id: "pay-1",
    category: "payment",
    question: "Metode pembayaran apa saja yang didukung?",
    questionEn: "What payment methods are supported?",
    answer: "Kami bekerja sama dengan Midtrans Payment Gateway resmi. Anda dapat membayar melalui QRIS (GoPay, OVO, Dana, ShopeePay, BCA Mobile), Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan Kartu Kredit/Debit. Pembayaran diverifikasi secara otomatis dalam hitungan detik tanpa perlu konfirmasi manual.",
    answerEn: "We integrate directly with official Midtrans Payment Gateway. You can pay using QRIS (GoPay, OVO, Dana, ShopeePay, Mobile Banking), Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata), and Credit/Debit Cards. Transactions are automatically verified in seconds.",
  },
  {
    id: "pay-2",
    category: "payment",
    question: "Apakah saya harus mengunggah bukti transfer manual?",
    questionEn: "Do I need to upload a manual transfer receipt?",
    answer: "Tidak perlu. Sistem pembayaran kami 100% otomatis. Segera setelah Anda menyelesaikan transaksi di aplikasi e-wallet atau m-banking, sistem Midtrans akan mengirimkan webhook instan dan kelas Anda akan langsung terbuka di dashboard 'Kelas Saya'.",
    answerEn: "No manual receipt upload is required. Our payment system is 100% automated. As soon as you complete the payment via e-wallet or mobile banking, your course is automatically unlocked in your dashboard.",
  },
  {
    id: "pay-3",
    category: "payment",
    question: "Bagaimana cara menggunakan kode kupon promo?",
    questionEn: "How do I redeem a discount coupon code?",
    answer: "Pada halaman Checkout kelas, masukkan kode kupon pada kolom 'Kode Kupon' lalu klik tombol 'Gunakan'. Potongan harga akan langsung diterapkan ke total pembayaran sebelum Anda menekan tombol Bayar.",
    answerEn: "On the course checkout page, enter your code into the 'Coupon Code' field and click 'Apply'. The discount will be instantly deducted from the total price.",
  },

  // Learning
  {
    id: "learn-1",
    category: "learning",
    question: "Berapa lama masa akses kelas setelah saya mendaftar?",
    questionEn: "How long is my course access valid after enrollment?",
    answer: "Semua kelas yang dibeli di PT. Matoh Technologies Indonesia memiliki Akses Selamanya (Lifetime Access). Anda dapat mengakses video, modul bacaan, kuis, dan pembaruan kurikulum di masa depan tanpa batas waktu dan tanpa biaya langganan bulanan.",
    answerEn: "All purchased courses come with Lifetime Access. You can access video lessons, reading materials, quizzes, and future curriculum updates anytime without monthly fees.",
  },
  {
    id: "learn-2",
    category: "learning",
    question: "Apakah materi kelas dapat diakses melalui smartphone?",
    questionEn: "Can I access courses on mobile devices?",
    answer: "Ya, platform kami telah dioptimasi secara penuh (responsive web) untuk browser mobile, tablet, laptop, dan desktop. Anda dapat belajar kapan saja dengan nyaman.",
    answerEn: "Yes, our platform is fully responsive and optimized for mobile smartphones, tablets, laptops, and desktop computers.",
  },
  {
    id: "learn-3",
    category: "learning",
    question: "Bagaimana jika saya memiliki pertanyaan materi yang sulit dipahami?",
    questionEn: "What if I have questions about difficult course topics?",
    answer: "Setiap kelas dilengkapi dengan tab 'Forum Diskusi'. Anda dapat mengajukan pertanyaan spesifik pada modul yang bersangkutan, dan instruktur ahli atau asisten akademik kami akan menjawab pertanyaan Anda.",
    answerEn: "Every course features a dedicated 'Discussion Forum' tab. You can post questions directly on any lesson, and our instructors or academic assistants will provide guidance.",
  },

  // Certificate
  {
    id: "cert-1",
    category: "certificate",
    question: "Kapan saya berhak mendapatkan sertifikat kelulusan?",
    questionEn: "When am I eligible to receive a completion certificate?",
    answer: "Sertifikat resmi dapat diklaim setelah Anda menyelesaikan 100% seluruh modul pembelajaran dan lulus kuis evaluasi dengan nilai minimal yang ditentukan (umumnya 70-80%). Tombol 'Klaim Sertifikat' akan otomatis aktif pada dashboard kelas.",
    answerEn: "Official certificates can be claimed after completing 100% of the lessons and achieving the passing score on the final quiz (usually 70-80%). The 'Claim Certificate' button will automatically unlock.",
  },
  {
    id: "cert-2",
    category: "certificate",
    question: "Bagaimana cara memverifikasi keaslian sertifikat?",
    questionEn: "How can anyone verify the authenticity of my certificate?",
    answer: "Setiap sertifikat diterbitkan dengan Kode Unik dan QR Code resmi. Siapa pun (termasuk tim HRD atau instansi penguji) dapat memindai QR Code atau mengunjungi halaman `/verify/[kode]` untuk melihat keaslian nama pemilik, transkrip nilai kompetensi, dan status pengesahan PT. Matoh Technologies Indonesia (SK Menkumham: AHU-064920.AH.01.30.Tahun 2024).",
    answerEn: "Every certificate contains an official Unique Verification Code and QR Code. Anyone, including recruiters and HR teams, can scan the QR code or visit `/verify/[code]` to inspect the verified recipient name, competency scores, and legal validity.",
  },

  // Account
  {
    id: "acc-1",
    category: "account",
    question: "Bagaimana jika saya lupa kata sandi akun saya?",
    questionEn: "What should I do if I forget my password?",
    answer: "Klik tautan 'Lupa Password' pada halaman login. Masukkan email terdaftar Anda untuk menerima instruksi reset kata sandi, atau hubungi tim dukungan jika Anda memerlukan bantuan pemulihan akun.",
    answerEn: "Click 'Forgot Password' on the login page. Enter your registered email to reset your credentials, or reach out to support if you need account recovery assistance.",
  },
  {
    id: "acc-2",
    category: "account",
    question: "Apakah nama di sertifikat bisa diubah setelah terbit?",
    questionEn: "Can the name on the certificate be altered after issuance?",
    answer: "Sertifikat diterbitkan secara otomatis berdasarkan Nama Lengkap yang tertera pada Profil Akun Anda saat klaim dilakukan. Pastikan nama profil Anda sudah sesuai dengan identitas resmi (KTP/Ijazah) sebelum menekan tombol klaim sertifikat.",
    answerEn: "Certificates are generated according to your account profile name at the time of claim. Please ensure your profile matches your official legal identity before claiming.",
  },

  // Research & Corporate
  {
    id: "res-1",
    category: "research",
    question: "Apakah PT. Matoh Technologies melayani pelatihan in-house korporasi atau riset?",
    questionEn: "Does PT. Matoh Technologies offer in-house corporate training or custom research?",
    answer: "Ya, kami melayani bimbingan teknis in-house corporate, workshop akademisi (pemodelan AHP & ISM), pendampingan digitalisasi UMKM daerah, dan riset publikasi terapan. Silakan hubungi kami via halaman /contact atau hotline riset +62 812-1414-0084.",
    answerEn: "Yes, we provide corporate in-house workshops, academic modeling consultancies (AHP & ISM), regional MSME digital incubation, and applied research. Contact us via /contact or our research line +62 812-1414-0084.",
  },
];

const CATEGORIES = [
  { id: "all", label: "Semua Topik", labelEn: "All Topics", icon: HelpCircle },
  { id: "payment", label: "Pembayaran & Midtrans", labelEn: "Payment & Midtrans", icon: CreditCard },
  { id: "learning", label: "Akses Belajar", labelEn: "Learning Access", icon: GraduationCap },
  { id: "certificate", label: "Sertifikat & QR Verifikasi", labelEn: "Certificates & Verification", icon: Award },
  { id: "account", label: "Akun & Keamanan", labelEn: "Account & Security", icon: ShieldCheck },
  { id: "research", label: "Konsultasi & Riset", labelEn: "Consulting & Research", icon: BookOpen },
];

export function HelpClient({ isEn }: { isEn: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openIds, setOpenIds] = useState<string[]>(["pay-1", "learn-1", "cert-1"]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const questionText = isEn ? item.questionEn : item.question;
      const answerText = isEn ? item.answerEn : item.answer;
      const matchesSearch =
        searchQuery.trim() === "" ||
        questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        answerText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory, isEn]);

  return (
    <div>
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto -mt-7 relative z-20 px-4">
        <div className="relative rounded-2xl bg-white shadow-md border border-slate-200/90 p-2 flex items-center">
          <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEn
                ? "Search questions (e.g. payment, certificate, access)..."
                : "Cari pertanyaan (misal: pembayaran, sertifikat, klaim)..."
            }
            className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 text-xs text-slate-400 hover:text-slate-700 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:border-blue-300 hover:text-blue-600 shadow-2xs"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500"}`} />
                {isEn ? cat.labelEn : cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs transition-colors hover:border-blue-200"
                >
                  <button
                    onClick={() => toggleOpen(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span
                      className="text-sm sm:text-base"
                      style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                    >
                      {isEn ? faq.questionEn : faq.question}
                    </span>
                    <span className="shrink-0 p-1.5 rounded-xl bg-slate-100 text-slate-500">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {isEn ? faq.answerEn : faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 rounded-3xl bg-white border border-slate-200/90 p-8">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3
                className="text-base font-bold text-slate-800"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {isEn ? "No matching answers found" : "Pertanyaan tidak ditemukan"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {isEn
                  ? "Try using different keywords or contact our customer support team directly."
                  : "Coba gunakan kata kunci lain atau langsung hubungi tim bantuan WhatsApp kami."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                {isEn ? "View all questions" : "Lihat semua pertanyaan"}
              </button>
            </div>
          )}
        </div>

        {/* Live Support Helpdesk Cards */}
        <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WhatsApp Hotline */}
          <div className="rounded-3xl bg-white border border-emerald-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-warm transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {isEn ? "WhatsApp Fast Support" : "Hotline Dukungan WhatsApp"}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isEn
                  ? "Need quick help regarding payments, lesson access, or certificate questions? Chat with our team."
                  : "Butuh bantuan cepat mengenai transaksi pembayaran, kendala video pembelajaran, atau klaim sertifikat?"}
              </p>
              <div className="mt-3 text-xs text-slate-500 font-medium">
                ⏱ {isEn ? "Operational Hours: 08:00 - 17:00 WIB" : "Jam Operasional: 08:00 - 17:00 WIB"}
              </div>
            </div>
            <div className="mt-6">
              <a
                href="https://wa.me/6281210106680?text=Halo%20Admin%20Matoh%20Technologies,%20saya%20memerlukan%20bantuan%20terkait%20platform%20belajar."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-xs w-full justify-center"
              >
                {isEn ? "Chat via WhatsApp" : "Hubungi WhatsApp (+62 812-1010-6680)"}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: Email & Formal Inquiries */}
          <div className="rounded-3xl bg-white border border-blue-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-warm transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                {isEn ? "Official Email Helpdesk" : "Layanan Email Resmi"}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isEn
                  ? "For partnership proposals, billing inquiries, invoice requests, or institutional training programs."
                  : "Untuk permintaan faktur resmi, verifikasi institusi/kampus, pengajuan riset, atau proposal in-house training."}
              </p>
              <div className="mt-3 text-xs text-slate-500 font-medium">
                ✉️ info@matohtechnologies.com
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold transition-all shadow-xs w-full justify-center"
              >
                {isEn ? "Open Contact Form" : "Buka Formulir Kontak"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
