import { PLATFORM_LABELS, type PlatformKey } from "../../../lib/work-platforms"
import { togglePlatform } from "../../../lib/work-view"
import { workViewTranslations } from "../../../lib/work-view-translations"
import type { WorkLanguage } from "../work-page.types"

export function WorkPlatformFilter({ available, selected, onChange, lang, otherLabel }: {
  available: PlatformKey[]; selected: PlatformKey[]; onChange: (value: PlatformKey[]) => void
  lang: WorkLanguage; otherLabel: string
}) {
  const copy = workViewTranslations[lang]
  return <fieldset className="mb-3 min-w-0">
    <legend className="mb-2 text-xs font-semibold text-gray-400">{copy.platforms}</legend>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!available.length} aria-pressed={selected.length === available.length}
        onClick={() => onChange([...available])} className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-white disabled:opacity-40">{copy.all}</button>
      {available.map(p => <button key={p} type="button" aria-pressed={selected.includes(p)}
        onClick={() => onChange(togglePlatform(selected, p))}
        className={`rounded-lg border px-3 py-1.5 text-xs transition ${selected.includes(p) ? "border-cyan-400/50 bg-cyan-950/40 text-cyan-300" : "border-gray-700 text-gray-400"}`}>
        {p === "other" ? otherLabel : PLATFORM_LABELS[p]}
      </button>)}
    </div>
  </fieldset>
}
