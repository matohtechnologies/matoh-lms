import Link from "next/link";
import { BookOpen, Users, Award, Target, Heart, Star } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "en" ? "About Us" : "Tentang Kami",
    description:
      locale === "en"
        ? "Learn more about Earthy Academy, our mission, vision, and the team behind our trusted online learning platform."
        : "Pelajari lebih lanjut tentang Earthy Academy, misi, visi, dan tim di balik platform belajar online terpercaya.",
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const t = await getTranslations("about");

  const values = [
    {
      icon: Target,
      title: t("mission_title"),
      desc: t("mission_desc"),
    },
    {
      icon: Heart,
      title: t("vision_title"),
      desc: t("vision_desc"),
    },
    {
      icon: Star,
      title: t("value_title"),
      desc: t("value_desc"),
    },
  ];

  const team = [
    { name: "Arif Wibowo", role: "Founder & CEO", avatar: "A", bg: "from-orange-400 to-amber-500" },
    { name: "Dini Rahayu", role: "CTO", avatar: "D", bg: "from-blue-400 to-indigo-500" },
    { name: "Fajar Nugroho", role: isEn ? "Head of Content" : "Kepala Konten", avatar: "F", bg: "from-green-400 to-emerald-500" },
    { name: "Lina Susanti", role: isEn ? "Head of Design" : "Kepala Desain", avatar: "L", bg: "from-purple-400 to-pink-500" },
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="gradient-hero py-20 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium mb-6">
            <BookOpen size={16} />
            {t("hero_badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 mb-6" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
            {t("hero_title")}<br />
            <span className="text-gradient">{t("hero_highlight")}</span>
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            {t("hero_desc")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "12K+", label: t("stat_students") },
              { value: "240+", label: t("stat_courses") },
              { value: "48+", label: t("stat_instructors") },
              { value: "4.9★", label: t("stat_rating") },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-extrabold text-stone-900" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                  {value}
                </p>
                <p className="text-stone-500 text-sm mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
              {t("values_title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-stone-200 p-7 hover:shadow-warm transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-orange-600" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg mb-3" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
                  {title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
              {t("team_title")}
            </h2>
            <p className="text-stone-500">{t("team_subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {team.map(({ name, role, avatar, bg }) => (
              <div key={name} className="text-center group">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-105 transition-transform shadow-warm`}>
                  {avatar}
                </div>
                <p className="font-semibold text-stone-900">{name}</p>
                <p className="text-sm text-stone-500 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gradient-to-br from-orange-600 to-amber-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-plus-jakarta, sans-serif)" }}>
            {isEn ? "Join Our Community" : "Bergabunglah Bersama Kami"}
          </h2>
          <p className="text-orange-100 mb-7">
            {isEn ? "Be part of a thriving network of learners and tech professionals." : "Jadilah bagian dari komunitas belajar yang terus berkembang"}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
          >
            {isEn ? "Start Learning Free" : "Mulai Belajar Gratis"}
          </Link>
        </div>
      </section>
    </div>
  );
}
