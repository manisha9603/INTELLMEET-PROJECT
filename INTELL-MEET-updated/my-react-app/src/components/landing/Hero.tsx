import React, { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from '../../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Animated Mesh Background — gated by IntersectionObserver
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let rafId: number;
    let isVisible = false;

    const blobs = [
      { x: w * 0.2, y: h * 0.3, r: 350, c: '#4f46e5', tx: w * 0.2, ty: h * 0.3, vx: 0.8, vy: 0.8 },
      { x: w * 0.8, y: h * 0.2, r: 400, c: '#7c3aed', tx: w * 0.8, ty: h * 0.2, vx: -0.6, vy: 0.9 },
      { x: w * 0.5, y: h * 0.7, r: 450, c: '#ec4899', tx: w * 0.5, ty: h * 0.7, vx: 0.5, vy: -0.7 },
      { x: w * 0.3, y: h * 0.8, r: 380, c: '#4f46e5', tx: w * 0.3, ty: h * 0.8, vx: -0.9, vy: 0.6 },
      { x: w * 0.7, y: h * 0.6, r: 410, c: '#7c3aed', tx: w * 0.7, ty: h * 0.6, vx: 0.6, vy: -0.5 },
    ];

    const animate = (t: number) => {
      if (!isVisible || document.hidden) return; // 🛑 skip if off-screen or tab hidden
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.12;
      ctx.filter = 'blur(160px)';
      
      blobs.forEach(b => {
        b.x = b.tx + Math.sin(t * 0.0008 * b.vx) * 180;
        b.y = b.ty + Math.cos(t * 0.0008 * b.vy) * 180;
        
        ctx.beginPath();
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.c);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      
      rafId = requestAnimationFrame(animate);
    };

    // Pause/resume rAF when browser tab is hidden/shown
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (isVisible) {
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Intersection Observer — start rAF only when hero is visible
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
    observer.observe(container);
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  useGSAP(() => {
    // Headline Animation
    if (headlineRef.current) {
        const words = headlineRef.current.innerText.split(' ');
        headlineRef.current.innerHTML = words.map(word => `<span class="inline-block opacity-0 translate-y-[80px]">${word}</span>`).join(' ');
        
        gsap.to(headlineRef.current.children, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: MOTION.duration.xl,
            ease: MOTION.ease.smooth,
            delay: 0.5
        });
    }

    // Subtext + Button Entrance
    gsap.from('.hero-content', {
        y: 40,
        opacity: 0,
        duration: MOTION.duration.xl,
        ease: 'power4.out',
        delay: 1
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen bg-white flex flex-col items-center pt-24 md:pt-36 lg:pt-44 pb-14 md:pb-28 px-6 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto">
        <h1 
          ref={headlineRef}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[140px] font-black text-zinc-950 leading-[0.85] md:leading-[0.8] tracking-[-0.05em] mb-6 md:mb-10"
        >
          Meetings redefined.
        </h1>
        
        <div className="hero-content mt-8 text-center flex flex-col items-center w-full">
          <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-zinc-600 mb-8 md:mb-12 tracking-tight max-w-3xl mx-auto flex items-center justify-center border-l-4 border-accent pl-6 md:pl-8 text-left md:text-center">
            The AI-first workspace for high-performance teams.
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <button 
              onClick={() => navigate('/access')}
              className="px-10 py-5 bg-accent text-white font-black rounded-full shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest text-[12px]"
            >
              Start Meeting
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('ecosystem');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 bg-zinc-100 border border-zinc-200 text-zinc-900 font-black rounded-full hover:bg-zinc-200 transition-all duration-300 uppercase tracking-widest text-[12px]"
            >
              Platform Tour
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
