"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "blur-in" | "fade";
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  className?: string;
  threshold?: number;
  once?: boolean;
}

/**
 * High-performance, GPU-accelerated scroll reveal component.
 * Uses native IntersectionObserver with zero layout shift (CLS = 0)
 * and automatically respects WCAG prefers-reduced-motion standards.
 */
export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  className,
  threshold = 0.1,
  once = true,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Accessibility check: disable animation if user prefers reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const getStyle = (): React.CSSProperties => {
    const transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    if (isVisible) {
      return {
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1)",
        filter: "blur(0px)",
        transition,
        willChange: "opacity, transform",
      };
    }

    switch (animation) {
      case "fade-down":
        return {
          opacity: 0,
          transform: "translate3d(0, -24px, 0)",
          transition,
          willChange: "opacity, transform",
        };
      case "fade-left":
        return {
          opacity: 0,
          transform: "translate3d(-28px, 0, 0)",
          transition,
          willChange: "opacity, transform",
        };
      case "fade-right":
        return {
          opacity: 0,
          transform: "translate3d(28px, 0, 0)",
          transition,
          willChange: "opacity, transform",
        };
      case "zoom-in":
        return {
          opacity: 0,
          transform: "translate3d(0, 16px, 0) scale(0.95)",
          transition,
          willChange: "opacity, transform",
        };
      case "blur-in":
        return {
          opacity: 0,
          transform: "translate3d(0, 20px, 0)",
          filter: "blur(6px)",
          transition,
          willChange: "opacity, transform, filter",
        };
      case "fade":
        return {
          opacity: 0,
          transition,
          willChange: "opacity",
        };
      case "fade-up":
      default:
        return {
          opacity: 0,
          transform: "translate3d(0, 24px, 0)",
          transition,
          willChange: "opacity, transform",
        };
    }
  };

  return (
    <div ref={ref} style={getStyle()} className={cn("transition-gpu", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Helper container to auto-stagger children elements on scroll entrance.
 */
export function ScrollRevealGroup({
  children,
  staggerDelay = 90,
  animation = "fade-up",
  className,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "blur-in";
  className?: string;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <ScrollReveal animation={animation} delay={index * staggerDelay}>
            {child}
          </ScrollReveal>
        );
      })}
    </div>
  );
}
