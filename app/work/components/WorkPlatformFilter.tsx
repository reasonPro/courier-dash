import { PLATFORM_LABELS, type PlatformKey } from "../../../lib/work-platforms"
import { togglePlatform } from "../../../lib/work-view"
import { workViewTranslations } from "../../../lib/work-view-translations"
import type { WorkLanguage } from "../work-page.types"

export function WorkPlatformFilter({ available, selected, onChange, lang, otherLabel }: {
  available: PlatformKey[]; selected: PlatformKey[]; onChange: (value: PlatformKey[]) => void
  lang: WorkLanguage; otherLabel: string
}) {
  const copy = workViewTranslations[lang]
  const allSelected = available.length > 0 && selected.length === available.length
  const control = "inline-flex min-h-11 md:min-h-10 max-w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
  return <fieldset className="min-w-0">
    <legend className="mb-2 text-sm font-medium text-gray-400">{copy.platforms}</legend>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!available.length} aria-pressed={allSelected}
        onClick={() => onChange([...available])}
        className={`${control} disabled:opacity-40 ${allSelected ? "border-cyan-400/50 bg-cyan-950/40 text-cyan-300" : "border-gray-700 text-gray-400 hover:text-white"}`}>
        {allSelected && <span aria-hidden="true">✓</span>}{copy.all}
      </button>
      {available.map(p => <button key={p} type="button" aria-pressed={selected.includes(p)}
        onClick={() => onChange(togglePlatform(selected, p))}
        className={`${control} ${selected.includes(p) ? "border-cyan-400/50 bg-cyan-950/40 text-cyan-300" : "border-gray-700 text-gray-400 hover:text-white"}`}>
        {selected.includes(p) && <span aria-hidden="true">✓</span>}
        <span className="min-w-0 break-words">{p === "other" ? otherLabel : PLATFORM_LABELS[p]}</span>
      </button>)}
    </div>
  </fieldset>
}
