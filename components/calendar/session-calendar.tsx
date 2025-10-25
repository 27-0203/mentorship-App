"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import type { Session } from "@/lib/types"

interface SessionCalendarProps {
  sessions: Session[]
  onDateClick?: (date: Date) => void
}

export function SessionCalendar({ sessions, onDateClick }: SessionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay()

  // Add empty cells for days before the month starts
  const calendarDays = [...Array(firstDayOfWeek).fill(null), ...daysInMonth]

  const getSessionsForDay = (date: Date) => {
    return sessions.filter((session) => isSameDay(new Date(session.scheduled_at), date))
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
    completed: "bg-blue-500",
    cancelled: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const daySessions = getSessionsForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick?.(day)}
                className={`aspect-square rounded-lg border p-1 transition-all hover:border-blue-500 hover:shadow-md ${
                  isToday ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                } ${!isSameMonth(day, currentMonth) ? "opacity-50" : ""}`}
              >
                <div className="flex h-full flex-col">
                  <span className={`text-sm font-medium ${isToday ? "text-blue-600 dark:text-blue-400" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {daySessions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {daySessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className={`h-1.5 w-1.5 rounded-full ${statusColors[session.status]}`}
                          title={session.title}
                        />
                      ))}
                      {daySessions.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{daySessions.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
