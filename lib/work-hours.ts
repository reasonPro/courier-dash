export type WorkBreak = {
  start: string
  end: string
}

function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function calculateWorkedHours(
  shiftStart: string,
  shiftEnd: string,
  breaks: WorkBreak[],
) {
  const startMinutes = parseTime(shiftStart)
  let endMinutes = parseTime(shiftEnd)

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }

  let workedMinutes = endMinutes - startMinutes

  breaks.forEach((workBreak) => {
    if (!workBreak.start || !workBreak.end) {
      return
    }

    let breakStart = parseTime(workBreak.start)
    let breakEnd = parseTime(workBreak.end)

    if (breakEnd < breakStart) {
      breakEnd += 24 * 60
    }

    if (
      breakStart < startMinutes &&
      breakStart + 24 * 60 < endMinutes
    ) {
      breakStart += 24 * 60
      breakEnd += 24 * 60
    }

    workedMinutes -= breakEnd - breakStart
  })

  return workedMinutes / 60
}
