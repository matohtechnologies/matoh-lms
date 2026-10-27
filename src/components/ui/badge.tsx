import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "orange" | "amber";
}

const variantClasses = {
  default: "bg-slate-100/90 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  amber: "bg-amber-50 text-amber-800",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full",
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
