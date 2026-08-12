import type {
  ExpenseCategory,
  ManualExpenseCategory,
} from "../docs/shared/types/expenses"

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

export const MANUAL_EXPENSE_CATEGORIES: ManualExpenseCategory[] = [
  "fuel",
  "food_on_shift",
  "repair",
  "maintenance",
]

const BIGINT_ZERO = BigInt("0")
const BIGINT_ONE = BigInt("1")
const BIGINT_TWO = BigInt("2")
const PLN_MINOR_UNITS = BigInt("100")
const DAYS_PER_WEEK = BigInt("7")

export type PrototypeManualExpense = {
  id: string
  source: "manual"
  category: ManualExpenseCategory
  expenseDate: string
  amount: string
  createdAt: string
  updatedAt: string
}

export type PrototypeRentalPeriod = {
  id: string
  source: "rental_period"
  weeklyAmount: string
  validFrom: string
  validTo: string | null
  createdAt: string
  updatedAt: string
}

export type ExpensesPrototypeState = {
  version: 1
  enabled: boolean
  activeCategories: ExpenseCategory[]
  manualExpenses: PrototypeManualExpense[]
  rentalPeriods: PrototypeRentalPeriod[]
}

export type ExpensesPrototypeReadResult = {
  state: ExpensesPrototypeState
  error: string | null
}

export type StorageReaderWriter = Pick<
  Storage,
  "getItem" | "setItem"
>

export function createEmptyExpensesPrototypeState(): ExpensesPrototypeState {
  return {
    version: 1,
    enabled: false,
    activeCategories: [],
    manualExpenses: [],
    rentalPeriods: [],
  }
}

function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(value as ExpenseCategory)
}

function isManualExpenseCategory(
  value: unknown,
): value is ManualExpenseCategory {
  return MANUAL_EXPENSE_CATEGORIES.includes(value as ManualExpenseCategory)
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

export function plnToMinorUnits(value: string): bigint {
  const normalized = normalizePlnInput(value)
  if (!isValidPlnInput(normalized)) {
    throw new Error("INVALID_PLN")
  }
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

export function countInclusiveDays(
  from: string,
  to: string,
): number {
  return calendarDateToOrdinal(to) - calendarDateToOrdinal(from) + 1
}

export function getRangeIntersection(
  leftFrom: string,
  leftTo: string,
  rightFrom: string,
  rightTo: string,
): { from: string; to: string; days: number } | null {
  const from = leftFrom > rightFrom ? leftFrom : rightFrom
  const to = leftTo < rightTo ? leftTo : rightTo
  if (from > to) return null
  return { from, to, days: countInclusiveDays(from, to) }
}

function roundPositiveRationalHalfUp(
  numerator: bigint,
  denominator: bigint,
): bigint {
  if (numerator < BIGINT_ZERO || denominator <= BIGINT_ZERO) {
    throw new Error("INVALID_RATIONAL")
  }
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * BIGINT_TWO >= denominator
    ? quotient + BIGINT_ONE
    : quotient
}

export function calculateRentalForRange(
  periods: PrototypeRentalPeriod[],
  from: string,
  to: string,
): string {
  const numerator = periods.reduce((total, period) => {
    const overlap = getRangeIntersection(
      period.validFrom,
      period.validTo ?? to,
      from,
      to,
    )
    if (!overlap) return total
    return total + plnToMinorUnits(period.weeklyAmount) * BigInt(overlap.days)
  }, BIGINT_ZERO)

  return formatMinorUnits(
    roundPositiveRationalHalfUp(numerator, DAYS_PER_WEEK),
  )
}

export type ExpensesRangeTotals = {
  total: string
  byCategory: Record<ExpenseCategory, string>
}

export function calculateExpensesForRange(
  state: ExpensesPrototypeState,
  from: string,
  to: string,
): ExpensesRangeTotals {
  const manualByCategory = new Map<ManualExpenseCategory, bigint>()
  MANUAL_EXPENSE_CATEGORIES.forEach((category) => {
    manualByCategory.set(category, BIGINT_ZERO)
  })

  state.manualExpenses.forEach((expense) => {
    if (expense.expenseDate < from || expense.expenseDate > to) return
    manualByCategory.set(
      expense.category,
      (manualByCategory.get(expense.category) ?? BIGINT_ZERO) +
        plnToMinorUnits(expense.amount),
    )
  })

  const rental = calculateRentalForRange(state.rentalPeriods, from, to)
  const byCategory: Record<ExpenseCategory, string> = {
    fuel: formatMinorUnits(manualByCategory.get("fuel") ?? BIGINT_ZERO),
    rental,
    food_on_shift: formatMinorUnits(
      manualByCategory.get("food_on_shift") ?? BIGINT_ZERO,
    ),
    repair: formatMinorUnits(
      manualByCategory.get("repair") ?? BIGINT_ZERO,
    ),
    maintenance: formatMinorUnits(
      manualByCategory.get("maintenance") ?? BIGINT_ZERO,
    ),
  }

  return {
    byCategory,
    total: addPlnValues(Object.values(byCategory)),
  }
}

function isManualExpense(value: unknown): value is PrototypeManualExpense {
  if (!value || typeof value !== "object") return false
  const record = value as Partial<PrototypeManualExpense>
  return (
    typeof record.id === "string" &&
    record.source === "manual" &&
    isManualExpenseCategory(record.category) &&
    isCalendarDate(record.expenseDate) &&
    typeof record.amount === "string" &&
    isValidPlnInput(record.amount) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  )
}

function isRentalPeriod(value: unknown): value is PrototypeRentalPeriod {
  if (!value || typeof value !== "object") return false
  const record = value as Partial<PrototypeRentalPeriod>
  return (
    typeof record.id === "string" &&
    record.source === "rental_period" &&
    typeof record.weeklyAmount === "string" &&
    isValidPlnInput(record.weeklyAmount) &&
    isCalendarDate(record.validFrom) &&
    (record.validTo === null || isCalendarDate(record.validTo)) &&
    (record.validTo === null || record.validTo >= record.validFrom) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  )
}

function parseExpensesPrototypeState(value: unknown): ExpensesPrototypeState {
  if (!value || typeof value !== "object") throw new Error("INVALID_STATE")
  const state = value as Partial<ExpensesPrototypeState>
  if (
    state.version !== 1 ||
    typeof state.enabled !== "boolean" ||
    !Array.isArray(state.activeCategories) ||
    !state.activeCategories.every(isExpenseCategory) ||
    !Array.isArray(state.manualExpenses) ||
    !state.manualExpenses.every(isManualExpense) ||
    !Array.isArray(state.rentalPeriods) ||
    !state.rentalPeriods.every(isRentalPeriod)
  ) {
    throw new Error("INVALID_STATE")
  }

  return {
    version: 1,
    enabled: state.enabled,
    activeCategories: [...new Set(state.activeCategories)],
    manualExpenses: state.manualExpenses,
    rentalPeriods: state.rentalPeriods,
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

export function hasOverlappingRentalPeriods(
  periods: PrototypeRentalPeriod[],
): boolean {
  const sorted = [...periods].sort((a, b) =>
    a.validFrom.localeCompare(b.validFrom),
  )
  return sorted.some((period, index) => {
    if (index === 0) return false
    const previous = sorted[index - 1]
    return previous.validTo === null || previous.validTo >= period.validFrom
  })
}

export function createPrototypeId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${suffix}`
}
