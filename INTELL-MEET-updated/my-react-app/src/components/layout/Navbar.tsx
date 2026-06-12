import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLandingPage = location.pathname === '/';
  // Check immediately if we should be visible to prevent one-frame flashes
  const [isVisible, setIsVisible] = useState(() => {
    if (location.pathname === '/' && sessionStorage.getItem('logoRevealed') !== 'true') {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (isLandingPage && sessionStorage.getItem('logoRevealed') !== 'true') {
      setIsVisible(false);
      const interval = setInterval(() => {
        if (sessionStorage.getItem('logoRevealed') === 'true') {
          setIsVisible(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      setIsVisible(true);
    }
  }, [isLandingPage]);

  const isMeetRoom = location.pathname.startsWith('/room');
  if (isMeetRoom) return null;

  return (
    <nav className={clsx(
      'fixed top-0 left-0 w-full z-[1000] transition-all duration-300 border-b',
      scrolled ? 'bg-white/80 backdrop-blur-3xl border-zinc-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-8',
      (!isVisible && isLandingPage) && 'opacity-0 -translate-y-10 pointer-events-none'
    )}>
      <div className="max-w-[1400px] mx-auto px-10 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-4 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-[46px] h-[46px] rounded-2xl bg-accent flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] group-hover:rotate-12 transition-transform">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[26px] h-[26px]">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
             </svg>
          </div>
          <span className="font-display text-2xl font-black text-zinc-950 tracking-[-0.05em]">intellmeet</span>
        </div>

        {/* Links */}
        {isLandingPage && (
          <div className="hidden md:flex items-center space-x-16">
            {['Ecosystem', 'Security', 'Strategic', 'Intelligence'].map((link) => (
              <a 
                key={link} 
                href={`/#${link.toLowerCase()}`}
                onClick={(e) => {
                  const targetId = link.toLowerCase();
                  if (location.pathname !== '/') return;

                  e.preventDefault();
                  const target = document.getElementById(targetId);
                  
                  if (target) {
                    const securitySection = document.getElementById('security');
                    const lenis = (window as any).lenis;

                    if (securitySection && lenis) {
                      const currentY = window.scrollY;
                      const targetY = target.getBoundingClientRect().top + window.scrollY;
                      const secTop = securitySection.getBoundingClientRect().top + window.scrollY;

                      // Check boundaries crossing Ecosystem (approximate threshold)
                      const isAboveSecurity = currentY < secTop - 100;
                      const isTargetingBelowOrAtSafety = targetY >= secTop - 5;
                      const isBelowSecurity = currentY >= secTop - 5;
                      const isTargetingEcosystemOrAbove = targetY < secTop - 100;

                      const crossingForward = isAboveSecurity && isTargetingBelowOrAtSafety;
                      const crossingBackward = isBelowSecurity && isTargetingEcosystemOrAbove;

                      if (crossingForward) {
                        // 1. Jump instantly to Security to bypass Ecosystem horizontal tracking using Lenis API
                        lenis.scrollTo(secTop, { immediate: true });
                        // 2. Continues with smooth scroll to final target (e.g. Strategic/Intelligence)
                        if (targetId !== 'security') {
                          setTimeout(() => {
                            lenis.scrollTo(target, { duration: 1.2 });
                          }, 50);
                        }
                        return;
                      }

                      if (crossingBackward) {
                        // Make all backwards travel crossing the ecosystem an instant direct jump
                        lenis.scrollTo(target, { immediate: true });
                        return;
                      }

                      // Normal smooth scrolling for internal jumps (e.g. Security <-> Intelligence)
                      lenis.scrollTo(target, { duration: 1.2 });
                      return;
                    }

                    // Fallback
                    target.scrollIntoView({
                      behavior: targetId === 'ecosystem' ? 'auto' : 'smooth',
                      block: 'start',
                    });
                  }
                }}
                className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-950 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        {isLandingPage && (
          <button 
            className="px-10 py-3.5 bg-accent text-white font-black text-[12px] uppercase tracking-widest rounded-full shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all duration-500"
            onClick={() => window.open('/access', '_blank')}
          >
            Access Space
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
