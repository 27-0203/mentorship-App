"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AvailabilitySlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [selectedDay, setSelectedDay] = useState<string>("1")
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("17:00")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("availability")
      .select("*")
      .eq("mentor_id", user.id)
      .order("day_of_week", { ascending: true })

    if (data) {
      setAvailability(data)
    }
  }

  const handleAddSlot = async () => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("availability").insert({
      mentor_id: user.id,
      day_of_week: Number.parseInt(selectedDay),
      start_time: startTime,
      end_time: endTime,
    })

    if (!error) {
      await loadAvailability()
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase.from("availability").delete().eq("id", id)

    if (!error) {
      await loadAvailability()
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/mentor/dashboard">
            <h1 className="text-2xl font-bold">MentorConnect</h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/mentor/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Manage Availability</h1>
          <p className="text-muted-foreground">Set your weekly availability for student sessions</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add New Slot */}
          <Card>
            <CardHeader>
              <CardTitle>Add Time Slot</CardTitle>
              <CardDescription>Define when you're available for sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddSlot} disabled={isLoading} className="w-full">
                Add Time Slot
              </Button>
            </CardContent>
          </Card>

          {/* Current Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Current Availability</CardTitle>
              <CardDescription>Your weekly schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {availability.length > 0 ? (
                <div className="space-y-2">
                  {availability.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{daysOfWeek[slot.day_of_week]}</p>
                        <p className="text-sm text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSlot(slot.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No availability set yet</p>
                  <p className="text-sm">Add time slots to let students book sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
