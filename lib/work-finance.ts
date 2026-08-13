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

export function calculateMonthlyWorkFinance(
  shifts: MonthlyFinanceShift[],
  settings: WorkTaxSettings | null,
): MonthlyWorkFinance {
  const platformStats = Object.fromEntries(
    TAX_PLATFORM_KEYS.map((platform) => [
      platform,
      { gross: 0, days: 0, weeks: new Set<number>() },
    ]),
  ) as Record<
    TaxPlatformKey,
    { gross: number; days: number; weeks: Set<number> }
  >
  let fleetGross = 0
  let grossIncome = 0

  shifts.forEach((shift) => {
    const week = getIsoWeek(shift.date)

    PLATFORM_KEYS.forEach((platform) => {
      const metrics = getPlatformMetrics(shift, platform)
      grossIncome +=
        metrics.income + metrics.appTips + metrics.cashTips + metrics.bonuses

      if (!isTaxPlatformKey(platform)) return

      const taxableGross = metrics.income + metrics.appTips + metrics.bonuses
      if (taxableGross > 0 || metrics.orders > 0) {
        platformStats[platform].gross += taxableGross
        platformStats[platform].days += 1
        platformStats[platform].weeks.add(week)
        if (platform !== "glovo") fleetGross += taxableGross
      }
    })
  })

  const taxesConfigured = areTaxesConfigured(settings)
  if (!taxesConfigured || !settings) {
    return {
      grossIncome: grossIncome.toFixed(2),
      netIncome: null,
      taxAmount: null,
      taxesConfigured: false,
    }
  }

  const percentages: Record<TaxPlatformKey, number> = {
    uber: 0,
    wolt: 0,
    bolt: 0,
    glovo: 0,
  }
  let fixedTax = 0

  TAX_PLATFORM_KEYS.forEach((platform) => {
    const type = settings[`${platform}_type` as keyof WorkTaxSettings]
    const value =
      Number(settings[`${platform}_val` as keyof WorkTaxSettings]) || 0

    if (type === "percent") {
      percentages[platform] = value / 100
    } else if (platformStats[platform].days > 0) {
      if (type === "fixed_week") {
        fixedTax += value * Math.min(4, platformStats[platform].weeks.size)
      } else if (type === "fixed_month") {
        fixedTax += value
      }
    }
  })

  const fleetFixedRatio = fleetGross > 0 ? fixedTax / fleetGross : 0
  let netIncome = 0

  shifts.forEach((shift) => {
    PLATFORM_KEYS.forEach((platform) => {
      const metrics = getPlatformMetrics(shift, platform)
      const taxableGross = metrics.income + metrics.appTips + metrics.bonuses

      if (isTaxPlatformKey(platform) && taxableGross > 0) {
        let platformNet = taxableGross - taxableGross * percentages[platform]
        if (platform !== "glovo") {
          platformNet -= taxableGross * fleetFixedRatio
        }
        netIncome += platformNet + metrics.cashTips
      } else {
        netIncome += taxableGross + metrics.cashTips
      }
    })
  })

  return {
    grossIncome: grossIncome.toFixed(2),
    netIncome: netIncome.toFixed(2),
    taxAmount: (grossIncome - netIncome).toFixed(2),
    taxesConfigured: true,
  }
}
