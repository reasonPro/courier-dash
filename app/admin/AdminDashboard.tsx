"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  parseAdminDashboardMetrics,
  type AdminComparisonMetric,
  type AdminDashboardMetrics,
} from "../../lib/admin-dashboard"

const numberFormatter = new Intl.NumberFormat("uk-UA")
const percentFormatter = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 1,
})
const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit",
  month: "short",
  timeZone: "Europe/Warsaw",
})
const timeFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
})

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail?: string
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <p className="text-sm leading-5 text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-white">
        {numberFormatter.format(value)}
      </p>
      {detail && <p className="mt-2 text-xs text-slate-500">{detail}</p>}
    </article>
  )
}

function ComparisonCard({
  label,
  metric,
}: {
  label: string
  metric: AdminComparisonMetric
}) {
  const change = metric.percentChange
  const positive = change !== null && change > 0
  const negative = change !== null && change < 0
  const indicator =
    change === null
      ? "Новий базовий період"
      : `${positive ? "+" : ""}${percentFormatter.format(change)}%`

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-black text-white">
            {numberFormatter.format(metric.current)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Попередній проміжок: {numberFormatter.format(metric.previous)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            positive
              ? "bg-emerald-500/15 text-emerald-300"
              : negative
                ? "bg-rose-500/15 text-rose-300"
                : "bg-slate-500/15 text-slate-300"
          }`}
        >
          {indicator}
        </span>
      </div>
    </article>
  )
}

function ActivityChart({ metrics }: { metrics: AdminDashboardMetrics }) {
  const maximum = Math.max(1, ...metrics.activity30.map((item) => item.users))
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">Активність за 30 днів</h2>
        <p className="mt-1 text-sm text-slate-400">
          Унікальні авторизовані користувачі за календарний день
        </p>
      </div>
      <div
        aria-label="Графік активності користувачів за 30 днів"
        className="flex h-48 items-end gap-1 overflow-hidden border-b border-white/10 pb-1"
        role="img"
      >
        {metrics.activity30.map((item, index) => (
          <div
            className="group relative flex h-full min-w-0 flex-1 items-end"
            key={item.date}
          >
            <div
              className="w-full min-h-1 rounded-t bg-gradient-to-t from-blue-600 to-cyan-400 transition group-hover:brightness-125"
              style={{ height: `${Math.max(3, (item.users / maximum) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#121219] px-2 py-1 text-xs text-white shadow-xl group-hover:block">
              {dateFormatter.format(new Date(`${item.date}T12:00:00`))}: {item.users}
            </div>
            {(index === 0 || index === metrics.activity30.length - 1) && (
              <span className="absolute -bottom-6 text-[10px] text-slate-500 first:left-0 last:right-0">
                {dateFormatter.format(new Date(`${item.date}T12:00:00`))}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/metrics", { cache: "no-store" })
      const data: unknown = await response.json().catch(() => null)
      const parsed = response.ok ? parseAdminDashboardMetrics(data) : null
      if (!parsed) throw new Error("unavailable")
      setMetrics(parsed)
    } catch {
      setError("Не вдалося завантажити агреговані показники. Спробуйте ще раз.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch completion owns the resulting UI state.
    void load()
  }, [load])

  const updatedAt = useMemo(
    () => (metrics ? timeFormatter.format(new Date(metrics.generatedAt)) : null),
    [metrics],
  )

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              CourierDash · приватна аналітика
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Адмін-панель
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Лише агреговані показники, часовий пояс Europe/Warsaw.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {updatedAt && (
              <span className="text-xs text-slate-500">Оновлено {updatedAt}</span>
            )}
            <button
              className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void load()}
              type="button"
            >
              {isLoading ? "Оновлення…" : "Оновити"}
            </button>
          </div>
        </header>

        {isLoading && !metrics && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400" role="status">
            Завантаження агрегованих показників…
          </div>
        )}

        {error && !metrics && (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-6" role="alert">
            <p className="font-bold text-rose-200">{error}</p>
            <button
              className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white"
              onClick={() => void load()}
              type="button"
            >
              Повторити
            </button>
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            {error && (
              <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200" role="status">
                {error} Показано останні успішно завантажені дані.
              </p>
            )}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard detail="heartbeat за останні 10 хвилин" label="Онлайн зараз" value={metrics.onlineNow} />
              <MetricCard label="Усього користувачів" value={metrics.totalUsers} />
              <MetricCard detail="поточний тиждень" label="Нові користувачі" value={metrics.newUsers.week} />
              <MetricCard detail="поточний місяць" label="Нові користувачі" value={metrics.newUsers.month} />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-lg font-bold text-white">Активні користувачі</h2>
                <p className="mt-1 text-sm text-slate-400">Відкривали авторизований CourierDash</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Сьогодні" value={metrics.activeUsers.today} />
                  <MetricCard label="7 днів" value={metrics.activeUsers.days7} />
                  <MetricCard label="30 днів" value={metrics.activeUsers.days30} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-lg font-bold text-white">Активність із даними</h2>
                <p className="mt-1 text-sm text-slate-400">Успішно створювали або редагували Work, Garage чи Expenses</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Сьогодні" value={metrics.dataActiveUsers.today} />
                  <MetricCard label="7 днів" value={metrics.dataActiveUsers.days7} />
                  <MetricCard label="30 днів" value={metrics.dataActiveUsers.days30} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white">Використання функцій</h2>
                <p className="mt-1 text-sm text-slate-400">Користувачі, які мають записи у відповідному розділі</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(["work", "garage", "expenses"] as const).map((area) => {
                  const item = metrics.adoption[area]
                  const label = area === "work" ? "Work" : area === "garage" ? "Garage" : "Expenses"
                  return (
                    <article className="rounded-xl border border-white/10 bg-black/15 p-4" key={area}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-white">{label}</span>
                        <span className="text-sm font-bold text-blue-300">{percentFormatter.format(item.percent)}%</span>
                      </div>
                      <p className="mt-2 text-2xl font-black text-white">{numberFormatter.format(item.count)}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min(100, item.percent)}%` }} />
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <MetricCard detail="були активні щонайменше у два різні дні за останні 30 днів" label="Користувачі, що повертаються" value={metrics.returningUsers.days30} />
              <ComparisonCard label="Поточний тиждень" metric={metrics.comparisons.week} />
              <ComparisonCard label="Поточний місяць" metric={metrics.comparisons.month} />
            </section>

            <ActivityChart metrics={metrics} />
          </div>
        )}
      </div>
    </main>
  )
}
