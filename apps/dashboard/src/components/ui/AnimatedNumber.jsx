import { useState, useEffect } from 'react';

export default function AnimatedNumber({ value, prefix = '', suffix = '', duration = 800 }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplayed(0); return; }
    
    const start = Date.now();
    let raf;
    
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    
    tick();
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{prefix}{displayed.toLocaleString('id-ID')}{suffix}</span>;
}
