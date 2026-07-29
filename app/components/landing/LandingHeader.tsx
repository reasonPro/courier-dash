"use client";

import Image from "next/image";

import type { LangType } from "../../../lib/translations";
import type { LandingV2Copy } from "../../../lib/landing-translations";
import courierDashIcon from "../../icon.png";

type LandingHeaderProps = {
  copy: LandingV2Copy;
  lang: LangType;
  onLanguageChange: (lang: LangType) => void;
  onSignIn: () => void;
};

const languages: LangType[] = ["pl", "uk", "en", "ru"];

export function LandingHeader({ copy, lang, onLanguageChange, onSignIn }: LandingHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-5">
      <div className="night-header mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#090b12]/72 px-2.5 shadow-[0_16px_55px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:px-4">
        <a href="#top" className="group flex min-w-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          <Image src={courierDashIcon} alt="" sizes="32px" className="size-8 shrink-0 rounded-xl object-contain shadow-[0_0_24px_rgba(34,211,238,0.14)] ring-1 ring-cyan-300/20" />
          <span className="truncate text-sm font-black tracking-[-0.04em] sm:text-base">Courier<span className="night-gradient-text">Dash</span></span>
        </a>

        <nav aria-label={copy.nav.ariaLabel} className="hidden items-center gap-5 text-xs font-semibold text-slate-400 lg:flex">
          <a className="night-nav-link" href="#features">{copy.nav.features}</a>
          <a className="night-nav-link" href="#product">{copy.nav.product}</a>
          <a className="night-nav-link" href="#how-it-works">{copy.nav.howItWorks}</a>
          <a className="night-nav-link" href="#faq">{copy.nav.faq}</a>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <label className="sr-only" htmlFor="landing-language">{copy.nav.language}</label>
          <select id="landing-language" value={lang} onChange={(event) => onLanguageChange(event.target.value as LangType)} className="h-9 w-12 rounded-xl border border-white/10 bg-white/[0.05] px-1 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-300 sm:w-14">
            {languages.map((language) => <option key={language} value={language} className="bg-slate-950">{language}</option>)}
          </select>
          <button type="button" onClick={onSignIn} className="min-h-9 whitespace-nowrap rounded-xl border border-white/12 bg-white/[0.055] px-2.5 text-[11px] font-bold text-white transition hover:border-cyan-300/35 hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:px-4 sm:text-xs">
            {copy.nav.signIn}
          </button>
        </div>
      </div>
    </header>
  );
}
