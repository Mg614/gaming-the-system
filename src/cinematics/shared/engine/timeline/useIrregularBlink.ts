import { useEffect, useRef, useState } from 'react';
import { seededUnit } from './animationMath';

export function useIrregularBlink(enabled: boolean, seed = 17) {
  const [blink, setBlink] = useState(0);
  const count = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setBlink(0);
      return;
    }

    let closedTimer = 0;
    let openTimer = 0;
    const schedule = () => {
      const delay = 1800 + seededUnit(seed + count.current++) * 2600;
      openTimer = window.setTimeout(() => {
        setBlink(1);
        closedTimer = window.setTimeout(() => {
          setBlink(0);
          schedule();
        }, 115);
      }, delay);
    };
    schedule();
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closedTimer);
    };
  }, [enabled, seed]);

  return blink;
}
