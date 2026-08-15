"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { ADMIN_HEARTBEAT_INTERVAL_MS } from "../../lib/admin-dashboard"
import { recordSessionHeartbeat } from "../../lib/admin-analytics"
import {
  clearRecoverySessionMarker,
  hasRecoveryCallbackParams,
  hasRecoverySessionMarker,
  hasRecoveryUrlError,
  isPasswordRecoveryCallback,
  isPasswordRecoveryRoute,
  markRecoverySession,
  PASSWORD_RECOVERY_ROUTE,
  shouldIsolateRecoverySession,
} from "../../lib/password-recovery"
import { syncServerAuthSession } from "../../lib/server-session-client"
import { supabase } from "../../lib/supabase"

export function AuthSessionBridge() {
  const pathname = usePathname()

  useEffect(() => {
    let active = true
    const recoveryRoute = isPasswordRecoveryRoute(pathname)
    const recoveryCallback = isPasswordRecoveryCallback(
      window.location.search,
      window.location.hash,
    )

    if (recoveryCallback && !recoveryRoute) {
      window.location.replace(
        `${PASSWORD_RECOVERY_ROUTE}${window.location.search}${window.location.hash}`,
      )
      return
    }

    const recoveryCallbackPresent = hasRecoveryCallbackParams(
      window.location.search,
      window.location.hash,
    )

    if (
      recoveryRoute &&
      recoveryCallbackPresent &&
      !hasRecoveryUrlError(window.location.search, window.location.hash)
    ) {
      markRecoverySession(window.localStorage)
    }

    const recoverySessionMarked = hasRecoverySessionMarker(window.localStorage)
    const recoverySessionIsolated = shouldIsolateRecoverySession(
      pathname,
      window.location.search,
      window.location.hash,
      undefined,
      recoverySessionMarked,
    )

    const syncCurrentSession = async () => {
      if (recoverySessionIsolated) {
        await syncServerAuthSession(null)

        if (recoverySessionMarked && !recoveryRoute) {
          clearRecoverySessionMarker(window.localStorage)
          await supabase.auth.signOut({ scope: "local" })
        }

        return
      }

      const { data } = await supabase.auth.getSession()
      if (!active) return
      const session = data.session
      await syncServerAuthSession(session?.access_token ?? null)
      if (session?.user.id) void recordSessionHeartbeat(session.user.id)
    }

    void syncCurrentSession()

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      queueMicrotask(() => {
        if (!active) return

        if (event === "PASSWORD_RECOVERY") {
          markRecoverySession(window.localStorage)
        } else if (event === "SIGNED_OUT") {
          clearRecoverySessionMarker(window.localStorage)
        }

        if (
          shouldIsolateRecoverySession(
            pathname,
            window.location.search,
            window.location.hash,
            event,
            hasRecoverySessionMarker(window.localStorage),
          )
        ) {
          void syncServerAuthSession(null)

          if (event === "PASSWORD_RECOVERY" && !recoveryRoute) {
            clearRecoverySessionMarker(window.localStorage)
            void supabase.auth.signOut({ scope: "local" })
          }

          return
        }

        void syncServerAuthSession(session?.access_token ?? null)
        if (session?.user.id) void recordSessionHeartbeat(session.user.id)
      })
    })

    if (recoverySessionIsolated) {
      return () => {
        active = false
        data.subscription.unsubscribe()
      }
    }

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
  }, [pathname])

  return null
}
