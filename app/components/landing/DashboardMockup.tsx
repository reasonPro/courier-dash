"use client";

import type { LangType } from "../../../lib/translations";
import type { LandingV1Copy } from "../../../lib/landing-translations";
import { CountUp } from "./LandingMotion";

export type DemoVariant = "work" | "platforms" | "annual" | "garage";

type DashboardMockupProps = {
  copy: LandingV1Copy;
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

function MiniBars({ variant }: { variant: DemoVariant }) {
  const bars = variant === "annual" ? [34, 47, 42, 61, 57, 75, 69, 88, 79, 92, 84, 96] : [42, 68, 54, 82, 63, 92, 76];
  return (
    <div className="flex h-24 items-end gap-1.5" aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={`${variant}-${index}`}
          className="min-w-0 flex-1 rounded-t-md bg-gradient-to-t from-sky-600/35 via-violet-500/70 to-fuchsia-300 shadow-[0_0_16px_rgba(139,92,246,0.16)]"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function DashboardMockup({ copy, lang, variant = "work", compact = false }: DashboardMockupProps) {
  const locale = localeByLanguage[lang];
  const label = copy.product.previewLabels[variant];

  return (
    <div role="img" aria-label={`${copy.demo.ariaLabel}. ${label}.`} className={`landing-dashboard relative min-w-0 max-w-full overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0c101a]/95 shadow-[0_35px_120px_rgba(0,0,0,0.62),0_0_90px_rgba(76,29,149,0.15)] ${compact ? "p-4" : "p-3 sm:p-5"}`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(124,58,237,0.16),transparent_42%),radial-gradient(circle_at_0%_80%,rgba(14,165,233,0.12),transparent_38%)]" />
      <div aria-hidden="true" className="relative">
        <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400/20 to-fuchsia-500/20 text-xs font-black text-sky-200">CD</span>
            <div>
              <p className="text-xs font-bold text-white">CourierDash</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">{copy.demo.label}</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">{copy.product.previewLabels.active}</span>
        </div>

        {variant === "platforms" ? (
          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="grid place-items-center rounded-2xl border border-white/8 bg-white/[0.025] p-4">
              <div className="relative grid size-32 place-items-center rounded-full bg-[conic-gradient(#38bdf8_0_32%,#8b5cf6_32%_57%,#ec4899_57%_77%,#22c55e_77%_91%,#64748b_91%)]">
                <div className="grid size-20 place-items-center rounded-full bg-[#0d111b] text-center"><span className="text-[10px] uppercase tracking-widest text-slate-500">{copy.demo.income}</span><strong className="text-base text-white">8.4k</strong></div>
              </div>
            </div>
            <div className="space-y-2">
              {[["Glovo", "32%", "bg-sky-400"], ["Uber Eats", "25%", "bg-violet-400"], ["Wolt", "20%", "bg-fuchsia-400"], ["Bolt Food", "14%", "bg-emerald-400"], [copy.platforms.other, "9%", "bg-slate-500"]].map(([name, share, color]) => (
                <div key={name} className="flex items-center justify-between rounded-xl border border-white/7 bg-white/[0.025] px-3 py-2 text-xs"><span className="flex items-center gap-2 text-slate-300"><i className={`size-2 rounded-full ${color}`} />{name}</span><strong className="text-white">{share}</strong></div>
              ))}
            </div>
          </div>
        ) : variant === "garage" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{copy.product.previewLabels.odometer}</p>
              <p className="mt-2 text-2xl font-black text-white">12 860 <span className="text-sm text-slate-500">{copy.demo.kmUnit}</span></p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" /></div>
              <p className="mt-2 text-[10px] text-emerald-300">68% · {copy.product.previewLabels.serviceInterval}</p>
            </div>
            <div className="space-y-2">
              {[copy.product.previewLabels.driveBelt, copy.product.previewLabels.brakePads, copy.product.previewLabels.engineOil].map((item, index) => (
                <div key={item} className="rounded-xl border border-white/7 bg-white/[0.025] p-3"><div className="flex items-center justify-between text-xs"><span className="text-slate-300">{item}</span><span className={index === 1 ? "text-amber-300" : "text-emerald-300"}>{index === 1 ? "82%" : `${45 + index * 8}%`}</span></div></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                [copy.demo.income, <><CountUp key="income" value={8420} locale={locale} /> <small>{copy.demo.currency}</small></>],
                [copy.demo.hours, <><CountUp key="hours" value={132} locale={locale} /> <small>{copy.demo.hourUnit}</small></>],
                [copy.demo.orders, <CountUp key="orders" value={412} locale={locale} />],
                [copy.demo.hourlyRate, <><CountUp key="rate" value={63.79} decimals={2} locale={locale} /> <small>{copy.demo.currency}</small></>],
                [copy.demo.distance, <><CountUp key="distance" value={1286} locale={locale} /> <small>{copy.demo.kmUnit}</small></>],
              ].map(([metricLabel, value], index) => (
                <div key={String(metricLabel)} className={`rounded-xl border border-white/8 bg-white/[0.025] p-2.5 ${index === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                  <p className="truncate text-[9px] uppercase tracking-wider text-slate-500">{metricLabel}</p>
                  <p className="mt-1 whitespace-nowrap text-sm font-black text-white sm:text-base">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3">
              <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-400">{variant === "annual" ? copy.product.previewLabels.annual : copy.demo.trend}</span><span className="text-[9px] text-emerald-300">+12.4%</span></div>
              <MiniBars variant={variant} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
