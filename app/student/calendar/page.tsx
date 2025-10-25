import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionCalendar } from "@/components/calendar/session-calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionCard } from "@/components/student/session-card"
import Link from "next/link"
import { format, startOfMonth, endOfMonth } from "date-fns"

export default async function StudentCalendarPage() {
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
      mentor:mentor_profiles(
        *,
        profile:profiles(*)
      )
    `,
    )
    .eq("student_id", user.id)
    .gte("scheduled_at", monthStart.toISOString())
    .lte("scheduled_at", monthEnd.toISOString())
    .order("scheduled_at", { ascending: true })

  // Get upcoming sessions (next 7 days)
  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select(
      `
      *,
      mentor:mentor_profiles(
        *,
        profile:profiles(*)
      )
    `,
    )
    .eq("student_id", user.id)
    .gte("scheduled_at", new Date().toISOString())
    .lte("scheduled_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("scheduled_at", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/student/dashboard">
            <h1 className="text-2xl font-bold">MentorConnect</h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/student/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground">View and manage your scheduled sessions</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <SessionCalendar sessions={sessions || []} />
          </div>

          {/* Upcoming Sessions Sidebar */}
          <div>
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
                        <p className="text-sm text-muted-foreground">with {session.mentor?.profile?.full_name}</p>
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

            <Card className="mt-4">
              <CardContent className="pt-6">
                <Button asChild className="w-full">
                  <Link href="/student/mentors">Book New Session</Link>
                </Button>
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
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
