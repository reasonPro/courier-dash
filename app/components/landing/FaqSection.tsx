import type { LandingV2Copy } from "../../../lib/landing-translations";
import { ScrollReveal } from "./LandingMotion";

export function FaqSection({ copy }: { copy: LandingV2Copy }) {
  return (
    <section id="faq" className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div><p className="landing-eyebrow">{copy.faq.eyebrow}</p><h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-[2.8rem]">{copy.faq.title}</h2></div>
            <p className="text-sm leading-6 text-slate-500 lg:max-w-lg lg:justify-self-end">CourierDash · FAQ</p>
          </div>
        </ScrollReveal>
        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {copy.faq.items.map((item, index) => (
            <ScrollReveal key={item.question} delay={(index % 2) * 60}>
              <details className="night-faq group rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4 backdrop-blur-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"><span>{item.question}</span><span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] text-cyan-300 transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm leading-6 text-slate-500">{item.answer}</p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
