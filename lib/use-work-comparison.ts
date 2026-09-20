import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import { comparisonPeriods, localCalendarDate } from "./work-comparison"
import type { Shift } from "../app/work/work-page.types"

export function useWorkComparison(userId: string | null, month: string, refreshing: boolean) {
  const [today, setToday] = useState("")
  const [result, setResult] = useState<{ key: string; rows: Shift[]; state: "ready" | "error" }>({ key: "", rows: [], state: "ready" })
  const key = `${userId}:${month}`
  useEffect(() => {
    const tick = () => setToday(localCalendarDate())
    // Calendar boundaries come from the browser, never SSR's timezone.
    tick()
    const timer = setInterval(tick, 30000)
    window.addEventListener("focus", tick)
    return () => { clearInterval(timer); window.removeEventListener("focus", tick) }
  }, [])
  useEffect(() => {
    if (!userId || refreshing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Invalidate the previous snapshot while an authenticated refresh is in progress.
      setResult({ key: "", rows: [], state: "ready" })
      return
    }
    let active = true
    const controller = new AbortController()
    const load = async () => {
      const bounds = comparisonPeriods(month, "9999-12-31")
      const rows: Shift[] = []
      try {
        // Bounded, authenticated, paginated reads: never truncate a busy two-month period.
        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase.from("work_shifts").select("*").eq("user_id", userId)
            .gte("date", bounds.previousStart).lte("date", bounds.end).order("date").order("id")
            .range(offset, offset + 499).abortSignal(controller.signal)
          if (!active) return
          if (error || !data) throw new Error("comparison_read_failed")
          rows.push(...data as Shift[])
          if (data.length < 500) break
        }
        if (active) setResult({ key, rows, state: "ready" })
      } catch { if (active) setResult({ key, rows: [], state: "error" }) }
    }
    void load()
    return () => { active = false; controller.abort() }
  }, [userId, month, key, refreshing])
  return { today, rows: result.key === key ? result.rows : [],
    state: !today || !userId || refreshing || result.key !== key ? "loading" as const : result.state }
}
