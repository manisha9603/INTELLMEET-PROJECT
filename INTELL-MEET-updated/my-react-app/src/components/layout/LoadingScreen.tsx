import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MOTION } from '../../utils/motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const STORAGE_KEY = 'intellmeet-loader-shown';

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem(STORAGE_KEY);

    if (hasLoaded) {
      setShouldRender(false);
      onComplete();
    }
  }, [onComplete]);

  useGSAP(() => {
    if (!shouldRender) return;
    if (!containerRef.current || !textRef.current || !barRef.current) return;

    const chars = textRef.current.innerText.split('');

    textRef.current.innerHTML = chars
      .map(
        (char) =>
          `<span class="inline-block opacity-0 translate-y-20">${
            char === ' ' ? '&nbsp;' : char
          }</span>`
      )
      .join('');

    gsap.to(textRef.current.children, {
      opacity: 1,
      y: 0,
      stagger: 0.04,
      duration: MOTION.duration.xl,
      ease: MOTION.ease.smooth,
    });

    const progressObj = { val: 0 };

    const fakeLoader = gsap.to(progressObj, {
      val: 85,
      duration: MOTION.duration.xl * 1.5,
      ease: 'power1.out',
      onUpdate: () => {
        const rounded = Math.round(progressObj.val);
        setProgress(rounded);
        barRef.current!.style.width = `${rounded}%`;
      },
    });

    const preloadAssets = async () => {
      const fontPromise = document.fonts
        ? document.fonts.ready
        : Promise.resolve();

      const images = Array.from(document.images);

      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        });
      });

      const minDisplayTime = new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      await Promise.all([
        fontPromise,
        minDisplayTime,
        ...imagePromises,
      ]);

      fakeLoader.kill();

      gsap.to(progressObj, {
        val: 100,
        duration: MOTION.duration.medium,
        ease: MOTION.ease.standard,
        onUpdate: () => {
          const rounded = Math.round(progressObj.val);
          setProgress(rounded);
          barRef.current!.style.width = `${rounded}%`;
        },
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: MOTION.duration.slow,
            ease: 'power2.out',
            delay: 0.1,
            onComplete: () => {
              sessionStorage.setItem(STORAGE_KEY, 'true');
              setShouldRender(false);
              onComplete();
            },
          });
        },
      });
    };

    preloadAssets();
  }, { scope: containerRef, dependencies: [shouldRender] });

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center"
    >
      <div className="relative overflow-hidden mb-8">
        <h1
          ref={textRef}
          className="font-display text-8xl font-black text-white tracking-[0.2em]"
        >
          INTELLMEET
        </h1>
      </div>

      <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
        <div
          ref={barRef}
          className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_15px_#4fffff]"
          style={{ width: '0%' }}
        />
      </div>

      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
        {progress}% Initializing Neural Core
      </div>
    </div>
  );
};

export default LoadingScreen;