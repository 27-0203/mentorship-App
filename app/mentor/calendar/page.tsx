import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionCalendar } from "@/components/calendar/session-calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionRequestCard } from "@/components/mentor/session-request-card"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"

export default async function MentorCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all sessions for the current month
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      `
      *,
      student:profiles!sessions_student_id_fkey(*)
    `,
    )
    .eq("mentor_id", user.id)
    .gte("scheduled_at", monthStart.toISOString())
    .lte("scheduled_at", monthEnd.toISOString())
    .order("scheduled_at", { ascending: true })

  // Get upcoming sessions (next 7 days)
  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select(
      `
      *,
      student:profiles!sessions_student_id_fkey(*)
    `,
    )
    .eq("mentor_id", user.id)
    .gte("scheduled_at", new Date().toISOString())
    .lte("scheduled_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("scheduled_at", { ascending: true })

  // Get availability
  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("mentor_id", user.id)
    .order("day_of_week", { ascending: true })

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground">View your schedule and manage availability</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <SessionCalendar sessions={sessions || []} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions && upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="rounded-lg border p-3">
                        <h4 className="font-semibold">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">with {session.student?.full_name}</p>
                        <p className="mt-2 text-sm">
                          {format(new Date(session.scheduled_at), "EEE, MMM d")}
                          <br />
                          {format(new Date(session.scheduled_at), "h:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No upcoming sessions this week</p>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Availability</CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/mentor/availability">Edit</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {availability && availability.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {availability.map((slot) => (
                      <div key={slot.id} className="flex justify-between">
                        <span className="font-medium">{daysOfWeek[slot.day_of_week]}</span>
                        <span className="text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-2 text-sm text-muted-foreground">No availability set</p>
                    <Button asChild size="sm">
                      <Link href="/mentor/availability">Set Availability</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Sessions This Month */}
        {sessions && sessions.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">All Sessions This Month</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <SessionRequestCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
