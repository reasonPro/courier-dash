import type { ExpenseCategory } from "../docs/shared/types/expenses"

export const EXPENSES_PROTOTYPE_STORAGE_KEY =
  "courierdash.expenses.prototype.v1"
export const EXPENSES_PROTOTYPE_EVENT = "courierdash:expenses-prototype-change"

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "fuel",
  "rental",
  "food_on_shift",
  "repair",
  "maintenance",
]

export const PROTOTYPE_EXPENSE_ENTRY_CATEGORIES: ExpenseCategory[] = [
  ...EXPENSE_CATEGORIES,
]

const BIGINT_ZERO = BigInt("0")
const PLN_MINOR_UNITS = BigInt("100")

export type PrototypeExpenseRecord = {
  id: string
  source: "manual"
  category: ExpenseCategory
  expenseDate: string
  amount: string
  paidPeriodFrom: string | null
  paidPeriodTo: string | null
  createdAt: string
  updatedAt: string
}

export type PrototypeManualExpense = PrototypeExpenseRecord

export type ExpensesPrototypeState = {
  version: 2
  enabled: boolean
  activeCategories: ExpenseCategory[]
  manualExpenses: PrototypeExpenseRecord[]
}

export type ExpensesPrototypeReadResult = {
  state: ExpensesPrototypeState
  error: string | null
}

export type StorageReaderWriter = Pick<Storage, "getItem" | "setItem">

export function createEmptyExpensesPrototypeState(): ExpensesPrototypeState {
  return {
    version: 2,
    enabled: false,
    activeCategories: [],
    manualExpenses: [],
  }
}

function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(value as ExpenseCategory)
}

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string") return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1) return false

  const nextMonth = month === 12 ? 1 : month + 1
  const nextMonthYear = month === 12 ? year + 1 : year
  const monthLength =
    calendarDateToOrdinal(
      `${String(nextMonthYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`,
    ) -
    calendarDateToOrdinal(
      `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`,
    )

  return day <= monthLength
}

export function normalizePlnInput(value: string): string {
  return value.trim().replace(",", ".")
}

export function isValidPlnInput(value: string): boolean {
  return /^\d+(?:\.\d{1,2})?$/.test(normalizePlnInput(value))
}

export function isPositivePlnInput(value: string): boolean {
  const normalized = normalizePlnInput(value)
  if (!isValidPlnInput(normalized)) return false
  const [whole, fraction = ""] = normalized.split(".")
  return (
    BigInt(whole) * PLN_MINOR_UNITS + BigInt(fraction.padEnd(2, "0")) >
    BIGINT_ZERO
  )
}

export function plnToMinorUnits(value: string): bigint {
  const normalized = normalizePlnInput(value)
  if (!isValidPlnInput(normalized)) throw new Error("INVALID_PLN")
  const [whole, fraction = ""] = normalized.split(".")
  return BigInt(whole) * PLN_MINOR_UNITS + BigInt(fraction.padEnd(2, "0"))
}

export function formatMinorUnits(value: bigint): string {
  const sign = value < BIGINT_ZERO ? "-" : ""
  const absolute = value < BIGINT_ZERO ? -value : value
  return `${sign}${absolute / PLN_MINOR_UNITS}.${String(absolute % PLN_MINOR_UNITS).padStart(2, "0")}`
}

export function normalizePlnForStorage(value: string): string {
  return formatMinorUnits(plnToMinorUnits(value))
}

export function addPlnValues(values: string[]): string {
  return formatMinorUnits(
    values.reduce(
      (total, value) => total + plnToMinorUnits(value),
      BIGINT_ZERO,
    ),
  )
}

export function subtractPlnValues(minuend: string, subtrahend: string): string {
  return formatMinorUnits(plnToMinorUnits(minuend) - plnToMinorUnits(subtrahend))
}

export function calendarDateToOrdinal(value: string): number {
  const [rawYear, month, day] = value.split("-").map(Number)
  let year = rawYear
  year -= month <= 2 ? 1 : 0
  const era = Math.floor(year / 400)
  const yearOfEra = year - era * 400
  const monthPrime = month + (month > 2 ? -3 : 9)
  const dayOfYear = Math.floor((153 * monthPrime + 2) / 5) + day - 1
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear
  return era * 146097 + dayOfEra
}

export function ordinalToCalendarDate(ordinal: number): string {
  const era = Math.floor(ordinal / 146097)
  const dayOfEra = ordinal - era * 146097
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1460) +
      Math.floor(dayOfEra / 36524) -
      Math.floor(dayOfEra / 146096)) /
      365,
  )
  let year = yearOfEra + era * 400
  const dayOfYear =
    dayOfEra -
    (365 * yearOfEra +
      Math.floor(yearOfEra / 4) -
      Math.floor(yearOfEra / 100))
  const monthPrime = Math.floor((5 * dayOfYear + 2) / 153)
  const day = dayOfYear - Math.floor((153 * monthPrime + 2) / 5) + 1
  const month = monthPrime + (monthPrime < 10 ? 3 : -9)
  year += month <= 2 ? 1 : 0
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function addCalendarDays(value: string, days: number): string {
  return ordinalToCalendarDate(calendarDateToOrdinal(value) + days)
}

