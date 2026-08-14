import { subtractPlnValues } from "./expenses-prototype"

export type AfterExpensesMode = "brutto" | "netto"

type AfterExpensesInput = {
  expensesTotal: string
  grossIncome: string
  mode: AfterExpensesMode
  netIncome: string | null
}

export function calculateAfterExpensesIncome({
  expensesTotal,
  grossIncome,
  mode,
  netIncome,
}: AfterExpensesInput) {
  const income = mode === "netto" ? netIncome : grossIncome
  return income === null ? null : subtractPlnValues(income, expensesTotal)
}
