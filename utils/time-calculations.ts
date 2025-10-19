import type { AppSettings, MonthData, ProgressData, TimeData } from "~types"

import { getWorkingDays, getWorkingDaysPassed } from "./date"

/**
 * Parse time string like "64h 18m" or "5h 30m" into TimeData
 */
export function parseTimeString(timeStr: string): TimeData {
  const hourMatch = timeStr.match(/(\d+)h/)
  const minuteMatch = timeStr.match(/(\d+)m/)

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0

  return { hours, minutes }
}

/**
 * Convert TimeData to total minutes
 */
export function timeToMinutes(time: TimeData): number {
  return time.hours * 60 + time.minutes
}

/**
 * Convert minutes to TimeData
 */
export function minutesToTime(totalMinutes: number): TimeData {
  const hours = Math.floor(Math.abs(totalMinutes) / 60)
  const minutes = Math.abs(totalMinutes) % 60
  return { hours, minutes }
}

/**
 * Format TimeData as string (e.g., "5h 30m" or "30m")
 */
export function formatTime(time: TimeData): string {
  const parts: string[] = []
  if (time.hours > 0) {
    parts.push(`${time.hours}h`)
  }
  if (time.minutes > 0 || parts.length === 0) {
    parts.push(`${time.minutes}m`)
  }
  return parts.join(" ")
}

/**
 * Calculate expected hours based on working days passed and daily hours
 */
export function calculateExpectedHours(
  workingDaysPassed: number,
  dailyHours: number
): TimeData {
  const totalMinutes = workingDaysPassed * dailyHours * 60
  return minutesToTime(totalMinutes)
}

/**
 * Calculate the difference between actual and expected hours
 */
export function calculateDifference(
  actual: TimeData,
  expected: TimeData
): { difference: TimeData; isAhead: boolean } {
  const actualMinutes = timeToMinutes(actual)
  const expectedMinutes = timeToMinutes(expected)
  const diffMinutes = actualMinutes - expectedMinutes

  return {
    difference: minutesToTime(diffMinutes),
    isAhead: diffMinutes >= 0
  }
}

/**
 * Calculate complete progress data for the current month
 */
export function calculateProgress(
  actualHoursStr: string,
  settings: AppSettings & { currentMonth?: number; currentYear?: number }
): ProgressData | null {
  try {
    const now = new Date()

    // Validate current date
    if (!now || isNaN(now.getTime())) {
      throw new Error("Invalid current date")
    }

    // Use provided month/year or fall back to current date
    const year = settings.currentYear ?? now.getFullYear()
    const month = settings.currentMonth ?? now.getMonth()

    // Check if viewing a different month
    const isDifferentMonth =
      settings.currentMonth !== undefined &&
      settings.currentYear !== undefined &&
      (settings.currentMonth !== now.getMonth() ||
        settings.currentYear !== now.getFullYear())

    if (isDifferentMonth) {
      return null
    }

    const actualHours = parseTimeString(actualHoursStr)
    const holidays = settings.holidays || []
    const workingDaysArray = getWorkingDays(year, month, holidays)
    const daysPassedArray = getWorkingDaysPassed(year, month, holidays)

    const workingDays = workingDaysArray.length
    const daysPassed = daysPassedArray.length

    const expectedHours = calculateExpectedHours(
      daysPassed,
      settings.dailyHours
    )

    const { difference, isAhead } = calculateDifference(
      actualHours,
      expectedHours
    )

    // Calculate progress percentage
    const totalExpectedMinutes = workingDays * settings.dailyHours * 60
    const actualMinutes = timeToMinutes(actualHours)

    // Avoid division by zero
    const progressPercentage =
      totalExpectedMinutes > 0
        ? Math.min((actualMinutes / totalExpectedMinutes) * 100, 100)
        : 0

    // Check if on track (within 30 minutes)
    const diffMinutes = Math.abs(timeToMinutes(difference))
    const isOnTrack = diffMinutes <= 30

    return {
      actualHours,
      expectedHours,
      difference,
      isAhead,
      isOnTrack,
      workingDaysPassed: daysPassed,
      totalWorkingDays: workingDays,
      remainingWorkingDays: workingDays - daysPassed,
      progressPercentage
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get month data for display
 */
export function getMonthData(
  year: number,
  month: number,
  holidays: string[] = []
): MonthData {
  const workingDays = getWorkingDays(year, month, holidays)

  return {
    year,
    month,
    workingDays: workingDays.length,
    holidays: holidays.filter((h) => {
      try {
        // Parse date string manually to avoid date-fns issues
        const parts = h.split("-")
        if (parts.length !== 3) return false

        const holidayYear = parseInt(parts[0])
        const holidayMonth = parseInt(parts[1]) - 1 // JS months are 0-indexed

        return holidayYear === year && holidayMonth === month
      } catch {
        return false
      }
    })
  }
}

/**
 * Format progress message for badge
 */
export function formatProgressMessage(progress: ProgressData): string {
  const sign = progress.isAhead ? "+" : "−"
  const timeStr = formatTime(progress.difference)

  if (progress.isOnTrack) {
    return "✓ On track"
  }

  return `${sign}${timeStr} ${progress.isAhead ? "ahead" : "behind"}`
}
