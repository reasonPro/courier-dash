"use client"
import { useState } from "react"
import { useLanguage } from "../../context/LanguageContext"
import { createWorkTaxContext, type WorkTaxSettings } from "../../lib/work-finance"
import { availablePlatforms, hasPlatformActivity, projectShift } from "../../lib/work-view"
import { workViewTranslations } from "../../lib/work-view-translations"
import { buildPlatformShiftPayload, createEmptyPlatformValues, getShiftPlatformTotals, type PlatformKey } from "../../lib/work-platforms"
import { WorkHistory } from "../work/components/WorkHistory"
import { WorkSummary } from "../work/components/WorkSummary"
import { WorkFilters } from "../work/components/WorkFilters"
import { WorkPlatformFilter } from "../work/components/WorkPlatformFilter"
import { WorkChart } from "../work/components/WorkChart"
import type { Shift } from "../work/work-page.types"

const empty = buildPlatformShiftPayload([], {
  earnings: createEmptyPlatformValues(), orders: createEmptyPlatformValues(),
  tips: createEmptyPlatformValues(), cashTips: createEmptyPlatformValues(), bonuses: createEmptyPlatformValues(),
}, "")
function synthetic(id: number, date: string, data: Partial<Shift>): Shift {
  return { ...empty, id, date, hours: 5, km: 30, user_id: "synthetic-only",
    created_at: date + "T12:00:00Z", tips: null, bonuses: null, ...data }
}
const records = [
  synthetic(1, "2026-09-03", { uber: 100, cash_tips_uber: 20, orders_uber: 4 }),
  synthetic(2, "2026-09-02", { wolt: 200, orders_wolt: 8, tips_wolt: 10 }),
  synthetic(3, "2026-09-02", { uber: 50, wolt: 50, orders_uber: 2, orders_wolt: 2, bonuses_uber: 10 }),
  synthetic(4, "2026-08-01", { bonuses_stuart: 15, orders_stuart: 1 }),
]
export function WorkDemo() {
  const { lang, setLanguage, t } = useLanguage()
  const copy = workViewTranslations[lang]
  const [month, setMonth] = useState("2026-09")
  const [selected, setSelected] = useState<PlatformKey[] | null>(null)
  const [netto, setNetto] = useState(false)
  const [tableNetto, setTableNetto] = useState(false)
  const [includeTips, setTips] = useState(true)
  const [includeBonuses, setBonuses] = useState(true)
  const [fixed, setFixed] = useState(false)
  const [bestVisible, setBestVisible] = useState(false)
  const [mobileTable, setMobileTable] = useState(false)
  const [original, setOriginal] = useState<Shift | null>(null)
  const rows = records.filter(r => r.date.startsWith(month))
  const available = availablePlatforms(rows)
  const platforms = selected ?? available
  const all = platforms.length === available.length
  const settings: WorkTaxSettings = {
    uber_type: fixed ? "fixed_month" : "percent", uber_val: fixed ? 30 : 10,
    wolt_type: "percent", wolt_val: 20, bolt_type: "none", bolt_val: 0, glovo_type: "none", glovo_val: 0,
  }
  const context = createWorkTaxContext(rows, settings, includeTips, includeBonuses)
  const unavailable = !all && context.fixedTax > 0
  const chosen = rows.filter(r => all || platforms.some(p => hasPlatformActivity(r, p)))
  const project = (mode: boolean) => chosen.map(r => projectShift(r, platforms, context, mode && !unavailable, all, includeTips, includeBonuses))
  const visual = project(netto)
  const money = visual.map(r => { const m = getShiftPlatformTotals(r); return m.income + m.tips + m.bonuses })
  const total = money.reduce((a, b) => a + b, 0)
  const hours = all ? visual.reduce((a, r) => a + r.hours, 0) : NaN
  const km = all ? visual.reduce((a, r) => a + r.km, 0) : NaN
  const orders = visual.reduce((a, r) => a + getShiftPlatformTotals(r).orders, 0)
  const dates = new Map<string, number>()
  visual.forEach((r, i) => dates.set(r.date, (dates.get(r.date) ?? 0) + money[i]))
  const best = [...dates].sort((a, b) => b[1] - a[1])[0]
  const mean = (n: number, d: number) => !(netto && unavailable) && d > 0 ? (n / d).toFixed(2) : "—"
  return <main className="min-h-screen bg-[#121212] p-4 text-white md:p-10"><div className="mx-auto max-w-6xl">
    <p className="mb-3 rounded-xl border border-cyan-800 p-3 text-sm text-cyan-300">{copy.demo}</p>
    <div className="mb-4 flex flex-wrap gap-2">
      {(["uk", "pl", "en", "ru"] as const).map(l => <button className="rounded border border-gray-700 px-3 py-1" key={l} onClick={() => setLanguage(l)}>{l.toUpperCase()}</button>)}
      <button className="rounded border border-gray-700 px-3 py-1" onClick={() => setFixed(!fixed)} aria-pressed={fixed}>{t.work.taxesBtn}: {fixed ? "30 PLN" : "10% / 20%"}</button>
    </div>
    <WorkFilters hasTaxesConfigured includeTips={includeTips} includeBonuses={includeBonuses} isNetto={netto} lang={lang}
      onBruttoSelect={() => setNetto(false)} onNettoSelect={() => setNetto(true)}
      onIncludeTipsChange={setTips} onIncludeBonusesChange={setBonuses} onOpenTaxSettings={() => setFixed(!fixed)}
      onSelectedMonthChange={value => { setMonth(value); setSelected(null) }} selectedMonth={month} translations={t} />
    <WorkSummary avgEarnedPerDay={mean(total, dates.size)} avgHoursPerDay={all && dates.size ? (hours / dates.size).toFixed(1) : "—"}
      avgOrdersPerDay={dates.size ? (orders / dates.size).toFixed(1) : "—"} avgPerHour={mean(total, hours)} avgPerKm={mean(total, km)} avgPerOrder={mean(total, orders)}
      bestShiftDate={netto && unavailable ? "" : best?.[0] ?? ""} maxEarned={best?.[1] ?? 0} isNetto={netto}
      onShowBestMonthDayChange={setBestVisible} showBestMonthDay={bestVisible} tipsPercent={total > 0 ? (visual.reduce((sum, r) => sum + getShiftPlatformTotals(r).tips, 0) / total * 100).toFixed(1) : "0"}
      totalHours={hours} totalKm={km} totalOrders={orders} totalVisualEarned={total} moneyUnavailable={netto && unavailable} translations={t}
      platformFilter={<><WorkPlatformFilter available={available} selected={platforms} onChange={setSelected} lang={lang} otherLabel={t.work.otherPlatform} />
        {!all && <p className="mb-3 text-xs text-gray-400">{copy.shared}</p>}
        {netto && unavailable && <p className="mb-3 text-xs text-amber-300">{copy.fixed}</p>}</>} />
    {visual.length > 0 && !(netto && unavailable) && <WorkChart isNetto={netto} translations={t}
      data={{ labels: visual.map(r => r.date), datasets: [{ type: "bar", label: netto ? t.work.netto : t.work.brutto, data: money, backgroundColor: "#16a34a" }] }}
      options={{ responsive: true, maintainAspectRatio: false }} />}
    <WorkHistory getMetricTooltip={() => ""} isLoading={false} lang={lang} translations={t}
      netto={tableNetto} onNettoChange={setTableNetto} moneyUnavailable={tableNetto && unavailable} unavailableReason={copy.fixed}
      onDelete={() => undefined} onEdit={view => setOriginal(records.find(r => r.id === view.id) ?? null)}
      onShowMobileTableChange={setMobileTable} showMobileTable={mobileTable} shifts={project(tableNetto)} />
    {original && <div role="dialog" aria-modal="true" aria-label={t.common.edit} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-gray-900 p-4">
        <p>{copy.demo}</p><pre className="overflow-auto text-xs">{JSON.stringify(original, null, 2)}</pre>
        <button className="mt-3 rounded border px-4 py-2" onClick={() => setOriginal(null)}>{t.common.cancel}</button>
      </div>
    </div>}
  </div></main>
}
