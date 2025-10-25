import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SessionCard } from "@/components/student/session-card"
import { Calendar, Search, MessageSquare, Users } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "student") {
    redirect("/mentor/dashboard")
  }

  // Get upcoming sessions
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
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(3)

  // Get unread messages count
  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false)

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
        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <Link href="/student/mentors">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Find</p>
                  <p className="font-semibold">Mentors</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <Link href="/student/calendar">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">My</p>
                  <p className="font-semibold">Calendar</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <Link href="/student/sessions">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">My</p>
                  <p className="font-semibold">Sessions</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <Link href="/student/messages">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  {unreadCount && unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">My</p>
                  <p className="font-semibold">Messages</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg">
            <Link href="/student/groups">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join</p>
                  <p className="font-semibold">Groups</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
            <Button asChild variant="outline">
              <Link href="/student/sessions">View All</Link>
            </Button>
          </div>
          {sessions && sessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-semibold">No upcoming sessions</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Start by finding a mentor and booking your first session
                </p>
                <Button asChild>
                  <Link href="/student/mentors">Find Mentors</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Browse Mentors</h3>
                  <p className="text-sm text-muted-foreground">Explore our community of experienced mentors</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Book a Session</h3>
                  <p className="text-sm text-muted-foreground">Schedule a time that works for both of you</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Start Learning</h3>
                  <p className="text-sm text-muted-foreground">Connect via video and begin your journey</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
