import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { calculateMonthlyWorkFinance, createWorkTaxContext, displayedPlatformMetrics, type WorkTaxSettings } from "../lib/work-finance"
import { PLATFORM_KEYS, TAX_PLATFORM_KEYS, type PlatformKey } from "../lib/work-platforms"
import { projectShift, summarizeDisplayedIncome } from "../lib/work-view"
import { translations } from "../lib/translations"

const defaults: WorkTaxSettings = {
  uber_type: "none", uber_val: 0, wolt_type: "none", wolt_val: 0,
  bolt_type: "none", bolt_val: 0, glovo_type: "none", glovo_val: 0,
}
function settings(p: PlatformKey, type: string, value: number): WorkTaxSettings {
  return { ...defaults, [`${p}_type`]: type, [`${p}_val`]: value }
}
function row(p: PlatformKey, base = 1000, extras = 0, date = "2026-10-01") {
  return { date, hours: 5, km: 20, [p === "other" ? "other_income" : p]: base,
    [`orders_${p}`]: 1, [`tips_${p}`]: extras, [`cash_tips_${p}`]: extras,
    [`bonuses_${p}`]: extras, other_platform_name: "Pyszne" }
}

describe.each(PLATFORM_KEYS)("tax settings: %s", p => {
  it.each([undefined, "none", "percent"])("keeps absent/none/zero unconfigured: %s", mode => {
    const tax = mode ? settings(p, mode, 0) : defaults
    const r = row(p)
    expect(calculateMonthlyWorkFinance([r], tax)).toMatchObject({ grossIncome: "1000.00", netIncome: null })
    expect(displayedPlatformMetrics(r, p, createWorkTaxContext([r], tax), true).income).toBe(1000)
  })
  it("calculates 1000 at 27.77 percent as 722.30", () => {
    expect(calculateMonthlyWorkFinance([row(p)], settings(p, "percent", 27.77)).netIncome).toBe("722.30")
  })
  it("taxes bonuses and online tips, never cash tips", () => {
    expect(calculateMonthlyWorkFinance([row(p, 1000, 100)], settings(p, "percent", 27.77)))
      .toMatchObject({ grossIncome: "1300.00", netIncome: "966.76", taxAmount: "333.24" })
  })
  it.each(["bonuses", "tips", "cash_tips"])("supports %s without base income", field => {
    const r = { date: "2026-10-01", [`${field}_${p}`]: 100 }
    expect(calculateMonthlyWorkFinance([r], settings(p, "percent", 27.77)).netIncome)
      .toBe(field === "cash_tips" ? "100.00" : "72.23")
  })
  it("keeps decimal amounts and rounds only the final result", () => {
    expect(calculateMonthlyWorkFinance([row(p, 123.45)], settings(p, "percent", 27.77)).netIncome).toBe("89.17")
  })
  it.each(["fixed_week", "fixed_month"])("preserves existing %s semantics, including Glovo exception", mode => {
    const rows = [row(p, 500, 0), row(p, 500, 0, "2026-10-02")]
    const tax = settings(p, mode, 100)
    expect(createWorkTaxContext(rows, tax).fixedTax).toBe(100)
    expect(calculateMonthlyWorkFinance(rows, tax).netIncome).toBe(p === "glovo" ? "1000.00" : "900.00")
    expect(createWorkTaxContext([], tax).fixedTax).toBe(0)
  })
  it("caps active ISO weeks at four and resets context at month boundary", () => {
    const rows = ["01", "05", "12", "19", "26"].map(day => row(p, 1000, 0, `2026-10-${day}`))
    const tax = settings(p, "fixed_week", 100)
    expect(createWorkTaxContext(rows, tax).fixedTax).toBe(400)
    expect(createWorkTaxContext([row(p, 1000, 0, "2026-12-31")], tax).fixedTax).toBe(100)
    expect(createWorkTaxContext([row(p, 1000, 0, "2027-01-01")], tax).fixedTax).toBe(100)
  })
  it("keeps shared projection and Expenses monthly totals aligned without duplicating hours/distance", () => {
    const rows = [row(p, 1000, 100), row(p, 50, 10, "2026-10-02")]
    const tax = settings(p, "percent", 27.77)
    const context = createWorkTaxContext(rows, tax)
    const projected = rows.map(r => projectShift(r, [...PLATFORM_KEYS], context, true, true))
    expect(summarizeDisplayedIncome(projected).income.toFixed(2)).toBe(calculateMonthlyWorkFinance(rows, tax).netIncome)
    expect(projected.reduce((s, r) => s + r.hours, 0)).toBe(10)
    expect(projected.reduce((s, r) => s + r.km, 0)).toBe(40)
    for (const tips of [true, false]) for (const bonuses of [true, false]) {
      const ctx = createWorkTaxContext(rows, tax, tips, bonuses)
      const view = rows.map(r => projectShift(r, [p], ctx, true, true, tips, bonuses))
      const expected = (1050 + (tips ? 110 : 0) + (bonuses ? 110 : 0)) * .7223 + (tips ? 110 : 0)
      expect(summarizeDisplayedIncome(view).income).toBeCloseTo(expected, 8)
    }
  })
})

