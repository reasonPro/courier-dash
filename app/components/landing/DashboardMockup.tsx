"use client";

import { useId } from "react";

import type { LangType } from "../../../lib/translations";
import type { LandingV2Copy } from "../../../lib/landing-translations";
import { CountUp } from "./LandingMotion";

export type DemoVariant = "work" | "platforms" | "annual" | "garage";

type DashboardMockupProps = {
  copy: LandingV2Copy;
  lang: LangType;
  variant?: DemoVariant;
  compact?: boolean;
};

const localeByLanguage: Record<LangType, string> = {
  pl: "pl-PL",
  uk: "uk-UA",
  en: "en-US",
  ru: "ru-RU",
};

const platforms = [
  { name: "Glovo", share: 32, color: "#22d3ee" },
  { name: "Uber Eats", share: 25, color: "#a78bfa" },
  { name: "Wolt", share: 20, color: "#f472b6" },
  { name: "Bolt Food", share: 14, color: "#34d399" },
];

function RouteChart({ annual = false }: { annual?: boolean }) {
  const lineGradientId = useId();
  const fillGradientId = useId();
  const line = annual
    ? "M8 86 C48 72 74 77 108 60 S176 44 214 50 270 18 330 29"
    : "M8 82 C42 70 68 78 105 56 S170 66 206 43 262 52 330 20";

  return (
    <svg aria-hidden="true" viewBox="0 0 340 105" className="h-24 w-full overflow-visible">
      <defs>
        <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#22d3ee" /><stop offset="0.55" stopColor="#a78bfa" /><stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8b5cf6" stopOpacity="0.25" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[26, 52, 78].map((y) => <path key={y} d={`M0 ${y}H340`} stroke="#ffffff" strokeOpacity="0.055" strokeDasharray="3 5" />)}
      <path d={`${line} L330 105 L8 105 Z`} fill={`url(#${fillGradientId})`} />
      <path d={line} fill="none" stroke={`url(#${lineGradientId})`} strokeWidth="3" strokeLinecap="round" />
      <circle cx="330" cy={annual ? 29 : 20} r="4" fill="#f9a8d4" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center gap-3 border-r border-white/[0.07] bg-black/10 py-4 sm:flex">
      <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-[10px] font-black text-cyan-100">CD</span>
      {[0, 1, 2, 3].map((item) => <span key={item} className={`h-7 w-8 rounded-lg border ${item === 0 ? "border-cyan-300/18 bg-cyan-300/10" : "border-white/[0.05] bg-white/[0.025]"}`} />)}
      <span className="mt-auto size-7 rounded-full border border-white/10 bg-gradient-to-br from-slate-500/30 to-violet-500/30" />
    </aside>
  );
}

function PlatformBreakdown({ copy }: { copy: LandingV2Copy }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{copy.demo.platformMix}</p>
      {platforms.map((platform) => (
        <div key={platform.name} className="grid grid-cols-[5.25rem_1fr_2rem] items-center gap-2 text-[9px] text-slate-400">
          <span className="truncate">{platform.name}</span>
          <span className="h-1 overflow-hidden rounded-full bg-white/[0.06]"><i className="block h-full rounded-full" style={{ width: `${platform.share * 2.7}%`, backgroundColor: platform.color }} /></span>
          <strong className="text-right text-slate-200">{platform.share}%</strong>
        </div>
      ))}
    </div>
  );
}

function WorkPreview({ copy, locale, annual }: { copy: LandingV2Copy; locale: string; annual: boolean }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div><p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{copy.demo.income}</p><p className="mt-1 text-xl font-black tracking-[-0.04em] text-white sm:text-2xl"><CountUp value={8420} locale={locale} /> <small className="text-[10px] text-slate-500">{copy.demo.currency}</small></p></div>
            <span className="rounded-full bg-emerald-300/8 px-2 py-1 text-[8px] font-bold text-emerald-300">+12.4%</span>
          </div>
          <div className="mt-2"><RouteChart annual={annual} /></div>
        </section>
        <section className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-3 sm:p-4"><PlatformBreakdown copy={copy} /></section>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [copy.demo.hours, <><CountUp key="hours" value={132} locale={locale} /> {copy.demo.hourUnit}</>],
          [copy.demo.orders, "412"],
          [copy.demo.onlineTips, "286 PLN"],
          [copy.demo.distance, `1 286 ${copy.demo.kmUnit}`],
        ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-white/[0.065] bg-white/[0.02] px-2.5 py-2"><p className="truncate text-[8px] uppercase tracking-wider text-slate-600">{label}</p><p className="mt-1 whitespace-nowrap text-[11px] font-black text-slate-200 sm:text-xs">{value}</p></div>)}
      </div>
    </>
  );
}

