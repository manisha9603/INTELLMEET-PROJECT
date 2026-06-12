import React, { useMemo, useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

interface ParticleBackgroundProps {
  opacity?: number;
}

/**
 * World-class particle mesh background component.
 * UPDATED: Monochromatic theme (White/Gray).
 */
const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ opacity = 1 }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

  const options = useMemo(() => ({
    fullScreen: { enable: false },
    background: {
      color: "transparent",
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: ["#ffffff", "#888888", "#444444"],
      },
      links: {
        color: "#ffffff",
        distance: 120,
        enable: true,
        opacity: 0.1,
        width: 1,
      },
      move: {
        direction: "none" as const,
        enable: true,
        outModes: {
          default: "out" as const,
        },
        random: true,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 80,
      },
      opacity: {
        value: 0.3,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    detectRetina: true,
  }), []);

  const ParticlesComponent = Particles as any;

  return (
    <div style={{ opacity }} className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000">
      <ParticlesComponent
        id="tsparticles-hero"
        className="w-full h-full"
        init={particlesInit}
        loaded={particlesLoaded}
        options={options}
      />
    </div>
  );
};

export default React.memo(ParticleBackground);
