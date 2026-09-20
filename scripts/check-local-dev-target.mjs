import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { loadEnvConfig } = require("@next/env")
loadEnvConfig(process.cwd(), true, { info() {}, error() {} })

// npm run dev must not silently reuse Production credentials from .env.local.
// No network, secrets in output, credential rewriting or auth bypass.
let local = false
try {
  const target = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  local = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)
} catch { /* A missing/invalid target is not safe. */ }

if (!local || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Local development blocked: configure a verified local Supabase URL and publishable/anon key. Remote targets are not enabled for this local task. See docs/WORKFLOW.md.")
  process.exitCode = 1
}
