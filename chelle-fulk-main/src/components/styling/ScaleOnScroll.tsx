import React, { JSX, ReactNode, useEffect, useRef, useState } from 'react';

interface ScaleOnScroll {
  children: ReactNode;
}

export default function ScaleOnScroll({ children }: ScaleOnScroll): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio > 0);
      },
      {
        threshold: [0],
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-hidden flex justify-center items-center transition-all duration-1000 ease-out"
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}
