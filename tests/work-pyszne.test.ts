import { readFileSync, existsSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  PLATFORM_KEYS, TAX_PLATFORM_KEYS, buildPlatformShiftPayload,
  createEmptyPlatformValues, getPlatformMetrics, getShiftPlatformTotals,
  getEditingPlatformKeys, serializePlatformPreference, parsePlatformPreference,
} from "../lib/work-platforms"
import { calculateMonthlyWorkFinance, createWorkTaxContext } from "../lib/work-finance"
import { availablePlatforms, projectShift } from "../lib/work-view"
import { aggregateAnnualShifts } from "../app/work/year/annual-report-calculations"

const taxes = {
  uber_type: "none", uber_val: 0, wolt_type: "none", wolt_val: 0,
  bolt_type: "none", bolt_val: 0, glovo_type: "none", glovo_val: 0,
  pyszne_type: "percent", pyszne_val: 10,
}
const row = { date: "2026-09-03", hours: 4, km: 25, pyszne: 100,
  orders_pyszne: 5, tips_pyszne: 10, cash_tips_pyszne: 20, bonuses_pyszne: 10 }

describe("Pyszne local contract and real Work consumers", () => {
  it("retains every platform, including Stuart and Other", () => {
    expect(PLATFORM_KEYS).toEqual(["uber", "wolt", "bolt", "glovo", "stuart", "pyszne", "other"])
    expect(TAX_PLATFORM_KEYS).toContain("pyszne")
    expect(parsePlatformPreference(serializePlatformPreference(["pyszne", "other"], "Custom")))
      .toEqual({ platforms: ["pyszne", "other"], otherPlatformName: "Custom" })
  })
  it("round trips all five metrics through the create/edit payload without reclassifying Other", () => {
    const form = { earnings: createEmptyPlatformValues(), orders: createEmptyPlatformValues(),
      tips: createEmptyPlatformValues(), cashTips: createEmptyPlatformValues(), bonuses: createEmptyPlatformValues() }
    form.earnings.pyszne = "100"
    form.orders.pyszne = "5"
    form.tips.pyszne = "10"
    form.cashTips.pyszne = "20"
    form.bonuses.pyszne = "10"
    const saved = buildPlatformShiftPayload(["pyszne"], form, "", { other_income: 77, other_platform_name: "Pyszne (old Other)" })
    expect(getPlatformMetrics(saved, "pyszne")).toEqual({ income: 100, orders: 5, appTips: 10, cashTips: 20, tips: 30, bonuses: 10 })
    expect(saved.other_income).toBe(77)
    expect(saved.other_platform_name).toBe("Pyszne (old Other)")
    expect(getEditingPlatformKeys(saved)).toEqual(["pyszne", "other"])
    expect(buildPlatformShiftPayload(["uber"], form, "", saved).cash_tips_pyszne).toBe(20)
  })
  it("deducts Pyszne tax from base/app tips/bonus but never cash", () => {
    expect(calculateMonthlyWorkFinance([row], taxes)).toEqual({
      grossIncome: "140.00", netIncome: "128.00", taxAmount: "12.00", taxesConfigured: true,
    })
    const context = createWorkTaxContext([row], taxes)
    const netto = projectShift(row, ["pyszne"], context, true, true)
    expect(getShiftPlatformTotals(netto)).toEqual({ income: 90, orders: 5, tips: 29, bonuses: 9 })
    expect(netto.cash_tips_pyszne).toBe(20)
    expect(row.pyszne).toBe(100)
  })
  it("preserves existing shared weekly/monthly deductions for Pyszne", () => {
    for (const type of ["fixed_week", "fixed_month"]) {
      expect(calculateMonthlyWorkFinance([row], { ...taxes, pyszne_type: type, pyszne_val: 30 }).netIncome).toBe("110.00")
    }
  })
  it("supports legacy rows, all selection, subsets and annual reporting", () => {
    const mixed = { ...row, stuart: 60, orders_stuart: 3 }
    const context = createWorkTaxContext([mixed], taxes)
    expect(getPlatformMetrics({ uber: 100 }, "pyszne").income).toBe(0)
    expect(availablePlatforms([mixed])).toEqual(["stuart", "pyszne"])
    expect(getShiftPlatformTotals(projectShift(mixed, availablePlatforms([mixed]), context, false, true)))
      .toEqual(getShiftPlatformTotals(mixed))
    const subset = projectShift(mixed, ["pyszne"], context, false, false)
    expect(subset.stuart).toBe(0)
    expect(Number.isNaN(subset.hours)).toBe(true)
    const annual = aggregateAnnualShifts([mixed], true, true)
    expect(annual.income).toBe(200)
    expect(annual.platforms.pyszne.cashTips).toBe(20)
    expect(annual.orders).toBe(8)
  })
  it("uses real routes, the existing form and a common tax calculation", () => {
    const work = readFileSync("app/work/page.tsx", "utf8")
    const expenses = readFileSync("app/expenses/page.tsx", "utf8")
    expect(existsSync("app/work-demo/page.tsx")).toBe(false)
    expect(work).toContain("buildPlatformShiftPayload(")
    expect(work).toContain("pyszne_type: taxForm.pyszne_type")
    expect(work).toContain("pyszne_type: data.pyszne_type")
    expect(work).toContain("calculateMonthlyWorkFinance(monthShifts, taxSettings)")
    expect(expenses).toContain("pyszne_type: taxRow.pyszne_type")
    expect(expenses).toContain("calculateMonthlyWorkFinance(")
    expect(readFileSync("app/work/components/WorkModals.tsx", "utf8")).toContain("TAX_PLATFORM_KEYS.map")
    expect(readFileSync("app/work/year/page.tsx", "utf8")).toContain('id: "pyszne"')
  })
  it("keeps the migration additive without changing policies or old values", () => {
    const sql = readFileSync("supabase/migrations/202609160001_add_pyszne_platform.sql", "utf8")
    expect(sql.match(/add column /g)).toHaveLength(7)
    expect(sql).toContain("cash_tips_pyszne >= 0")
    expect(sql).toContain("'none', 'percent', 'fixed_week', 'fixed_month'")
    expect(sql).not.toMatch(/\b(update|delete|drop|truncate|grant|revoke)\s/i)
    expect(sql).toContain("begin;")
    expect(sql).toContain("commit;")
  })
})