function PlatformsPreview({ copy }: { copy: LandingV2Copy }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[0.78fr_1.22fr]">
      <div className="grid place-items-center rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4">
        <div className="grid size-28 place-items-center rounded-full bg-[conic-gradient(#22d3ee_0_32%,#a78bfa_32%_57%,#f472b6_57%_77%,#34d399_77%_91%,#475569_91%)] shadow-[0_0_42px_rgba(139,92,246,0.12)]">
          <span className="grid size-16 place-items-center rounded-full bg-[#0b0e16] text-center text-[9px] font-bold text-slate-300">8.4k<br />PLN</span>
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4"><PlatformBreakdown copy={copy} /><div className="mt-4 grid grid-cols-2 gap-2"><span className="rounded-lg bg-cyan-300/[0.055] p-2 text-[9px] text-cyan-100">{copy.demo.onlineTips}<strong className="mt-1 block">286 PLN</strong></span><span className="rounded-lg bg-violet-300/[0.055] p-2 text-[9px] text-violet-100">{copy.demo.cashTips}<strong className="mt-1 block">174 PLN</strong></span></div></div>
    </div>
  );
}

function GaragePreview({ copy }: { copy: LandingV2Copy }) {
  const resources = [copy.product.previewLabels.driveBelt, copy.product.previewLabels.brakePads, copy.product.previewLabels.engineOil];
  return (
    <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4"><p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{copy.product.previewLabels.odometer}</p><p className="mt-2 text-2xl font-black">12 860 <small className="text-xs text-slate-500">{copy.demo.kmUnit}</small></p><svg aria-hidden="true" viewBox="0 0 240 70" className="mt-5 w-full"><path d="M5 57C45 56 54 20 92 31s53 30 78 4 39-10 65-24" fill="none" stroke="#22d3ee" strokeWidth="2.5" /><circle cx="235" cy="11" r="4" fill="#a78bfa" /></svg></div>
      <div className="space-y-2">{resources.map((resource, index) => <div key={resource} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3"><div className="flex justify-between gap-2 text-[10px]"><span className="text-slate-300">{resource}</span><strong className={index === 1 ? "text-amber-300" : "text-emerald-300"}>{[45, 82, 53][index]}%</strong></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"><i className={`block h-full rounded-full ${index === 1 ? "bg-amber-300" : "bg-emerald-300"}`} style={{ width: `${[45, 82, 53][index]}%` }} /></div></div>)}</div>
    </div>
  );
}

export function DashboardMockup({ copy, lang, variant = "work", compact = false }: DashboardMockupProps) {
  const locale = localeByLanguage[lang];
  const variantLabel = copy.product.previewLabels[variant];

  return (
    <div role="img" aria-label={`${copy.demo.ariaLabel}. ${variantLabel}.`} className={`night-dashboard relative flex min-w-0 max-w-full overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#090c14]/94 shadow-[0_36px_110px_rgba(0,0,0,0.6),0_0_80px_rgba(34,211,238,0.07)] ${compact ? "min-h-[21rem]" : "min-h-[24rem]"}`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,rgba(124,58,237,0.14),transparent_42%),radial-gradient(circle_at_0%_92%,rgba(6,182,212,0.1),transparent_38%)]" />
      <Sidebar />
      <div aria-hidden="true" className="relative min-w-0 flex-1 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/[0.065] pb-3">
          <div><p className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300/75">{copy.demo.label}</p><p className="mt-0.5 text-xs font-black text-white">{variantLabel}</p></div>
          <span className="rounded-xl border border-white/[0.075] bg-white/[0.035] px-2.5 py-1.5 text-[9px] text-slate-400">{copy.demo.period}⌄</span>
        </div>
        {variant === "platforms" ? <PlatformsPreview copy={copy} /> : variant === "garage" ? <GaragePreview copy={copy} /> : <WorkPreview copy={copy} locale={locale} annual={variant === "annual"} />}
        <div className="mt-3 flex items-center gap-2 text-[8px] uppercase tracking-[0.16em] text-slate-600"><span className="size-1.5 rounded-full bg-cyan-300" />CourierDash · {copy.demo.label}</div>
      </div>
    </div>
  );
}
