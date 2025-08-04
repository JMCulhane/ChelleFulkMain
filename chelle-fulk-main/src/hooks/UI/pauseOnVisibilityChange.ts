import { useEffect, useState } from 'react';

const usePauseOnVisibilityChange = (): boolean => {  
    const [isHidden, setIsHidden] = useState<boolean>(document.hidden);

    useEffect(() => {
    const handleVisibilityChange = (): void => {
      setIsHidden(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])
  return isHidden;
};

export default usePauseOnVisibilityChange;
