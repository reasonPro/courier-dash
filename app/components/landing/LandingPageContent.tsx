"use client";

import { useEffect, useRef } from "react";

import type { LangType } from "../../../lib/translations";
import { landingTranslations } from "../../../lib/landing-translations";
import { FaqSection } from "./FaqSection";
import { FinalCta, LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { BentoFeaturesSection, HowPlatformsSection, ValueStrip } from "./LandingSections";
import { NightRouteBackground } from "./NightRouteBackground";
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || reducedMotion.matches) return;

    let frame = 0;
    const updateLayers = () => {
      const scroll = window.scrollY;
      root.style.setProperty("--night-slow-y", `${scroll * 0.035}px`);
      root.style.setProperty("--night-map-y", `${scroll * -0.055}px`);
      root.style.setProperty("--night-map-x", `${Math.sin(scroll / 560) * 12}px`);
      root.style.setProperty("--night-fast-y", `${scroll * -0.11}px`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateLayers);
    };

    updateLayers();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="night-root min-h-screen overflow-clip bg-[#06070b] text-white">
      <a href="#landing-main" className="landing-skip-link">{copy.skipToContent}</a>
      <NightRouteBackground />
      <LandingHeader copy={copy} lang={lang} onLanguageChange={onLanguageChange} onSignIn={onSignIn} />
      <main id="landing-main" className="relative z-10">
        <LandingHero copy={copy} lang={lang} onRegister={onRegister} />
        <ValueStrip copy={copy} />
        <BentoFeaturesSection copy={copy} />
        <ProductShowcase copy={copy} lang={lang} />
        <HowPlatformsSection copy={copy} />
        <FaqSection copy={copy} />
        <FinalCta copy={copy} onRegister={onRegister} onSignIn={onSignIn} />
      </main>
      <LandingFooter copy={copy} />
    </div>
  );
}
