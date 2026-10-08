import Image from "next/image";
import { cn } from "@/lib/utils";

interface MatohLogoProps {
  size?: number;
  variant?: "dark" | "white" | "auto";
  showText?: boolean;
  className?: string;
  imageClassName?: string;
}

/**
 * Official logo emblem of PT. Matoh Technologies Indonesia
 */
export function MatohLogo({
  size = 28,
  variant = "dark",
  showText = false,
  className,
  imageClassName,
}: MatohLogoProps) {
  const src =
    variant === "white"
      ? "/images/matoh-logo-white.png"
      : "/images/matoh-logo.png";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={src}
        alt="PT. Matoh Technologies Indonesia"
        width={size}
        height={size}
        className={cn("object-contain shrink-0", imageClassName)}
        priority
      />
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-lg",
            variant === "white" ? "text-white" : "text-stone-900"
          )}
          style={{ fontFamily: "var(--font-poppins, sans-serif)" }}
        >
          Matoh
          <span className={variant === "white" ? "text-blue-400" : "text-blue-600"}>
            Technologies
          </span>
        </span>
      )}
    </div>
  );
}
