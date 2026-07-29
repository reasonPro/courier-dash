"use client";

import { useState } from "react";

import type { LandingV1Copy } from "../../../lib/landing-translations";
import { ScrollReveal } from "./LandingMotion";

export function FaqSection({ copy }: { copy: LandingV1Copy }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <ScrollReveal>
          <p className="landing-eyebrow">{copy.faq.eyebrow}</p>
          <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.04em] text-white">{copy.faq.title}</h2>
        </ScrollReveal>

        <div className="divide-y divide-white/8 border-y border-white/8">
          {copy.faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `landing-faq-panel-${index}`;
            const buttonId = `landing-faq-button-${index}`;
            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left text-base font-bold text-white outline-none transition hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
                  >
                    {item.question}
                    <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-lg font-light transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="pb-6 pr-12 text-sm leading-7 text-slate-400">
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
