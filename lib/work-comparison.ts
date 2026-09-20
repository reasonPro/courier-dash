import { createWorkTaxContext, type WorkTaxSettings } from "./work-finance"
import { PLATFORM_KEYS, type PlatformKey, type PlatformMetricSource } from "./work-platforms"
import { hasPlatformActivity, projectShift, summarizeDisplayedIncome } from "./work-view"

export function localCalendarDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}
export type ComparisonReason = "loading" | "error" | "future" | "noDays" | "noRecords" | "taxes" | "fixed" | "hours" | "base"
export function comparisonPeriods(month: string, today: string) {
  const [year, m] = month.split("-").map(Number)
  const previous = m === 1 ? `${year - 1}-12` : `${year}-${String(m - 1).padStart(2, "0")}`
  const days = (y: number, n: number) => new Date(y, n, 0, 12).getDate()
  const current = month === today.slice(0, 7)
  const previousDays = days(m === 1 ? year - 1 : year, m === 1 ? 12 : m - 1)
  const n = current ? Math.min(Number(today.slice(8)) - 1, previousDays) : days(year, m)
  const end = (value: string, day: number) => `${value}-${String(day).padStart(2, "0")}`
  return { current, start: `${month}-01`, end: end(month, Math.max(1, n)),
    previousStart: `${previous}-01`, previousEnd: end(previous, current ? Math.max(1, n) : previousDays),
    reason: month > today.slice(0, 7) ? "future" as const : n === 0 ? "noDays" as const : null }
}
type Row = PlatformMetricSource & { date: string; hours: number; km: number }
export type ComparisonMetric = { current: number | null; previous: number | null; percent: number | null; reason: ComparisonReason | null }
export function percentChange(current: number | null, previous: number | null, reason: ComparisonReason | null = null): ComparisonMetric {
  if (reason) return { current, previous, percent: null, reason }
  if (current === null || previous === null || !Number.isFinite(current) || !Number.isFinite(previous))
    return { current, previous, percent: null, reason: "hours" }
  if (previous <= 0) return { current, previous, percent: null, reason: "base" }
  const percent = (current - previous) / previous * 100
  return { current, previous, percent: Number.isFinite(percent) ? percent : null, reason: Number.isFinite(percent) ? null : "base" }
}
export function compareWorkPeriods(rows: Row[], month: string, today: string, options: {
  platforms: PlatformKey[] | null; app: boolean; cash: boolean; bonus: boolean; netto: boolean;
  taxes: WorkTaxSettings | null; state: "ready" | "loading" | "error";
}) {
  const periods = comparisonPeriods(month, today)
  const blocked = options.state !== "ready" ? options.state : periods.reason
  const period = (start: string, end: string) => {
    const fullMonth = rows.filter(r => r.date.startsWith(start.slice(0, 7)))
    const selected = options.platforms ?? [...PLATFORM_KEYS]
    const source = fullMonth.filter(r => r.date >= start && r.date <= end &&
      (options.platforms === null || selected.some(p => hasPlatformActivity(r, p))))
    if (!source.length) return { income: null, rate: null, daily: null, reason: "noRecords" as ComparisonReason }
    const context = createWorkTaxContext(fullMonth, options.taxes, options.app, options.bonus)
    if (options.netto && !context.configured) return { income: null, rate: null, daily: null, reason: "taxes" as ComparisonReason }
    // Never invent partial-month or platform-subset allocation of existing fixed fees.
    if (options.netto && context.fixedTax > 0 && (periods.current || options.platforms !== null))
      return { income: null, rate: null, daily: null, reason: "fixed" as ComparisonReason }
    const projected = source.map(r => projectShift(r, selected, context, options.netto, options.platforms === null,
      options.app, options.bonus, options.cash))
    const income = summarizeDisplayedIncome(projected).income
    const hours = projected.reduce((sum, r) => sum + r.hours, 0)
    const workingDays = new Set(source.map(r => r.date)).size
    return { income, daily: income / workingDays, rate: hours > 0 && Number.isFinite(hours) ? income / hours : null, reason: null }
  }
  const a = blocked ? { income: null, rate: null, daily: null, reason: blocked } : period(periods.start, periods.end)
  const b = blocked ? { income: null, rate: null, daily: null, reason: blocked } : period(periods.previousStart, periods.previousEnd)
  const reason = blocked ?? a.reason ?? b.reason
  return { periods, income: percentChange(a.income, b.income, reason), rate: percentChange(a.rate, b.rate, reason), daily: percentChange(a.daily, b.daily, reason) }
}
export type WorkComparison = ReturnType<typeof compareWorkPeriods>
