"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Building2,
  User,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Laptop,
  GraduationCap,
  ArrowRight,
  MessageSquare,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomCourseRequestProps {
  isEn?: boolean;
  userEmail?: string | null;
  userName?: string | null;
}

export function CustomCourseRequestModal({
  isOpen,
  onClose,
  isEn = false,
  userEmail = "",
  userName = "",
  defaultType = "CORPORATE",
}: {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  defaultType?: "INDIVIDUAL" | "CORPORATE";
}) {
  const [requestType, setRequestType] = useState<"INDIVIDUAL" | "CORPORATE">(defaultType);
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [topic, setTopic] = useState("");
  const [participants, setParticipants] = useState("6 - 15 Orang");
  const [format, setFormat] = useState("Online Live Interaktif");
  const [timeline, setTimeline] = useState("Bulan Depan");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync default type when opened
  useEffect(() => {
    if (isOpen) {
      setRequestType(defaultType);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, defaultType]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(isEn ? "Full name or PIC name is required." : "Nama lengkap atau PIC wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(isEn ? "Please enter a valid email address." : "Alamat email tidak valid.");
      return;
    }
    if (requestType === "CORPORATE" && !institution.trim()) {
      setError(
        isEn
          ? "Company or institution name is required for corporate requests."
          : "Nama instansi atau perusahaan wajib diisi untuk request corporate."
      );
      return;
    }
    if (!topic.trim()) {
      setError(
        isEn
          ? "Please specify the course topic or focus area you need."
          : "Topik atau bidang kursus yang diinginkan wajib diisi."
      );
      return;
    }
    if (!notes.trim()) {
      setError(
        isEn
          ? "Please describe your syllabus requirements or training goals."
          : "Mohon jelaskan secara singkat kebutuhan silabus atau tujuan kursus Anda."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/courses/request-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          institution: institution.trim() || null,
          topic: topic.trim(),
          participants,
          format,
          timeline,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Failed to submit request." : "Gagal mengirim request kursus."));
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isEn ? "Network error" : "Terjadi kendala jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const waUrl = `https://wa.me/6281210106680?text=${encodeURIComponent(
    `Halo Tim Matoh Technologies, saya ${name || "User"} (${institution || (requestType === "CORPORATE" ? "Corporate" : "Individu")}) ingin menindaklanjuti pengajuan Request Kursus Custom topik: ${topic || "Pelatihan Khusus"}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-course-title"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 mb-2 border border-slate-200/80">
              <Sparkles size={13} className="text-slate-700" />
              <span>{isEn ? "Tailored Learning Program" : "Program Kursus Disesuaikan"}</span>
            </div>
            <h2 id="custom-course-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isEn ? "Request Custom Course & In-House Training" : "Request Kursus Custom & In-House Training"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isEn
                ? "Design a personalized syllabus with our expert instructors for yourself or your entire team."
                : "Rancang kurikulum spesifik bersama instruktur pakar kami untuk kebutuhan pribadi maupun tim perusahaan."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label={isEn ? "Close dialog" : "Tutup dialog"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 flex-1">
          {success ? (
            /* Success State */
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-slate-900">
                  {isEn ? "Request Successfully Sent!" : "Request Kursus Berhasil Dikirim!"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isEn
                    ? "Thank you! Our academic & training advisory team will review your requirements and reach out via email/WhatsApp within 1 business day."
                    : "Terima kasih! Tim konsultan kurikulum Matoh Technologies akan mempelajari kebutuhan Anda dan menghubungi via email/WhatsApp dalam 1x24 jam kerja."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs sm:text-sm text-slate-700 space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isEn ? "Applicant Type:" : "Tipe Pemohon:"}</span>
                  <span className="font-semibold text-slate-900">
                    {requestType === "CORPORATE" ? (isEn ? "Corporate / Institution" : "Perusahaan / Instansi") : (isEn ? "Individual / Pro" : "Individu / Mandiri")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isEn ? "Topic:" : "Topik:"}</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[220px]">{topic}</span>
                </div>
                {institution && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isEn ? "Company/Org:" : "Instansi:"}</span>
                    <span className="font-semibold text-slate-900">{institution}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"
                >
                  <MessageSquare size={16} />
                  <span>{isEn ? "Chat WhatsApp Immediately" : "Hubungi Langsung via WhatsApp"}</span>
                </a>
                <Button variant="outline" onClick={handleResetAndClose} className="w-full sm:w-auto">
                  {isEn ? "Back to Courses" : "Kembali ke Katalog Kursus"}
                </Button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Switcher: Segmented Pill */}
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/70 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setRequestType("CORPORATE")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${requestType === "CORPORATE"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Building2 size={16} className={requestType === "CORPORATE" ? "text-slate-900" : "text-slate-400"} />
                  <span>{isEn ? "Corporate & Team (B2B)" : "Perusahaan & Instansi (B2B)"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType("INDIVIDUAL")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${requestType === "INDIVIDUAL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <User size={16} className={requestType === "INDIVIDUAL" ? "text-slate-900" : "text-slate-400"} />
                  <span>{isEn ? "Individual & Private (B2C)" : "Individu & Privat (B2C)"}</span>
                </button>
              </div>

              {/* Informative Micro-Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5">
                <GraduationCap size={18} className="text-slate-800 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {requestType === "CORPORATE"
                    ? isEn
                      ? "Custom training programs tailored to your company's tech stack, real business problems, and enterprise delivery standards."
                      : "Program pelatihan in-house yang dirancang khusus sesuai studi kasus bisnis, stack teknologi, dan jadwal operasional perusahaan Anda."
                    : isEn
                      ? "Private 1-on-1 or small-cohort mentoring tailored to your specific career path, research thesis, or specialized learning needs."
                      : "Mentoring privat 1-on-1 atau kelompok kecil yang berfokus pada pendalaman karir, bimbingan tesis/riset (MCDM, AHP, AI), atau keahlian spesifik."}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Grid: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={isEn ? "Full Name / PIC Name *" : "Nama Lengkap / PIC *"}
                  placeholder={isEn ? "e.g. John Doe" : "misal: Dr. Pratama / Budi Santoso"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label={isEn ? "Email Address *" : "Alamat Email Aktif *"}
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Grid: Phone / WA & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={isEn ? "WhatsApp / Phone Number" : "Nomor WhatsApp / HP"}
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  hint={isEn ? "For faster curriculum coordination" : "Untuk koordinasi cepat perancangan silabus"}
                />
                <Input
                  label={
                    requestType === "CORPORATE"
                      ? isEn
                        ? "Company / Institution Name *"
                        : "Nama Perusahaan / Instansi *"
                      : isEn
                        ? "Company / Campus (Optional)"
                        : "Instansi / Kampus (Opsional)"
                  }
                  placeholder={
                    requestType === "CORPORATE"
                      ? "PT. Contoh Digital Indonesia / Diskominfo"
                      : "Universitas / Perusahaan Anda"
                  }
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required={requestType === "CORPORATE"}
                />
              </div>

              {/* Topic Field */}
              <Input
                label={isEn ? "Requested Course Topic or Skill Focus *" : "Topik / Bidang Kursus yang Diinginkan *"}
                placeholder={
                  isEn
                    ? "e.g. Applied LLM & Agentic AI, MCDM (AHP & ISM) Advanced, Cloud Architecture"
                    : "misal: Pemodelan Keputusan MCDM (AHP & ISM), Fullstack Next.js Enterprise, AI Engineering"
                }
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />

              {/* Options Grid: Participants, Format, Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Participants */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {isEn ? "Participants Count" : "Perkiraan Peserta"}
                  </label>
                  <select
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    className="h-10 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1 Orang (Private Mentoring)">1 Orang (Private Mentoring)</option>
                    <option value="2 - 5 Orang (Kelompok Kecil)">2 - 5 Orang (Kelompok Kecil)</option>
                    <option value="6 - 15 Orang (Team / Squad)">6 - 15 Orang (Team / Squad)</option>
                    <option value="16 - 30 Orang (Divisi / Batch)">16 - 30 Orang (Divisi / Batch)</option>
                    <option value="> 30 Orang (Organisasi / Klasikal)">&gt; 30 Orang (Organisasi / Klasikal)</option>
                  </select>
                </div>

                {/* Training Format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {isEn ? "Delivery Format" : "Format Pelatihan"}
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="h-10 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Online Live Interaktif">Online Live Interaktif</option>
                    <option value="In-House Offline (Di Kantor/Kampus)">In-House Offline (Di Lokasi)</option>
                    <option value="Hybrid (Online + Sesi Praktik Offline)">Hybrid (Online + Offline)</option>
                    <option value="Self-Paced LMS + Tanya Jawab Pakar">Self-Paced LMS + Sesi Tanya Jawab</option>
                  </select>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {isEn ? "Target Timeline" : "Target Waktu"}
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="h-10 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Segera (1 - 2 Minggu)">Segera (1 - 2 Minggu)</option>
                    <option value="Bulan Depan">Bulan Depan</option>
                    <option value="Dalam 2 - 3 Bulan">Dalam 2 - 3 Bulan</option>
                    <option value="Jadwal Fleksibel">Jadwal Fleksibel</option>
                  </select>
                </div>
              </div>

              {/* Syllabus Details / Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="custom-course-notes" className="text-sm font-medium text-slate-700">
                  {isEn ? "Syllabus Details & Specific Requirements *" : "Rincian Kebutuhan & Ekspektasi Silabus *"}
                </label>
                <textarea
                  id="custom-course-notes"
                  rows={3}
                  required
                  placeholder={
                    isEn
                      ? "Briefly describe your team's background, current pain points, specific tools/technologies to cover, or expected outcomes..."
                      : "Jelaskan latar belakang peserta, modul atau teknologi yang ingin dipelajari secara mendalam, studi kasus khusus, atau capaian yang diharapkan..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {isEn ? "Cancel" : "Batal"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isEn ? "Submit Custom Request" : "Kirim Request Kursus"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Clean Top Bar Trigger Button with its own Modal
 */
export function CoursesRequestQuickAction({
  isEn = false,
  userEmail = "",
  userName = "",
}: CustomCourseRequestProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
      >
        <Sparkles size={14} className="text-slate-700 group-hover:scale-110 transition-transform" />
        <span>{isEn ? "Request Custom Course / B2B" : "Request Kursus Custom"}</span>
      </button>

      <CustomCourseRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isEn={isEn}
        userEmail={userEmail}
        userName={userName}
        defaultType="CORPORATE"
      />
    </>
  );
}

/**
 * Dedicated Full Section Banner placed below the Course Catalog
 */
export function CustomCourseSectionBanner({
  isEn = false,
  userEmail = "",
  userName = "",
}: CustomCourseRequestProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<"INDIVIDUAL" | "CORPORATE">("CORPORATE");

  const handleOpenCorporate = () => {
    setModalDefaultType("CORPORATE");
    setModalOpen(true);
  };

  const handleOpenIndividual = () => {
    setModalDefaultType("INDIVIDUAL");
    setModalOpen(true);
  };

  return (
    <>
      <section
        id="request-kursus-custom"
        className="mt-16 pt-12 border-t border-slate-200"
      >
        {/* Header & Action Buttons in single clean row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? (
                <>
                  Need a Custom Course or <span className="text-blue-600">In-House Training</span>?
                </>
              ) : (
                <>
                  Butuh Kursus Khusus atau <span className="text-blue-600">Pelatihan In-House</span>?
                </>
              )}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isEn
                ? "Cannot find the exact topic you need? We design tailored curricula taught by PhDs and seasoned tech practitioners for individuals, research groups, and enterprise corporate teams."
                : "Tidak menemukan topik kursus yang Anda cari di katalog? Kami siap merancang silabus khusus yang disesuaikan dengan kebutuhan riil proyek, riset ilmiah, maupun peningkatan kompetensi tim perusahaan Anda."}
            </p>
          </div>

          {/* Action Buttons directly accessible */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleOpenCorporate}
              leftIcon={<Building2 size={16} />}
              rightIcon={<ArrowRight size={14} />}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
            >
              {isEn ? "Request Corporate / Team" : "Request Corporate / Tim"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleOpenIndividual}
              leftIcon={<User size={16} />}
              className="border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold"
            >
              {isEn ? "Request Individual" : "Request Individu"}
            </Button>
          </div>
        </div>

        {/* 3 Kotak-kotak (Icon di Kiri, Kalimat di Kanan) - Hitam Putih / Monokrom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/80">
              <Laptop size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                {isEn ? "Tailored to Your Stack" : "Kasus Riil & Tech Stack"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? "Syllabus built around your company's actual workflow and frameworks."
                  : "Materi langsung menyasar problem kerja nyata dan arsitektur sistem tim Anda."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/80">
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                {isEn ? "PhD & Senior Mentors" : "Instruktur Doktor & Pakar"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? "Mentored directly by decision scientists, researchers, and tech leads."
                  : "Dibimbing langsung oleh pakar sains keputusan, konsultan AI, dan praktisi."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/80">
              <FileCheck2 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                {isEn ? "Official Certification" : "Sertifikasi Terverifikasi"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isEn
                  ? "Verifiable cryptographic digital certificates issued for each participant."
                  : "Dilengkapi sertifikat digital terotentikasi QR code untuk tiap peserta."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modal */}
      <CustomCourseRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isEn={isEn}
        userEmail={userEmail}
        userName={userName}
        defaultType={modalDefaultType}
      />
    </>
  );
}
