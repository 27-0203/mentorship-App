"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { use } from "react"

export default function BookSessionPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = use(params)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("09:00")
  const [duration, setDuration] = useState("60")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mentorName, setMentorName] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadMentorInfo()
  }, [])

  const loadMentorInfo = async () => {
    const { data } = await supabase
      .from("mentor_profiles")
      .select("profile:profiles(full_name)")
      .eq("id", mentorId)
      .single()

    if (data?.profile) {
      setMentorName(data.profile.full_name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Combine date and time
      const [hours, minutes] = time.split(":")
      const scheduledAt = new Date(date)
      scheduledAt.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      const { error: sessionError } = await supabase.from("sessions").insert({
        student_id: user.id,
        mentor_id: mentorId,
        title,
        description,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: Number.parseInt(duration),
        status: "pending",
      })

      if (sessionError) throw sessionError

      router.push("/student/sessions")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/student/dashboard">
            <h1 className="text-2xl font-bold">MentorConnect</h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href={`/student/mentors/${mentorId}`}>Back to Profile</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground">Schedule a mentorship session with {mentorName}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Provide information about what you'd like to learn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to React Hooks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What would you like to cover in this session?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger id="time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !date}>
                {isLoading ? "Booking..." : "Request Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
