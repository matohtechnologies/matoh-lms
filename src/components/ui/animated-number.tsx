"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // milliseconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
}

/**
 * Smooth, easing number counter on viewport intersection.
 * Uses native requestAnimationFrame and respects prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "id-ID",
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Accessibility check: immediately display target value without animation
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          observer.unobserve(element);

          const startTime = performance.now();
          const startValue = 0;
          const endValue = value;

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Silky ease-out cubic curve: 1 - (1 - t)^3
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentNumber = startValue + (endValue - startValue) * easeOutProgress;

            setDisplayValue(currentNumber);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(endValue);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString(locale);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
