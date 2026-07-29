"use client";

import { useEffect, useRef } from "react";

import type { LangType } from "../../../lib/translations";
import { landingTranslations } from "../../../lib/landing-translations";
import { BenefitsSection, FeaturesSection, HowItWorksSection, PlatformsSection } from "./LandingSections";
import { FaqSection } from "./FaqSection";
import { FinalCta, LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { ProductShowcase } from "./ProductShowcase";

type LandingPageContentProps = {
  lang: LangType;
  onLanguageChange: (lang: LangType) => void;
  onRegister: () => void;
  onSignIn: () => void;
};

export function LandingPageContent({ lang, onLanguageChange, onRegister, onSignIn }: LandingPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const copy = landingTranslations[lang];

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const updateParallax = () => {
      root.style.setProperty("--landing-scroll", `${window.scrollY}px`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="landing-root min-h-screen overflow-clip bg-[#07080d] text-white">
      <a href="#landing-main" className="landing-skip-link">{copy.skipToContent}</a>
      <LandingHeader copy={copy} lang={lang} onLanguageChange={onLanguageChange} onSignIn={onSignIn} />
      <main id="landing-main">
        <LandingHero copy={copy} lang={lang} onRegister={onRegister} />
        <FeaturesSection copy={copy} />
        <ProductShowcase copy={copy} lang={lang} />
        <HowItWorksSection copy={copy} />
        <PlatformsSection copy={copy} />
        <BenefitsSection copy={copy} />
        <FaqSection copy={copy} />
        <FinalCta copy={copy} onRegister={onRegister} onSignIn={onSignIn} />
      </main>
      <LandingFooter copy={copy} />
    </div>
  );
}
