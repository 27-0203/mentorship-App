import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionCard } from "@/components/student/session-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function SessionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all sessions
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
    .order("scheduled_at", { ascending: true })

  const { data: pastSessions } = await supabase
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
    .lt("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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
          <h1 className="mb-2 text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">Manage your mentorship sessions</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="mb-4 text-lg text-muted-foreground">No upcoming sessions</p>
                <Button asChild>
                  <Link href="/student/mentors">Find a Mentor</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastSessions && pastSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No past sessions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
