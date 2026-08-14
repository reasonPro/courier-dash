import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  ADMIN_HEARTBEAT_INTERVAL_MS,
  ADMIN_ONLINE_WINDOW_MINUTES,
  ADMIN_TIME_ZONE,
  parseAdminDashboardMetrics,
} from "../lib/admin-dashboard"

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")
const migration = read("supabase/migrations/202608150001_create_admin_analytics.sql")
const authGuard = read("lib/admin-auth.server.ts")
const apiRoute = read("app/api/admin/metrics/route.ts")
const pageRoute = read("app/admin/page.tsx")
const analyticsClient = read("lib/admin-analytics.ts")
const workPage = read("app/work/page.tsx")
const garagePage = read("app/garage/page.tsx")
const expensesHook = read("lib/use-expenses.ts")

const validMetrics = {
  timezone: "Europe/Warsaw",
  generatedAt: "2026-08-14T12:00:00Z",
  onlineNow: 2,
  totalUsers: 10,
  newUsers: { week: 1, month: 3 },
  activeUsers: { today: 2, days7: 5, days30: 8 },
  dataActiveUsers: { today: 1, days7: 4, days30: 6 },
  adoption: {
    work: { count: 8, percent: 80 },
    garage: { count: 4, percent: 40 },
    expenses: { count: 5, percent: 50 },
  },
  returningUsers: { days30: 5 },
  comparisons: {
    week: { current: 5, previous: 4, percentChange: 25 },
    month: { current: 0, previous: 0, percentChange: 0 },
  },
  activity30: [{ date: "2026-08-14", users: 2 }],
}

describe("private admin dashboard contract", () => {
  it("checks the exact owner UID at server and database boundaries", () => {
    const owner = "284cae3b-046c-4595-8f74-d826df4c1939"
    expect(authGuard).toContain(owner)
    expect(migration).toContain(owner)
    expect(pageRoute).toContain("requireAdminPageAccess")
    expect(apiRoute).toContain("isAdminUserId")
  })

  it("uses isolated analytics without triggers, drops, or business table updates", () => {
    expect(migration).toContain("create table public.app_activity_daily")
    expect(migration).not.toMatch(/create\s+trigger/i)
    expect(migration).not.toMatch(/\bdrop\b/i)
    expect(migration).not.toMatch(/update\s+public\.(work_shifts|garage_|expenses)/i)
    expect(migration).not.toMatch(/alter\s+default\s+privileges/i)
  })

  it("keeps activity owner-scoped and aggregate reads admin-only", () => {
    expect(migration).toContain("auth.uid() = user_id")
    expect(migration).toMatch(
      /revoke\s+all\s+privileges\s+on\s+table\s+public\.app_activity_daily/i,
    )
    expect(migration).not.toMatch(/grant\s+select\s+on\s+table\s+public\.app_activity_daily\s+to\s+authenticated/i)
    expect(migration).toMatch(
      /grant\s+execute\s+on\s+function\s+public\.get_admin_dashboard_metrics\(\)\s+to\s+authenticated/i,
    )
  })

  it("uses Warsaw dates, deduplicated daily rows, and low-frequency heartbeat", () => {
    expect(ADMIN_TIME_ZONE).toBe("Europe/Warsaw")
    expect(ADMIN_HEARTBEAT_INTERVAL_MS).toBe(5 * 60 * 1_000)
    expect(ADMIN_ONLINE_WINDOW_MINUTES).toBe(10)
    expect(migration).toContain("primary key (user_id, activity_date)")
    expect(migration).toContain("timezone('Europe/Warsaw', v_now)::date")
    expect(migration).toContain("interval '10 minutes'")
  })

  it("allows only documented aggregate fields onto the client", () => {
    const parsed = parseAdminDashboardMetrics({
      ...validMetrics,
      email: "hidden@example.test",
      user_id: "hidden",
      earnings: 999,
    })
    expect(parsed).toEqual(validMetrics)
    expect(parsed).not.toHaveProperty("email")
    expect(parsed).not.toHaveProperty("user_id")
    expect(parsed).not.toHaveProperty("earnings")
  })

  it("preserves zero and new-baseline percentage semantics", () => {
    expect(parseAdminDashboardMetrics(validMetrics)?.comparisons.month).toEqual({
      current: 0,
      previous: 0,
      percentChange: 0,
    })
    expect(
      parseAdminDashboardMetrics({
        ...validMetrics,
        comparisons: {
          ...validMetrics.comparisons,
          week: { current: 1, previous: 0, percentChange: null },
        },
      })?.comparisons.week.percentChange,
    ).toBeNull()
  })

  it("keeps tracking best-effort and downstream of successful mutations", () => {
    expect(analyticsClient).toMatch(/try\s*{[\s\S]*catch\s*{[\s\S]*return false/)
    expect(workPage).toContain('void recordAnalyticsActivity("work")')
    expect(garagePage).toContain('void recordAnalyticsActivity("garage")')
    expect(expensesHook).toContain('void recordAnalyticsActivity("expenses")')
    expect(workPage).not.toContain('await recordAnalyticsActivity("work")')
    expect(garagePage).not.toContain('await recordAnalyticsActivity("garage")')
    expect(expensesHook).not.toContain('await recordAnalyticsActivity("expenses")')
  })

  it("does not expose an admin link in public navigation", () => {
    const publicAppSources = [
      "app/page.tsx",
      "app/work/page.tsx",
      "app/expenses/page.tsx",
      "app/garage/page.tsx",
    ].map(read)
    expect(publicAppSources.join("\n")).not.toMatch(/href=["']\/admin["']/)
  })
})
