import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useMediaQuery from '../../hooks/useMediaQuery';
import { MOTION } from '../../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: 'Cognitive Start',
    desc: 'Launch a neural meeting node with zero overhead. Secure, encrypted, instant.',
    bg: 'radial-gradient(circle at center, rgba(79,70,229,0.03) 0%, #fff 100%)'
  },
  {
    number: '02',
    title: 'Spectral Capture',
    desc: 'Real-time audio processing with 99.9% semantic integrity. Neural listening activated.',
    bg: 'radial-gradient(circle at center, rgba(124,58,237,0.03) 0%, #fff 100%)'
  },
  {
    number: '03',
    title: 'Neural Synthesis',
    desc: 'Automated decision mapping and strategic summaries generated in real-time.',
    bg: 'radial-gradient(circle at center, rgba(236,72,153,0.03) 0%, #fff 100%)'
  },
  {
    number: '04',
    title: 'Team Propulsion',
    desc: 'Decisions converted to tasks and pushed to your team stack instantly.',
    bg: 'radial-gradient(circle at center, rgba(79,70,229,0.03) 0%, #fff 100%)'
  },
];

// ─── Mobile: Vertical card stack ─────────────────────────────────────────────
const VerticalCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Entrance animation for the container
    gsap.from(containerRef.current, {
      y: 80,
      opacity: 0,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.smooth,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      },
    });

    // Staggered card animations
    gsap.from('.vertical-phase-card', {
      y: 40,
      opacity: 0,
      stagger: 0.12,
      duration: MOTION.duration.medium,
      ease: MOTION.ease.standard,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative bg-white py-20 px-6 sm:px-10">
      {/* Decorative blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto flex flex-col gap-10 relative z-10">
        {steps.map((step, i) => (
          <div
            key={i}
            className="vertical-phase-card rounded-[2.5rem] p-8 sm:p-12 border border-zinc-100 shadow-xl shadow-zinc-100/60 relative overflow-hidden"
            style={{ background: step.bg }}
          >
            {/* Ghost number watermark */}
            <span className="absolute top-4 right-6 font-display text-[7rem] font-black text-black/[0.04] leading-none select-none pointer-events-none">
              {step.number}
            </span>

            <span className="font-mono text-accent text-[11px] tracking-[0.5em] uppercase font-black opacity-50 block mb-4">
              Phase {step.number} — System Stable
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-zinc-950 mb-4 tracking-[-0.04em] leading-[0.9]">
              {step.title}
            </h2>
            <p className="text-zinc-500 text-base sm:text-lg font-medium leading-relaxed font-body border-t border-zinc-100 pt-6">
              {step.desc}
            </p>

            {/* Step connector dot */}
            {i < steps.length - 1 && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-gradient-to-b from-accent/30 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Desktop: Pinned horizontal scroll ───────────────────────────────────────
const HorizontalDesktop: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Subtle entrance fade for the entire section
    gsap.from(triggerRef.current, {
      opacity: 0.7,
      duration: MOTION.duration.medium,
      ease: MOTION.ease.standard,
      scrollTrigger: {
        trigger: triggerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
    const pin = gsap.to(containerRef.current, {
      x: () => -(containerRef.current!.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: triggerRef.current,
        pin: true,
        scrub: 1,
        start: 'top 5%',
        end: () => `+=${containerRef.current!.scrollWidth * 0.75}`,
      }
    });

    gsap.utils.toArray('.phase-section').forEach((section: any) => {
      gsap.fromTo(section.querySelector('.phase-content'),
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: MOTION.duration.slow,
          ease: MOTION.ease.standard,
          scrollTrigger: {
            trigger: section,
            containerAnimation: pin,
            start: 'left center',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => pin.kill();
  }, { scope: triggerRef });

  return (
    <div ref={triggerRef} className="relative bg-white w-full h-screen overflow-hidden">
      {/* Background Floating Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-2/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div
        ref={containerRef}
        className="flex h-screen items-center"
        style={{ width: `${steps.length * 100}vw` }}
      >
        {steps.map((step, i) => (
          <section
            key={i}
            className="phase-section h-screen w-screen flex flex-col items-center justify-center relative px-20 pt-20"
            style={{ background: step.bg }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none">
              <h1 className="font-display text-[30rem] xl:text-[50rem] font-black text-black/[0.03] tracking-tighter leading-none select-none">
                {step.number}
              </h1>
            </div>

            <div className="phase-content relative z-10 flex flex-col items-center text-center max-w-6xl px-8">
              <span className="font-mono text-accent text-sm mb-8 tracking-[0.6em] uppercase font-black opacity-40">
                Phase {step.number} — System Stable
              </span>
              <h2 className="font-display text-7xl lg:text-[100px] xl:text-[140px] font-black text-zinc-950 mb-10 tracking-[-0.05em] leading-[0.85]">
                {step.title}
              </h2>
              <p className="text-zinc-600 text-xl lg:text-2xl xl:text-3xl font-medium leading-relaxed max-w-3xl font-body border-t border-zinc-100 pt-10">
                {step.desc}
              </p>
            </div>

            {/* Connection Line */}
            {i < steps.length - 1 && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 h-[4px] w-40 xl:w-80 bg-zinc-100 shadow-inner overflow-hidden">
                <div className="h-full bg-accent w-full -translate-x-full animate-line-move" />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

// ─── Root: Picks layout based on viewport ────────────────────────────────────
const HorizontalScroll: React.FC = () => {
  // Below md (768px) → vertical stack; md and above → pinned horizontal
  const isMobile = useMediaQuery('(max-width: 767px)');

  return isMobile ? <VerticalCards /> : <HorizontalDesktop />;
};

export default HorizontalScroll;
