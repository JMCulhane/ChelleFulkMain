import React, { JSX, ReactNode, useEffect, useRef, useState } from 'react';

interface ScaleOnScroll {
  children: ReactNode;
  triggerFadeOut?: boolean;
}

export default function ScaleOnScroll({ children, triggerFadeOut = false }: ScaleOnScroll): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isFadedOut, setIsFadedOut] = useState<boolean>(false);

  useEffect(() => {
    if (triggerFadeOut) {
      setIsFadedOut(true);
    }
  }, [triggerFadeOut]);

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

  // Determine final visibility state
  const shouldBeVisible = isVisible && !isFadedOut;

  return (
    <div
      ref={ref}
      className="transition-all duration-1000 ease-out"
      style={{
        transform: shouldBeVisible ? 'scale(1)' : 'scale(0.8)',
        opacity: shouldBeVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}