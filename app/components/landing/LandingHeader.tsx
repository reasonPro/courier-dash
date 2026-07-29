"use client";

import { useEffect, useState } from "react";

import type { LangType } from "../../../lib/translations";
import type { LandingV1Copy } from "../../../lib/landing-translations";

type LandingHeaderProps = {
  copy: LandingV1Copy;
  lang: LangType;
  onLanguageChange: (lang: LangType) => void;
  onSignIn: () => void;
};

const languages: LangType[] = ["pl", "uk", "en", "ru"];

export function LandingHeader({ copy, lang, onLanguageChange, onSignIn }: LandingHeaderProps) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nextCompact = window.scrollY > 24;
      setIsCompact((current) => (current === nextCompact ? current : nextCompact));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isCompact
          ? "border-white/10 bg-[#07080d]/90 py-2 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          : "border-transparent bg-[#07080d]/55 py-3 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <a href="#top" className="group flex min-h-11 min-w-0 items-center gap-1.5 rounded-xl pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:gap-2 sm:pr-2">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-400/20 to-fuchsia-500/20 shadow-[0_0_28px_rgba(56,189,248,0.2)] sm:size-9">
            <svg viewBox="0 0 24 24" className="size-5 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 15 10.5 4l2.1 6H20L13.5 20l-2.1-6H4Z" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="truncate text-sm font-black tracking-[-0.04em] text-white sm:text-lg">Courier<span className="bg-gradient-to-r from-sky-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Dash</span></span>
        </a>

        <nav aria-label={copy.nav.ariaLabel} className="hidden items-center gap-6 text-sm font-medium text-slate-300 lg:flex">
          <a className="landing-nav-link" href="#features">{copy.nav.features}</a>
          <a className="landing-nav-link" href="#product">{copy.nav.product}</a>
          <a className="landing-nav-link" href="#how-it-works">{copy.nav.howItWorks}</a>
          <a className="landing-nav-link" href="#faq">{copy.nav.faq}</a>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative sm:hidden">
            <label className="sr-only" htmlFor="landing-language-mobile">{copy.nav.language}</label>
            <select
              id="landing-language-mobile"
              value={lang}
              onChange={(event) => onLanguageChange(event.target.value as LangType)}
              className="h-10 w-12 rounded-xl border border-white/10 bg-white/[0.06] px-1 text-[11px] font-bold uppercase text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
            >
              {languages.map((language) => <option key={language} value={language} className="bg-slate-950">{language}</option>)}
            </select>
          </div>

          <div aria-label={copy.nav.language} className="hidden rounded-xl border border-white/10 bg-white/[0.04] p-1 sm:flex">
            {languages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => onLanguageChange(language)}
                aria-pressed={lang === language}
                className={`min-h-8 rounded-lg px-2.5 text-[11px] font-bold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${lang === language ? "bg-white/12 text-white shadow-sm" : "text-slate-500 hover:text-white"}`}
              >
                {language}
              </button>
            ))}
          </div>

          <button type="button" onClick={onSignIn} className="min-h-10 whitespace-nowrap rounded-xl border border-white/15 bg-white/[0.06] px-2 text-[11px] font-bold text-white transition hover:border-sky-300/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4 sm:text-sm">
            {copy.nav.signIn}
          </button>
        </div>
      </div>
    </header>
  );
}
