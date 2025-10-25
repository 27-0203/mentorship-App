import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionRequestCard } from "@/components/mentor/session-request-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function MentorSessionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get pending sessions
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

  // Get confirmed sessions
  const { data: confirmedSessions } = await supabase
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

  // Get past sessions
  const { data: pastSessions } = await supabase
    .from("sessions")
    .select(
      `
      *,
      student:profiles!sessions_student_id_fkey(*)
    `,
    )
    .eq("mentor_id", user.id)
    .in("status", ["completed", "cancelled"])
    .order("scheduled_at", { ascending: false })

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
          <h1 className="mb-2 text-3xl font-bold">My Sessions</h1>
          <p className="text-muted-foreground">Manage your mentorship sessions</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Pending {pendingSessions && pendingSessions.length > 0 && `(${pendingSessions.length})`}
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingSessions && pendingSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingSessions.map((session) => (
                  <SessionRequestCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No pending requests</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmed">
            {confirmedSessions && confirmedSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {confirmedSessions.map((session) => (
                  <SessionRequestCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No confirmed sessions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastSessions && pastSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastSessions.map((session) => (
                  <SessionRequestCard key={session.id} session={session} />
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
