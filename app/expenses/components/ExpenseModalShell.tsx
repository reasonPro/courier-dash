"use client"

import type { ReactNode } from "react"

type ExpenseModalShellProps = {
  children: ReactNode
  onClose: () => void
  title: string
  wide?: boolean
}

export function ExpenseModalShell({
  children,
  onClose,
  title,
  wide = false,
}: ExpenseModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-gray-700 bg-[#17171d] p-5 shadow-2xl sm:rounded-2xl sm:p-6 ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            aria-label={title}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-xl text-gray-300 transition hover:bg-gray-700 hover:text-white"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
