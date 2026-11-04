import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Globe,
  Database,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Workflow,
  Settings,
  FileCheck,
} from "lucide-react";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Custom Website & Software System Development Services | PT. Matoh Technologies Indonesia"
      : "Jasa Pembuatan Website & Sistem Kustom | PT. Matoh Technologies Indonesia",
    description: isEn
      ? "Professional custom web development, company profiles, e-commerce, and enterprise information systems tailored to your specific business requirements."
      : "Layanan profesional pembuatan website, company profile, e-commerce, dan sistem informasi kustom yang disesuaikan dengan alur kebutuhan bisnis Anda.",
  };
}

export default async function DeveloperPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const services = [
    {
      icon: Globe,
      color: "blue",
      title: isEn ? "Company Profile & Business Portals" : "Website Company Profile & Portal Bisnis",
      badge: isEn ? "High Conversion & Branding" : "Kredibilitas & Branding Eksklusif",
      desc: isEn
        ? "Modern, mobile-responsive corporate websites engineered with sub-second loading speed, tailored UI design, SEO architecture, and conversion-focused contact funnels."
        : "Website representatif, modern, dan responsif dengan kecepatan muat tinggi, struktur SEO optimal, dan desain eksklusif tanpa template pasaran untuk mendongkrak citra profesional bisnis Anda.",
      features: isEn
        ? ["Bespoke UI/UX Design (No Generic Templates)", "SEO Architecture & Mobile Optimization", "Integrated Contact Forms & WhatsApp Widget", "Fast Content Management System (CMS)"]
        : ["Desain UI/UX Eksklusif (Bukan Template Pasaran)", "Struktur SEO On-Page & Responsif di Semua Layar", "Integrasi Formulir Inquiry & Tombol WhatsApp Otomatis", "Panel Kelola Konten (CMS) yang Ramah Pengguna"],
    },
    {
      icon: Code2,
      color: "indigo",
      title: isEn ? "Custom Web App & Information Systems" : "Sistem Informasi Manajemen & Aplikasi Web Kustom",
      badge: isEn ? "Workflow Automation" : "Otomasi Alur Kerja Klien",
      desc: isEn
        ? "Custom internal business applications, ERP/CRM portals, inventory tracking, community dashboards, and administrative systems tailored directly to your organization's workflow."
        : "Sistem manajemen operasional internal, portal administrasi, dashboard inventori stok, manajemen data keanggotaan, dan aplikasi alur kerja khusus yang disesuaikan 100% dengan proses bisnis organisasi Anda.",
      features: isEn
        ? ["Tailored Role-Based Access Control (RBAC)", "Real-time Analytics & Executive Dashboards", "Automated Business Logic & PDF Report Generation", "High-Performance PostgreSQL Database"]
        : ["Hak Akses Multi-Level Pengguna (Admin, Staf, Klien)", "Dashboard Monitoring & Statistik Analitik Real-Time", "Otomasi Perhitungan & Ekspor Laporan Excel/PDF", "Basis Data PostgreSQL Berperforma Tinggi & Terenkripsi"],
    },
    {
      icon: Database,
      color: "emerald",
      title: isEn ? "E-Commerce & Digital Transaction Platforms" : "Platform E-Commerce & Sistem Transaksi Digital",
      badge: isEn ? "Payment Gateway Integration" : "Transaksi Otomatis & Aman",
      desc: isEn
        ? "Full-featured transactional platforms featuring automatic bank transfer & e-wallet payment gateways (QRIS, VA), automated WhatsApp notifications, and order management."
        : "Platform toko online dan sistem transaksi terintegrasi payment gateway resmi (QRIS, Virtual Account, Kartu Kredit, E-Wallet), notifikasi invoice WhatsApp otomatis, dan pelacakan pesanan.",
      features: isEn
        ? ["Midtrans / Xendit / Doku Gateway Integration", "Instant WhatsApp Order & Invoice Notifications", "Automated Inventory & Stock Tracking", "PCI-DSS Compliant & Hardened API Security"]
        : ["Integrasi Gerbang Pembayaran Resmi (Midtrans / Xendit)", "Notifikasi Pembayaran & Bukti Invoice Otomatis via WhatsApp", "Sinkronisasi Stok & Manajemen Pesanan", "Standar Keamanan Transaksi dan Enkripsi Data Pelanggan"],
    },
    {
      icon: Layers,
      color: "amber",
      title: isEn ? "API Integration & Legacy System Migration" : "Integrasi API & Modernisasi Sistem Lama",
      badge: isEn ? "System Modernization" : "Konektivitas Antar Sistem",
      desc: isEn
        ? "Connect disconnected business tools with secure APIs, modernize slow legacy systems into high-speed Next.js architectures, and migrate databases safely without data loss."
        : "Menghubungkan berbagai sistem bisnis Anda dengan API yang aman, meremajakan sistem lama yang lambat ke arsitektur modern Next.js yang super cepat, serta migrasi data aman tanpa downtime.",
      features: isEn
        ? ["RESTful & GraphQL Secure API Architecture", "Database Migration & Data Cleansing", "Third-Party Service & Cloud Integrations", "Sub-second Page Load TTFB Optimizations"]
        : ["Pengembangan API RESTful & Integrasi Pihak Ketiga", "Migrasi Basis Data Lama ke Cloud Modern yang Andal", "Peningkatan Kecepatan Muat Aplikasi (Sub-second TTFB)", "Dukungan Pemeliharaan & Audit Keamanan Sistem"],
    },
  ];

  const workflowSteps = [
    {
      num: "01",
      title: isEn ? "Discovery & Requirements" : "Konsultasi & Analisis Kebutuhan",
      desc: isEn
        ? "We analyze your business flow, listen to your pain points, map functional specifications, and provide transparent timeline and cost estimates."
        : "Mendiskusikan proses bisnis Anda, memetakan fitur yang dibutuhkan, merumuskan spesifikasi teknis, serta memberikan estimasi waktu dan biaya yang transparan.",
    },
    {
      num: "02",
      title: isEn ? "UI/UX & System Architecture" : "Perancangan UI/UX & Arsitektur",
      desc: isEn
        ? "Our team creates interactive mockups and validates technical database architecture before any line of production code is written."
        : "Merancang desain antarmuka (wireframe & mockup interaktif) serta arsitektur basis data agar alur sistem disetujui klien sebelum pengkodean dimulai.",
    },
    {
      num: "03",
      title: isEn ? "Agile Development & Demo" : "Pengembangan Sistem & Demo Berkala",
      desc: isEn
        ? "We build your system modularly with high-standard clean code, offering regular demo sessions so you can test features as they are built."
        : "Membangun sistem dengan kode berkualitas tinggi, terstruktur, serta menyelenggarakan sesi demo progres berkala agar Anda dapat menguji fitur langsung.",
    },
    {
      num: "04",
      title: isEn ? "Quality Assurance & Deployment" : "Uji Coba, Keamanan & Peluncuran",
      desc: isEn
        ? "Rigorous stress testing, security audits, and cloud server deployment to ensure your system goes live smoothly and reliably."
        : "Pengujian menyeluruh terhadap bug, keamanan data, performa kecepatan server, hingga sistem siap diluncurkan secara resmi ke domain klien.",
    },
    {
      num: "05",
      title: isEn ? "Staff Training & Support" : "Pelatihan Penggunaan & Garansi",
      desc: isEn
        ? "We train your team with clear user manuals and provide ongoing maintenance support and warranty for worry-free operation."
        : "Memberikan sesi panduan penggunaan untuk staf Anda, dokumentasi teknis lengkap, serta garansi pemeliharaan teknis agar sistem berjalan lancar.",
    },
  ];

  return (
    <div className="pt-20 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200 py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn
                ? "Build Tailored Websites & Systems Designed for Your Business"
                : "Solusi Pembuatan Website & Sistem Kustom Sesuai Kebutuhan Bisnis Anda"}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {isEn
                ? "PT. Matoh Technologies Indonesia provides end-to-end software development: company profiles, custom web applications, e-commerce, and enterprise ERP/CRM systems engineered to match your exact business processes."
                : "Kami melayani pembuatan website profesional, aplikasi web operasional, portal bisnis, dan sistem informasi manajemen terintegrasi yang dirancang dari nol sesuai spesifikasi dan alur kerja spesifik institusi Anda."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <a
                href="https://wa.me/6281210106680?text=Halo%20Tim%20Developer%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20kebutuhan%20pembuatan%20website%20atau%20sistem."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base transition-colors shadow-warm hover:shadow-lg cursor-pointer"
              >
                <MessageSquare size={17} />
                <span>{isEn ? "Free Project Consultation on WhatsApp" : "Konsultasi Gratis via WhatsApp"}</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 hover:border-blue-600 bg-white text-slate-800 hover:text-blue-600 font-semibold text-sm sm:text-base transition-colors shadow-2xs"
              >
                <span>{isEn ? "Submit Project Inquiry" : "Kirim Rincian Kebutuhan"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Development Services */}
      <section className="py-20 sm:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "What We Build for Clients" : "Layanan Pengembangan yang Kami Sediakan"}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "From corporate brand websites to complex multi-user enterprise platforms."
                : "Mulai dari website profil perusahaan hingga sistem enterprise multi-pengguna yang kompleks."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((svc, idx) => {
              const IconComp = svc.icon;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl p-8 sm:p-9 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between space-y-6 shadow-2xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <IconComp size={24} />
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {svc.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {svc.desc}
                    </p>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      {svc.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`https://wa.me/6281210106680?text=Halo%20Tim%20Developer%20Matoh%20Technologies,%20saya%20tertarik%20dengan%20layanan%20${encodeURIComponent(svc.title)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
                    >
                      <span>{isEn ? "Inquire this Service" : "Konsultasikan Layanan Ini"}</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparent Development Workflow */}
      <section className="py-20 sm:py-28 border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold mb-3">
              <Workflow size={13} className="text-slate-600" />
              <span>{isEn ? "Development Methodology" : "Alur Kerja Pengerjaan"}</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "How We Deliver Your Project" : "Tahapan Pengerjaan Proyek yang Terstruktur"}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Transparent, communicative, and timely execution from concept to delivery."
                : "Transparan, terjadwal, dan berorientasi hasil sejak penyusunan konsep hingga rilis."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 max-w-6xl mx-auto">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl p-6 bg-white space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-extrabold text-blue-600/40 font-mono">
                    {step.num}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Matoh Technologies for Development */}
      <section className="py-20 sm:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
            >
              {isEn ? "Why Build with Matoh Technologies?" : "Mengapa Memilih Layanan Developer Kami?"}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mt-3">
              {isEn
                ? "Enterprise architectural standards applied directly to your projects."
                : "Standar rekayasa industri enterprise diterapkan langsung pada sistem Anda."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEn ? "100% Full Code Ownership" : "100% Hak Milik Kode Klien"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "You receive full source code access and full intellectual ownership without proprietary vendor lock-in."
                  : "Seluruh kode sumber dan akses server diserahkan seutuhnya kepada Anda tanpa keterikatan sistem tertutup."}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEn ? "Sub-second Page Speeds" : "Performa Super Cepat"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Engineered with Next.js 15 streaming SSR for lightning-fast responsive load times."
                  : "Dibangun dengan teknologi Next.js App Router performa tinggi agar waktu muat halaman di bawah 1 detik."}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEn ? "Enterprise Security Standard" : "Keamanan Data Berlapis"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Hardened CSP headers, encrypted database connections, and protection against common OWASP vulnerabilities."
                  : "Perlindungan ketat dari ancaman SQL injection, XSS, CSRF, serta enkripsi data sensitif pengguna."}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Settings size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEn ? "Dedicated After-Sales Support" : "Garansi & Pemeliharaan"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn
                  ? "Technical warranty, free bug fixes post-launch, and continuous support to keep your system performing at peak."
                  : "Dukungan garansi teknis pasca-rilis, perbaikan bug gratis, dan pendampingan kelancaran sistem operasional."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-2xs">
            <Sparkles size={28} />
          </div>

          <h2
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn
              ? "Have a Website or System in Mind? Let's Discuss."
              : "Punya Rencana Pembuatan Website atau Sistem? Diskusikan Bersama Kami."}
          </h2>

          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {isEn
              ? "Share your concept, requirements, or pain points. Our development team will provide honest technical advice, mockups, and cost estimates."
              : "Sampaikan ide, kendala operasional, atau spesifikasi sistem yang Anda butuhkan. Tim developer kami siap memberikan masukan teknis dan penawaran terbaik."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <a
              href="https://wa.me/6281210106680?text=Halo%20Tim%20Developer%20Matoh%20Technologies,%20saya%20ingin%20konsultasi%20pembuatan%20website%20atau%20sistem."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base transition-colors shadow-warm cursor-pointer"
            >
              <MessageSquare size={18} />
              <span>{isEn ? "Chat via WhatsApp (Fast Response)" : "Hubungi via WhatsApp (Respon Cepat)"}</span>
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-semibold text-sm sm:text-base transition-colors shadow-2xs"
            >
              <span>{isEn ? "Submit Inquiry Form" : "Kirim Formulir Penawaran"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
