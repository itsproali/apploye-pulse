import {
  eachDayOfInterval,
  endOfMonth,
  isBefore,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfMonth
} from "date-fns"

/**
 * Get all working days in a month (excluding weekends and holidays)
 */
export function getWorkingDays(
  year: number,
  month: number,
  holidays: string[] = []
): Date[] {
  try {
    // Ensure valid date parameters
    if (!year || !Number.isFinite(year) || year < 1900 || year > 2100) {
      return []
    }
    if (!Number.isFinite(month) || month < 0 || month > 11) {
      return []
    }

    const start = startOfMonth(new Date(year, month))
    const end = endOfMonth(new Date(year, month))

    // Validate dates
    if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
      return []
    }

    const allDays = eachDayOfInterval({ start, end })

    const workingDays = allDays.filter((day) => {
      try {
        // Validate the day is a valid date
        if (!day || isNaN(day.getTime())) {
          return false
        }

        // Exclude weekends
        if (isWeekend(day)) return false

        // Exclude holidays - use native JS formatting to avoid date-fns issues
        try {
          const year = day.getFullYear()
          const month = String(day.getMonth() + 1).padStart(2, "0")
          const date = String(day.getDate()).padStart(2, "0")
          const dayStr = `${year}-${month}-${date}`

          if (holidays && holidays.includes(dayStr)) return false
        } catch (formatError) {
          return false
        }

        return true
      } catch (error) {
        return false
      }
    })

    return workingDays
  } catch (error) {
    return []
  }
}

/**
 * Get working days that have passed (up to and including today)
 */
export function getWorkingDaysPassed(
  year: number,
  month: number,
  holidays: string[] = []
): Date[] {
  try {
    const workingDays = getWorkingDays(year, month, holidays)
    const now = new Date()
    const today = startOfDay(now)

    if (!today || isNaN(today.getTime())) {
      return []
    }

    const passed = workingDays.filter((day) => {
      try {
        const dayStart = startOfDay(day)
        // Include today and all days before it
        const isPassed = isBefore(dayStart, today) || isSameDay(dayStart, today)
        return isPassed
      } catch (error) {
        return false
      }
    })

    return passed
  } catch (error) {
    return []
  }
}
