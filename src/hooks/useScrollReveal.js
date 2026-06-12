import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          
          // Apply delay if specified
          const delay = el.getAttribute("data-aos-delay");
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }
          
          el.classList.add("reveal-active");
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll("[data-aos]");
    
    animatedElements.forEach((el) => {
      const aosType = el.getAttribute("data-aos") || "fade-up";
      el.classList.add("reveal-hidden", `reveal-${aosType}`);
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);
}