export function getLocalCalendarDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export function getMonthRange(month: string): { from: string; to: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) throw new Error("INVALID_MONTH")
  const nextMonth = Number(match[2]) === 12 ? 1 : Number(match[2]) + 1
  const nextYear = Number(match[2]) === 12 ? Number(match[1]) + 1 : Number(match[1])
  const from = `${match[1]}-${match[2]}-01`
  const next = `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`
  return { from, to: addCalendarDays(next, -1) }
}

export type ExpensesRangeTotals = {
  total: string
  byCategory: Record<ExpenseCategory, string>
}

export function getExpensesForRange(
  state: ExpensesPrototypeState,
  from: string,
  to: string,
  category: ExpenseCategory | "all" = "all",
): PrototypeExpenseRecord[] {
  return state.manualExpenses.filter(
    (expense) =>
      expense.expenseDate >= from &&
      expense.expenseDate <= to &&
      (category === "all" || expense.category === category),
  )
}

export function calculateExpensesForRange(
  state: ExpensesPrototypeState,
  from: string,
  to: string,
): ExpensesRangeTotals {
  const byCategoryMinor = new Map<ExpenseCategory, bigint>()
  EXPENSE_CATEGORIES.forEach((category) => {
    byCategoryMinor.set(category, BIGINT_ZERO)
  })

  getExpensesForRange(state, from, to).forEach((expense) => {
    byCategoryMinor.set(
      expense.category,
      (byCategoryMinor.get(expense.category) ?? BIGINT_ZERO) +
        plnToMinorUnits(expense.amount),
    )
  })

  const byCategory = Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [
      category,
      formatMinorUnits(byCategoryMinor.get(category) ?? BIGINT_ZERO),
    ]),
  ) as Record<ExpenseCategory, string>

  return {
    byCategory,
    total: addPlnValues(Object.values(byCategory)),
  }
}

function normalizeExpenseRecord(
  value: unknown,
  legacy: boolean,
): PrototypeExpenseRecord | null {
  if (!value || typeof value !== "object") return null
  const record = value as Partial<PrototypeExpenseRecord>
  if (
    typeof record.id !== "string" ||
    record.source !== "manual" ||
    !isExpenseCategory(record.category) ||
    !isCalendarDate(record.expenseDate) ||
    typeof record.amount !== "string" ||
    !isValidPlnInput(record.amount) ||
    typeof record.createdAt !== "string" ||
    typeof record.updatedAt !== "string"
  ) {
    return null
  }
  if (legacy && record.category === "rental") return null

  const paidPeriodFrom = record.paidPeriodFrom ?? null
  const paidPeriodTo = record.paidPeriodTo ?? null
  if (
    record.category === "rental" &&
    (!isCalendarDate(paidPeriodFrom) ||
      !isCalendarDate(paidPeriodTo) ||
      paidPeriodTo < paidPeriodFrom)
  ) {
    return null
  }
  if (
    record.category !== "rental" &&
    (paidPeriodFrom !== null || paidPeriodTo !== null)
  ) {
    return null
  }

  return {
    id: record.id,
    source: "manual",
    category: record.category,
    expenseDate: record.expenseDate,
    amount: normalizePlnForStorage(record.amount),
    paidPeriodFrom,
    paidPeriodTo,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function parseExpensesPrototypeState(value: unknown): ExpensesPrototypeState {
  if (!value || typeof value !== "object") throw new Error("INVALID_STATE")
  const state = value as {
    version?: unknown
    enabled?: unknown
    activeCategories?: unknown
    manualExpenses?: unknown
  }
  const legacy = state.version === 1
  if (
    (!legacy && state.version !== 2) ||
    typeof state.enabled !== "boolean" ||
    !Array.isArray(state.activeCategories) ||
    !state.activeCategories.every(isExpenseCategory) ||
    !Array.isArray(state.manualExpenses)
  ) {
    throw new Error("INVALID_STATE")
  }

  const manualExpenses = state.manualExpenses.map((record) =>
    normalizeExpenseRecord(record, legacy),
  )
  if (manualExpenses.some((record) => record === null)) {
    throw new Error("INVALID_STATE")
  }

  return {
    version: 2,
    enabled: state.enabled,
    activeCategories: [...new Set(state.activeCategories)],
    manualExpenses: manualExpenses as PrototypeExpenseRecord[],
  }
}

export function readExpensesPrototype(
  storage: StorageReaderWriter,
): ExpensesPrototypeReadResult {
  try {
    const raw = storage.getItem(EXPENSES_PROTOTYPE_STORAGE_KEY)
    if (raw === null) {
      return { state: createEmptyExpensesPrototypeState(), error: null }
    }
    return { state: parseExpensesPrototypeState(JSON.parse(raw)), error: null }
  } catch {
    return {
      state: createEmptyExpensesPrototypeState(),
      error: "EXPENSES_PROTOTYPE_READ_FAILED",
    }
  }
}

export function writeExpensesPrototype(
  storage: StorageReaderWriter,
  state: ExpensesPrototypeState,
): void {
  const validated = parseExpensesPrototypeState(state)
  storage.setItem(EXPENSES_PROTOTYPE_STORAGE_KEY, JSON.stringify(validated))
}

export function createPrototypeId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${suffix}`
}
