import confetti from "canvas-confetti";

/**
 * Triggers a multi-stage celebratory confetti explosion
 * Perfect for graduation, certificate issuance, or course completion
 */
export function triggerCelebrationConfetti() {
  if (typeof window === "undefined") return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Multi-stage explosion
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#F59E0B", "#FBBF24", "#FEF08A"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#3B82F6", "#06B6D4", "#60A5FA"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#10B981", "#34D399", "#A7F3D0"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#EC4899", "#8B5CF6", "#F43F5E"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#F59E0B", "#10B981", "#3B82F6"],
  });

  // Secondary side cannons after 350ms
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      zIndex: 99999,
      colors: ["#3B82F6", "#F59E0B", "#10B981"],
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      zIndex: 99999,
      colors: ["#8B5CF6", "#EC4899", "#F59E0B"],
    });
  }, 350);
}

/**
 * Micro confetti burst around a specific element or coordinate
 * Perfect for completing a lesson or high-score quiz question
 */
export function triggerMicroConfetti(origin?: { x: number; y: number }) {
  if (typeof window === "undefined") return;

  confetti({
    particleCount: 35,
    spread: 50,
    origin: origin || { x: 0.5, y: 0.6 },
    scalar: 0.75,
    ticks: 150,
    zIndex: 99999,
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#6366F1"],
  });
}
