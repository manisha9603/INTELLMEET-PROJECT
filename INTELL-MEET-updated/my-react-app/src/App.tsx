import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DashboardPage } from './pages/Dashboard/Dashboard';
gsap.registerPlugin(ScrollTrigger);

// Layout
import Navbar from './components/layout/Navbar';

// Pages
import Landing from './pages/Landing';
import MeetRoom from './pages/MeetRoom';
import Access from './pages/Access';
import { LoginPage } from './pages/Auth/Login';
import { SignupPage } from './pages/Auth/Signup';

// Styles
import './styles/globals.css';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
     <motion.div
       initial={{ opacity: 0, scale: 0.98, y: 20 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.98, y: -20 }}
       transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
       className="w-full h-full origin-top"
     >
       {children}
     </motion.div>
  );
};

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                <Route path="/access" element={<PageTransition><Access /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
                <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
                <Route path="/room/:id" element={<PageTransition><MeetRoom /></PageTransition>} />
                <Route path="*" element={null} />
            </Routes>
        </AnimatePresence>
    );
};

const App: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 2,
      infinite: false,
    });

    (window as any).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
        gsap.globalTimeline.pause();
      } else {
        lenis.start();
        gsap.globalTimeline.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      lenis.destroy();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      gsap.ticker.remove(updateLenis);
    };
  }, []);

  return (
    <Router>
      <div className="relative">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
