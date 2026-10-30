"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  PlayCircle,
  Clock,
  CheckCircle2,
  Tag,
  CreditCard,
  X,
  ListOrdered,
  RotateCcw,
} from "lucide-react";
import { LevelBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { resolveThumbnailUrl } from "@/lib/youtube";

export interface DashboardCourseItem {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration?: number | null;
  totalLessons?: number | null;
  rating?: number | null;
  reviewCount: number;
  enrollCount: number;
  whatYouLearn?: string | null;
  category: {
    id: string;
    name: string;
  };
  instructor: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  sections: Array<{
    id: string;
    title: string;
    titleEn?: string | null;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      titleEn?: string | null;
      duration?: number | null;
    }>;
  }>;
}

interface DashboardCoursesClientProps {
  courses: DashboardCourseItem[];
  categories: Array<{ id: string; name: string }>;
  enrolledCourseIds: string[];
  pendingOrderCourseIds: string[];
  isEn?: boolean;
}

export function DashboardCoursesClient({
  courses,
  categories,
  enrolledCourseIds,
  pendingOrderCourseIds,
  isEn = false,
}: DashboardCoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Modal detail & silabus
  const [selectedCourseForModal, setSelectedCourseForModal] =
    useState<DashboardCourseItem | null>(null);

  const enrolledSet = useMemo(() => new Set(enrolledCourseIds), [enrolledCourseIds]);
  const pendingSet = useMemo(() => new Set(pendingOrderCourseIds), [pendingOrderCourseIds]);

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle =
            course.title.toLowerCase().includes(q) ||
            (course.titleEn && course.titleEn.toLowerCase().includes(q));
          const matchDesc = course.description.toLowerCase().includes(q);
          const matchInstructor =
            course.instructor.name &&
            course.instructor.name.toLowerCase().includes(q);
          const matchCategory = course.category.name.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchInstructor && !matchCategory) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "ALL" && course.category.id !== selectedCategory) {
          return false;
        }

        // Level filter
        if (selectedLevel !== "ALL" && course.level !== selectedLevel) {
          return false;
        }

        // Status filter
        const isEnrolled = enrolledSet.has(course.id);
        const isPending = pendingSet.has(course.id);
        const isFree = course.price === 0;

        if (selectedStatus === "NOT_ENROLLED" && isEnrolled) return false;
        if (selectedStatus === "ENROLLED" && !isEnrolled) return false;
        if (selectedStatus === "PENDING" && !isPending) return false;
        if (selectedStatus === "FREE" && !isFree) return false;
        if (selectedStatus === "PAID" && isFree) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.enrollCount - a.enrollCount;
        if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === "price-asc") {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceA - priceB;
        }
        if (sortBy === "price-desc") {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceB - priceA;
        }
        return 0;
      });
  }, [
    courses,
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedStatus,
    sortBy,
    enrolledSet,
    pendingSet,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedLevel("ALL");
    setSelectedStatus("ALL");
    setSortBy("popular");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedLevel !== "ALL" ||
    selectedStatus !== "ALL" ||
    sortBy !== "popular";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Minimalist Clean Header (Fully Responsive) ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-stone-200/60">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "Available Courses" : "Pilih & Beli Pelatihan"}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {isEn
              ? "Browse all certifications and digital courses available in your learning portal."
              : "Daftar program sertifikasi dan pelatihan digital yang tersedia untuk Anda ikuti."}
          </p>
        </div>

        {/* Minimalist Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 bg-white text-stone-700 shadow-2xs">
            <span className="text-stone-500">{isEn ? "Total:" : "Total:"}</span>
            <span className="font-extrabold text-stone-900">{courses.length}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-2xs">
            <span>{isEn ? "Enrolled:" : "Dimiliki:"}</span>
            <span className="font-extrabold">{enrolledSet.size}</span>
          </div>
          {pendingSet.size > 0 && (
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Clock size={12} />
              <span>
                {pendingSet.size} {isEn ? "pending" : "menunggu bayar"}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Search & Filter Controls (Responsive Grid/Flex) ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Row 1: Search & Dropdown Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={isEn ? "Search course or instructor..." : "Cari judul pelatihan atau nama instruktur..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Filters (Grid on mobile, flex on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full h-9 px-2.5 sm:px-3 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">{isEn ? "All Levels" : "Semua Tingkat"}</option>
              <option value="BEGINNER">{isEn ? "Beginner" : "Pemula"}</option>
              <option value="INTERMEDIATE">{isEn ? "Intermediate" : "Menengah"}</option>
              <option value="ADVANCED">{isEn ? "Advanced" : "Lanjutan"}</option>
            </select>

            {/* Ownership Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 px-2.5 sm:px-3 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">{isEn ? "All Status" : "Semua Status"}</option>
              <option value="NOT_ENROLLED">{isEn ? "Ready to Buy" : "Belum Dimiliki"}</option>
              <option value="ENROLLED">{isEn ? "Already Enrolled" : "Sudah Dimiliki"}</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="col-span-2 sm:col-span-1 w-full h-9 px-2.5 sm:px-3 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="popular">{isEn ? "Most Popular" : "Paling Populer"}</option>
              <option value="rating">{isEn ? "Rating" : "Rating Tertinggi"}</option>
              <option value="price-asc">{isEn ? "Price: Low to High" : "Harga: Terendah"}</option>
              <option value="price-desc">{isEn ? "Price: High to Low" : "Harga: Tertinggi"}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              selectedCategory === "ALL"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
            }`}
          >
            {isEn ? "All" : "Semua Kategori"}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
              }`}
            >
              {cat.name}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 shrink-0 ml-auto transition-colors"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Course Grid (Fully Responsive: 1 col on mobile, 2 on tablet, 3 on desktop) ─────────────────────────── */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={22} />
          </div>
          <h3
            className="text-base font-bold text-stone-900 mb-1"
            style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
          >
            {isEn ? "No Courses Found" : "Pelatihan Tidak Ditemukan"}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
            {isEn
              ? "No courses matched your current filter. Try resetting filters."
              : "Tidak ada pelatihan yang cocok dengan filter saat ini."}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <RotateCcw size={13} />
            <span>{isEn ? "Reset Filters" : "Reset Filter"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledSet.has(course.id);
            const isPending = pendingSet.has(course.id);
            const isFree = course.price === 0;
            const finalPrice = course.discountPrice ?? course.price;
            const hasDiscount =
              course.discountPrice != null && course.discountPrice < course.price;
            const safeThumbnail = resolveThumbnailUrl(course.thumbnail);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all duration-150 flex flex-col overflow-hidden"
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-video w-full bg-stone-100 overflow-hidden shrink-0">
                  {safeThumbnail ? (
                    <img
                      src={safeThumbnail}
                      alt={course.title}
                      width={384}
                      height={216}
                      style={{ aspectRatio: "16 / 9" }}
                      className="w-full h-full object-cover aspect-video"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-stone-400">
                      <BookOpen size={32} />
                    </div>
                  )}

                  {/* Category pill */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-900/80 text-white backdrop-blur-xs">
                      {course.category.name}
                    </span>
                  </div>

                  {/* Status Badges Overlay */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {isEnrolled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 size={11} />
                        <span>{isEn ? "Enrolled" : "Dimiliki"}</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                        <Clock size={11} />
                        <span>{isEn ? "Pending" : "Menunggu"}</span>
                      </span>
                    ) : hasDiscount ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-xs">
                        <Tag size={10} />
                        <span>Diskon</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Duration & Lessons pill */}
                  <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded bg-stone-900/75 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-2">
                    {course.totalLessons != null && (
                      <span>
                        {course.totalLessons} {isEn ? "materi" : "materi"}
                      </span>
                    )}
                    {course.duration != null && (
                      <span>{formatDuration(course.duration)}</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Level & Rating */}
                    <div className="flex items-center justify-between text-xs">
                      <LevelBadge level={course.level} locale={isEn ? "en" : "id"} />
                      {course.rating != null && course.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          <StarRating rating={course.rating} size={12} />
                          <span className="text-stone-600 text-[11px]">({course.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h2
                      className="font-bold text-stone-900 text-sm leading-snug line-clamp-2"
                      style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                      title={course.title}
                    >
                      {course.title}
                    </h2>

                    {/* Instructor */}
                    <p className="text-xs text-stone-500 truncate">
                      {course.instructor.name}
                    </p>
                  </div>

                  {/* Price & Action Area */}
                  <div className="pt-2.5 border-t border-stone-100 space-y-2.5">
                    {/* Price and Details link */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        {isEnrolled ? (
                          <span className="text-xs font-semibold text-emerald-700">
                            {isEn ? "Full Access" : "Akses Penuh"}
                          </span>
                        ) : isFree ? (
                          <span className="text-sm font-bold text-stone-900">
                            {isEn ? "Free" : "Gratis"}
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-stone-900">
                              {formatCurrency(finalPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] line-through text-stone-400">
                                {formatCurrency(course.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCourseForModal(course)}
                        className="text-[11px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        {isEn ? "Syllabus" : "Silabus"}
                      </button>
                    </div>

                    {/* CTA Button */}
                    <div>
                      {isEnrolled ? (
                        <Link
                          href={`/learn/${course.id}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                        >
                          <PlayCircle size={14} />
                          <span>{isEn ? "Start Learning" : "Lanjutkan Belajar"}</span>
                        </Link>
                      ) : isPending ? (
                        <Link
                          href="/dashboard/orders"
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
                        >
                          <CreditCard size={14} />
                          <span>{isEn ? "Complete Payment" : "Selesaikan Bayar"}</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/checkout/${course.id}`}
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <CreditCard size={14} />
                          <span>
                            {isFree
                              ? isEn
                                ? "Enroll Free"
                                : "Daftar Gratis"
                              : isEn
                              ? "Enroll Now"
                              : "Beli Kelas"}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Syllabus / Curriculum Preview Modal (Fully Responsive on Mobile/Tablet/PC) ─────────────── */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white rounded-2xl shadow-xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-5 border-b border-stone-100 flex items-start justify-between gap-3">
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-medium text-stone-500">
                    {selectedCourseForModal.category.name}
                  </span>
                  <LevelBadge
                    level={selectedCourseForModal.level}
                    locale={isEn ? "en" : "id"}
                  />
                </div>
                <h3
                  className="text-sm sm:text-base font-bold text-stone-900 leading-snug"
                  style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
                >
                  {selectedCourseForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseForModal(null)}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors shrink-0"
                aria-label="Tutup"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs text-stone-600">
              {/* Description */}
              <div>
                <p className="leading-relaxed">
                  {selectedCourseForModal.description}
                </p>
              </div>

              {/* What You'll Learn (if available) */}
              {selectedCourseForModal.whatYouLearn && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-2">
                  <h4 className="font-bold text-stone-900 text-xs">
                    {isEn ? "Key Takeaways:" : "Materi Pembelajaran:"}
                  </h4>
                  <ul className="space-y-1 text-stone-700">
                    {selectedCourseForModal.whatYouLearn
                      .split("\n")
                      .filter((line) => line.trim().length > 0)
                      .slice(0, 5)
                      .map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600">•</span>
                          <span>{item.replace(/^[-*•]\s*/, "")}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Curriculum */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                  <ListOrdered size={13} className="text-stone-500" />
                  <span>{isEn ? "Curriculum" : "Silabus Pelajaran"}</span>
                </h4>

                {selectedCourseForModal.sections.length === 0 ? (
                  <p className="text-stone-400 italic">
                    {isEn ? "Curriculum will be added soon." : "Silabus belum tersedia."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedCourseForModal.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="rounded-xl border border-stone-200/70 overflow-hidden"
                      >
                        <div className="px-3 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-800">
                          <span className="truncate pr-2">
                            {idx + 1}. {section.title}
                          </span>
                          <span className="text-[10px] text-stone-400 font-normal shrink-0">
                            {section.lessons.length} {isEn ? "lessons" : "materi"}
                          </span>
                        </div>
                        <ul className="divide-y divide-stone-100">
                          {section.lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              className="px-3 py-2 flex items-center justify-between text-[11px] text-stone-600"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <PlayCircle size={12} className="text-stone-400 shrink-0" />
                                <span className="truncate">{lesson.title}</span>
                              </div>
                              {lesson.duration != null && lesson.duration > 0 && (
                                <span className="text-stone-400 text-[10px] shrink-0">
                                  {formatDuration(lesson.duration)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-2.5">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Harga</p>
                <p className="text-xs sm:text-sm font-bold text-stone-900">
                  {enrolledSet.has(selectedCourseForModal.id)
                    ? isEn
                      ? "Enrolled"
                      : "Dimiliki"
                    : selectedCourseForModal.price === 0
                    ? "Gratis"
                    : formatCurrency(
                        selectedCourseForModal.discountPrice ??
                          selectedCourseForModal.price
                      )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForModal(null)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  {isEn ? "Close" : "Tutup"}
                </button>

                {enrolledSet.has(selectedCourseForModal.id) ? (
                  <Link
                    href={`/learn/${selectedCourseForModal.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
                  >
                    <PlayCircle size={13} />
                    <span>{isEn ? "Learn" : "Mulai Belajar"}</span>
                  </Link>
                ) : (
                  <Link
                    href={`/checkout/${selectedCourseForModal.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <CreditCard size={13} />
                    <span>
                      {selectedCourseForModal.price === 0
                        ? isEn
                          ? "Enroll Free"
                          : "Daftar Gratis"
                        : isEn
                        ? "Enroll Now"
                        : "Beli Kelas"}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
