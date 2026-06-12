import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
  scale?: number;
  perspective?: number;
}

/**
 * Reusable 3D Tilt Hover Animation component.
 * Applies a premium mouse-tracking 3D rotation and scale.
 */
export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className = "",
  maxRotation = 6,
  scale = 1.03,
  perspective = 1000
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    setIsHovered(true);

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    setTransform(
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
      className={`
        transition-[transform,box-shadow] duration-500 ease-out 
        will-change-transform 
        antialiased
        border-none
        ${isHovered 
          ? 'shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15),0_0_0_1px_rgba(79,70,229,0.1)]' 
          : 'shadow-[0_8px_30px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)]'} 
        ${className}
      `}
    >
      <div className="w-full h-full" style={{ transform: 'translateZ(1px)' }}>
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
