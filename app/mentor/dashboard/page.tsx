import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SessionRequestCard } from "@/components/mentor/session-request-card"
import { Calendar, Users, Star, Settings } from "lucide-react"
import Link from "next/link"

export default async function MentorDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "mentor") {
    redirect("/student/dashboard")
  }

  // Get or create mentor profile
  const { data: mentorProfile } = await supabase.from("mentor_profiles").select("*").eq("id", user.id).single()

  // Get pending session requests
  const { data: pendingSessions } = await supabase
    .from("sessions")
    .select(
      `
      *,
      student:profiles!sessions_student_id_fkey(*)
    `,
    )
    .eq("mentor_id", user.id)
    .eq("status", "pending")
    .order("scheduled_at", { ascending: true })
    .limit(5)

  // Get upcoming confirmed sessions
  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select(
      `
      *,
      student:profiles!sessions_student_id_fkey(*)
    `,
    )
    .eq("mentor_id", user.id)
    .eq("status", "confirmed")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(3)

  // Get stats
  const { count: totalSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("mentor_id", user.id)
    .eq("status", "completed")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">MentorConnect</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile?.full_name}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Setup Notice */}
        {!mentorProfile && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Complete Your Mentor Profile</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Set up your profile to start accepting students
                </p>
              </div>
              <Button asChild>
                <Link href="/mentor/profile/setup">Setup Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingSessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingSessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentorProfile?.rating.toFixed(1) || "0.0"}</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <Link href="/mentor/calendar">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">View</p>
                  <p className="font-semibold">Calendar</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingSessions && pendingSessions.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Pending Requests</h2>
              <Button asChild variant="outline">
                <Link href="/mentor/sessions">View All</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingSessions.map((session) => (
                <SessionRequestCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            <Button asChild variant="outline">
              <Link href="/mentor/sessions">View All</Link>
            </Button>
          </div>
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <SessionRequestCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-semibold">No upcoming sessions</p>
                <p className="text-sm text-muted-foreground">
                  Your confirmed sessions will appear here. Check pending requests above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/mentor/availability">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Availability</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/mentor/sessions">
                  <Users className="h-6 w-6" />
                  <span>View All Sessions</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
                <Link href="/mentor/profile">
                  <Settings className="h-6 w-6" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