describe("seven-platform compatibility", () => {
  it("keeps migration additive and preserves ownership and existing values", () => {
    const sql = readFileSync("supabase/migrations/202611210001_add_stuart_other_tax_settings.sql", "utf8")
    expect(sql.match(/add column /g)).toHaveLength(4)
    expect(sql.match(/add constraint /g)).toHaveLength(2)
    expect(sql).not.toMatch(/\b(update|delete|drop|truncate|grant|revoke)\s/i)
    expect(sql).toContain("default 'none'")
    expect(sql).toContain("default 0")
  })
  it("does not inherit another platform's percentage", () => {
    const rows = [{ date: "2026-10-01", uber: 1000, stuart: 1000 }]
    expect(calculateMonthlyWorkFinance(rows, settings("uber", "percent", 27.77)).netIncome).toBe("1722.30")
  })
  it("uses stable IDs even when Other is named Pyszne or renamed", () => {
    const tax = { ...settings("other", "percent", 20), pyszne_type: "percent", pyszne_val: 10 }
    for (const name of ["Pyszne", "Custom", "Stuart"]) {
      expect(calculateMonthlyWorkFinance([{ date: "2026-10-01", other_income: 1000, pyszne: 1000, other_platform_name: name }], tax).netIncome).toBe("1700.00")
    }
  })
  it.each(["uber", "wolt", "bolt", "pyszne", "stuart", "other"] as const)("shares %s fixed fees with other non-Glovo platforms, including none mode", p => {
    const companion = p === "uber" ? "wolt" : "uber"
    const r = { ...row(p), [companion]: 3000 }
    const tax = settings(p, "fixed_month", 100)
    const ctx = createWorkTaxContext([r], tax)
    expect(ctx.ratio).toBe(.025)
    expect(displayedPlatformMetrics(r, p, ctx, true).income).toBe(975)
    expect(displayedPlatformMetrics(r, companion, ctx, true).income).toBe(2925)
    expect(calculateMonthlyWorkFinance([r], tax).netIncome).toBe("3900.00")
  })
  it("preserves Glovo fixed-fee contribution and exemption rather than silently fixing it", () => {
    const r = { date: "2026-10-01", uber: 1000, glovo: 1000 }
    const tax = settings("glovo", "fixed_month", 100)
    const ctx = createWorkTaxContext([r], tax)
    expect(displayedPlatformMetrics(r, "glovo", ctx, true).income).toBe(1000)
    expect(displayedPlatformMetrics(r, "uber", ctx, true).income).toBe(900)
  })
  it("uses all seven stable fields for form load/save and Expenses reads", () => {
    expect(TAX_PLATFORM_KEYS).toEqual(PLATFORM_KEYS)
    const work = readFileSync("app/work/page.tsx", "utf8")
    const expenses = readFileSync("app/expenses/page.tsx", "utf8")
    for (const p of PLATFORM_KEYS) {
      expect(work).toContain(`${p}_type: data.${p}_type`)
      expect(work).toContain(`${p}_type: taxForm.${p}_type`)
      expect(work).toContain(`${p}_type: cleanData.${p}_type`)
      expect(expenses).toContain(`${p}_type: taxRow.${p}_type`)
    }
    expect(work).toContain('.update(cleanData).eq("user_id", userId)')
    const modal = readFileSync("app/work/components/WorkModals.tsx", "utf8")
    expect(modal).toContain('p === "other" ? t.work.otherPlatform : PLATFORM_LABELS[p]')
    expect(modal).toContain('max-h-[calc(100dvh-2rem)] overflow-y-auto')
    expect(modal).toContain('htmlFor={`tax-mode-${p}`}')
    for (const lang of ["uk", "pl", "en", "ru"] as const) {
      expect(translations[lang].work.otherPlatform).toBeTruthy()
      expect(translations[lang].work.taxTypeFixedMonth).toBeTruthy()
    }
  })
})
