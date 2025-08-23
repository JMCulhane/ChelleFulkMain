import React, { JSX, useEffect, useRef, useState } from "react";
import styles from "./PhotoReel.module.scss";
import usePauseOnVisibilityChange from "../../hooks/UI/pauseOnVisibilityChange";

interface PhotoReelProps {
  reel: string[];
}

const PhotoReel: React.FC<PhotoReelProps> = ({ reel }): JSX.Element => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageIsHidden = usePauseOnVisibilityChange();

  const infiniteReel = [...reel, ...reel]; // duplicate for seamless looping
  const slideInterval = 3000; // 3 seconds per slide
  const transitionDuration = 800; // ms

  // Update index every interval
  useEffect(() => {
    if (pageIsHidden) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [pageIsHidden]);

  // Reset index when reaching the duplicated end
  useEffect(() => {
    if (currentIndex === reel.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
      }, transitionDuration);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, reel.length]);

  return (
    <div className={styles.reelWrapper} ref={containerRef}>
      <div
        className={styles.reelContainer}
        style={{
          transform: `translateX(-${currentIndex * 100}vw)`,
          transition:
            currentIndex === 0 ? "none" : `transform ${transitionDuration}ms ease-in-out`,
        }}
      >
        {infiniteReel.map((src, i) => (
          <img key={i} src={src} className={styles.reelPhoto} />
        ))}
      </div>
    </div>
  );
};

export default PhotoReel;
