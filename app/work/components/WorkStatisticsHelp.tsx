import { useId, useRef, useState } from "react";
import { workViewTranslations } from "../../../lib/work-view-translations";
import type { WorkLanguage } from "../work-page.types";

export function WorkStatisticsHelp({ lang }: { lang: WorkLanguage }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const copy = workViewTranslations[lang];

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-label={copy.statisticsHelpLabel}
        aria-haspopup="dialog"
        aria-controls={id}
        aria-expanded={open}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-700/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        <span aria-hidden="true" className="text-lg">ⓘ</span>
      </button>
      <div
        ref={content}
        id={id}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
        onToggle={event => {
          const visible = event.newState === "open";
          setOpen(visible);
          if (visible) content.current?.focus();
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-gray-700 bg-[#1e1e24] p-5 text-gray-300 shadow-2xl focus:outline-none"
      >
        <h4 id={`${id}-title`} className="mb-3 text-base font-bold text-white">{copy.statisticsHelpTitle}</h4>
        <div className="space-y-3 text-sm leading-relaxed">
          {copy.statisticsHelpParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </>
  );
}
