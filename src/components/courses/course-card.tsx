"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, BookOpen, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { useAppLocale } from "@/components/providers/locale-provider";

interface CourseCardProps {
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
  locale?: string;
  isEnrolled?: boolean;
}

export function CourseCard({
  id,
  slug,
  title,
  thumbnail,
  price,
  discountPrice,
  level,
  rating,
  reviewCount = 0,
  enrollCount = 0,
  totalLessons,
  duration,
  instructor,
  category,
  locale: propLocale,
  isEnrolled = false,
}: CourseCardProps) {
  const { locale: appLocale } = useAppLocale();
  const locale = propLocale || appLocale || "id";
  const isEn = locale === "en";

  const isFree = price === 0;
  const finalPrice = discountPrice ?? price;
  const hasDiscount = discountPrice != null && discountPrice < price;
  const targetHref = isEnrolled ? `/learn/${id || slug}` : `/courses/${slug}`;

  return (
    <Link href={targetHref}>
      <Card hover className="group flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-stone-100 rounded-t-2xl">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
              <BookOpen size={40} className="text-orange-300" />
            </div>
          )}
          {/* Enrolled badge */}
          {isEnrolled ? (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <CheckCircle size={12} /> {isEn ? "ENROLLED" : "SUDAH DIAMBIL"}
              </span>
            </div>
          ) : isFree ? (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500 text-white shadow-sm">
                {isEn ? "FREE" : "GRATIS"}
              </span>
            </div>
          ) : null}
          {/* Discount badge */}
          {!isEnrolled && hasDiscount && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500 text-white shadow-sm">
                {isEn ? "DISCOUNT" : "DISKON"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* Category & Level */}
          <div className="flex items-center gap-2">
            <Badge variant="orange" className="text-[11px]">
              {category.name}
            </Badge>
            <LevelBadge level={level} locale={locale} className="text-[11px]" />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-orange-700 transition-colors">
            {title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {instructor.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-stone-500 truncate">{instructor.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-stone-500">
            {rating != null && rating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={rating} size={12} />
                <span className="font-medium text-stone-700">{rating.toFixed(1)}</span>
                {reviewCount > 0 && <span>({reviewCount})</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-500">
            {totalLessons && (
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {totalLessons} {isEn ? "lessons" : "materi"}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(duration)}
              </span>
            )}
            {enrollCount > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {enrollCount.toLocaleString(locale === "en" ? "en-US" : "id-ID")}
              </span>
            )}
          </div>

          {/* Price / Enrolled Status */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-stone-100">
            {isEnrolled ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                <CheckCircle size={13} /> {isEn ? "Go to Course →" : "Masuk ke Kelas →"}
              </span>
            ) : isFree ? (
              <span className="font-bold text-green-600">{isEn ? "Free" : "Gratis"}</span>
            ) : (
              <>
                <span className="font-bold text-stone-900 text-base">
                  {formatCurrency(finalPrice, locale)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-stone-400 line-through">
                    {formatCurrency(price, locale)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Skeleton loading state
export function CourseCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <div className="aspect-video w-full animate-shimmer rounded-t-2xl" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-shimmer rounded-full" />
          <div className="h-5 w-14 animate-shimmer rounded-full" />
        </div>
        <div className="h-10 animate-shimmer rounded-lg" />
        <div className="h-4 w-28 animate-shimmer rounded" />
        <div className="h-4 w-full animate-shimmer rounded" />
        <div className="h-6 w-24 animate-shimmer rounded mt-2" />
      </div>
    </Card>
  );
}
