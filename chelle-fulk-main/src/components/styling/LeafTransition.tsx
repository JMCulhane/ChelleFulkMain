import React, { useEffect, useState } from "react";

interface LeafTransitionProps {
  trigger: boolean;
  onComplete?: () => void;
}

// Use your actual leaf images here (transparent PNGs work best)
const leafImages = [
  "https://cdn-icons-png.flaticon.com/512/415/415733.png",
  "https://cdn-icons-png.flaticon.com/512/415/415734.png",
  // add more leaf image URLs if you want
];

type Leaf = {
  id: number;
  xStart: number;      // starting x (vw%)
  yStart: number;      // starting y (vh%)
  duration: number;    // ms
  delay: number;       // ms
  size: number;        // px
  rotationStart: number; // deg
  rotationEnd: number;   // deg
  img: string;
};

export default function LeafTransition({ trigger, onComplete }: LeafTransitionProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    if (trigger) {
      // Generate 30 leaves with random properties
      const newLeaves: Leaf[] = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        xStart: -10,                                 // start slightly off left screen (vw%)
        yStart: 10 + Math.random() * 80,             // random vertical position 10-90vh
        duration: 4000 + Math.random() * 2000,       // 4-6 seconds duration
        delay: Math.random() * 1000,                  // up to 1 second delay
        size: 20 + Math.random() * 25,                // 20-45 px wide
        rotationStart: Math.random() * 360,
        rotationEnd: Math.random() * 720 + 360,
        img: leafImages[Math.floor(Math.random() * leafImages.length)],
      }));
      setLeaves(newLeaves);

      const maxTime = Math.max(...newLeaves.map(l => l.duration + l.delay));
      const timeout = setTimeout(() => {
        setLeaves([]);
        if (onComplete) onComplete();
      }, maxTime);

      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <>
      {leaves.map(leaf => (
        <img
          key={leaf.id}
          src={leaf.img}
          alt="leaf"
          className="leaf"
          style={{
            position: "fixed",
            top: `${leaf.yStart}vh`,
            left: `${leaf.xStart}vw`,
            width: `${leaf.size}px`,
            height: "auto",
            pointerEvents: "none",
            animationName: "leaf-sweep",
            animationDuration: `${leaf.duration}ms`,
            animationDelay: `${leaf.delay}ms`,
            animationFillMode: "forwards",
            animationTimingFunction: "linear",
            transformOrigin: "center center",
            rotate: `${leaf.rotationStart}deg`,
            // CSS vars for rotation end
            "--rotation-end": `${leaf.rotationEnd}deg`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes leaf-sweep {
          0% {
            transform: translateX(0) rotate(var(--rotation-start, 0deg));
            opacity: 1;
          }
          100% {
            transform: translateX(110vw) rotate(var(--rotation-end, 720deg));
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
