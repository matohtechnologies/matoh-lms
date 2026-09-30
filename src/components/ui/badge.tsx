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
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
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
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const variants: Record<string, "success" | "warning" | "danger"> = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "danger",
  };

  const labels: Record<string, string> = {
    BEGINNER: "Pemula",
    INTERMEDIATE: "Menengah",
    ADVANCED: "Lanjutan",
  };

  return (
    <Badge variant={variants[level]} className={className}>
      {labels[level]}
    </Badge>
  );
}
