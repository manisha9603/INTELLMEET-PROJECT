import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MagneticButton } from './ui/MagneticButton';
import ScrollVelocity from './ui/ScrollVelocity';

function FloatingBackground() {
  const orbs = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {orbs.map((_, i) => (
        <motion.div
           key={i}
           className="absolute rounded-full mix-blend-screen pointer-events-none"
           style={{
             width: `${Math.random() * 400 + 200}px`,
             height: `${Math.random() * 400 + 200}px`,
             background: `radial-gradient(circle, rgba(255,255,255,${Math.random() * 0.12 + 0.05}) 0%, transparent 70%)`,
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
           }}
           animate={{
             y: [0, Math.random() * -200 - 100, 0],
             x: [0, Math.random() * 200 - 100, 0],
             scale: [1, 1.2, 0.9, 1],
           }}
           transition={{
             duration: Math.random() * 15 + 15,
             repeat: Infinity,
             ease: "easeInOut"
           }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-[4px]" />
    </div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Track scroll progress purely within the 200vh height.
  // "start start" -> top of container matches top of viewport.
  // "end end" -> bottom of container reaches the bottom of the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Start perfectly blank (opacity 0)
  // Text gracefully reveals as you scroll between 5% and 50%
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.5], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.05, 0.5], [50, 0]);

  // Buttons and tagline follow slightly after it (40% to 70%)
  const ctaOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.3, 0.7], [30, 0]);
  const pointerEvents = useTransform(scrollYProgress, (v) => v >= 0.5 ? "auto" : "none");

  // Keep background float visible constantly, but gentle
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0.8, 0.8]);

  return (
    <section ref={containerRef} className="relative h-[200vh] w-full bg-black">
      
      {/* Sticky container that holds the sequence in the viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
        
        {/* Deep Premium Floating Background */}
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0">
          <FloatingBackground />
        </motion.div>

        {/* Scroll Reveal Text Layer (Starts completely blank!) */}
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center px-4 w-full"
        >
          {/* Main Title */}
          <motion.div 
            style={{ opacity: textOpacity, y: textY }}
            className="flex flex-col items-center max-w-6xl mx-auto text-center"
          >
            <h1 className="text-[clamp(4rem,8vw,7rem)] font-black leading-[1.1] tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              IntellMeet<br />
              <span className="text-white/80 font-semibold tracking-tight text-[clamp(2.5rem,5vw,5rem)]">
                AI Meets Workflow.
              </span>
            </h1>
            
            <div className="w-full mt-10 mix-blend-screen max-w-5xl overflow-hidden rounded-full py-2">
              <ScrollVelocity 
                texts={['Transforming Meetings into Intelligence •']}
                velocity={40}
                className="text-white/50 text-xl md:text-2xl tracking-widest uppercase font-light drop-shadow"
              />
            </div>
          </motion.div>

          {/* Action Call - Revealing smoothly alongside text */}
          <motion.div 
            style={{ 
              opacity: ctaOpacity, 
              y: ctaY,
              pointerEvents: pointerEvents as any
            }}
            className="flex flex-col items-center mt-16"
          >
            <p className="mb-8 text-xl md:text-2xl font-medium text-white/70 tracking-tight text-center max-w-2xl px-4 drop-shadow-md">
              Step into the future of corporate synchronization.
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              <MagneticButton>
                <div className="group relative px-10 py-5 bg-white rounded-full font-bold text-lg overflow-hidden transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 duration-300">
                  <span className="relative z-10 text-black">Start Free Trial</span>
                </div>
              </MagneticButton>
              <MagneticButton>
                <div className="px-10 py-5 bg-white/5 border border-white/20 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white transition-all backdrop-blur-md text-white hover:scale-105 active:scale-95 duration-300">
                  Contact Sales
                </div>
              </MagneticButton>
            </div>
          </motion.div>

        </motion.div>
        
        {/* Indicator to let them know to scroll the blank page */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [0.5, 0]) }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center space-y-2 pointer-events-none z-30"
        >
          <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Scroll Down</span>
          <div className="w-5 h-8 border border-white/40 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/80 rounded-full animate-pulse" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
