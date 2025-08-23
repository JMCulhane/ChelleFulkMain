// hooks/useImagePreloader.ts
import { useState, useEffect } from "react";

const useImagePreloader = (imageUrls: string[]): boolean => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;
    const imgElements: HTMLImageElement[] = [];

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;

      img.onload = handleLoad;
      img.onerror = handleLoad; // count errors as "done" so we don’t hang

      imgElements.push(img);
    });

    function handleLoad() {
      loadedCount += 1;
      if (loadedCount === imageUrls.length) {
        setLoaded(true);
      }
    }

    // cleanup
    return () => {
      imgElements.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);

  return loaded;
};

export default useImagePreloader;
