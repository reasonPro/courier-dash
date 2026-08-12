"use client"

import { useMemo, useState } from "react"

import {
  getLocalCalendarDate,
  isCalendarDate,
  isValidPlnInput,
  type PrototypeRentalPeriod,
} from "../../../lib/expenses-prototype"
import type { ExpensesCopy } from "../../../lib/expenses-translations"
import { ExpenseModalShell } from "./ExpenseModalShell"

type RentalInput = {
  validFrom: string
  validTo: string | null
  weeklyAmount: string
}

type RentalManagerModalProps = {
  copy: ExpensesCopy
  onChangeRate: (
    id: string,
    value: { validFrom: string; weeklyAmount: string },
  ) => void
  onClose: () => void
  onCorrect: (id: string, value: RentalInput) => void
  onCreate: (value: RentalInput) => void
  onSuccess: (message: string) => void
  open: boolean
  periods: PrototypeRentalPeriod[]
}

type Mode = "create" | "rate" | "history" | null

export function RentalManagerModal({
  copy,
  onChangeRate,
  onClose,
  onCorrect,
  onCreate,
  onSuccess,
  open,
  periods,
}: RentalManagerModalProps) {
  const sorted = useMemo(
    () => [...periods].sort((a, b) => b.validFrom.localeCompare(a.validFrom)),
    [periods],
  )
  const current = sorted.find((period) => period.validTo === null) ?? null
  const [mode, setMode] = useState<Mode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [weeklyAmount, setWeeklyAmount] = useState("")
  const [validFrom, setValidFrom] = useState(getLocalCalendarDate())
  const [validTo, setValidTo] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const resetForm = (nextMode: Mode, period?: PrototypeRentalPeriod) => {
    setMode(nextMode)
    setEditingId(period?.id ?? null)
    setWeeklyAmount(period?.weeklyAmount ?? current?.weeklyAmount ?? "")
    setValidFrom(period?.validFrom ?? getLocalCalendarDate())
    setValidTo(period?.validTo ?? "")
    setError(null)
  }

  const submit = () => {
    if (
      !isValidPlnInput(weeklyAmount) ||
      !isCalendarDate(validFrom) ||
      (validTo !== "" && !isCalendarDate(validTo)) ||
      (validTo !== "" && validTo < validFrom)
    ) {
      setError(
        validTo !== "" && validTo < validFrom
          ? copy.invalidRentalRange
          : copy.amountInvalid,
      )
      return
    }
    try {
      if (mode === "create") {
        onCreate({ weeklyAmount, validFrom, validTo: validTo || null })
        onSuccess(copy.rentalSaved)
      } else if (mode === "rate" && current) {
        onChangeRate(current.id, { weeklyAmount, validFrom })
        onSuccess(copy.rentalSaved)
      } else if (mode === "history" && editingId) {
        onCorrect(editingId, {
          weeklyAmount,
          validFrom,
          validTo: validTo || null,
        })
        onSuccess(copy.rentalCorrected)
      }
      setMode(null)
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message === "RENTAL_OVERLAP"
          ? copy.rentalOverlap
          : copy.invalidRentalRange,
      )
    }
  }

  return (
    <ExpenseModalShell onClose={onClose} title={copy.rentalTitle} wide>
      {current ? (
        <div className="mb-5 grid gap-3 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {copy.currentWeeklyRate}
            </p>
            <p className="mt-1 text-xl font-black text-cyan-300">
              {current.weeklyAmount} PLN
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              {copy.activePeriod}
            </p>
            <p className="mt-1 font-semibold text-white">{current.validFrom} —</p>
          </div>
        </div>
      ) : (
        <p className="mb-5 rounded-xl border border-gray-800 bg-[#1e1e24] p-4 text-sm text-gray-400">
          {copy.noRentalPeriod}
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-bold text-gray-950"
          onClick={() => resetForm("create")}
          type="button"
        >
          {copy.createRental}
        </button>
        {current && (
          <button
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-semibold text-white"
            onClick={() => resetForm("rate", current)}
            type="button"
          >
            {copy.changeRate}
          </button>
        )}
      </div>

      {mode && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-[#202028] p-4">
          {mode === "history" && (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              {copy.correctionWarning}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-gray-300">
              {copy.weeklyRate}
              <input
                className="mt-1 w-full rounded-lg border border-gray-700 bg-[#17171d] px-3 py-2.5 text-white outline-none focus:border-cyan-500"
                inputMode="decimal"
                onChange={(event) => setWeeklyAmount(event.target.value)}
                value={weeklyAmount}
              />
            </label>
            <label className="text-sm text-gray-300">
              {mode === "rate" ? copy.newRateStart : copy.startDate}
              <input
                className="mt-1 w-full rounded-lg border border-gray-700 bg-[#17171d] px-3 py-2.5 text-white outline-none focus:border-cyan-500"
                onInput={(event) => setValidFrom(event.currentTarget.value)}
                type="date"
                value={validFrom}
              />
            </label>
            {mode !== "rate" && (
              <label className="text-sm text-gray-300 sm:col-span-2">
                {copy.endDate}
                <input
                  className="mt-1 w-full rounded-lg border border-gray-700 bg-[#17171d] px-3 py-2.5 text-white outline-none focus:border-cyan-500"
                  onInput={(event) => setValidTo(event.currentTarget.value)}
                  type="date"
                  value={validTo}
                />
                <span className="mt-1 block text-xs text-gray-500">
                  {copy.endInclusive}
                </span>
              </label>
            )}
          </div>
          {error && (
            <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="rounded-lg px-3 py-2 text-sm text-gray-400"
              onClick={() => setMode(null)}
              type="button"
            >
              {copy.cancel}
            </button>
            <button
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-gray-950"
              onClick={submit}
              type="button"
            >
              {mode === "history"
                ? copy.saveCorrection
                : mode === "rate"
                  ? copy.changeRate
                  : copy.createRental}
            </button>
          </div>
        </div>
      )}

      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-400">
        {copy.rateHistory}
      </h3>
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500">{copy.noRentalPeriod}</p>
        ) : (
          sorted.map((period) => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-[#1d1d24] p-3"
              key={period.id}
            >
              <div>
                <p className="font-semibold text-white">
                  {period.weeklyAmount} PLN
                </p>
                <p className="text-xs text-gray-500">
                  {period.validFrom} — {period.validTo ?? copy.currentPeriod}
                </p>
              </div>
              <button
                className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-300"
                onClick={() => resetForm("history", period)}
                type="button"
              >
                {copy.correctHistory}
              </button>
            </div>
          ))
        )}
      </div>
    </ExpenseModalShell>
  )
}
