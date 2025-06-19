import React, { JSX, useEffect, useRef } from 'react';
import styles from './PhotoReel.module.scss';

const assets = (r: __WebpackModuleApi.RequireContext): string[] =>
  r.keys().map((key: string): string => r(key) as string);

const reel: string[] = assets(
  require.context('../../public/assets/reel', false, /\.(png|jpe?g|svg)$/)
);

const infiniteReel: string[] = [...reel, ...reel];

const PhotoReel: React.FC = (): JSX.Element => {
  const containerRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const currentIndex: React.MutableRefObject<number> = useRef<number>(0);
  const intervalRef: React.MutableRefObject<number | null> = useRef<number | null>(null);
  const resizeTimeoutRef: React.MutableRefObject<number | null> = useRef<number | null>(null);
  const slideInterval: number = 3000;

  useEffect((): () => void => {
    const container: HTMLDivElement | null = containerRef.current;
    if (!container) return () => {};

    const totalSlides: number = reel.length;

    const intervalId: number = window.setInterval(() => {
      if (!container) return;

      currentIndex.current += 1;
      const scrollAmount: number = currentIndex.current * container.offsetWidth;
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });

      if (currentIndex.current === totalSlides) {
        setTimeout(() => {
          if (container) {
            container.scrollLeft = 0;
            currentIndex.current = 0;
          }
        }, 800);
      }
    }, slideInterval);

    return (): void => window.clearInterval(intervalId);
  }, []);

  return (
    <div className={styles.reelWrapper} ref={containerRef}>
      <div className={styles.reelContainer}>
        {infiniteReel.map((src: string, i: number): JSX.Element => (
          <img key={i} src={src} className={styles.reelPhoto} />
        ))}
      </div>
    </div>
  );
};

export default PhotoReel;
