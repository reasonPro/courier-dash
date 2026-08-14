"use client"

import { useEffect } from "react"

import { ADMIN_HEARTBEAT_INTERVAL_MS } from "../../lib/admin-dashboard"
import { recordSessionHeartbeat } from "../../lib/admin-analytics"
import { syncServerAuthSession } from "../../lib/server-session-client"
import { supabase } from "../../lib/supabase"

export function AuthSessionBridge() {
  useEffect(() => {
    let active = true

    const syncCurrentSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      const session = data.session
      await syncServerAuthSession(session?.access_token ?? null)
      if (session?.user.id) void recordSessionHeartbeat(session.user.id)
    }

    void syncCurrentSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (!active) return
        void syncServerAuthSession(session?.access_token ?? null)
        if (session?.user.id) void recordSessionHeartbeat(session.user.id)
      })
    })

    const heartbeatId = window.setInterval(() => {
      if (!active || document.visibilityState === "hidden") return
      void supabase.auth.getSession().then(({ data: sessionData }) => {
        const userId = sessionData.session?.user.id
        if (active && userId) void recordSessionHeartbeat(userId)
      })
    }, ADMIN_HEARTBEAT_INTERVAL_MS)

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void syncCurrentSession()
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      active = false
      data.subscription.unsubscribe()
      window.clearInterval(heartbeatId)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return null
}
