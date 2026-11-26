"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { useAppLocale } from "@/components/providers/locale-provider";
import { resolveThumbnailUrl, isVideoUrl } from "@/lib/youtube";

interface CourseCardProps {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
  level?: string;
  rating?: number | null;
  reviewCount?: number;
  enrollCount?: number;
  totalLessons?: number | null;
  duration?: number | null;
  instructor?: {
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
  rating,
  reviewCount = 0,
  enrollCount = 0,
  totalLessons,
  duration,
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
  const safeThumbnail = resolveThumbnailUrl(thumbnail);
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={targetHref}>
      <Card hover className="group flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 rounded-t-2xl">
          {safeThumbnail && !imgError ? (
            isVideoUrl(safeThumbnail) ? (
              <video
                src={safeThumbnail}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                muted
                playsInline
                preload="metadata"
                onError={() => setImgError(true)}
              />
            ) : (
              <Image
                src={safeThumbnail}
                alt={title}
                fill
                onError={() => setImgError(true)}
                unoptimized={
                  safeThumbnail.includes("youtube.com") ||
                  safeThumbnail.includes("ytimg.com")
                }
                style={{ aspectRatio: "16 / 9" }}
                className="object-cover aspect-video transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/70 to-slate-200 text-slate-500 p-4 text-center select-none">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200/90 flex items-center justify-center mb-2 text-blue-600">
                <BookOpen size={24} />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight line-clamp-1 max-w-[90%]">
                {title}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                Matoh Technologies
              </span>
            </div>
          )}
          {/* Enrolled checkmark indicator - subtle white badge with green check */}
          {isEnrolled && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span
                className="w-5 h-5 rounded-full bg-white text-emerald-600 shadow-xs border border-slate-200/80 flex items-center justify-center"
                title={isEn ? "Course enrolled" : "Kursus sudah diambil"}
                aria-label={isEn ? "Course enrolled" : "Kursus sudah diambil"}
              >
                <Check size={11} strokeWidth={3} />
              </span>
            </div>
          )}

          {/* Free badge */}
          {!isEnrolled && isFree ? (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500 text-white shadow-sm">
                {isEn ? "FREE" : "GRATIS"}
              </span>
            </div>
          ) : null}
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500 text-white shadow-sm">
                {isEn ? "DISCOUNT" : "DISKON"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* Category & Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="info" className="text-[11px]">
              {category.name}
            </Badge>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
              Lifetime Access
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
              Self Paced
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            {rating != null && rating > 0 && (
              <>
                <div className="flex items-center gap-1">
                  <StarRating rating={rating} size={12} />
                  <span className="font-medium text-slate-700">{rating.toFixed(1)}</span>
                  {reviewCount > 0 && <span>({reviewCount})</span>}
                </div>
                <span className="text-slate-300">•</span>
              </>
            )}
            {totalLessons && (
              <span>
                {totalLessons} {isEn ? "lessons" : "materi"}
              </span>
            )}
            {totalLessons && duration && <span className="text-slate-300">•</span>}
            {duration && (
              <span>
                {formatDuration(duration)}
              </span>
            )}
            {(totalLessons || duration) && enrollCount > 0 && <span className="text-slate-300">•</span>}
            {enrollCount > 0 && (
              <span>
                {enrollCount.toLocaleString(locale === "en" ? "en-US" : "id-ID")} {isEn ? "students" : "siswa"}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-100">
            {isFree ? (
              <span className="font-bold text-emerald-600 text-base">
                {isEn ? "Free" : "Gratis"}
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 text-base">
                  {formatCurrency(finalPrice, locale)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(price, locale)}
                  </span>
                )}
              </div>
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
        <div className="flex flex-wrap gap-1.5">
          <div className="h-5 w-16 animate-shimmer rounded-full" />
          <div className="h-5 w-20 animate-shimmer rounded-full" />
          <div className="h-5 w-16 animate-shimmer rounded-full" />
        </div>
        <div className="h-10 animate-shimmer rounded-lg" />
        <div className="h-4 w-full animate-shimmer rounded" />
        <div className="h-6 w-24 animate-shimmer rounded mt-auto pt-2" />
      </div>
    </Card>
  );
}
