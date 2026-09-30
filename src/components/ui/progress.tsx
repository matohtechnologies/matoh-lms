import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Progress({ value, className, showLabel = false, size = "md" }: ProgressProps) {
  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-stone-500">Progress</span>
          <span className="text-xs font-medium text-orange-600">{Math.round(value)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-stone-200 rounded-full overflow-hidden", heightClass)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            "bg-gradient-to-r from-orange-500 to-amber-500"
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
