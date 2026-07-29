"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`landing-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

type CountUpProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  locale: string;
};

export function CountUp({ value, decimals = 0, suffix = "", locale }: CountUpProps) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return;

    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const finalValue = `${formatter.format(value)}${suffix}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = finalValue;
      return;
    }

    let frame = 0;
    let startedAt = 0;

    const animate = (timestamp: number) => {
      if (!startedAt) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / 900, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${formatter.format(value * eased)}${suffix}`;

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.textContent = `${formatter.format(0)}${suffix}`;
          frame = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [decimals, locale, suffix, value]);

  const initialValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return <span ref={numberRef}>{initialValue}{suffix}</span>;
}
