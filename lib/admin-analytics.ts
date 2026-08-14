"use client"

import {
  ADMIN_HEARTBEAT_INTERVAL_MS,
  type AdminActivityArea,
} from "./admin-dashboard"
import { supabase } from "./supabase"

const HEARTBEAT_STORAGE_PREFIX = "courierdash.analytics.heartbeat.v1"

export async function recordAnalyticsActivity(
  area: AdminActivityArea,
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("record_app_activity", { p_area: area })
    return !error
  } catch {
    return false
  }
}

export async function recordSessionHeartbeat(userId: string): Promise<boolean> {
  if (typeof window === "undefined" || document.visibilityState === "hidden") {
    return false
  }

  const storageKey = `${HEARTBEAT_STORAGE_PREFIX}.${userId}`
  const now = Date.now()
  try {
    const previous = Number.parseInt(localStorage.getItem(storageKey) ?? "0", 10)
    if (Number.isFinite(previous) && now - previous < ADMIN_HEARTBEAT_INTERVAL_MS) {
      return false
    }
    localStorage.setItem(storageKey, String(now))
  } catch {
    // Storage restrictions must never block the application or heartbeat.
  }

  return recordAnalyticsActivity("session")
}
