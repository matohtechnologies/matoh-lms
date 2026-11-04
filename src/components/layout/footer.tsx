"use client";

import Link from "next/link";
import Image from "next/image";
import { PAYMENT_METHODS } from "@/components/layout/payment-logos";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.94 0-1.7.76-1.7 1.7s.76 1.7 1.7 1.7 1.7-.76 1.7-1.7-.76-1.7-1.7-1.7Z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* 3-Column Minimalist Wireframe Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Column 1: Brand & Copyright (Kiri) */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 transition-colors group-hover:border-blue-500">
                <Image
                  src="/images/matoh-logo-white-v2.png"
                  alt="PT. Matoh Technologies Indonesia"
                  width={20}
                  height={20}
                  priority
                  style={{ aspectRatio: "1 / 1" }}
                  className="object-contain aspect-square"
                />
              </div>
              <span
                className="font-bold text-white text-base tracking-tight"
                style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
              >
                MATOH TECHNOLOGIES
              </span>
            </Link>

            <div className="space-y-1 text-xs text-slate-400">
              <p className="font-medium text-slate-300">
                PT. Matoh Technologies Indonesia · {currentYear}.
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                Make Home Ready on Digital
              </p>
            </div>
          </div>

          {/* Column 2: Social Media - Cukup Logo / Icon Saja (Tengah) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Media Sosial
            </h4>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/60 hover:bg-slate-800 hover:text-pink-400 flex items-center justify-center transition-all duration-200 text-slate-300 shadow-2xs hover:scale-105"
              >
                <InstagramIcon />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/60 hover:bg-slate-800 hover:text-red-400 flex items-center justify-center transition-all duration-200 text-slate-300 shadow-2xs hover:scale-105"
              >
                <YouTubeIcon />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-800 hover:text-blue-400 flex items-center justify-center transition-all duration-200 text-slate-300 shadow-2xs hover:scale-105"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Navigation Links - About, Kontak, etc. (Kanan) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tautan Navigasi
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <Link href="/about" className="text-slate-400 hover:text-white transition-colors py-0.5">
                About
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Kontak
              </Link>
              <Link href="/courses" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Course
              </Link>
              <Link href="/riset" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Riset
              </Link>
              <Link href="/publikasi" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Publikasi
              </Link>
              <Link href="/developer" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Developer
              </Link>
              <Link href="/konsultan" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Konsultan
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors py-0.5">
                Syarat &amp; Privasi
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="mt-12 pt-8 border-t border-slate-900 space-y-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Metode Pembayaran Resmi
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            {PAYMENT_METHODS.map(({ name, component: Component, opticalHeight }) => (
              <div
                key={name}
                className="group flex items-center justify-center shrink-0 cursor-pointer select-none transition-transform duration-200 hover:scale-105 opacity-80 hover:opacity-100"
                title={name}
              >
                <Component className={`${opticalHeight} w-auto`} />
              </div>
            ))}
          </div>
        </div>

{/* Bottom Sub-strip */}
        <div className="mt-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {currentYear} PT. Matoh Technologies Indonesia. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
}
