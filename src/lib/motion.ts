import type { Transition, Variants } from "motion/react";

/**
 * Spring presets meeting Apple interaction standards (docs/FRONTEND.md §3.5).
 */
export const springPresets = {
  /**
   * Default critically damped spring (bounce: 0, duration ~0.3s).
   * Used for modals, sheets, standard UI state changes.
   */
  default: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1,
  } as const satisfies Transition,

  /**
   * Interactive bounce spring (bounce: 0.2) only for swipe/pull gestures.
   */
  bouncy: {
    type: "spring",
    stiffness: 350,
    damping: 25,
    bounce: 0.2,
  } as const satisfies Transition,

  /**
   * Snappy quick spring for toggles, chips, and small feedback.
   */
  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 35,
  } as const satisfies Transition,

  /**
   * Reduced motion fallback: fast opacity cross-fade with zero translation.
   */
  reduced: {
    type: "tween",
    duration: 0.15,
    ease: "easeOut",
  } as const satisfies Transition,
};

/**
 * Standard staggered list transitions (30-50ms delay per item).
 */
export const staggeredContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const staggeredItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.default,
  },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
};
