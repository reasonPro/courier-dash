import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { calculateMonthlyWorkFinance, createWorkTaxContext, displayedPlatformMetrics, type WorkTaxSettings } from "../lib/work-finance"
import { availablePlatforms, hasPlatformActivity, projectShift, togglePlatform } from "../lib/work-view"
import { getShiftPlatformTotals } from "../lib/work-platforms"
import { workViewTranslations } from "../lib/work-view-translations"

const tax: WorkTaxSettings = {
  uber_type: "percent", uber_val: 10, wolt_type: "percent", wolt_val: 20,
  bolt_type: "none", bolt_val: 0, glovo_type: "none", glovo_val: 0,
}
const row = { date: "2026-09-01", hours: 5, km: 30, uber: 100, cash_tips_uber: 20, orders_uber: 4 }

describe("Work display finance", () => {
  it("keeps 100 + 20 cash at gross 120 / tax 10 / net 110", () => {
    expect(calculateMonthlyWorkFinance([row], tax)).toMatchObject({
      grossIncome: "120.00", taxAmount: "10.00", netIncome: "110.00",
    })
  })
  it.each([0, 10, 50])("does not reduce cash-only tips at %s percent", rate => {
    const settings = { ...tax, uber_val: rate }
    const cash = { ...row, uber: 0 }
    expect(displayedPlatformMetrics(cash, "uber", createWorkTaxContext([cash], settings), true).tips).toBe(20)
  })
  it("applies platform percentages to online tips/bonuses, not cash", () => {
    const mixed = { ...row, tips_uber: 10, bonuses_uber: 10, wolt: 100, cash_tips_wolt: 5 }
    expect(calculateMonthlyWorkFinance([mixed], tax)).toMatchObject({ grossIncome: "245.00", netIncome: "213.00" })
    const view = projectShift(mixed, ["uber", "wolt"], createWorkTaxContext([mixed], tax), true, true)
    const totals = getShiftPlatformTotals(view)
    expect(totals.income + totals.tips + totals.bonuses).toBe(213)
    expect(view.cash_tips_uber).toBe(20)
  })
  it("preserves unavailable taxes and handles missing values", () => {
    expect(calculateMonthlyWorkFinance([{ date: row.date }], null).netIncome).toBeNull()
    expect(calculateMonthlyWorkFinance([{ date: row.date }], tax).grossIncome).toBe("0.00")
  })
  it("charges shared fixed deductions once across rows, preserving weekly/monthly rules", () => {
    const rows = [row, { ...row, date: "2026-09-02" }]
    for (const type of ["fixed_week", "fixed_month"]) {
      const settings = { ...tax, uber_type: type, uber_val: 30 }
      const context = createWorkTaxContext(rows, settings)
      expect(context.fixedTax).toBe(30)
      const nets = rows.map(r => getShiftPlatformTotals(projectShift(r, ["uber"], context, true, true)))
      expect(nets.reduce((sum, m) => sum + m.income + m.tips + m.bonuses, 0)).toBe(210)
      expect(calculateMonthlyWorkFinance(rows, settings).netIncome).toBe("210.00")
    }
  })
  it("keeps include toggles from adding cash twice", () => {
    const m = displayedPlatformMetrics(row, "uber", createWorkTaxContext([row], tax, false), true, false)
    expect(m.tips).toBe(0)
    expect(m.income).toBe(90)
  })
})

describe("Shared platform filter", () => {
  it("finds activity including orders, online tips, cash and bonuses without base income", () => {
    expect(availablePlatforms([{ orders_uber: 1, tips_wolt: 2, bonuses_bolt: 3, cash_tips_glovo: 4 }])).toEqual(["uber", "wolt", "bolt", "glovo"])
    expect(availablePlatforms([])).toEqual([])
    expect(hasPlatformActivity({ other_platform_name: "name only" }, "other")).toBe(false)
  })
  it("supports one/multiple/all and prevents an empty selection", () => {
    expect(togglePlatform(["uber"], "uber")).toEqual(["uber"])
    expect(togglePlatform(["uber"], "wolt")).toEqual(["uber", "wolt"])
    expect(togglePlatform(["uber", "wolt"], "uber")).toEqual(["wolt"])
  })
  it("projects without mutating recorded data and never allocates hours/distance", () => {
    const original = { ...row, wolt: 200, orders_wolt: 8 }
    const before = JSON.stringify(original)
    const view = projectShift(original, ["uber"], createWorkTaxContext([original], tax), false, false)
    expect(view.wolt).toBe(0)
    expect(view.uber).toBe(100)
    expect(Number.isNaN(view.hours)).toBe(true)
    expect(Number.isNaN(view.km)).toBe(true)
    expect(JSON.stringify(original)).toBe(before)
  })
  it("wires independent modes, reset-on-month, original editing, and unavailable shared expenses", () => {
    const page = readFileSync("app/work/page.tsx", "utf8")
    expect(page).toContain("const [tableNetto, setTableNetto] = useState(false)")
    expect(page).toContain("onNettoChange={setTableNetto}")
    expect(page).toContain("setSelectedMonth(month); setPlatformSelection(null)")
    expect(page).toContain("new Set(filteredShifts.map(shift => shift.date)).size")
    expect(page).toContain("if (original) handleEdit(original)")
    expect(page).toContain("grossKnown={allPlatforms &&")
    expect(page).toContain("if (allPlatforms) chartDatasets.push")
    expect(page).toContain("!allPlatforms && taxContext.fixedTax > 0")
  })
})

