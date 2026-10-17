"use client";

import { Sparkles, Target, CheckCircle2 } from "lucide-react";

interface CourseCompetencyBadgesProps {
  categoryName: string;
  courseTitle: string;
  whatYouLearn?: string[];
  locale?: string;
}

export function CourseCompetencyBadges({
  categoryName,
  courseTitle,
  whatYouLearn = [],
  locale = "id",
}: CourseCompetencyBadgesProps) {
  const isEn = locale === "en";

  // Derive relevant industry competency skills based on title, category, or whatYouLearn
  const derivedSkills: string[] = (() => {
    const list: string[] = [];
    const text = `${categoryName} ${courseTitle} ${whatYouLearn.join(" ")}`.toLowerCase();

    if (text.includes("marketing") || text.includes("digital") || text.includes("penjualan")) {
      list.push(
        isEn ? "Digital Sales Funnel" : "Digital Sales Funnel",
        isEn ? "Social Ads Strategy" : "Strategi Iklan Berbayar",
        isEn ? "Content Copywriting" : "Copywriting Konversi",
        isEn ? "Analytics & ROI" : "Analisis Omzet & ROI"
      );
    }
    if (text.includes("ahp") || text.includes("mcdm") || text.includes("decision") || text.includes("keputusan")) {
      list.push(
        isEn ? "AHP Modeling" : "Pemodelan AHP",
        isEn ? "MCDM Decision Matrix" : "Matriks Keputusan MCDM",
        isEn ? "Sensitivity Analysis" : "Analisis Sensitivitas",
        isEn ? "Policy Formulation" : "Perumusan Kebijakan Publik"
      );
    }
    if (text.includes("ism") || text.includes("interpretive") || text.includes("struktur")) {
      list.push(
        isEn ? "Structural Modeling" : "Pemodelan Struktural ISM",
        isEn ? "Hierarchy Matrix" : "Matriks Hirarki Elemen",
        isEn ? "Strategic Roadmapping" : "Roadmap Strategis"
      );
    }
    if (text.includes("design thinking") || text.includes("inovasi") || text.includes("innovation")) {
      list.push(
        isEn ? "Design Thinking Sprint" : "Design Thinking Sprint",
        isEn ? "Empathy Mapping" : "Pemetaan Masalah Pengguna",
        isEn ? "Rapid Prototyping" : "Rapid Prototyping Bisnis",
        isEn ? "Agile Validation" : "Validasi Produk Cepat"
      );
    }
    if (text.includes("umkm") || text.includes("bisnis") || text.includes("usaha") || text.includes("sme")) {
      list.push(
        isEn ? "Business Scaling" : "Scale-Up Omzet UMKM",
        isEn ? "Operational Efficiency" : "Efisiensi Operasional",
        isEn ? "Branding Strategy" : "Strategi Diferensiasi Merek"
      );
    }

    // Default fallback competencies if none matched
    if (list.length === 0) {
      list.push(
        isEn ? "Applied Methodology" : "Metodologi Terapan",
        isEn ? "Real-World Case Study" : "Studi Kasus Riil",
        isEn ? "Industry Best Practices" : "Best Practice Industri",
        isEn ? "Verified Digital Portfolio" : "Portofolio Terverifikasi"
      );
    }

    // Deduplicate and cap to 5 items max
    return Array.from(new Set(list)).slice(0, 5);
  })();

  return (
    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-sky-50/70 rounded-2xl p-4 sm:p-5 border border-blue-200/60 shadow-2xs">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Target size={14} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            {isEn ? "Target Industry Competencies & Skills" : "Target Capaian Kompetensi & Keahlian Industri"}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
            <Sparkles size={11} className="text-blue-600" />
            {isEn ? "Job-Ready Outcome" : "Siap Diterapkan"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {derivedSkills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200/80 text-xs font-semibold text-slate-800 shadow-2xs hover:border-blue-400 hover:text-blue-700 transition-all cursor-default"
          >
            <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
            <span>#{skill}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
