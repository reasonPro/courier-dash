import {
  PLATFORM_KEYS,
  TAX_PLATFORM_KEYS,
  getPlatformMetrics,
  isTaxPlatformKey,
  type PlatformMetricSource,
  type TaxPlatformKey,
} from "./work-platforms"

export type WorkTaxSettings = {
  uber_type: string
  uber_val: number | string
  wolt_type: string
  wolt_val: number | string
  bolt_type: string
  bolt_val: number | string
  glovo_type: string
  glovo_val: number | string
  // Optional when reading a pre-Pyszne snapshot; absent means not configured.
  pyszne_type?: string | null
  pyszne_val?: number | string | null
}

export type MonthlyFinanceShift = PlatformMetricSource & {
  date: string
}

export type MonthlyWorkFinance = {
  grossIncome: string
  netIncome: string | null
  taxAmount: string | null
  taxesConfigured: boolean
}

function getIsoWeek(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  date.setDate(date.getDate() + 3 - (date.getDay() || 7))
  const firstWeek = new Date(date.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((date.getTime() - firstWeek.getTime()) / 86_400_000 -
        3 +
        (firstWeek.getDay() || 7)) /
        7,
    )
  )
}

export function areTaxesConfigured(settings: WorkTaxSettings | null) {
  if (!settings) return false

  return TAX_PLATFORM_KEYS.some((platform) => {
    const type = settings[`${platform}_type` as keyof WorkTaxSettings]
    const value =
      Number(settings[`${platform}_val` as keyof WorkTaxSettings]) || 0
    return type !== "none" && value > 0
  })
}

/** One full-month context preserves the existing fixed-fee model. Never rebuild it per row. */
export function createWorkTaxContext(
  shifts: MonthlyFinanceShift[],
  settings: WorkTaxSettings | null,
  includeTips = true,
  includeBonuses = true,
) {
  const stats = Object.fromEntries(TAX_PLATFORM_KEYS.map(p => [p, { active: false, weeks: new Set<number>() }])) as
    Record<TaxPlatformKey, { active: boolean; weeks: Set<number> }>
  let fleetGross = 0
  shifts.forEach(shift => TAX_PLATFORM_KEYS.forEach(p => {
    const m = getPlatformMetrics(shift, p)
    const gross = m.income + (includeTips ? m.appTips : 0) + (includeBonuses ? m.bonuses : 0)
    if (gross > 0 || m.orders > 0) {
      stats[p].active = true
      stats[p].weeks.add(getIsoWeek(shift.date))
      if (p !== "glovo") fleetGross += gross
    }
  }))
  let fixedTax = 0
  const percentages = Object.fromEntries(TAX_PLATFORM_KEYS.map(p => [p, 0])) as Record<TaxPlatformKey, number>
  if (settings) TAX_PLATFORM_KEYS.forEach(p => {
    const type = settings[`${p}_type`]
    const value = Number(settings[`${p}_val`]) || 0
    if (type === "percent") percentages[p] = value / 100
    else if (stats[p].active) {
      if (type === "fixed_week") fixedTax += value * Math.min(4, stats[p].weeks.size)
      if (type === "fixed_month") fixedTax += value
    }
  })
  return {
    configured: areTaxesConfigured(settings),
    fixedTax,
    ratio: fleetGross > 0 ? fixedTax / fleetGross : 0,
    percentages,
  }
}

export type WorkTaxContext = ReturnType<typeof createWorkTaxContext>

/** Cash tips remain untouched; online tips and bonuses follow the existing deduction ratio. */
export function displayedPlatformMetrics(
  source: PlatformMetricSource,
  platform: import("./work-platforms").PlatformKey,
  context: WorkTaxContext,
  netto: boolean,
  includeTips = true,
  includeBonuses = true,
) {
  const m = getPlatformMetrics(source, platform)
  const appTips = includeTips ? m.appTips : 0
  const cashTips = includeTips ? m.cashTips : 0
  const bonuses = includeBonuses ? m.bonuses : 0
  const taxable = m.income + appTips + bonuses
  const ratio = netto && isTaxPlatformKey(platform) && taxable > 0
    ? 1 - context.percentages[platform] - (platform === "glovo" ? 0 : context.ratio)
    : 1
  return { ...m, income: m.income * ratio, appTips: appTips * ratio, cashTips,
    tips: appTips * ratio + cashTips, bonuses: bonuses * ratio }
}

export function calculateMonthlyWorkFinance(
  shifts: MonthlyFinanceShift[],
  settings: WorkTaxSettings | null,
): MonthlyWorkFinance {
  const context = createWorkTaxContext(shifts, settings)
  let gross = 0
  let net = 0
  shifts.forEach(shift => PLATFORM_KEYS.forEach(p => {
    const m = getPlatformMetrics(shift, p)
    gross += m.income + m.tips + m.bonuses
    const n = displayedPlatformMetrics(shift, p, context, true)
    net += n.income + n.tips + n.bonuses
  }))
  return { grossIncome: gross.toFixed(2), netIncome: context.configured ? net.toFixed(2) : null,
    taxAmount: context.configured ? (gross - net).toFixed(2) : null,
    taxesConfigured: context.configured }
}
