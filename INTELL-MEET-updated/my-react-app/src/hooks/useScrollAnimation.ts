import { useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * Hook for advanced scroll-scrubbed transforms.
 * Provides parallax for background particles, content drift, and scroll progress logic.
 */
export const useScrollAnimation = () => {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax layers: particles move at 0.3x scroll speed, hero content moves at 0.7x (depth feeling)
  const particleParallaxY = useTransform(smoothScroll, [0, 1], ["0%", "-30%"]);
  const contentParallaxY = useTransform(smoothScroll, [0, 1], ["0%", "-70%"]);

  // Headline scrub: as user scrolls, opacity and scale reflect the transition depth
  const headlineOpacity = useTransform(smoothScroll, [0, 0.35], [1, 0]);
  const headlineScale = useTransform(smoothScroll, [0, 0.35], [1, 0.85]);
  const headlineY = useTransform(smoothScroll, [0, 0.35], [0, -100]);

  // Mockup exit: floating UI mockup scales from 1 → 0.85 and opacity 1 → 0 as user scrolls past 30% of hero height
  const mockupOpacity = useTransform(smoothScroll, [0, 0.4], [1, 0]);
  const mockupScale = useTransform(smoothScroll, [0, 0.4], [1, 0.75]);
  const mockupY = useTransform(smoothScroll, [0, 0.4], [0, 150]);

  // Scroll progress bar: thin 1px gold line at top of viewport grows from 0% to 100% as page scrolls
  const scrollProgressWidth = useTransform(smoothScroll, [0, 1], ["0%", "100%"]);

  // Scroll hint opacity fades based on start interaction
  const scrollHintOpacity = useTransform(smoothScroll, [0, 0.05], [1, 0]);

  return {
    scrollYProgress,
    particleParallaxY,
    contentParallaxY,
    headlineOpacity,
    headlineScale,
    headlineY,
    mockupOpacity,
    mockupScale,
    mockupY,
    scrollProgressWidth,
    scrollHintOpacity
  };
};
