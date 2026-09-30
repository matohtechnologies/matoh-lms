import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 14,
  showValue = false,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;

          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              {/* Background star */}
              <Star
                size={size}
                className="text-stone-200 fill-stone-200 absolute top-0 left-0"
              />
              {/* Filled star */}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{
                  width: filled ? "100%" : partial ? `${(rating % 1) * 100}%` : "0%",
                }}
              >
                <Star
                  size={size}
                  className="text-amber-400 fill-amber-400"
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-stone-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
