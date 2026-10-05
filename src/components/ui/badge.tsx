import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "orange" | "amber";
}

const variantClasses = {
  default: "bg-stone-100 text-stone-700 border-stone-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  orange: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

interface LevelBadgeProps {
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  className?: string;
  locale?: string;
}

export function LevelBadge({ level, className, locale = "id" }: LevelBadgeProps) {
  const variants: Record<string, "success" | "warning" | "danger"> = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "danger",
  };

  const labelsId: Record<string, string> = {
    BEGINNER: "Pemula",
    INTERMEDIATE: "Menengah",
    ADVANCED: "Lanjutan",
  };

  const labelsEn: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

  const label = locale === "en" ? labelsEn[level] : labelsId[level];

  return (
    <Badge variant={variants[level]} className={className}>
      {label}
    </Badge>
  );
}
