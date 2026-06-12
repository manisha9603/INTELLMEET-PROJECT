import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import Hero from '../components/landing/Hero';
import StatsBar from '../components/landing/StatsBar';
import Features from '../components/landing/Features';
import HorizontalScroll from '../components/landing/HorizontalScroll';
import AIShowcase from '../components/landing/AIShowcase';
import TechMarquee from '../components/landing/TechMarquee';
import CTABanner from '../components/landing/CTABanner';
import FloatingMockup from '../components/FloatingMockup';
import Footer from '../components/layout/Footer';
import LogoReveal from '../components/LogoReveal';

const Landing: React.FC = () => {
  const location = useLocation();
  const alreadyPlayed = sessionStorage.getItem('logoRevealed') === 'true';
  const [revealComplete, setRevealComplete] = React.useState(alreadyPlayed);

  // Safety fallback — if LogoReveal fails to call onComplete, reveal after 4s
  useEffect(() => {
    if (revealComplete) return;
    const fallback = setTimeout(() => {
      setRevealComplete(true);
    }, 4000);
    return () => clearTimeout(fallback);
  }, [revealComplete]);

  useEffect(() => {
    if (location.hash && revealComplete) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 100);
    }
  }, [location, revealComplete]);

  return (
    <>
      {/* LogoReveal MUST be outside the opacity-controlled div —
          CSS opacity:0 on a parent hides ALL children, including fixed ones */}
      <LogoReveal onComplete={() => setRevealComplete(true)} />

      {/* scroll-container gives GSAP correct offset + position: relative from CSS */}
      <div className={clsx(
          "scroll-container bg-white transition-opacity duration-1000",
          revealComplete ? "opacity-100" : "opacity-0"
      )}>
        <Hero />
        <div id="ecosystem"><HorizontalScroll /></div>
        <section id="security" className="scroll-mt-[46px]"><FloatingMockup /></section>
        <StatsBar />
        <section id="strategic" className="scroll-mt-24"><Features /></section>
        <section id="intelligence" className="scroll-mt-24"><AIShowcase /></section>
        <TechMarquee />
        <section id="enterprise" className="scroll-mt-24"><CTABanner /></section>
        <Footer />
      </div>
    </>
  );
};

export default Landing;
