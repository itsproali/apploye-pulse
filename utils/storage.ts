import type { AppSettings } from "~types"
import { DEFAULT_SETTINGS } from "~types"

const SETTINGS_KEY = "apploye_pulse_settings"

/**
 * Get settings from chrome.storage.local
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const result = await chrome.storage.local.get(SETTINGS_KEY)
    return result[SETTINGS_KEY] || DEFAULT_SETTINGS
  } catch (error) {
    console.error("Error getting settings:", error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save settings to chrome.storage.local
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings })
  } catch (error) {
    console.error("Error saving settings:", error)
    throw error
  }
}

/**
 * Update partial settings
 */
export async function updateSettings(
  updates: Partial<AppSettings>
): Promise<AppSettings> {
  const currentSettings = await getSettings()
  const newSettings = { ...currentSettings, ...updates }
  await saveSettings(newSettings)
  return newSettings
}

/**
 * Add a holiday
 */
export async function addHoliday(date: string): Promise<AppSettings> {
  const settings = await getSettings()
  if (!settings.holidays.includes(date)) {
    settings.holidays.push(date)
    settings.holidays.sort()
    await saveSettings(settings)
  }
  return settings
}

/**
 * Remove a holiday
 */
export async function removeHoliday(date: string): Promise<AppSettings> {
  const settings = await getSettings()
  settings.holidays = settings.holidays.filter((h) => h !== date)
  await saveSettings(settings)
  return settings
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<AppSettings> {
  await saveSettings(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}


