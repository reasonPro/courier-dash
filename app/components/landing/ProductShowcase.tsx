"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { getNextLandingTabIndex, type LandingTabNavigationKey } from "../../../lib/landing-tabs";
import type { LandingV2Copy } from "../../../lib/landing-translations";
import type { LangType } from "../../../lib/translations";
import { DashboardMockup, type DemoVariant } from "./DashboardMockup";
import { ScrollReveal } from "./LandingMotion";

const variants: DemoVariant[] = ["work", "platforms", "annual", "garage"];
const navigationKeys: LandingTabNavigationKey[] = ["ArrowLeft", "ArrowRight", "Home", "End"];

export function ProductShowcase({ copy, lang }: { copy: LandingV2Copy; lang: LangType }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStory = copy.product.tabs[activeTab];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!navigationKeys.includes(event.key as LandingTabNavigationKey)) return;
    event.preventDefault();
    const nextIndex = getNextLandingTabIndex(activeTab, event.key as LandingTabNavigationKey, copy.product.tabs.length);
    setActiveTab(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section id="product" className="landing-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div><p className="landing-eyebrow">{copy.product.eyebrow}</p><h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-[2.8rem]">{copy.product.title}</h2></div>
            <p className="max-w-2xl text-pretty leading-7 text-slate-400 lg:justify-self-end">{copy.product.description}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-8">
          <div className="night-product-shell rounded-[1.8rem] border border-white/[0.085] bg-[#090c14]/78 p-3 shadow-[0_34px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
            <div role="tablist" aria-label={copy.product.tabListLabel} className="night-tab-list flex gap-1.5 overflow-x-auto pb-1">
              {copy.product.tabs.map((story, index) => (
                <button
                  key={story.label}
                  ref={(element) => { tabRefs.current[index] = element; }}
                  id={`product-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  aria-controls="product-panel"
                  tabIndex={activeTab === index ? 0 : -1}
                  onClick={() => setActiveTab(index)}
                  onKeyDown={onKeyDown}
                  className={`min-h-10 shrink-0 rounded-xl px-3.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:px-5 ${activeTab === index ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(103,232,249,0.14)]" : "text-slate-500 hover:bg-white/[0.045] hover:text-slate-200"}`}
                >
                  {story.label}
                </button>
              ))}
            </div>

            <div id="product-panel" role="tabpanel" aria-labelledby={`product-tab-${activeTab}`} tabIndex={0} className="mt-3 grid min-h-[25rem] gap-5 rounded-2xl border border-white/[0.055] bg-black/10 p-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:p-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
              <div className="px-1 sm:px-2"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/75">0{activeTab + 1} · {activeStory.label}</p><h3 className="mt-3 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">{activeStory.title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{activeStory.description}</p><div aria-hidden="true" className="mt-6 flex items-center gap-2"><span className="h-px w-10 bg-gradient-to-r from-cyan-300 to-violet-400" /><span className="size-1.5 rounded-full bg-fuchsia-300" /></div></div>
              <DashboardMockup copy={copy} lang={lang} variant={variants[activeTab]} compact />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
