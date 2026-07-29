import type { LandingV2Copy } from "../../../lib/landing-translations";
import { ScrollReveal } from "./LandingMotion";

function SectionIntro({ eyebrow, title, description, align = "center" }: { eyebrow: string; title: string; description?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="landing-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem]">{title}</h2>
      {description ? <p className={`mt-4 text-pretty leading-7 text-slate-400 ${align === "center" ? "mx-auto max-w-2xl" : ""}`}>{description}</p> : null}
    </div>
  );
}

const featureIcons = [
  <path key="money" d="M4 7h16v10H4zM8 12h.01M16 12h.01M12 9.5v5" />,
  <path key="speed" d="M4 18a8 8 0 1 1 16 0M12 18l4-6M7 15h.01M17 9h.01" />,
  <path key="route" d="M5 5h4v4H5zM15 15h4v4h-4zM9 7c6 0 0 10 6 10" />,
  <path key="year" d="M5 19V9m5 10V5m5 14v-7m5 7V8M3 19h19" />,
  <path key="garage" d="M4 11 6 6h12l2 5v7h-2v-2H6v2H4zm2 0h12M8 13h.01M16 13h.01" />,
];

export function ValueStrip({ copy }: { copy: LandingV2Copy }) {
  return (
    <section aria-label={copy.features.eyebrow} className="relative z-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.075] bg-[#090c13]/72 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:grid-cols-4">
        {copy.valueItems.map((item, index) => (
          <div key={item} className="flex min-h-16 items-center gap-2 border-white/[0.065] px-3 py-3 text-xs font-semibold text-slate-300 max-sm:nth-[odd]:border-r sm:border-r sm:last:border-r-0">
            <span className="font-black text-cyan-300/80">0{index + 1}</span><span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BentoFeaturesSection({ copy }: { copy: LandingV2Copy }) {
  return (
    <section id="features" className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal><SectionIntro eyebrow={copy.features.eyebrow} title={copy.features.title} description={copy.features.description} /></ScrollReveal>
        <div className="mt-9 grid auto-rows-[minmax(12rem,auto)] gap-3 md:grid-cols-6">
          {copy.features.cards.map((card, index) => (
            <ScrollReveal key={card.title} delay={index * 60} className={`h-full ${index < 2 ? "md:col-span-3" : "md:col-span-2"}`}>
              <article className={`night-bento-card group h-full p-5 sm:p-6 ${index === 0 ? "night-bento-card-cyan" : index === 1 ? "night-bento-card-violet" : index === 2 ? "night-bento-card-pink" : index === 3 ? "night-bento-card-emerald" : "night-bento-card-amber"}`}>
                <div className="flex h-full flex-col justify-between gap-7">
                  <span className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-cyan-100">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{featureIcons[index]}</svg>
                  </span>
                  <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">0{index + 1}</p><h3 className="text-xl font-black tracking-[-0.025em] text-white">{card.title}</h3><p className="mt-2.5 text-sm leading-6 text-slate-400">{card.description}</p></div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const platformNames = ["Glovo", "Uber Eats", "Wolt", "Bolt Food", "Stuart"];

export function HowPlatformsSection({ copy }: { copy: LandingV2Copy }) {
  return (
    <section id="how-it-works" className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <ScrollReveal><SectionIntro align="left" eyebrow={copy.how.eyebrow} title={copy.how.title} description={copy.how.description} /></ScrollReveal>
          <div className="grid gap-3 sm:grid-cols-3">
            {copy.how.steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 70} className="h-full">
                <article className="night-step-card h-full rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4 backdrop-blur-sm"><span className="text-xs font-black text-cyan-300">0{index + 1}</span><h3 className="mt-5 font-black text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p></article>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal className="mt-7">
          <div className="rounded-[1.6rem] border border-white/[0.08] bg-[#090c14]/72 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl"><h3 className="text-xl font-black text-white">{copy.platforms.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy.platforms.description}</p></div>
              <div className="flex flex-wrap gap-2">{[...platformNames, copy.platforms.other].map((platform) => <span key={platform} className="rounded-xl border border-white/[0.075] bg-white/[0.035] px-3 py-2 text-[11px] font-bold text-slate-300">{platform}</span>)}</div>
            </div>
            <p className="mt-5 border-t border-white/[0.065] pt-4 text-[11px] leading-5 text-slate-600">{copy.platforms.manualNote}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
