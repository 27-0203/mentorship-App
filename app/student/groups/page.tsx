import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GroupCard } from "@/components/student/group-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import Link from "next/link"

export default async function StudentGroupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all groups with member counts
  const { data: groups } = await supabase.from("groups").select(
    `
      *,
      mentor:mentor_profiles(
        *,
        profile:profiles(*)
      )
    `,
  )

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    (groups || []).map(async (group) => {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id)

      const { data: membership } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single()

      return {
        ...group,
        member_count: count || 0,
        is_member: !!membership,
      }
    }),
  )

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
          <h1 className="mb-2 text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground">Join group sessions and learn with peers</p>
        </div>

        {groupsWithCounts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groupsWithCounts.map((group) => (
              <GroupCard key={group.id} group={group} isMember={group.is_member} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">No groups available yet</p>
              <p className="text-sm text-muted-foreground">Check back later for group learning opportunities</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
