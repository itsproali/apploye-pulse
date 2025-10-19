import { parseISO } from "date-fns"
import { Calendar, Plus, RotateCcw, Save, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import Icon16 from "url:./assets/icon-16.png"
import Icon32 from "url:./assets/icon-32.png"

import { Badge } from "~components/ui/badge"
import { Button } from "~components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~components/ui/card"
import { Input } from "~components/ui/input"
import { Label } from "~components/ui/label"
import type { AppSettings } from "~types"
import {
  addHoliday,
  getSettings,
  removeHoliday,
  resetSettings,
  saveSettings
} from "~utils/storage"
import { getMonthData } from "~utils/time-calculations"
import { VERSION } from "~utils/version"

import "~style.css"

function OptionsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [dailyHours, setDailyHours] = useState<string>("8")
  const [monthlyTarget, setMonthlyTarget] = useState<string>("")
  const [newHoliday, setNewHoliday] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: "success" | "error"
  } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings()
      setSettings(currentSettings)
      setDailyHours(currentSettings.dailyHours.toString())
      setMonthlyTarget(currentSettings.monthlyTarget?.toString() || "")
      setLoading(false)
    } catch (error) {
      console.error("Error loading settings:", error)
      showMessage("Error loading settings", "error")
      setLoading(false)
    }
  }

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)

      const hours = parseFloat(dailyHours)
      if (isNaN(hours) || hours <= 0 || hours > 24) {
        showMessage("Please enter a valid daily hours (1-24)", "error")
        setSaving(false)
        return
      }

      const target = monthlyTarget ? parseFloat(monthlyTarget) : undefined
      if (monthlyTarget && (isNaN(target!) || target! <= 0)) {
        showMessage("Please enter a valid monthly target", "error")
        setSaving(false)
        return
      }

      const newSettings: AppSettings = {
        ...settings,
        dailyHours: hours,
        monthlyTarget: target
      }

      await saveSettings(newSettings)
      setSettings(newSettings)
      showMessage("Settings saved successfully!", "success")
    } catch (error) {
      console.error("Error saving settings:", error)
      showMessage("Error saving settings", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleAddHoliday = async () => {
    if (!newHoliday) {
      showMessage("Please select a date", "error")
      return
    }

    try {
      const updatedSettings = await addHoliday(newHoliday)
      setSettings(updatedSettings)
      setNewHoliday("")
      showMessage("Holiday added successfully!", "success")
    } catch (error) {
      console.error("Error adding holiday:", error)
      showMessage("Error adding holiday", "error")
    }
  }

  const handleRemoveHoliday = async (date: string) => {
    try {
      const updatedSettings = await removeHoliday(date)
      setSettings(updatedSettings)
      showMessage("Holiday removed successfully!", "success")
    } catch (error) {
      console.error("Error removing holiday:", error)
      showMessage("Error removing holiday", "error")
    }
  }

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all settings to defaults? This will remove all holidays."
      )
    ) {
      return
    }

    try {
      const defaultSettings = await resetSettings()
      setSettings(defaultSettings)
      setDailyHours(defaultSettings.dailyHours.toString())
      setMonthlyTarget("")
      setNewHoliday("")
      showMessage("Settings reset to defaults", "success")
    } catch (error) {
      console.error("Error resetting settings:", error)
      showMessage("Error resetting settings", "error")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Error loading settings</p>
      </div>
    )
  }

  const now = new Date()
  const monthData = getMonthData(
    now.getFullYear(),
    now.getMonth(),
    settings.holidays
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img src={Icon32} alt="Apploye Pulse" className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Apploye Pulse Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your daily hours and manage holidays
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Working Hours Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src={Icon16} alt="Working Hours" className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Set your expected daily working hours and monthly target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyHours">Daily Hours</Label>
                  <Input
                    id="dailyHours"
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    placeholder="8"
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected hours per working day (1-24)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyTarget">
                    Monthly Target (Optional)
                  </Label>
                  <Input
                    id="monthlyTarget"
                    type="number"
                    min="1"
                    step="1"
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(e.target.value)}
                    placeholder="160"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total hours goal for the month
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Month Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Month</CardTitle>
              <CardDescription>
                {now.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric"
                })}{" "}
                working days breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Working Days</p>
                  <p className="text-2xl font-bold">{monthData.workingDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Holidays</p>
                  <p className="text-2xl font-bold">
                    {monthData.holidays.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Expected Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {monthData.workingDays * settings.dailyHours}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                  <p className="text-2xl font-bold">{settings.dailyHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holidays Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Holidays
              </CardTitle>
              <CardDescription>
                Mark days as holidays to exclude them from calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Holiday */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value)}
                    placeholder="Select a date"
                  />
                </div>
                <Button onClick={handleAddHoliday} disabled={!newHoliday}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Holiday
                </Button>
              </div>

              {/* Holiday List */}
              {settings.holidays.length > 0 ? (
                <div className="space-y-2">
                  <Label>Marked Holidays ({settings.holidays.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.holidays
                      .sort((a, b) => a.localeCompare(b))
                      .map((holiday) => {
                        try {
                          const date = parseISO(holiday)
                          return (
                            <Badge
                              key={holiday}
                              variant="secondary"
                              className="px-3 py-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors">
                              <span>
                                {date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric"
                                })}
                              </span>
                              <button
                                onClick={() => handleRemoveHoliday(holiday)}
                                className="ml-2 hover:text-destructive">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          )
                        } catch {
                          return null
                        }
                      })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No holidays marked yet</p>
                  <p className="text-sm">
                    Add holidays to exclude them from working day calculations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • <strong>Daily Hours:</strong> Your expected working hours per
                day (default: 8h)
              </p>
              <p>
                • <strong>Holidays:</strong> Days marked as holidays are
                excluded from calculations
              </p>
              <p>
                • <strong>Weekends:</strong> Automatically excluded from working
                days
              </p>
              <p>
                • <strong>Progress:</strong> Calculates based on actual hours vs
                expected hours for days that have passed
              </p>
              <p>
                • <strong>Badge:</strong> Shows on Apploye timesheet page with
                real-time progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Apploye Pulse v{VERSION}</p>
          <p className="mt-1">
            Track your progress and stay on top of your goals
          </p>
          <p className="mt-2 text-xs">
            Made with ❤️ by{" "}
            <a
              href="https://github.com/itsproali"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline">
              Mohammad Ali
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
