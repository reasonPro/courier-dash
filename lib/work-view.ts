import { PLATFORM_KEYS, getPlatformMetrics, type PlatformKey, type PlatformMetricSource } from "./work-platforms"
import { displayedPlatformMetrics, type WorkTaxContext } from "./work-finance"

/** Activity is based on recorded metrics, not a saved platform preference/name. */
export function hasPlatformActivity(source: PlatformMetricSource, platform: PlatformKey) {
  const m = getPlatformMetrics(source, platform)
  return [m.income, m.orders, m.appTips, m.cashTips, m.bonuses].some(value => value !== 0)
}

export function availablePlatforms(rows: PlatformMetricSource[]) {
  return PLATFORM_KEYS.filter(platform => rows.some(row => hasPlatformActivity(row, platform)))
}

export function togglePlatform(current: PlatformKey[], platform: PlatformKey) {
  if (!current.includes(platform)) return [...current, platform]
  return current.length > 1 ? current.filter(value => value !== platform) : current
}

/** Display-only copy. Editing must resolve the original row by id. */
export function projectShift<T extends PlatformMetricSource & { hours: number; km: number }>(
  source: T, selected: PlatformKey[], context: WorkTaxContext, netto: boolean,
  sharedMetricsKnown: boolean, includeTips = true, includeBonuses = true,
  includeCashTips = includeTips,
): T {
  const result: Record<string, unknown> = { ...source }
  for (const p of PLATFORM_KEYS) {
    const m = displayedPlatformMetrics(source, p, context, netto, includeTips, includeBonuses, includeCashTips)
    const active = selected.includes(p)
    result[p === "other" ? "other_income" : p] = active ? m.income : 0
    result[`orders_${p}`] = active ? m.orders : 0
    result[`tips_${p}`] = active ? m.appTips : 0
    result[`cash_tips_${p}`] = active ? m.cashTips : 0
    result[`bonuses_${p}`] = active ? m.bonuses : 0
  }
  if (!selected.includes("other")) result.other_platform_name = null
  // NaN is an internal unavailable sentinel, never persisted or charted as zero.
  if (!sharedMetricsKnown) { result.hours = NaN; result.km = NaN }
  return result as T
}

/** The same display projection feeds cards, best day, chart and history. No stored rows change. */
export function summarizeDisplayedIncome(rows: PlatformMetricSource[], unavailable = false) {
  let income = 0, appTips = 0, cashTips = 0, bonuses = 0
  for (const row of rows) for (const platform of PLATFORM_KEYS) {
    const m = getPlatformMetrics(row, platform)
    income += m.income + m.tips + m.bonuses
    appTips += m.appTips
    cashTips += m.cashTips
    bonuses += m.bonuses
  }
  const tips = appTips + cashTips
  return { income, appTips, cashTips, tips, bonuses,
    tipsPercent: unavailable || income === 0 ? null : tips / income * 100 }
}
