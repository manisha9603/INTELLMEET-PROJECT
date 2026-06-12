import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const techs1 = [
  'REACT 19', 'NODE.JS', 'MONGODB', 'SOCKET.IO', 'WEBRTC', 'REDIS', 'OPENAI', 
  'TYPESCRIPT', 'VITE', 'POSTGRES', 'KAFKA', 'EXPRESS', 'ZUSTAND'
];

const techs2 = [
  'DOCKER', 'KUBERNETES', 'GITHUB ACTIONS', 'PROMETHEUS', 'GRAFANA', 'AWS', 
  'JWT', 'TERRAFORM', 'NGINX', 'KIBANA', 'SENTRY', 'TURBOREPO'
];

const TechMarquee: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Row 1: Right to Left
    const r1Width = row1Ref.current!.scrollWidth / 2;
    const tween1 = gsap.to(row1Ref.current, {
      x: -r1Width,
      duration: 30,
      ease: 'none',
      repeat: -1,
    });

    // Row 2: Left to Right
    const r2Width = row2Ref.current!.scrollWidth / 2;
    const tween2 = gsap.to(row2Ref.current, {
      x: r2Width,
      duration: 35,
      ease: 'none',
      repeat: -1,
    });

    // Random highlights
    const highlightInterval = setInterval(() => {
        const items = document.querySelectorAll('.marquee-item');
        items.forEach(el => {
            el.classList.remove('opacity-100');
            el.classList.add('opacity-60');
        });
        const random = Math.floor(Math.random() * items.length);
        items[random].classList.remove('opacity-60');
        items[random].classList.add('opacity-100');
    }, 2000);

    // Pause tweens when section leaves viewport — saves GPU on idle
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tween1.resume();
          tween2.resume();
        } else {
          tween1.pause();
          tween2.pause();
        }
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearInterval(highlightInterval);
      observer.disconnect();
    };
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="py-16 md:py-20 bg-accent overflow-hidden border-y border-white/10"
    >
      <div className="flex flex-col space-y-6 md:space-y-10">
        {/* Row 1 */}
        <div className="relative flex">
           <div ref={row1Ref} className="flex whitespace-nowrap">
              {[...techs1, ...techs1].map((tech, i) => (
                <div 
                  key={i} 
                  className="marquee-item font-display text-3xl md:text-6xl font-black text-white opacity-60 px-8 transition-all duration-300 tracking-[-0.04em] cursor-default hover:opacity-100 hover:scale-105 transform-gpu"
                >
                  {tech}
                </div>
              ))}
           </div>
        </div>

        {/* Row 2 */}
        <div className="relative flex overflow-visible">
           <div ref={row2Ref} className="flex whitespace-nowrap translate-x-[-50%]">
              {[...techs2, ...techs2].map((tech, i) => (
                <div 
                  key={i} 
                  className="marquee-item font-display text-3xl md:text-6xl font-black text-white opacity-60 px-8 transition-all duration-300 tracking-[-0.04em] cursor-default hover:opacity-100 hover:scale-105 transform-gpu"
                >
                  {tech}
                </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
