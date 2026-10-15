import confetti from "canvas-confetti";

// Keep a dedicated canvas-confetti instance with useWorker: false
// to ensure 100% reliable confetti rendering in all browsers, modals, and CSP environments
let reliableConfetti: confetti.CreateTypes | typeof confetti | null = null;

function getConfettiRunner(): confetti.CreateTypes | typeof confetti {
  if (typeof window === "undefined") return confetti;

  if (!reliableConfetti) {
    try {
      // confetti.create(null, { useWorker: false, resize: true }) ensures main-thread canvas
      // rendering, completely bypassing OffscreenCanvas/Blob Worker CSP restrictions
      reliableConfetti = confetti.create(undefined, {
        resize: true,
        useWorker: false,
        disableForReducedMotion: false,
      });
    } catch {
      reliableConfetti = confetti;
    }
  }

  return reliableConfetti;
}

/**
 * Triggers a multi-stage celebratory confetti explosion
 * Perfect for graduation, certificate issuance, or course completion
 */
export function triggerCelebrationConfetti() {
  if (typeof window === "undefined") return;

  const runner = getConfettiRunner();
  const count = 220;
  const defaults: confetti.Options = {
    origin: { y: 0.65 },
    zIndex: 999999,
    disableForReducedMotion: false,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    runner({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Multi-stage explosion
  fire(0.25, {
    spread: 30,
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
    scalar: 0.85,
    colors: ["#10B981", "#34D399", "#A7F3D0"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 30,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#EC4899", "#8B5CF6", "#F43F5E"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#F59E0B", "#10B981", "#3B82F6"],
  });

  // Secondary side cannons after 300ms
  setTimeout(() => {
    runner({
      particleCount: 65,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.75 },
      zIndex: 999999,
      colors: ["#3B82F6", "#F59E0B", "#10B981"],
    });
    runner({
      particleCount: 65,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.75 },
      zIndex: 999999,
      colors: ["#8B5CF6", "#EC4899", "#F59E0B"],
    });
  }, 300);
}

/**
 * Micro confetti burst around a specific element or coordinate
 * Perfect for completing a lesson or high-score quiz question
 */
export function triggerMicroConfetti(origin?: { x: number; y: number }) {
  if (typeof window === "undefined") return;

  const runner = getConfettiRunner();
  runner({
    particleCount: 40,
    spread: 55,
    origin: origin || { x: 0.5, y: 0.6 },
    scalar: 0.8,
    ticks: 160,
    zIndex: 999999,
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#6366F1"],
  });
}
