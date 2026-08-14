export const ADMIN_TIME_ZONE = "Europe/Warsaw" as const
export const ADMIN_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1_000
export const ADMIN_ONLINE_WINDOW_MINUTES = 10

export type AdminActivityArea = "session" | "work" | "garage" | "expenses"

export type AdminPeriodMetric = {
  today: number
  days7: number
  days30: number
}

export type AdminAdoptionMetric = {
  count: number
  percent: number
}

export type AdminComparisonMetric = {
  current: number
  previous: number
  percentChange: number | null
}

export type AdminDashboardMetrics = {
  timezone: typeof ADMIN_TIME_ZONE
  generatedAt: string
  onlineNow: number
  totalUsers: number
  newUsers: {
    week: number
    month: number
  }
  activeUsers: AdminPeriodMetric
  dataActiveUsers: AdminPeriodMetric
  adoption: {
    work: AdminAdoptionMetric
    garage: AdminAdoptionMetric
    expenses: AdminAdoptionMetric
  }
  returningUsers: {
    days30: number
  }
  comparisons: {
    week: AdminComparisonMetric
    month: AdminComparisonMetric
  }
  activity30: Array<{
    date: string
    users: number
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function finiteNonNegative(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null
}

function parsePeriodMetric(value: unknown): AdminPeriodMetric | null {
  if (!isRecord(value)) return null
  const today = finiteNonNegative(value.today)
  const days7 = finiteNonNegative(value.days7)
  const days30 = finiteNonNegative(value.days30)
  return today === null || days7 === null || days30 === null
    ? null
    : { today, days7, days30 }
}

function parseAdoptionMetric(value: unknown): AdminAdoptionMetric | null {
  if (!isRecord(value)) return null
  const count = finiteNonNegative(value.count)
  const percent = finiteNonNegative(value.percent)
  return count === null || percent === null ? null : { count, percent }
}

function parseComparisonMetric(value: unknown): AdminComparisonMetric | null {
  if (!isRecord(value)) return null
  const current = finiteNonNegative(value.current)
  const previous = finiteNonNegative(value.previous)
  const percentChange = value.percentChange
  if (
    current === null ||
    previous === null ||
    !(
      percentChange === null ||
      (typeof percentChange === "number" && Number.isFinite(percentChange))
    )
  ) {
    return null
  }
  return { current, previous, percentChange }
}

export function parseAdminDashboardMetrics(
  value: unknown,
): AdminDashboardMetrics | null {
  if (!isRecord(value) || value.timezone !== ADMIN_TIME_ZONE) return null
  if (typeof value.generatedAt !== "string") return null

  const onlineNow = finiteNonNegative(value.onlineNow)
  const totalUsers = finiteNonNegative(value.totalUsers)
  const activeUsers = parsePeriodMetric(value.activeUsers)
  const dataActiveUsers = parsePeriodMetric(value.dataActiveUsers)
  if (
    onlineNow === null ||
    totalUsers === null ||
    !activeUsers ||
    !dataActiveUsers ||
    !isRecord(value.newUsers) ||
    !isRecord(value.adoption) ||
    !isRecord(value.returningUsers) ||
    !isRecord(value.comparisons) ||
    !Array.isArray(value.activity30)
  ) {
    return null
  }

  const newWeek = finiteNonNegative(value.newUsers.week)
  const newMonth = finiteNonNegative(value.newUsers.month)
  const work = parseAdoptionMetric(value.adoption.work)
  const garage = parseAdoptionMetric(value.adoption.garage)
  const expenses = parseAdoptionMetric(value.adoption.expenses)
  const returningDays30 = finiteNonNegative(value.returningUsers.days30)
  const week = parseComparisonMetric(value.comparisons.week)
  const month = parseComparisonMetric(value.comparisons.month)
  const activity30 = value.activity30.map((point) => {
    if (!isRecord(point) || typeof point.date !== "string") return null
    const users = finiteNonNegative(point.users)
    return users === null ? null : { date: point.date, users }
  })

  if (
    newWeek === null ||
    newMonth === null ||
    !work ||
    !garage ||
    !expenses ||
    returningDays30 === null ||
    !week ||
    !month ||
    activity30.some((point) => point === null)
  ) {
    return null
  }

  return {
    timezone: ADMIN_TIME_ZONE,
    generatedAt: value.generatedAt,
    onlineNow,
    totalUsers,
    newUsers: { week: newWeek, month: newMonth },
    activeUsers,
    dataActiveUsers,
    adoption: { work, garage, expenses },
    returningUsers: { days30: returningDays30 },
    comparisons: { week, month },
    activity30: activity30 as AdminDashboardMetrics["activity30"],
  }
}
