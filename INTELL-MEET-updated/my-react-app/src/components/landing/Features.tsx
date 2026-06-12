import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { 
  Video, 
  BrainCircuit, 
  ClipboardCheck, 
  LayoutDashboard, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';
import TiltCard from '../ui/Feature';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { 
    title: 'Real-Time Video', 
    desc: 'Ultra-low latency streaming with peer-to-peer optimization for up to 50 participants.',
    icon: Video,
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  { 
    title: 'AI Transcription', 
    desc: 'Neural-powered live speech-to-text with 99.8% spectral integrity across 40+ languages.',
    icon: BrainCircuit,
    color: 'from-accent-2/20 to-violet-500/20'
  },
  { 
    title: 'Smart Action Items', 
    desc: 'Auto-detect decisions and assign tasks to team members directly from the conversation.',
    icon: ClipboardCheck,
    color: 'from-accent-3/20 to-magenta-500/20'
  },
  { 
    title: 'Team Kanban', 
    desc: 'Sync meeting outcomes to your existing workflow tools with one-click enterprise integration.',
    icon: LayoutDashboard,
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  { 
    title: 'Analytics Dashboard', 
    desc: 'Deep insights into team engagement, meeting efficiency, and conversational sentiment.',
    icon: BarChart3,
    color: 'from-amber-500/20 to-orange-500/20'
  },
  { 
    title: 'End-to-End Encrypted', 
    desc: 'Production-grade security protocols ensuring your data never leaves your private cloud.',
    icon: ShieldCheck,
    color: 'from-red-500/20 to-rose-500/20'
  },
];

const Features: React.FC = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Section entrance animation - slides up and fades in
    gsap.fromTo(
      sectionRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          markers: false,
        },
      }
    );

    // Staggered card animations
    const cards = sectionRef.current.querySelectorAll('.feature-card');
    gsap.fromTo(
      cards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef}
      className="py-24 md:py-32 px-6 md:px-10 bg-white relative overflow-visible select-none"
      style={{ perspective: '1000px' }}
    >
      {/* Floating Background Blooms */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-30" />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10 w-full">
        <h2 
          className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-black text-zinc-950 text-center mb-12 md:mb-20 tracking-[-0.05em] leading-none"
        >
          Built for spectral scale.
        </h2>

        <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 w-full relative">
            {features.map((f, i) => (
              <TiltCard key={i} className="feature-card h-full rounded-[3rem]" maxRotation={20} scale={1.1} perspective={700}>
                <div className="relative p-16 bg-white border border-zinc-100 rounded-[3rem] overflow-hidden backdrop-blur-3xl h-full">
                   <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-12 border border-white/20 shadow-md shadow-accent/10`}>
                      <f.icon className="text-white w-10 h-10" />
                   </div>
                   
                   <h3 className="text-3xl font-bold text-zinc-950 mb-6 tracking-tight">
                      {f.title}
                   </h3>
                   <p className="text-zinc-600 text-xl leading-relaxed font-medium font-body border-t border-zinc-50 pt-8">
                      {f.desc}
                   </p>
                   
                   {/* Subtle Corner Bloom */}
                   <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 -z-10" />
                </div>
              </TiltCard>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
