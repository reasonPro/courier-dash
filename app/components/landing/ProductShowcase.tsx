"use client";

import { useEffect, useRef, useState } from "react";

import type { LangType } from "../../../lib/translations";
import type { LandingV1Copy } from "../../../lib/landing-translations";
import { DashboardMockup, type DemoVariant } from "./DashboardMockup";
import { ScrollReveal } from "./LandingMotion";

const variants: DemoVariant[] = ["work", "platforms", "annual", "garage"];

type ProductShowcaseProps = {
  copy: LandingV1Copy;
  lang: LangType;
};

export function ProductShowcase({ copy, lang }: ProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stories = storyRefs.current.filter((story): story is HTMLDivElement => Boolean(story));
    if (!stories.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visible) {
          const index = Number((visible.target as HTMLElement).dataset.storyIndex);
          setActiveIndex(index);
        }
      },
      { rootMargin: "-28% 0px -42%", threshold: [0.2, 0.55, 0.8] },
    );

    stories.forEach((story) => observer.observe(story));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="product" className="landing-section relative px-4 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/3 size-96 rounded-full bg-fuchsia-600/8 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="max-w-3xl">
            <p className="landing-eyebrow">{copy.product.eyebrow}</p>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">{copy.product.title}</h2>
            <p className="mt-5 max-w-2xl text-pretty leading-7 text-slate-400">{copy.product.description}</p>
          </div>
        </ScrollReveal>

        <div className="mt-14 hidden grid-cols-[1.15fr_0.85fr] gap-14 lg:grid">
          <div className="sticky top-28 h-fit">
            <div className="grid">
              {variants.map((variant, index) => (
                <div key={variant} className={`col-start-1 row-start-1 transition-all duration-500 ${activeIndex === index ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-[0.985] opacity-0"}`}>
                  <DashboardMockup copy={copy} lang={lang} variant={variant} />
                </div>
              ))}
            </div>
          </div>

          <div>
            {copy.product.stories.map((story, index) => (
              <div
                key={story.title}
                ref={(element) => { storyRefs.current[index] = element; }}
                data-story-index={index}
                className="flex min-h-[52vh] items-center py-8"
              >
                <article className={`border-l px-7 transition-colors duration-300 ${activeIndex === index ? "border-violet-400" : "border-white/10"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">0{index + 1} · {story.tag}</span>
                  <h3 className="mt-4 text-3xl font-black tracking-tight text-white">{story.title}</h3>
                  <p className="mt-4 max-w-md text-base leading-7 text-slate-400">{story.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-14 lg:hidden">
          {copy.product.stories.map((story, index) => (
            <ScrollReveal key={story.title}>
              <article>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">0{index + 1} · {story.tag}</span>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{story.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{story.description}</p>
                <div className="mt-6"><DashboardMockup copy={copy} lang={lang} variant={variants[index]} compact /></div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
