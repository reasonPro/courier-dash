import type { LangType } from "../../../lib/translations";
import type { LandingV2Copy } from "../../../lib/landing-translations";
import { DashboardMockup } from "./DashboardMockup";

type LandingHeroProps = {
  copy: LandingV2Copy;
  lang: LangType;
  onRegister: () => void;
};

export function LandingHero({ copy, lang, onRegister }: LandingHeroProps) {
  return (
    <section id="top" className="relative px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-5">
        <div className="min-w-0 text-center lg:text-left">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.065] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.07)] sm:text-[10px] sm:tracking-[0.17em]">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.85)]" />
            {copy.hero.badge}
          </div>
          <h1 className="text-balance text-[2.65rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem] xl:text-[4.8rem]">
            {copy.hero.title} <span className="night-gradient-text">{copy.hero.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-slate-400 lg:mx-0">{copy.hero.description}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <button type="button" onClick={onRegister} className="landing-primary-button min-h-12 px-6">{copy.hero.primary}<span aria-hidden="true">→</span></button>
            <a href="#product" className="landing-secondary-button min-h-12 px-6">{copy.hero.secondary}<span aria-hidden="true">↘</span></a>
          </div>
          <p className="mx-auto mt-4 max-w-lg text-xs leading-5 text-slate-500 lg:mx-0">{copy.hero.note}</p>
        </div>

        <div className="night-hero-dashboard relative mx-auto w-full min-w-0 max-w-3xl lg:translate-x-5">
          <div aria-hidden="true" className="night-float-card night-float-card-a absolute -left-1 top-8 z-20 hidden max-w-40 rounded-2xl border border-emerald-300/20 bg-[#09110f]/82 px-3 py-2 text-[10px] font-bold text-emerald-200 shadow-xl backdrop-blur-xl sm:block lg:-left-8">{copy.hero.floatingIncome}</div>
          <div aria-hidden="true" className="night-float-card night-float-card-b absolute -right-1 bottom-8 z-20 hidden max-w-40 rounded-2xl border border-fuchsia-300/20 bg-[#110912]/82 px-3 py-2 text-[10px] font-bold text-fuchsia-100 shadow-xl backdrop-blur-xl sm:block lg:-right-5">{copy.hero.floatingEfficiency}</div>
          <DashboardMockup copy={copy} lang={lang} />
        </div>
      </div>
    </section>
  );
}
