import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";
import { getLocale } from "next-intl/server";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Building,
  Users,
  Compass,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Contact & Academic Advisory | Earthy Academy"
      : "Kontak & Layanan Konsultasi | Earthy Academy",
    description: isEn
      ? "Reach out to Earthy Academy's academic advisors and support team. Get personalized course recommendations, tech career roadmaps, corporate training inquiries, or technical support."
      : "Hubungi tim konsultan akademik dan layanan bantuan Earthy Academy. Dapatkan panduan pemilihan kelas, roadmap karir teknologi, konsultasi kemitraan, atau bantuan teknis.",
  };
}

export default async function ContactPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const contactChannels = [
    {
      icon: Phone,
      title: isEn ? "Official WhatsApp Hotline" : "WhatsApp Hotline Resmi",
      detail: "+62 821-4567-8901",
      subtext: isEn
        ? "Fast response under 15 minutes during operational hours"
        : "Respons cepat di bawah 15 menit pada jam operasional",
      actionLabel: isEn ? "Chat on WhatsApp ➔" : "Chat WhatsApp ➔",
      actionUrl: isEn
        ? "https://wa.me/6282145678901?text=Hello%20Earthy%20Academy,%20I%20would%20like%20to%20consult%20about%20learning%20programs."
        : "https://wa.me/6282145678901?text=Halo%20Earthy%20Academy,%20saya%20ingin%20konsultasi%20program%20belajar.",
      badge: isEn ? "Fastest" : "Paling Cepat",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      icon: Mail,
      title: isEn ? "Official Academic Support Email" : "Email Resmi Tim Akademik",
      detail: "halo@earthyacademy.com",
      subtext: isEn
        ? "For syllabus inquiries, certificate verification & support tickets"
        : "Untuk pengajuan silabus, verifikasi sertifikat & tiket bantuan",
      actionLabel: isEn ? "Send Email ➔" : "Kirim Email ➔",
      actionUrl: "mailto:halo@earthyacademy.com",
      badge: isEn ? "Official" : "Resmi",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      icon: Building,
      title: isEn ? "Corporate & Enterprise Training" : "Kemitraan Corporate & B2B",
      detail: "partnership@earthyacademy.com",
      subtext: isEn
        ? "Engineering team upskilling, campus scholarships & CSR partnerships"
        : "Pelatihan tim engineering, beasiswa kampus, & CSR program",
      actionLabel: isEn ? "Contact Partnerships ➔" : "Hubungi Kemitraan ➔",
      actionUrl: "mailto:partnership@earthyacademy.com",
      badge: isEn ? "Enterprise" : "B2B Training",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  const faqs = [
    {
      q: isEn
        ? "Can I get advice on which course fits beginners best?"
        : "Apakah saya bisa berkonsultasi mengenai kelas mana yang cocok untuk pemula?",
      a: isEn
        ? "Absolutely! Send a message through our form or reach us directly on WhatsApp. Our admissions team will review your background and recommend the most realistic learning roadmap toward your career goals."
        : "Tentu saja! Anda bisa langsung mengirimkan pesan melalui formulir di samping atau chat WhatsApp kami. Tim admission kami akan memetakan latar belakang Anda dan merekomendasikan roadmap belajar yang paling realistis menuju karir impian Anda.",
    },
    {
      q: isEn
        ? "What is the expected response wait time?"
        : "Berapa lama waktu tunggu untuk mendapatkan balasan?",
      a: isEn
        ? "Via WhatsApp during business hours (09:00 - 18:00 WIB), average response time is 5-15 minutes. Through the contact form or email, we guarantee a comprehensive reply within 24 business hours."
        : "Melalui WhatsApp pada jam operasional (09.00 - 18.00 WIB), rata-rata waktu respon adalah 5-15 menit. Melalui formulir atau email, kami menjamin balasan maksimal dalam 1x24 jam kerja.",
    },
    {
      q: isEn
        ? "Does Earthy Academy have a physical office open for visits?"
        : "Apakah Earthy Academy memiliki kantor fisik yang dapat dikunjungi?",
      a: isEn
        ? "Yes, our headquarters is located at Tekno Satrio Tower, 14th Floor, Mega Kuningan, South Jakarta. For in-person consultations, please schedule an appointment in advance via WhatsApp."
        : "Ya, kantor pusat kami berlokasi di Menara Tekno Satrio, Lt. 14, Kawasan Mega Kuningan, Jakarta Selatan. Untuk kunjungan konsultasi tatap muka, harap membuat janji temu terlebih dahulu melalui WhatsApp.",
    },
    {
      q: isEn
        ? "How can I verify the authenticity of an Earthy Academy certificate?"
        : "Bagaimana cara memverifikasi keaslian sertifikat yang saya peroleh?",
      a: isEn
        ? "Every graduate certificate features a unique credential ID (e.g. EA-MUNR6MWY-2P67) and a cryptographic QR code that anyone can verify publicly on our verification portal with no fees."
        : "Setiap sertifikat kelulusan Earthy Academy dilengkapi dengan kode kredensial unik (contoh: EA-MUNR6MWY-2P67) dan QR Code resmi yang dapat dicek langsung secara publik di portal verifikasi kami tanpa dipungut biaya.",
    },
  ];

  return (
    <div className="pt-20 bg-[#f8fafc] min-h-screen">
      {/* Hero Header */}
      <section className="py-16 sm:py-20 border-b border-stone-200/70 bg-gradient-to-b from-blue-50/60 via-[#f8fafc] to-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
            <MessageSquare size={14} className="text-blue-600" />
            {isEn ? "Student Advisory & Academic Support" : "Layanan Siswa & Konsultasi Akademik"}
          </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight mb-4"
            style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
          >
            {isEn ? (
              <>
                Have Questions? We&apos;re Here to Help <br className="hidden sm:inline" />
                <span className="text-gradient">Your Tech Career Journey</span>
              </>
            ) : (
              <>
                Ada Pertanyaan? Kami Siap Membantu <br className="hidden sm:inline" />
                <span className="text-gradient">Perjalanan Karir Teknologimu</span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? "From guidance on choosing your first course, inquiries about official graduation credentials, to enterprise training programs for corporate engineering teams."
              : "Mulai dari bimbingan memilih kelas pertama, pertanyaan seputar sertifikat resmi kelulusan, hingga penawaran program upskilling untuk tim perusahaan Anda."}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Direct Info & Channels (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Channel Cards */}
              <div className="space-y-4">
                {contactChannels.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.title}
                      className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:shadow-warm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
                            <Icon size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900">{c.title}</h4>
                            <p className="text-sm font-extrabold text-stone-900 font-mono tracking-tight mt-0.5">
                              {c.detail}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${c.badgeColor}`}>
                          {c.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mb-3">{c.subtext}</p>
                      <a
                        href={c.actionUrl}
                        target={c.actionUrl.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group-hover:underline"
                      >
                        {c.actionLabel}
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Office & Operational Hours Card */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                      {isEn ? "Headquarters & Learning Hub" : "Kantor Pusat & Learning Hub"}
                    </h4>
                    <p className="text-sm font-bold text-stone-900 leading-snug">
                      {isEn ? "Tekno Satrio Tower, 14th Floor" : "Menara Tekno Satrio, Lantai 14"}
                    </p>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Jl. Prof. DR. Satrio No. Kav. C4, Karet Kuningan, Setiabudi, Jakarta Selatan 12940
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {isEn
                        ? "Convenient access via Kuningan LRT Station (3 min walk) & Departemen Kesehatan TransJakarta Bus Stop."
                        : "Akses mudah via Stasiun LRT Kuningan (3 menit jalan kaki) & Halte TransJakarta Departemen Kesehatan."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="text-xs space-y-1">
                    <h4 className="font-bold uppercase tracking-wider text-stone-500">
                      {isEn ? "Operational Hours" : "Jam Layanan"}
                    </h4>
                    <p className="text-stone-800 font-medium">
                      {isEn ? "Monday – Friday:" : "Senin – Jumat:"}{" "}
                      <span className="font-bold text-stone-900">09:00 – 18:00 WIB</span>
                    </p>
                    <p className="text-stone-800 font-medium">
                      {isEn ? "Saturday:" : "Sabtu:"}{" "}
                      <span className="font-bold text-stone-900">09:00 – 14:00 WIB</span>
                    </p>
                    <p className="text-stone-400 text-[11px]">
                      {isEn
                        ? "Sunday & Public Holidays: Inquiries handled via scheduled email tickets."
                        : "Minggu & Libur Nasional: Pelayanan via tiket email terjadwal."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form (7 cols) */}
            <div className="lg:col-span-7">
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-stone-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200/60">
              {isEn ? "Frequently Asked Questions" : "Pertanyaan Populer"}
            </span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
            >
              {isEn ? "Quick Answers Before Reaching Out" : "Jawaban Cepat Sebelum Menghubungi Kami"}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-stone-200/80 bg-white hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <h4 className="text-sm font-bold text-stone-900 flex items-start gap-2.5 mb-2">
                  <HelpCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-7">
                  {f.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-xs text-stone-500 mb-3">
              {isEn
                ? "Still have questions or want to review the full curriculum?"
                : "Masih butuh bantuan lain atau ingin membaca kurikulum lengkap?"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-4 py-2 rounded-xl transition-colors border border-blue-200"
              >
                <Compass size={14} />
                {isEn ? "Explore All Courses" : "Jelajahi Semua Kelas"}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition-colors"
              >
                <Users size={14} />
                {isEn ? "Get to Know Earthy Academy" : "Kenal Lebih Dekat Earthy Academy"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
