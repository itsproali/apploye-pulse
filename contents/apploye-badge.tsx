import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import { useEffect, useState } from "react"

import {
  BADGE_SELECTOR,
  BADGE_WITH_CALENDAR_SELECTOR,
  CALENDAR_SELECTOR,
  HOURS_MINUTES_PATTERN,
  MONTH_HEADER_SELECTOR,
  MONTH_PICKER_SELECTOR,
  TOTAL_HOUR_TEXT_PATTERN
} from "~constants/selectors"
import type { AppSettings, ProgressData } from "~types"
import { getSettings } from "~utils/storage"
import {
  calculateProgress,
  formatProgressMessage,
  formatTime
} from "~utils/time-calculations"

export const config: PlasmoCSConfig = {
  matches: ["https://app.apploye.com/user/timesheet/monthly*"]
}

// Export styles for Shadow DOM
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    .apploye-pulse-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-right: 1rem;
    }
    
    .badge-container {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      cursor: help;
      transition: all 0.2s;
    }
    
    .badge-container:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    
    .badge-on-track {
      background-color: #f1f5f9;
      color: #4F46E5;
    }
    
    .badge-ahead {
      background-color: #f0fdf4;
      color: #10b981;
    }
    
    .badge-behind {
      background-color: #fef2f2;
      color: #ef4444;
    }
    
    .tooltip {
      position: absolute;
      top: 100%;
      left: 0;
      width: 18rem;
      padding-top: 0.5rem;
    }
    
    .tooltip-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      border: 1px solid rgb(229 231 235);
      z-index: 50;
    }
    
    .tooltip-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }
    
    .tooltip-label {
      color: rgb(107 114 128);
    }
    
    .tooltip-value {
      font-weight: 600;
      color: rgb(17 24 39);
    }
    
    .tooltip-divider {
      border-top: 1px solid rgb(229 231 235);
      padding-top: 0.5rem;
    }
    
    .loading-spinner {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background-color: rgb(243 244 246);
      color: rgb(107 114 128);
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `
  return style
}

// Use Plasmo's inline anchor system
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const badge = document.querySelector(BADGE_WITH_CALENDAR_SELECTOR)
  if (badge) {
    const badgeText = badge.textContent?.toLowerCase() || ""
    if (badgeText.includes("total hour")) {
      return { element: badge, insertPosition: "beforebegin" }
    }
  }
  return null
}

// Main component for the badge
const ProgressBadge = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  )
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  )

  const detectMonthChange = () => {
    const monthHeader = document.querySelector(MONTH_HEADER_SELECTOR)
    if (monthHeader) {
      const headerText = monthHeader.textContent || ""
      const [monthName, year] = headerText.split(", ")

      try {
        const currentDate = new Date(`${monthName} 1, ${year}`)
        const monthIndex = currentDate.getMonth()
        const yearNum = currentDate.getFullYear()

        if (monthIndex !== currentMonth || yearNum !== currentYear) {
          setCurrentMonth(monthIndex)
          setCurrentYear(yearNum)
          return true
        }
      } catch (error) {
        console.warn("Error parsing month:", error)
      }
    }
    return false
  }

  const extractTotalHours = (): string | null => {
    const totalBadge = document.querySelector(BADGE_SELECTOR)

    if (totalBadge) {
      const spans = totalBadge.querySelectorAll("span")
      for (const span of spans) {
        const text = span.textContent?.trim() || ""
        if (HOURS_MINUTES_PATTERN.test(text)) {
          return text
        }
      }
    }

    // Fallback: search for "Total Hour" text
    const allElements = document.querySelectorAll("span, div")
    for (const element of allElements) {
      const text = element.textContent?.toLowerCase() || ""
      if (TOTAL_HOUR_TEXT_PATTERN.test(text)) {
        const parent = element.parentElement
        if (parent) {
          const spans = parent.querySelectorAll("span")
          for (const span of spans) {
            const spanText = span.textContent?.trim() || ""
            if (HOURS_MINUTES_PATTERN.test(spanText)) {
              return spanText
            }
          }
        }
        break
      }
    }

    return null
  }

  const updateProgress = async () => {
    try {
      const totalHoursText = extractTotalHours()

      if (!totalHoursText) {
        setError("Could not find total hours")
        return
      }

      const currentSettings = await getSettings()

      if (!currentSettings) {
        setError("Settings not loaded")
        return
      }

      setSettings(currentSettings)

      // Create month-specific settings for progress calculation
      const monthSettings = {
        ...currentSettings,
        currentMonth,
        currentYear
      }

      const progressData = calculateProgress(totalHoursText, monthSettings)
      setProgress(progressData)
      setError(null)
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    // Check if target element exists and set visibility
    const checkVisibility = () => {
      const badge = document.querySelector(BADGE_WITH_CALENDAR_SELECTOR)
      const exists =
        badge && badge.textContent?.toLowerCase().includes("total hour")
      setIsVisible(!!exists)
      return exists
    }

    // Initial check
    if (checkVisibility()) {
      updateProgress()
    }

    const observer = new MutationObserver((mutations) => {
      const shouldUpdate = mutations.some((mutation) => {
        const target = mutation.target as Element
        return (
          target.closest(CALENDAR_SELECTOR) ||
          target.closest(MONTH_PICKER_SELECTOR) || // Month picker
          target.textContent?.includes("Total Hour") ||
          target.classList.contains("sc-gzpZyF") || // Month header container
          target.classList.contains("sc-meaPv") || // Month header text
          (target.textContent?.includes("h") &&
            target.textContent?.includes("m"))
        )
      })

      if (shouldUpdate) {
        // Check for month change first
        const monthChanged = detectMonthChange()

        if (checkVisibility()) {
          updateProgress()
        } else if (monthChanged) {
          // Update progress even if not visible (month changed)
          updateProgress()
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })

    const handleStorageChange = () => {
      if (isVisible) {
        updateProgress()
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)

    const interval = setInterval(() => {
      if (isVisible) {
        updateProgress()
      }
    }, 60000)

    return () => {
      observer.disconnect()
      chrome.storage.onChanged.removeListener(handleStorageChange)
      clearInterval(interval)
    }
  }, [isVisible])

  // Don't render if target element is not visible
  if (!isVisible) {
    return null
  }

  // Don't render if it's a different month
  const monthHeader = document.querySelector(MONTH_HEADER_SELECTOR)
  if (monthHeader) {
    const headerText = monthHeader.textContent || ""
    const [monthName, year] = headerText.split(", ")

    try {
      const selectedDate = new Date(`${monthName} 1, ${year}`)
      const currentDate = new Date()

      if (
        selectedDate.getMonth() !== currentDate.getMonth() ||
        selectedDate.getFullYear() !== currentDate.getFullYear()
      ) {
        return null
      }
    } catch {
      // If we can't parse the date, don't show badge
      return null
    }
  }

  if (error) {
    return (
      <div className="apploye-pulse-badge">
        <div className="badge-container badge-behind">⚠️ {error}</div>
      </div>
    )
  }

  if (!progress || !settings) {
    return (
      <div className="apploye-pulse-badge">
        <div className="loading-spinner">
          <span className="pulse">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render if progress is null (different month)
  if (progress === null) {
    return null
  }

  const badgeClass = progress.isOnTrack
    ? "badge-on-track"
    : progress.isAhead
      ? "badge-ahead"
      : "badge-behind"

  const icon = progress.isOnTrack ? "✓" : progress.isAhead ? "🟢" : "🔴"

  return (
    <div
      className="apploye-pulse-badge"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      <div className={`badge-container ${badgeClass}`}>
        <span>{icon}</span>
        <span>{formatProgressMessage(progress)}</span>
      </div>

      {showTooltip && (
        <div className="tooltip">
          <div className="tooltip-content">
            <div className="tooltip-row">
              <span className="tooltip-label">Expected so far:</span>
              <span className="tooltip-value">
                {formatTime(progress.expectedHours)}
              </span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Actual total:</span>
              <span className="tooltip-value">
                {formatTime(progress.actualHours)}
              </span>
            </div>
            <div className="tooltip-divider">
              <div className="tooltip-row">
                <span className="tooltip-label">Working days passed:</span>
                <span className="tooltip-value">
                  {progress.workingDaysPassed} / {progress.totalWorkingDays}
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Remaining days:</span>
                <span className="tooltip-value">
                  {progress.remainingWorkingDays}
                </span>
              </div>
            </div>
            <div className="tooltip-divider">
              <div className="tooltip-row">
                <span className="tooltip-label">Daily target:</span>
                <span className="tooltip-value">{settings.dailyHours}h</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Progress:</span>
                <span className="tooltip-value">
                  {progress.progressPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHours") {
    try {
      const totalBadge = document.querySelector(BADGE_SELECTOR)
      let totalHoursText = null

      if (totalBadge) {
        const spans = totalBadge.querySelectorAll("span")
        for (const span of spans) {
          const text = span.textContent?.trim() || ""
          if (HOURS_MINUTES_PATTERN.test(text)) {
            totalHoursText = text
            break
          }
        }
      }

      sendResponse({ hours: totalHoursText || "0h 0m" })
    } catch (error) {
      console.error("Error extracting hours:", error)
      sendResponse({ hours: "0h 0m" })
    }
  }
  return true
})

export default ProgressBadge
