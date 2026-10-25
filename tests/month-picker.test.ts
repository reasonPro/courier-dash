import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { LocalizedMonthPicker } from "../app/components/LocalizedMonthPicker"
import { localizedMonths, monthWithYear } from "../lib/month-picker"

describe("localized month picker", () => {
  it.each([['uk', 'жовтень'], ['pl', 'październik'], ['en', 'October'], ['ru', 'октябрь']] as const)("renders %s independently of OS locale", (lang, october) => {
    expect(localizedMonths(lang)).toHaveLength(12)
    expect(localizedMonths(lang)[9]).toEqual({ value: '10', label: october })
    const changed = () => { throw new Error('Rendering a different language must not change the period') }
    const html = renderToStaticMarkup(createElement(LocalizedMonthPicker, { lang, value: '2026-10', onChange: changed, label: 'Period' }))
    expect(html).toContain(october)
    expect(html).toMatch(/<option value="10"[^>]*selected=""/)
    expect(html).toContain('value="2026"')
    expect(html).not.toContain('type="month"')
  })
  it('preserves canonical month when changing year', () => {
    expect(monthWithYear('2026-10', '2027')).toBe('2027-10')
    expect(monthWithYear('2026-12', '2025')).toBe('2025-12')
  })
  it.each(['', '0', '10000', '-1', '2026.5', 'oops'])('rejects invalid year %s', year => {
    expect(monthWithYear('2026-10', year)).toBeNull()
  })
})
