"use client";

import { useState, useEffect, useRef } from "react";

export default function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let frameId: number;

    if (ref.current) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateCount = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = progress * (2 - progress); // Ease Out Quad
              const currentVal = Math.floor(easeProgress * target);
              
              setCount(currentVal);

              if (progress < 1) {
                frameId = requestAnimationFrame(updateCount);
              } else {
                setCount(target);
              }
            };

            frameId = requestAnimationFrame(updateCount);
            observer!.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(ref.current);
    }

    return () => {
      if (observer) observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target]);

  return <span ref={ref}>{count}</span>;
}
