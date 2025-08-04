import React, { JSX, useEffect, useRef } from 'react';
import styles from './PhotoReel.module.scss';
import usePauseOnVisibilityChange from '../../hooks/UI/pauseOnVisibilityChange';

const assets = (r: __WebpackModuleApi.RequireContext): string[] =>
  r.keys().map((key: string): string => r(key) as string);

const reel: string[] = assets(
  require.context('../../../public/assets/reel', false, /\.(png|jpe?g|svg)$/)
);

const infiniteReel: string[] = [...reel, ...reel];

const PhotoReel: React.FC = (): JSX.Element => {
  const pageIsHidden: boolean = usePauseOnVisibilityChange();
  const containerRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const currentIndex: React.MutableRefObject<number> = useRef<number>(0);
  const intervalRef: React.MutableRefObject<number | null> = useRef<number | null>(null);
  const resizeTimeoutRef: React.MutableRefObject<number | null> = useRef<number | null>(null);
  const slideInterval: number = 3000;

  const startCarousel = (): void => {
    const container: HTMLDivElement | null = containerRef.current;
    if (!container) return;

    const totalSlides: number = reel.length;

    intervalRef.current = window.setInterval(() => {
      if (!container) return;

      currentIndex.current += 1;
      const scrollAmount: number = currentIndex.current * container.offsetWidth; //offSetWidth is a reference to a container's visible width. For this specific example, the width is the length of the photo. scrollAmount calculates the multiplication of the current index of the carousel and the visible width (photo's length) to ensure that it continues to scroll infinitely to each next photo.

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
  };

  const stopCarousel = (): void => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect((): () => void => {
    const container: HTMLDivElement | null = containerRef.current;
    if (!container) return () => {};

    startCarousel();

    const handleResize = (): void => {
      stopCarousel();
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        const container = containerRef.current;
          if (container) {
            const newScrollLeft = currentIndex.current * container.offsetWidth;
            container.scrollLeft = newScrollLeft;
          }
        startCarousel();
      }, 500);
    };

    window.addEventListener('resize', handleResize);

    return (): void => {
      stopCarousel();
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pageIsHidden) {
      stopCarousel();
    } else {
      stopCarousel();
      startCarousel();
    }
  }, [pageIsHidden]);

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
