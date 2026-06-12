/**
 * IntellMeet Motion & Animation Standards
 * 
 * Centralized easing and duration values to maintain a consistent
 * cinematic feel across all GSAP and Framer Motion interactions.
 */

export const MOTION = {
  duration: {
    fast: 0.2,     // Quick micro-interactions (hover, cursor)
    medium: 0.45,  // Standard UI transitions
    slow: 0.8,     // Heavy page entrances, modals
    xl: 1.5,       // Cinematic reveals (Hero, Loaders)
  },
  ease: {
    // GSAP
    standard: "power3.out",           // Default UI ease
    emphasize: "back.out(1.5)",       // Poppy bounce (AI cards, popups)
    smooth: "expo.out",               // Long sliding sweeps
    bounce: "elastic.out(1, 0.3)",    // Very bouncy (Floating mockup resets)
    linear: "none",                   // Marquees, constant float
    
    // Framer Motion equivalents
    framerStandard: [0.215, 0.61, 0.355, 1] as const, // Cubic-bezier for power3.outish
    framerSmooth: [0.16, 1, 0.3, 1] as const,         // Cubic-bezier for expo.outish
  }
};
