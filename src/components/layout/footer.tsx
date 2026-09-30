"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.94 0-1.7.76-1.7 1.7s.76 1.7 1.7 1.7 1.7-.76 1.7-1.7-.76-1.7-1.7-1.7Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                Earthy<span className="text-orange-400">Academy</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400 mb-5">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: TwitterIcon, href: "#", label: "Twitter" },
                { icon: LinkedInIcon, href: "#", label: "LinkedIn" },
                { icon: YouTubeIcon, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-orange-600 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="text-stone-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              {t("platform")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/courses", label: t("all_courses") },
                { href: "/about", label: t("about_us") },
                { href: "/instructors", label: t("instructors") },
                { href: "/blog", label: t("blog") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              {t("support")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/help", label: t("help_center") },
                { href: "/contact", label: t("contact_us") },
                { href: "/terms", label: t("terms") },
                { href: "/privacy", label: t("privacy") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              {t("newsletter")}
            </h4>
            <p className="text-sm text-stone-400 mb-4">
              {t("newsletter_desc")}
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t("email_placeholder")}
                className="h-10 px-3 rounded-xl bg-stone-800 border border-stone-700 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
              >
                {t("subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            © {currentYear} Earthy Academy. {t("rights")}
          </p>
          <div className="flex items-center gap-1 text-sm text-stone-500">
            <span>{t("made_with")}</span>
            <span className="text-orange-500">♥</span>
            <span>{t("in_indonesia")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
