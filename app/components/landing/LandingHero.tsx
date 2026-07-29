import type { LangType } from "../../../lib/translations";
import type { LandingV1Copy } from "../../../lib/landing-translations";
import { DashboardMockup } from "./DashboardMockup";

type LandingHeroProps = {
  copy: LandingV1Copy;
  lang: LangType;
  onRegister: () => void;
};

export function LandingHero({ copy, lang, onRegister }: LandingHeroProps) {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 sm:pt-40 lg:px-8 lg:pb-32">
      <div aria-hidden="true" className="landing-parallax-slow pointer-events-none absolute -left-24 top-32 size-80 rounded-full bg-sky-500/12 blur-[110px]" />
      <div aria-hidden="true" className="landing-parallax-fast pointer-events-none absolute -right-32 top-20 size-[28rem] rounded-full bg-fuchsia-600/12 blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 landing-grid-mask opacity-40" />

      <div className="relative mx-auto grid min-w-0 max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
        <div className="min-w-0 text-center lg:text-left">
          <div className="mb-6 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-sky-200 shadow-[0_0_30px_rgba(56,189,248,0.08)] sm:text-[11px] sm:tracking-[0.18em]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            {copy.hero.badge}
          </div>

          <h1 className="max-w-full break-words text-balance text-[2.55rem] font-black leading-[1.01] tracking-[-0.05em] text-white [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl xl:text-[5.3rem]">
            {copy.hero.title}{" "}
            <span className="landing-gradient-text">{copy.hero.titleAccent}</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl break-words text-pretty text-base leading-7 text-slate-400 sm:text-lg lg:mx-0 lg:max-w-xl">
            {copy.hero.description}
          </p>

          <div className="mt-8 flex min-w-0 flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <button type="button" onClick={onRegister} className="landing-primary-button min-h-12 w-full px-4 sm:w-auto sm:px-6">
              {copy.hero.primary}
              <span aria-hidden="true">→</span>
            </button>
            <a href="#product" className="landing-secondary-button min-h-12 w-full px-4 text-center sm:w-auto sm:px-6">
              <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-white/8 text-[10px]">▶</span>
              {copy.hero.secondary}
            </a>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-xs leading-5 text-slate-500 lg:mx-0">
            {copy.hero.platformsNote}
          </p>
        </div>

        <div className="landing-parallax-fast relative mx-auto min-w-0 w-full max-w-3xl">
          <div aria-hidden="true" className="landing-float absolute -left-6 top-8 z-10 hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/8 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-200 shadow-xl backdrop-blur-xl sm:block">+12.4%</div>
          <div aria-hidden="true" className="landing-float-delayed absolute -right-3 bottom-10 z-10 hidden rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/8 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-fuchsia-200 shadow-xl backdrop-blur-xl sm:block">63.79 PLN/h</div>
          <DashboardMockup copy={copy} lang={lang} />
        </div>
      </div>
    </section>
  );
}
