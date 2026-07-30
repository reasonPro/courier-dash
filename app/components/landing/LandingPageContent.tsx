"use client";

import { useEffect, useRef } from "react";

import { startLandingScrollMotion } from "../../../lib/landing-scroll-motion";
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
  const meshLayerRef = useRef<HTMLDivElement>(null);
  const mapLayerRef = useRef<SVGSVGElement>(null);
  const foregroundLayerRef = useRef<HTMLDivElement>(null);
  const copy = landingTranslations[lang];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    return startLandingScrollMotion({
      layers: {
        mesh: meshLayerRef.current,
        map: mapLayerRef.current,
        foreground: foregroundLayerRef.current,
      },
      reducedMotion: reducedMotion.matches,
      getScrollY: () => window.scrollY,
      requestFrame: (callback) => requestAnimationFrame(callback),
      cancelFrame: (frame) => cancelAnimationFrame(frame),
      addScrollListener: (listener) =>
        window.addEventListener("scroll", listener, { passive: true }),
      removeScrollListener: (listener) =>
        window.removeEventListener("scroll", listener),
    });
  }, []);

  return (
    <div className="night-root min-h-screen overflow-clip bg-[#06070b] text-white">
      <a href="#landing-main" className="landing-skip-link">{copy.skipToContent}</a>
      <NightRouteBackground
        meshLayerRef={meshLayerRef}
        mapLayerRef={mapLayerRef}
        foregroundLayerRef={foregroundLayerRef}
      />
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
