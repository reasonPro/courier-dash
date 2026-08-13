import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { calculateAfterExpensesIncome } from "../lib/after-expenses"
import { calculateMonthlyWorkFinance } from "../lib/work-finance"

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("Expenses after-income preview", () => {
  it("calculates the approved BRUTTO and NETTO examples without subtracting expenses twice", () => {
    const finance = calculateMonthlyWorkFinance(
      [{ date: "2026-08-10", uber: 5000 }],
      {
        bolt_type: "none",
        bolt_val: 0,
        glovo_type: "none",
        glovo_val: 0,
        uber_type: "percent",
        uber_val: 12,
        wolt_type: "none",
        wolt_val: 0,
      },
    )

    expect(finance).toMatchObject({
      grossIncome: "5000.00",
      netIncome: "4400.00",
      taxAmount: "600.00",
    })
    expect(
      calculateAfterExpensesIncome({
        expensesTotal: "800.00",
        grossIncome: finance.grossIncome,
        mode: "brutto",
        netIncome: finance.netIncome,
      }),
    ).toBe("4200.00")
    expect(
      calculateAfterExpensesIncome({
        expensesTotal: "800.00",
        grossIncome: finance.grossIncome,
        mode: "netto",
        netIncome: finance.netIncome,
      }),
    ).toBe("3600.00")
  })

  it("keeps NETTO unavailable when taxes are not configured", () => {
    const finance = calculateMonthlyWorkFinance(
      [{ date: "2026-08-10", uber: 5000 }],
      null,
    )

    expect(finance.netIncome).toBeNull()
    expect(
      calculateAfterExpensesIncome({
        expensesTotal: "800.00",
        grossIncome: finance.grossIncome,
        mode: "netto",
        netIncome: finance.netIncome,
      }),
    ).toBeNull()
  })

  it("shows a locked Work block before activation and opens the existing settings flow", () => {
    const summary = source("app/work/components/ExpensesMonthSummary.tsx")
    const workPage = source("app/work/page.tsx")

    expect(summary).toContain("if (!state.enabled)")
    expect(summary).toContain('blur-[3px]')
    expect(summary).toContain("onClick={onSetupCategories}")
    expect(workPage).toContain(
      'onSetupCategories={() => setShowExpenseSettings(true)}',
    )
    expect(workPage).toContain("<ExpenseSettingsModal")
    const activeBlock = summary.slice(summary.indexOf('aria-controls="work-expenses-details"'))
    expect(activeBlock).not.toContain('blur-[3px]')
  })

  it("uses the localized minus action on Work and Expenses", () => {
    const workPage = source("app/work/page.tsx")
    const expensesPage = source("app/expenses/page.tsx")
    const translations = source("lib/expenses-translations.ts")

    expect(workPage).toContain("{expenseCopy.addExpenseButton}")
    expect(workPage).not.toContain(
      '<span aria-hidden="true">+</span> {expenseCopy.addExpense}',
    )
    expect(expensesPage).toContain("{copy.addExpenseButton}")
    expect(translations).toContain('addExpenseButton: "− Додати витрату"')
    expect(translations).toContain('addExpenseButton: "− Dodaj wydatek"')
    expect(translations).toContain('addExpenseButton: "− Add expense"')
    expect(translations).toContain('addExpenseButton: "− Добавить расход"')
  })

  it("shares one result component and follows the Work BRUTTO/NETTO selection", () => {
    const workPage = source("app/work/page.tsx")
    const expensesPage = source("app/expenses/page.tsx")

    expect(workPage).toContain('mode={isNetto ? "netto" : "brutto"}')
    expect(workPage).toContain("netIncome={expensesFinance.netIncome}")
    expect(expensesPage).toContain("<AfterExpensesResult")
    expect(expensesPage).toContain("showModeToggle")
  })

  it("removes the old not-Netto wording in every locale", () => {
    const translations = source("lib/expenses-translations.ts")

    expect(translations).not.toContain("Це не Netto")
    expect(translations).not.toContain("To nie jest netto")
    expect(translations).not.toContain("This is not net income")
    expect(translations).not.toContain("Это не Netto")
    expect(translations).toContain(
      'activationTitle: "Відстежуйте реальний заробіток після робочих витрат"',
    )
    expect(translations).toContain(
      'activationTitle: "Śledź realny zarobek po kosztach pracy"',
    )
    expect(translations).toContain(
      'activationTitle: "Track your real earnings after work expenses"',
    )
    expect(translations).toContain(
      'activationTitle: "Отслеживайте реальный заработок после рабочих расходов"',
    )
  })
})
