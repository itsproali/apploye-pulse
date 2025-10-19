export interface AppSettings {
  dailyHours: number // Default: 8
  monthlyTarget?: number // Optional monthly goal
  holidays: string[] // Array of date strings in YYYY-MM-DD format
}

export interface TimeData {
  hours: number
  minutes: number
}

export interface ProgressData {
  actualHours: TimeData
  expectedHours: TimeData
  difference: TimeData
  isAhead: boolean
  isOnTrack: boolean
  workingDaysPassed: number
  totalWorkingDays: number
  remainingWorkingDays: number
  progressPercentage: number
}

export interface MonthData {
  year: number
  month: number // 0-11 (JavaScript month format)
  workingDays: number
  holidays: string[]
}

export const DEFAULT_SETTINGS: AppSettings = {
  dailyHours: 8,
  holidays: []
}
