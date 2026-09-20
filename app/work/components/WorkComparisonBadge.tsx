import { useId, useRef, useState } from "react";
import type { WorkComparison } from "../../../lib/work-comparison";
import { comparisonTranslations } from "../../../lib/work-comparison-translations";
import type { WorkLanguage } from "../work-page.types";

export function WorkComparisonBadge({ comparison, metric, lang }: { comparison: WorkComparison; metric: "income" | "rate"; lang: WorkLanguage }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const copy = comparisonTranslations[lang];
  const value = comparison[metric];
  const rounded = value.percent === null ? null : Math.round(value.percent * 10) / 10;
  const format = new Intl.NumberFormat(lang === "uk" ? "uk-UA" : lang, { maximumFractionDigits: 1 });
  const badge = rounded === null ? "—" : rounded === 0 ? "0%" : `${rounded > 0 ? "↑ +" : "↓ −"}${format.format(Math.abs(rounded))}%`;
  const money = (amount: number | null) => amount === null ? "—" : new Intl.NumberFormat(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  const unit = metric === "rate" ? copy.unit : "PLN";
  const p = comparison.periods;
  return <>
    <button type="button" popoverTarget={id} aria-label={`${copy.title}: ${copy[metric]} ${badge}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={id}
      className={`mx-auto min-h-8 rounded px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-cyan-300 ${rounded !== null && rounded > 0 ? "text-green-400" : rounded !== null && rounded < 0 ? "text-rose-400" : "text-gray-400"}`}>{badge}</button>
    <div id={id} ref={ref} popover="auto" role="dialog" aria-labelledby={`${id}-title`} tabIndex={-1}
      onToggle={event => { setOpen(event.newState === "open"); if (event.newState === "open") ref.current?.focus(); }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm max-h-[calc(100dvh-2rem)] overflow-auto rounded-xl border border-gray-700 bg-[#1e1e24] p-4 text-left text-sm text-gray-300 shadow-2xl [overflow-wrap:anywhere]">
      <h4 id={`${id}-title`} className="mb-3 font-bold text-white">{copy.title}: {copy[metric]}</h4>
      <p>{p.start} – {p.end}: {money(value.current)} {unit}</p>
      <p>{p.previousStart} – {p.previousEnd}: {money(value.previous)} {unit}</p>
      <p className="mt-2">{value.reason ? copy[value.reason] : badge}</p>
      {p.current && <p className="mt-2">{copy.today}</p>}
      <p className="mt-2 text-gray-400">{copy.recorded}</p>
    </div>
  </>;
}
