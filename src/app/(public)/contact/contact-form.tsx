"use client";

import { useState } from "react";
import { Send, CheckCircle2, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useAppLocale } from "@/components/providers/locale-provider";

interface ContactFormProps {
  locale?: string;
}

export function ContactForm({ locale: propLocale }: ContactFormProps) {
  const { locale: contextLocale } = useAppLocale();
  const activeLocale = propLocale || contextLocale;
  const isEn = activeLocale === "en";

  const categoryOptions = [
    {
      value: "Konsultasi Kelas & Karir",
      label: isEn
        ? "Course Selection & Career Track Advisory"
        : "Konsultasi Pemilihan Kelas & Jalur Karir",
    },
    {
      value: "Bantuan Teknis & Akses Belajar",
      label: isEn
        ? "Platform Technical Support & Account Issues"
        : "Bantuan Teknis Platform & Akun",
    },
    {
      value: "Sertifikat & Verifikasi Kelulusan",
      label: isEn
        ? "Certificate & Transcript Verification"
        : "Pertanyaan Sertifikat & Transkrip",
    },
    {
      value: "Pelatihan Perusahaan (Corporate Training)",
      label: isEn
        ? "Corporate Partnership & Team Training"
        : "Kemitraan Corporate & Pelatihan Tim",
    },
    {
      value: "Pendaftaran Program Beasiswa/Prakerja",
      label: isEn
        ? "Scholarship Programs & Student Discounts"
        : "Program Beasiswa & Diskon Siswa",
    },
    {
      value: "Lainnya",
      label: isEn ? "Other General Inquiries" : "Pertanyaan Umum Lainnya",
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Konsultasi Kelas & Karir",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert(
        isEn
          ? "Please provide your name, email, and message."
          : "Mohon lengkapi nama, email, dan pesan Anda."
      );
      return;
    }

    setLoading(true);
    // Simulate real network submission with realistic latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "Konsultasi Kelas & Karir",
      message: "",
    });
    setSubmitted(false);
  };

  const selectedCategoryLabel =
    categoryOptions.find((c) => c.value === formData.category)?.label ||
    formData.category;

  const waMessage = encodeURIComponent(
    isEn
      ? `Hello Matoh Technologies team, my name is ${formData.name || "Prospective Student"}.\nI have an inquiry regarding: ${selectedCategoryLabel}.\nMessage: ${formData.message || "Please provide more details regarding your learning programs."}`
      : `Halo Tim Matoh Technologies, perkenalkan saya ${formData.name || "Calon Peserta"}.\nSaya ingin berkonsultasi mengenai: ${selectedCategoryLabel}.\nPesan: ${formData.message || "Mohon informasi lebih lanjut seputar program pelatihan."}`
  );

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-warm-lg relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100/50 to-sky-100/20 rounded-bl-full pointer-events-none -z-0" />

      <div className="relative z-10">
        {submitted ? (
          <div className="text-center py-10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3
                className="text-2xl font-bold text-stone-900 mb-2"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {isEn
                  ? "Your Message Has Been Sent Successfully!"
                  : "Pesan Anda Berhasil Terkirim!"}
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {isEn ? (
                  <>
                    Thank you for reaching out to Matoh Technologies,{" "}
                    <strong className="text-stone-900">{formData.name}</strong>.
                    Our academic & technical advisors will get back to you via WhatsApp or
                    email within{" "}
                    <span className="font-semibold text-blue-600">
                      1 business day
                    </span>
                    .
                  </>
                ) : (
                  <>
                    Terima kasih telah menghubungi Matoh Technologies,{" "}
                    <strong className="text-stone-900">{formData.name}</strong>.
                    Tim konsultan kami akan merespons melalui WhatsApp
                    atau email dalam waktu maksimal{" "}
                    <span className="font-semibold text-blue-600">
                      1x24 jam kerja
                    </span>
                    .
                  </>
                )}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 max-w-md mx-auto text-left text-xs space-y-1.5 text-stone-600">
              <p>
                <strong className="text-stone-800">
                  {isEn ? "Topic:" : "Kategori:"}
                </strong>{" "}
                {selectedCategoryLabel}
              </p>
              <p>
                <strong className="text-stone-800">Email:</strong>{" "}
                {formData.email}
              </p>
              {formData.phone && (
                <p>
                  <strong className="text-stone-800">WhatsApp:</strong>{" "}
                  {formData.phone}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href={`https://wa.me/6282145678901?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Phone size={16} />
                {isEn ? "Continue via Official WhatsApp" : "Lanjutkan via WhatsApp Resmi"}
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-sm transition-colors"
              >
                {isEn ? "Send Another Message" : "Kirim Pesan Lain"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-stone-100 pb-4 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                {isEn ? "Consultation & Support Form" : "Formulir Konsultasi & Bantuan"}
              </span>
              <h3
                className="text-xl font-bold text-stone-900 mt-2"
                style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}
              >
                {isEn
                  ? "Send a Direct Message to Our Academic Team"
                  : "Kirim Pesan Langsung ke Tim Akademik"}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isEn
                  ? "Please fill in your details. We respect your privacy and never spam."
                  : "Silakan isi data diri Anda. Kami tidak akan menyebarkan nomor atau email Anda untuk spam."}
              </p>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  {isEn ? "Full Name" : "Nama Lengkap"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? "e.g. Alex Morgan" : "Contoh: Budi Pratama"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  {isEn ? "WhatsApp / Phone Number" : "Nomor WhatsApp / HP"}
                </label>
                <input
                  type="tel"
                  placeholder={isEn ? "e.g. +62 812 3456 7890" : "Contoh: 081234567890"}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white shadow-2xs"
                />
              </div>
            </div>

            {/* Email & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  {isEn ? "Active Email Address" : "Alamat Email Aktif"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  {isEn ? "Inquiry Topic" : "Topik Kebutuhan"}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white shadow-2xs"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                {isEn ? "Question / Message Details" : "Pertanyaan / Detail Pesan"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder={
                  isEn
                    ? "Please share your questions in detail, such as syllabus topics, recommended hardware specs, or corporate invoices..."
                    : "Tuliskan pertanyaan Anda secara detail, misalnya seputar silabus kelas, rekomendasi laptop yang dibutuhkan, atau metode pembayaran..."
                }
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white shadow-2xs resize-none"
              />
            </div>

            {/* Privacy notice & Submit */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                <span>
                  {isEn
                    ? "Your personal data is encrypted & secure with Matoh Technologies"
                    : "Privasi data Anda terlindungi & aman bersama Matoh Technologies"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{isEn ? "Sending..." : "Mengirim..."}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{isEn ? "Send Inquiry" : "Kirim Pertanyaan"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
