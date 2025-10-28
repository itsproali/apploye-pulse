/**
 * Apploye UI Selectors
 * These selectors are used to target elements in the Apploye timesheet interface.
 * If Apploye updates their UI, these selectors need to be updated accordingly.
 */

// Badge/Total Hours Selectors
export const BADGE_SELECTOR = ".sc-jGONNV.cSDwqo"
export const BADGE_WITH_CALENDAR_SELECTOR = ".rbc-calendar .sc-jGONNV.cSDwqo"

// Calendar Selectors
export const CALENDAR_SELECTOR = ".rbc-calendar"
export const DATE_CELL_SELECTOR = ".rbc-date-cell:not(.rbc-off-range)"
export const OFF_RANGE_CELL_SELECTOR = ".rbc-off-range"

// Month Header Selector
export const MONTH_HEADER_SELECTOR = ".sc-gzpZyF.eyiZkS"

// Month Picker Selector
export const MONTH_PICKER_SELECTOR = ".react-datepicker-wrapper"

// Text Content Patterns
export const TOTAL_HOUR_TEXT_PATTERN = /total hour/
export const HOURS_MINUTES_PATTERN = /^\d+h\s*\d*m?$/
