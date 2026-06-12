import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { MOTION } from '../../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const CTABanner: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Floating Particles Background
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = containerRef.current.offsetHeight);
    let rafId: number;
    let isVisible = false;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    }));

    const animate = () => {
      if (!isVisible || document.hidden) return;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(79, 255, 255, 0.4)';

      particles.forEach((p) => {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          rafId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (isVisible) {
        rafId = requestAnimationFrame(animate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    const handleResize = () => {
      if (containerRef.current) {
        w = canvas.width = window.innerWidth;
        h = canvas.height = containerRef.current.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // CTA Entrance Animation
  useGSAP(() => {
    gsap.fromTo(
      '.cta-content > *',
      {
        y: 60,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: MOTION.duration.xl,
        ease: MOTION.ease.emphasize,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          once: true,
        },
      }
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative py-32 md:py-56 lg:py-80 px-6 sm:px-10 bg-white flex flex-col items-center justify-center text-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40"
      />

      {/* Background Gradient Bloom */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-purple-50 pointer-events-none" />

      <div className="cta-content relative z-10 max-w-7xl w-full">
        <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-black text-zinc-950 mb-12 md:mb-20 tracking-[-0.05em] leading-[0.8] px-4 md:px-0">
          Ready to work <br />
          <span className="text-accent underline underline-offset-[1.5rem] decoration-accent/10">
            differently?
          </span>
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          {/* Explore Platform */}
          <button
            onClick={() => navigate('/access')}
            className="px-10 py-5 bg-accent text-white font-black rounded-full shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest text-[12px]"
          >
            EXPLORE PLATFORM
          </button>

          {/* View Systems */}
          <button
            onClick={() => {
              const target = document.getElementById('ecosystem');
              const lenis = (window as any).lenis;

              if (!target || !lenis) return;

              lenis.scrollTo(target, {
                duration: 0,
                immediate: true,
                lock: true,
                force: true,
              });
            }}
            className="px-10 py-5 bg-zinc-100 border border-zinc-200 text-zinc-950 font-black rounded-full hover:bg-zinc-200 transition-all duration-300 uppercase tracking-widest text-[12px]"
          >
            VIEW SYSTEMS
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;