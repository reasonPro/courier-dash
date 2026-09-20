import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { createWorkTaxContext } from "../lib/work-finance"
import { projectShift, summarizeDisplayedIncome } from "../lib/work-view"
import { WorkSummary } from "../app/work/components/WorkSummary"
import { translations } from "../lib/translations"

const row = { date: "2026-09-01", hours: 1, km: 5, pyszne: 100,
  tips_pyszne: 10, cash_tips_pyszne: 20, bonuses_pyszne: 30, orders_pyszne: 1 }
const tax = { uber_type: "none", uber_val: 0, wolt_type: "none", wolt_val: 0,
  bolt_type: "none", bolt_val: 0, glovo_type: "none", glovo_val: 0,
  pyszne_type: "percent", pyszne_val: 10 }
const combinations = [false, true].flatMap(app => [false, true].flatMap(cash =>
  [false, true].flatMap(bonus => [false, true].map(net => ({ app, cash, bonus, net })))))

describe("Independent Work income components", () => {
  it.each(combinations)("app=$app cash=$cash bonus=$bonus net=$net", ({app, cash, bonus, net}) => {
    const original = structuredClone(row)
    const context = createWorkTaxContext([row], tax, app, bonus)
    const view = projectShift(row, ["pyszne"], context, net, true, app, bonus, cash)
    const result = summarizeDisplayedIncome([view])
    const multiplier = net ? 0.9 : 1
    const tips = (app ? 10 * multiplier : 0) + (cash ? 20 : 0)
    const income = 100 * multiplier + tips + (bonus ? 30 * multiplier : 0)
    expect(result.income).toBeCloseTo(income)
    expect(result.tips).toBeCloseTo(tips)
    expect(result.cashTips).toBe(cash ? 20 : 0)
    expect(result.bonuses).toBeCloseTo(bonus ? 30 * multiplier : 0)
    expect(result.tipsPercent).toBeCloseTo(tips / income * 100)
    expect(row).toEqual(original)
  })

  it("uses the requested cash-only 120 / 20 / 16.67% example", () => {
    const view = projectShift(row, ["pyszne"], createWorkTaxContext([row], tax, false, false), false, true, false, false, true)
    const result = summarizeDisplayedIncome([view])
    expect(result.income).toBe(120)
    expect(result.tips).toBe(20)
    expect(result.tipsPercent?.toFixed(2)).toBe("16.67")
  })

  it("keeps zero distinct from unavailable and limits sums to the selected month/platform", () => {
    const rows = [row, { ...row, date: "2026-10-01", cash_tips_pyszne: 999 }]
    const month = rows.filter(r => r.date.startsWith("2026-09"))
    const context = createWorkTaxContext(month, tax)
    expect(summarizeDisplayedIncome(month.map(r => projectShift(r, ["pyszne"], context, false, true))).cashTips).toBe(20)
    expect(summarizeDisplayedIncome(month.map(r => projectShift(r, ["uber"], context, false, false)))).toMatchObject({ income: 0, tips: 0, tipsPercent: null })
    expect(summarizeDisplayedIncome([{ uber: 100 }])).toMatchObject({ tips: 0, tipsPercent: 0 })
    expect(summarizeDisplayedIncome([row], true).tipsPercent).toBeNull()
    expect(summarizeDisplayedIncome([]).tipsPercent).toBeNull()
  })

  it("preserves legacy combined flags and the existing fixed-fee context without allocating subsets", () => {
    for (const type of ["fixed_week", "fixed_month"]) {
      const context = createWorkTaxContext([row], { ...tax, pyszne_type: type, pyszne_val: 30 }, false, true)
      expect(context.fixedTax).toBe(30)
      const before = structuredClone(context)
      const legacy = projectShift(row, ["pyszne"], context, true, true, false, true)
      expect(legacy.tips_pyszne).toBe(0)
      expect(legacy.cash_tips_pyszne).toBe(0)
      const cash = projectShift(row, ["pyszne"], context, true, true, false, true, true)
      expect(cash.cash_tips_pyszne).toBe(20)
      expect(summarizeDisplayedIncome([cash]).income).toBeCloseTo(120)
      expect(context).toEqual(before)
    }
  })
})

type Props = Parameters<typeof WorkSummary>[0]
const summaryProps: Props = {
  lang: "uk", translations: translations.uk, includeAppTips: true, includeCashTips: true,
  includeBonuses: true, appTips: 0, cashTips: 0, bonuses: 0,
  avgEarnedPerDay: "0.00", avgHoursPerDay: "—", avgOrdersPerDay: "—", avgPerHour: "—",
  avgPerKm: "—", avgPerOrder: "—", bestShiftDate: "", isNetto: false, maxEarned: 0,
  onShowBestMonthDayChange: () => {}, showBestMonthDay: false, tipsPercent: "—",
  totalHours: 0, totalKm: 0, totalOrders: 0, totalVisualEarned: 0,
}
const render = (props: Partial<Props> = {}) => renderToStaticMarkup(createElement(WorkSummary, { ...summaryProps, ...props }))

describe("Monthly component cards", () => {
  it("shows enabled zero amounts, hides only disabled components and cards", () => {
    expect(render({ tipsPercent: "6.86" })).toContain("6,86%")
    expect(render()).not.toContain('data-testid="work-tips-percent-card"')
    expect(render()).toContain("Готівка: 0.00 PLN")
    expect(render()).toContain("Додаток: 0.00 PLN")
    expect(render({ includeAppTips: false })).not.toContain("Додаток:")
    expect(render({ includeCashTips: false })).not.toContain("Готівка:")
    const hidden = render({ includeAppTips: false, includeCashTips: false, includeBonuses: false })
    expect(hidden).not.toContain('data-testid="work-tips-card"')
    expect(hidden).not.toContain('data-testid="work-tips-percent-card"')
    expect(hidden).not.toContain('data-testid="work-bonuses-card"')
  })
  it("does not present gross component money as NETTO when unavailable", () => {
    const html = render({ isNetto: true, moneyUnavailable: true, appTips: 111, cashTips: 222, bonuses: 333 })
    expect(html).toContain("Готівка: — PLN")
    expect(html).not.toContain("111.00")
    expect(html).not.toContain("333.00")
  })
  it.each(["uk", "pl", "en", "ru"] as const)("renders large amounts and component labels in %s", lang => {
    const html = render({ lang, translations: translations[lang], appTips: 999999.99, cashTips: 999999.99 })
    expect(html).toContain("1999999.98")
    expect(html).toContain("999999.99 PLN")
  })
})
