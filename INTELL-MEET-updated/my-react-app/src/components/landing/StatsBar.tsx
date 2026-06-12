import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from '../../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 60, suffix: '%', label: 'Less Follow-Up', id: 'stat-1' },
  { value: 10, suffix: 'K+', label: 'Concurrent Meetings', id: 'stat-2' },
  { value: 99.95, suffix: '%', label: 'Global Uptime', id: 'stat-3' },
];

const StatsBar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    stats.forEach((stat) => {
      const el = document.getElementById(stat.id);
      if (el) {
        gsap.from(el, {
          innerText: 0,
          duration: MOTION.duration.xl,
          snap: { innerText: stat.value % 1 === 0 ? 1 : 0.01 },
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
          },
          onUpdate: function() {
            el.innerHTML = Number(this.targets()[0].innerText).toFixed(stat.value % 1 === 0 ? 0 : 2) + stat.suffix;
          }
        });
      }
    });

    gsap.from('.stat-divider', {
        scaleY: 0,
        opacity: 0,
        stagger: 0.1,
        duration: MOTION.duration.slow,
        ease: MOTION.ease.standard,
        scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
        }
    });
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="w-full bg-zinc-50 border-y border-zinc-100 py-32 px-10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 md:gap-0">
        {stats.map((stat, i) => (
          <React.Fragment key={stat.id}>
            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 px-8">
              <span 
                id={stat.id}
                className="font-display text-5xl md:text-7xl font-black text-zinc-950 mb-4 tracking-[-0.05em]"
              >
                {stat.value}{stat.suffix}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-zinc-400 font-black">
                {stat.label}
              </span>
            </div>
            {i < stats.length - 1 && (
              <div className="hidden md:block stat-divider w-[1px] h-20 bg-zinc-200" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
