import type { LandingV1Copy } from "../../../lib/landing-translations";
import { ScrollReveal } from "./LandingMotion";

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="landing-eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? <p className="mx-auto mt-5 max-w-2xl text-pretty leading-7 text-slate-400">{description}</p> : null}
    </div>
  );
}

const featureIcons = [
  <path key="wallet" d="M4 7.5h14a2 2 0 0 1 2 2v8H6a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h10" />,
  <path key="speed" d="M4 18a8 8 0 1 1 16 0M12 18l4-6M7 15h.01M17 9h.01M12 7h.01" />,
  <path key="chart" d="M5 19V9m7 10V5m7 14v-7M3 19h18" />,
];

export function FeaturesSection({ copy }: { copy: LandingV1Copy }) {
  return (
    <section id="features" className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal><SectionIntro eyebrow={copy.features.eyebrow} title={copy.features.title} description={copy.features.description} /></ScrollReveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {copy.features.cards.map((card, index) => (
            <ScrollReveal key={card.title} delay={index * 90} className="h-full">
              <article className="landing-glass-card group h-full p-6 sm:p-7">
                <span className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/15 via-violet-500/10 to-fuchsia-500/15 text-sky-200 transition duration-300 group-hover:-translate-y-1 group-hover:border-sky-300/30">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{featureIcons[index]}</svg>
                </span>
                <h3 className="mt-7 text-xl font-bold tracking-tight text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection({ copy }: { copy: LandingV1Copy }) {
  return (
    <section id="how-it-works" className="landing-section relative px-4 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-[110px]" />
      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal><SectionIntro eyebrow={copy.how.eyebrow} title={copy.how.title} /></ScrollReveal>
        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent md:block" />
          {copy.how.steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 100}>
              <article className="relative rounded-3xl border border-white/9 bg-[#0d111b]/80 p-6 text-center backdrop-blur-xl">
                <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-lg font-black text-violet-200 shadow-[0_0_35px_rgba(139,92,246,0.12)]">0{index + 1}</span>
                <h3 className="mt-6 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformsSection({ copy }: { copy: LandingV1Copy }) {
  const platforms = ["Glovo", "Uber Eats", "Wolt", "Bolt Food", "Stuart", copy.platforms.other];
  return (
    <section id="platforms" className="px-4 py-20 sm:px-6 lg:px-8">
      <ScrollReveal className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.025] px-5 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-10">
        <p className="landing-eyebrow">{copy.platforms.eyebrow}</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{copy.platforms.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">{copy.platforms.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {platforms.map((platform, index) => (
            <span key={platform} className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0d15] px-4 py-2.5 text-sm font-semibold text-slate-200">
              <i className={`size-2 rounded-full ${["bg-amber-400", "bg-white", "bg-cyan-400", "bg-lime-400", "bg-violet-400", "bg-slate-500"][index]}`} />
              {platform}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

export function BenefitsSection({ copy }: { copy: LandingV1Copy }) {
  return (
    <section className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <ScrollReveal>
          <p className="landing-eyebrow">{copy.benefits.eyebrow}</p>
          <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.04em] text-white">{copy.benefits.title}</h2>
        </ScrollReveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {copy.benefits.items.map((item, index) => (
            <ScrollReveal key={item} delay={(index % 2) * 70}>
              <div className="flex min-h-full gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm leading-6 text-slate-300">
                <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-xs text-emerald-300">✓</span>
                {item}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
