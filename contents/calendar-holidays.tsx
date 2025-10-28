import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetInlineAnchorList,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useState } from "react"

import { DATE_CELL_SELECTOR, MONTH_HEADER_SELECTOR } from "~constants/selectors"
import { getSettings } from "~utils/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://app.apploye.com/user/timesheet/monthly*"]
}

// Export styles for holiday highlighting
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    /* Holiday indicator styles */
    .holiday-indicator {
      position: absolute;
      top: 2px;
      right: 2px;
      z-index: 20;
      pointer-events: none;
    }
    
    .holiday-badge {
      display: flex;
      align-items: center;
      gap: 2px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      animation: holidayPulse 2s ease-in-out infinite;
    }
    
    .holiday-icon {
      font-size: 8px;
      animation: holidayBounce 1.5s ease-in-out infinite;
    }
    
    .holiday-text {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    @keyframes holidayPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(255, 107, 107, 0.4);
      }
    }
    
    @keyframes holidayBounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-2px);
      }
    }
    
    /* Highlight the date cell background */
    .rbc-date-cell:has(.holiday-indicator) {
      background: linear-gradient(135deg, #fef2f2, #fee2e2) !important;
      border-radius: 8px !important;
      position: relative !important;
    }
    
    .rbc-date-cell:has(.holiday-indicator) .custom-date-cell span {
      background-color: #ef4444 !important;
      color: white !important;
      border-radius: 50% !important;
      font-weight: 700 !important;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3) !important;
    }
    
    .rbc-date-cell:has(.holiday-indicator):hover {
      transform: scale(1.02);
      transition: all 0.2s ease;
    }
  `
  return style
}

// Use Plasmo's inline anchor list to attach to all calendar date cells
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const dateCells = document.querySelectorAll(DATE_CELL_SELECTOR)
  return Array.from(dateCells).map((cell) => ({
    element: cell,
    insertPosition: "afterbegin" as const
  }))
}

const CalendarHolidayMarker = ({ anchor }: PlasmoCSUIProps) => {
  const element = anchor.element as HTMLElement
  const [holidays, setHolidays] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadHolidays = async () => {
    try {
      const settings = await getSettings()
      if (settings?.holidays) {
        setHolidays(settings.holidays)
      }
      setIsLoaded(true)
    } catch (error) {
      console.error("Error loading holidays:", error)
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadHolidays()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadHolidays()
    }
    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  // Check if this specific date cell should be marked as holiday
  const checkHoliday = () => {
    if (!isLoaded || !holidays.length) return false

    const daySpan = element?.textContent
    if (!daySpan) return false

    const day = parseInt(daySpan || "0")
    if (isNaN(day)) return false

    // Get current month and year from the calendar header
    const monthHeader = document.querySelector(MONTH_HEADER_SELECTOR)
    if (!monthHeader) return false

    const headerText = monthHeader.textContent || ""
    const [monthName, year] = headerText.split(", ")

    try {
      const currentDate = new Date(`${monthName} 1, ${year}`)
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      return holidays.some((holidayDate) => {
        try {
          const holiday = new Date(holidayDate)
          return (
            holiday.getDate() === day &&
            holiday.getMonth() === currentMonth &&
            holiday.getFullYear() === currentYear
          )
        } catch {
          return false
        }
      })
    } catch {
      return false
    }
  }

  const isHoliday = checkHoliday()

  // Don't render anything if not a holiday
  if (!isHoliday) {
    return null
  }

  return (
    <div className="holiday-indicator">
      <div className="holiday-badge">
        <span className="holiday-icon">🎉</span>
        <span className="holiday-text">Holiday</span>
      </div>
    </div>
  )
}

export default CalendarHolidayMarker