describe("Statistics settings panel", () => {
  it("places each existing control once before the summary and preserves its state handlers", () => {
    const page = readFileSync("app/work/page.tsx", "utf8")
    const filters = readFileSync("app/work/components/WorkFilters.tsx", "utf8")
    const summary = readFileSync("app/work/components/WorkSummary.tsx", "utf8")
    const settings = page.slice(page.indexOf("<WorkFilters"), page.indexOf("<WorkSummary"))
    expect(page.match(/<WorkPlatformFilter\b/g)).toHaveLength(1)
    expect(settings).toContain("<WorkPlatformFilter")
    expect(settings).toContain("onChange={values => setPlatformSelection({ month: selectedMonth, values })}")
    expect(settings).toContain("onIncludeAppTipsChange={setIncludeAppTips}")
    expect(settings).toContain("onIncludeCashTipsChange={setIncludeCashTips}")
    expect(settings).toContain("onIncludeBonusesChange={setIncludeBonuses}")
    expect(settings).toContain("onNettoSelect={handleNettoToggle}")
    expect(settings).toContain("onBruttoSelect={() => setIsNetto(false)}")
    expect(settings).toContain("onOpenTaxSettings={() => setShowTaxModal(true)}")
    expect(page).toContain("onNettoChange={setTableNetto}")
    expect(summary).not.toContain("platformFilter")
    expect(summary).toContain("{notices}")
    expect(filters.indexOf("{platformFilter}")).toBeLessThan(filters.indexOf("{copy.includeInIncome}"))
    expect(filters.indexOf("{copy.includeInIncome}")).toBeLessThan(filters.indexOf("{copy.metricsAndChart}"))
  })

  it("keeps the panel open, uses pressed markers and native keyboard buttons, and allows wrapping", () => {
    const filters = readFileSync("app/work/components/WorkFilters.tsx", "utf8")
    const platforms = readFileSync("app/work/components/WorkPlatformFilter.tsx", "utf8")
    expect(filters).toContain('aria-labelledby="work-statistics-settings"')
    expect(filters).not.toContain("aria-expanded")
    expect(filters).not.toMatch(/(?:max-)?h-\[/)
    expect(filters).toContain("grid-cols-1")
    expect(filters).toContain("focus-visible:outline")
    expect(filters).toContain("aria-pressed={included}")
    expect(filters).toContain("aria-pressed={includeBonuses}")
    expect(filters).toContain("aria-pressed={!isNetto}")
    expect(filters).toContain("aria-pressed={isNetto}")
    expect(filters).toContain('aria-haspopup="dialog" onClick={onOpenTaxSettings}')
    expect(platforms).toContain("flex flex-wrap gap-2")
    expect(platforms).toContain("focus-visible:outline")
    expect(platforms).toContain("aria-pressed={selected.includes(p)}")
    expect(platforms).toContain('selected.includes(p) && <span aria-hidden="true">✓</span>')
    expect(platforms).toContain("onChange(togglePlatform(selected, p))")
  })

  it("has panel labels in all four supported languages", () => {
    for (const lang of ["uk", "pl", "en", "ru"] as const) {
      for (const key of ["statisticsSettings", "includeInIncome", "metricsAndChart", "taxSettingsAction", "month"] as const) {
        expect(workViewTranslations[lang][key].trim()).not.toBe("")
      }
    }
    expect(workViewTranslations.uk.statisticsSettings).toBe("Налаштування статистики")
  })

  it("provides localized help through a keyboard-accessible native light-dismiss popover", () => {
    const help = readFileSync("app/work/components/WorkStatisticsHelp.tsx", "utf8")
    expect(help).toContain('popover="auto"')
    expect(help).toContain("popoverTarget={id}")
    expect(help).toContain('role="dialog"')
    expect(help).toContain("aria-expanded={open}")
    expect(help).toContain("aria-controls={id}")
    expect(help).toContain("content.current?.focus()")
    expect(help).toContain("focus-visible:outline")
    for (const lang of ["uk", "pl", "en", "ru"] as const) {
      expect(workViewTranslations[lang].statisticsHelpLabel).not.toBe("")
      expect(workViewTranslations[lang].statisticsHelpTitle).not.toBe("")
      expect(workViewTranslations[lang].statisticsHelpParagraphs).toHaveLength(3)
    }
    expect(workViewTranslations.uk.statisticsHelpTitle).toBe("Налаштуйте статистику під себе")
    expect(workViewTranslations.uk.statisticsHelpParagraphs[2]).toContain("не змінює збережені записи")
  })
})
