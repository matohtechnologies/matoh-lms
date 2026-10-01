"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating?: number | null;
  reviewCount?: number;
  enrollCount?: number;
  totalLessons?: number | null;
  duration?: number | null;
  instructor: {
    name?: string | null;
    image?: string | null;
  };
  category: {
    name: string;
  };
}

interface FeaturedCoursesShowcaseProps {
  courses: CourseItem[];
  enrolledCourseIds: string[];
  locale: string;
  isEn: boolean;
}

export function FeaturedCoursesShowcase({
  courses,
  enrolledCourseIds,
  locale,
  isEn,
}: FeaturedCoursesShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category?.name) set.add(c.category.name);
    });
    return Array.from(set);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "ALL") return courses;
    return courses.filter((c) => c.category?.name === selectedCategory);
  }, [courses, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Category Filter Pills (Minimal, clean, human design) */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {isEn ? "All Programs" : "Semua Program"} ({courses.length})
          </button>

          {categories.map((catName) => {
            const count = courses.filter((c) => c.category?.name === catName).length;
            const isSelected = selectedCategory === catName;

            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(catName)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {catName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Course Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              slug={course.slug}
              title={course.title}
              thumbnail={course.thumbnail}
              price={course.price}
              discountPrice={course.discountPrice}
              level={course.level}
              rating={course.rating}
              reviewCount={course.reviewCount}
              enrollCount={course.enrollCount}
              totalLessons={course.totalLessons}
              duration={course.duration}
              instructor={course.instructor}
              category={course.category}
              locale={locale}
              isEnrolled={enrolledCourseIds.includes(course.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
          <p className="text-slate-500 text-sm">
            {isEn ? "No courses in this category yet." : "Belum ada kelas di kategori ini."}
          </p>
        </div>
      )}

      {/* Bottom CTA to All Courses */}
      <div className="pt-4 text-center">
        <Link href="/courses">
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-slate-300 hover:border-slate-400 bg-white shadow-xs"
            rightIcon={<ArrowRight size={16} />}
          >
            {isEn ? "Explore Full Course Catalog" : "Jelajahi Seluruh Katalog Kelas"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
