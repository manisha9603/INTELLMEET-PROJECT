import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const FloatingMockup: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !cardRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } =
        sectionRef.current!.getBoundingClientRect();

      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      gsap.to(cardRef.current, {
        rotationX: (y - 0.5) * -12,
        rotationY: (x - 0.5) * 12,
        x: (x - 0.5) * 10,
        y: (y - 0.5) * 10,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const onMouseLeave = () => {
      gsap.to(cardRef.current, {
        rotationX: 0,
        rotationY: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    const section = sectionRef.current;

    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);

    return () => {
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
    };
  }, { scope: sectionRef });

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen bg-white overflow-hidden py-20"
    >
      <div className="flex items-center justify-center">
        <div
          className="relative w-full py-20 px-4 sm:px-6 overflow-visible select-none"
          style={{ perspective: '2000px' }}
        >
          {/* Background Decorative Blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-accent-2/5 rounded-full blur-[120px]" />
          </div>

          <div
            ref={cardRef}
            className="relative w-full max-w-6xl mx-auto z-10 transform-gpu will-change-transform px-4"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Main Mockup */}
            <div className="relative bg-white border border-zinc-200 rounded-[3.5rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.1)] overflow-hidden backdrop-blur-3xl">
              {/* Top Bar */}
              <div className="h-16 flex items-center px-10 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-zinc-200"
                    />
                  ))}
                </div>

                <div className="flex-1 text-center">
                  <span className="text-[12px] font-mono text-zinc-400 uppercase tracking-[0.4em] font-bold">
                    Neural Protocol • v4.0.2
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                  <span className="text-[11px] text-zinc-950 font-black uppercase tracking-widest">
                    Live Node
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col lg:flex-row min-h-fit lg:h-[650px]">
                {/* Left Grid */}
                <div className="flex-1 bg-white p-6 sm:p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 content-center">
                  {[
                    {
                      name: 'Terminal Nexus',
                      val: 'Active',
                      color: 'bg-accent/10 border-accent/20',
                    },
                    {
                      name: 'Spectral Core',
                      val: 'Optimal',
                      color: 'bg-zinc-50 border-zinc-200',
                    },
                    {
                      name: 'Auth Protocol',
                      val: 'Secure',
                      color: 'bg-zinc-50 border-zinc-200',
                    },
                    {
                      name: 'Data Stream',
                      val: 'Steady',
                      color: 'bg-zinc-50 border-zinc-200',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`relative h-52 rounded-[2.5rem] border ${item.color} p-8 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                        <span className="text-zinc-400 font-black">
                          0{i + 1}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-zinc-950 font-black text-lg tracking-tight mb-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-accent uppercase font-black tracking-[0.2em]">
                          {item.val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Panel */}
                <div className="w-full lg:w-[420px] lg:border-l border-t lg:border-t-0 border-zinc-100 bg-zinc-50/30 p-8 sm:p-10 md:p-14 flex flex-col">
                  <div className="mb-14">
                    <h3 className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.4em] mb-10">
                      AI Insights
                    </h3>

                    <div className="space-y-8">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-5"
                        >
                          <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />

                          <div className="flex-1 border-b border-zinc-100 pb-5">
                            <div className="h-3 w-32 bg-zinc-200 rounded-full mb-3" />
                            <div className="h-2 w-full bg-zinc-100 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="p-8 rounded-3xl bg-accent text-white shadow-[0_20px_40px_-5px_rgba(79,70,229,0.3)]">
                      <p className="text-sm font-bold leading-relaxed mb-6">
                        Autonomous systems initialized. All nodes report 100%
                        integrity.
                      </p>

                      <button className="w-full h-14 bg-white/20 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                        Expand View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-1/4 -left-16 px-10 py-6 bg-white border border-zinc-200 rounded-[2rem] shadow-2xl animate-float">
              <span className="text-[14px] font-black text-zinc-950 uppercase tracking-tighter italic">
                End-to-End Encryption
              </span>
            </div>

            <div
              className="absolute bottom-1/4 -right-16 px-10 py-6 bg-white border border-zinc-200 rounded-[2rem] shadow-2xl animate-float"
              style={{ animationDelay: '2s' }}
            >
              <span className="text-[14px] font-black text-accent uppercase tracking-tighter italic">
                Phase Shift: Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingMockup;