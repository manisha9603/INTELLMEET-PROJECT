import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface LogoRevealProps {
  onComplete: () => void;
}

/**
 * Animated Logo Reveal intro animation sequence.
 * UPDATED: Optimized for no collision, brighter white, and removed skip button.
 */
const LogoReveal: React.FC<LogoRevealProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const hasPlayed = useRef(sessionStorage.getItem('logoRevealed') === 'true');
  const shouldPlay = !hasPlayed.current && location.pathname === '/';

  React.useEffect(() => {
    if (!shouldPlay) {
      onComplete();
    }
  }, [onComplete, shouldPlay]);

  useGSAP(() => {
    if (!shouldPlay) return;

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('logoRevealed', 'true');
        onComplete();
        // Consolidate: Final hide
        gsap.set(containerRef.current, { display: 'none' });
      }
    });

    // 1. SVG robot icon draws in via stroke-dashoffset (Brilliant White)
    tl.fromTo('.robot-path', 
      { strokeDashoffset: 1000, strokeDasharray: 1000 },
      { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' },
      0.1
    );

    // 2. Icon fill floods in from bottom (Solid white)
    tl.fromTo('.robot-fill',
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' },
      0.8
    );

    // 3. "IntellMeet" wordmark reveal
    tl.fromTo('.wordmark-char',
      { opacity: 0 },
      { opacity: 1, duration: 0.5, stagger: 0.03, ease: 'power2.inOut' },
      1.0
    );

    // 4. PURE FADE OUT: Consolidate exit to a single container fade
    // No upward sliding / translateY movement
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, 2.2);

  }, { scope: containerRef });

  if (!shouldPlay) return null;

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black overflow-hidden pointer-events-none"
    >
        <div className="logo-group flex flex-col items-center select-none">
            {/* Brighter White Robot (Old Version) */}
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                    className="robot-path"
                    d="M30 40C30 28.9543 38.9543 20 50 20C61.0457 20 70 28.9543 70 40V70C70 81.0457 61.0457 90 50 90C38.9543 90 30 81.0457 30 70V40Z" 
                    stroke="#ffffff" 
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                <path 
                    className="robot-fill"
                    d="M35 45C35 36.7157 41.7157 30 50 30C58.2843 30 65 36.7157 65 45V65C65 73.2843 58.2843 80 50 80C41.7157 80 35 73.2843 35 65V45Z" 
                    fill="#ffffff" 
                />
                <rect x="42" y="46" width="3" height="3" rx="1.5" fill="#000000" />
                <rect x="55" y="46" width="3" height="3" rx="1.5" fill="#000000" />
            </svg>

            <div className="flex overflow-hidden mt-6">
                {"IntellMeet".split('').map((char, index) => (
                    <span 
                        key={index}
                        className="wordmark-char text-3xl font-black text-white tracking-widest uppercase italic"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
    </div>
  );
};

export default LogoReveal;
