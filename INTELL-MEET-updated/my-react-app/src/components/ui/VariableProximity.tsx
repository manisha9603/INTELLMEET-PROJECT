import { useMemo, useRef, useEffect } from "react";
import { useAnimationFrame } from "framer-motion";

interface VariableProximityProps {
  label: string;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const VariableProximity: React.FC<VariableProximityProps> = (
    {
      label,
      radius = 100,
      falloff = "linear",
      className,
      onClick,
      style,
      ...props
    }
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const words = useMemo(() => label.split(" "), [label]);

    return (
      <span
        ref={containerRef}
        className={`inline-block ${className}`}
        onClick={onClick}
        style={{ ...style, display: "inline-flex", flexWrap: "wrap" }}
        {...props}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} style={{ display: "inline-flex", marginRight: "0.25em" }}>
            {word.split("").map((char, charIndex) => (
               <Letter 
                  key={charIndex}
                  char={char}
                  mousePos={mousePos}
                  radius={radius}
                  falloff={falloff}
               />
            ))}
          </span>
        ))}
      </span>
    );
};

interface LetterProps {
    char: string;
    mousePos: React.RefObject<{ x: number; y: number }>;
    radius: number;
    falloff: "linear" | "exponential" | "gaussian";
}

function Letter({ char, mousePos, radius, falloff }: LetterProps) {
    const letterRef = useRef<HTMLSpanElement>(null);

    useAnimationFrame(() => {
        if (!letterRef.current || !mousePos.current) return;
        const rect = letterRef.current.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const letterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mousePos.current.x - letterX, 2) +
            Math.pow(mousePos.current.y - letterY, 2)
        );

        let proximity = 0;
        if (distance < radius) {
            if (falloff === "linear") proximity = 1 - distance / radius;
            else if (falloff === "exponential") proximity = Math.pow(1 - distance / radius, 2);
            else proximity = Math.exp(-Math.pow(distance / (radius / 2), 2));
        }

        const weight = 400 + (proximity * 500); 
        letterRef.current.style.fontWeight = weight.toString();
        letterRef.current.style.opacity = (0.3 + (proximity * 0.7)).toString();
    });

    return (
        <span ref={letterRef} style={{ display: "inline-block", transition: 'font-weight 0.1s ease-out' }}>
            {char}
        </span>
    );
}

export default VariableProximity;
