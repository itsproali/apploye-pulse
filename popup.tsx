import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Settings,
  TrendingDown,
  TrendingUp
} from "lucide-react"
import { useEffect, useState } from "react"
import Icon32 from "url:./assets/icon-32.png"

import { Badge } from "~components/ui/badge"
import { Button } from "~components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~components/ui/card"
import { Progress } from "~components/ui/progress"
import type { AppSettings, ProgressData } from "~types"
import { getSettings } from "~utils/storage"
import { calculateProgress, formatTime } from "~utils/time-calculations"
import { VERSION } from "~utils/version"

import "~style.css"

function IndexPopup() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnApploye, setIsOnApploye] = useState(false)
  const [currentUrl, setCurrentUrl] = useState<string>("")

  useEffect(() => {
    loadData()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadData()
    }
    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const loadData = async () => {
    try {
      const currentSettings = await getSettings()
      setSettings(currentSettings)

      // Check if we're on Apploye website
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0]
        const url = activeTab?.url || ""
        setCurrentUrl(url)

        const isApployePage = url.includes(
          "app.apploye.com/user/timesheet/monthly"
        )
        setIsOnApploye(isApployePage)

        if (isApployePage) {
          chrome.tabs.sendMessage(
            activeTab.id!,
            { action: "getHours" },
            (response) => {
              if (response?.hours) {
                const progressData = calculateProgress(
                  response.hours,
                  currentSettings
                )
                setProgress(progressData)
              }
              setLoading(false)
            }
          )
        } else {
          setLoading(false)
        }
      })
    } catch (error) {
      console.error("Error loading data:", error)
      setLoading(false)
    }
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const openApploye = () => {
    chrome.tabs.create({
      url: "https://app.apploye.com/user/timesheet/monthly"
    })
  }

  if (loading) {
    return (
      <div className="w-96 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="w-96 p-6">
        <p className="text-center text-muted-foreground">
          Error loading extension data
        </p>
      </div>
    )
  }

  // Show different UI if not on Apploye website
  if (!isOnApploye) {
    return (
      <div className="w-96 bg-background">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Icon32} alt="Apploye Pulse" className="w-6 h-6" />
              <h1 className="text-xl font-bold">Apploye Pulse</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={openOptions}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Not on Apploye Message */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Visit Apploye Timesheet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Open your Apploye monthly timesheet to see your progress
                    tracking and manage holidays.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <p className="font-medium mb-1">Current page:</p>
                  <p className="truncate">{currentUrl || "Unknown"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Preview */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Daily Target</span>
                  </div>
                  <span className="font-medium">{settings.dailyHours}h</span>
                </div>
                {settings.holidays.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Holidays</span>
                    <span className="font-medium">
                      {settings.holidays.length}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={openApploye}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Apploye
            </Button>
            <Button variant="outline" className="flex-1" onClick={openOptions}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="w-96 p-6">
        <p className="text-center text-muted-foreground">
          Error loading progress data
        </p>
      </div>
    )
  }

  const statusIcon = progress.isOnTrack ? (
    <CheckCircle className="w-5 h-5 text-primary" />
  ) : progress.isAhead ? (
    <TrendingUp className="w-5 h-5 text-success" />
  ) : (
    <TrendingDown className="w-5 h-5 text-destructive" />
  )

  const statusText = progress.isOnTrack
    ? "On Track"
    : progress.isAhead
      ? `${formatTime(progress.difference)} Ahead`
      : `${formatTime(progress.difference)} Behind`

  const statusVariant = progress.isOnTrack
    ? "default"
    : progress.isAhead
      ? "success"
      : "destructive"

  return (
    <div className="w-96 bg-background">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={Icon32} alt="Apploye Pulse" className="w-6 h-6" />
            <h1 className="text-xl font-bold">Apploye Pulse</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={openOptions}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Monthly Progress</span>
              {statusIcon}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {progress.progressPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={progress.progressPercentage}
                className="h-2"
                indicatorClassName={
                  progress.isAhead
                    ? "bg-success"
                    : progress.isOnTrack
                      ? "bg-primary"
                      : "bg-destructive"
                }
              />
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant={statusVariant} className="text-sm px-4 py-1">
                {statusText}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Actual Hours</p>
                <p className="text-lg font-semibold">
                  {formatTime(progress.actualHours)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Expected Hours</p>
                <p className="text-lg font-semibold">
                  {formatTime(progress.expectedHours)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Days Passed</p>
                <p className="text-lg font-semibold">
                  {progress.workingDaysPassed} / {progress.totalWorkingDays}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Days Remaining</p>
                <p className="text-lg font-semibold">
                  {progress.remainingWorkingDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Daily Target</span>
              </div>
              <span className="font-medium">{settings.dailyHours}h</span>
            </div>
            {settings.holidays.length > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Holidays</span>
                <span className="font-medium">{settings.holidays.length}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={openApploye}>
            Open Apploye
          </Button>
          <Button variant="outline" className="flex-1" onClick={openOptions}>
            Manage Settings
          </Button>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          <div className="mb-1">v{VERSION}</div>
          <div>
            Made with ❤️ by{" "}
            <a
              href="https://github.com/itsproali"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline">
              Mohammad Ali
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
